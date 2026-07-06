# Vendra — Multi-Vendor E-Commerce Platform · Architecture

A marketplace where **customers** shop across many vendors, **vendors** onboard products &
manage fulfilment, and **admins** approve vendors, moderate products and manage commission.
Built as **Spring Boot microservices** behind a **Spring Cloud Gateway**, with a **React (Vite)**
single-page frontend.

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Redux Toolkit + redux-persist, MUI v6, axios, react-router v6 |
| API layer | Spring Boot 3.4.1, Spring Cloud 2024.0.0, Java 21 |
| Gateway | Spring Cloud Gateway (reactive) |
| Service discovery | Netflix Eureka |
| Central config | Spring Cloud Config Server (native, reads `config-repo/`) |
| AuthN/AuthZ | Keycloak (realm `vendra`) + JWT; gateway validates, injects identity headers |
| Relational DB | MySQL (auth, user, order, inventory, notification, payment DBs) |
| Document DB | MongoDB (product, review DBs) |
| Messaging | Apache Kafka (order ↔ inventory saga, notifications) |
| Payments | Razorpay (razorpay-java SDK) |
| Mapping / boilerplate | MapStruct, Lombok |
| API docs | springdoc-openapi (Swagger UI aggregated at the gateway) |
| Build | Maven (multi-module reactor) |
| Containerization | Docker + docker-compose |

---

## 2. Service Topology & Ports

```
                                  ┌──────────────────────────┐
                                  │   React SPA (Vite)        │
                                  │   http://localhost:3000   │
                                  └────────────┬─────────────┘
                                               │  VITE_API_URL
                                               ▼
                                  ┌──────────────────────────┐
                                  │   API Gateway  :8090      │  ← JWT filter injects
                                  │   (Spring Cloud Gateway)  │    X-User-Name / X-User-Roles
                                  └────────────┬─────────────┘
                 ┌───────────────┬─────────────┼─────────────┬───────────────┬───────────────┐
                 ▼               ▼             ▼             ▼               ▼               ▼
          auth :8081      user :8087   product :8084   order :8085   inventory :8086   review :8088
          (MySQL)          (MySQL)       (MongoDB)      (MySQL,Kafka)  (MySQL,Kafka)    (MongoDB)
                 ▼               ▼                            ▼               ▼
          notification :8082                          payment :8089     report :8092
          (MySQL,Kafka)                                (MySQL,Razorpay)  (Feign aggregator)

  Platform services:  config-server :8888   ·   discovery-server (Eureka) :8761
  External infra:     Keycloak :8080 (realm vendra)   ·   Kafka :9092   ·   MySQL :3306   ·   MongoDB :27017
```

| Service | Port | Store | Messaging | Responsibility |
|---|---|---|---|---|
| config-server | 8888 | — | — | Serves centralized config from `config-repo/` (native profile) |
| discovery-server | 8761 | — | — | Eureka service registry |
| api-gateway | **8090** | — | — | Single entry point; routing, CORS, JWT validation, header injection |
| auth-service | 8081 | MySQL `auth_db` | — | Register/login/refresh via Keycloak; local user + role seed |
| user-service | 8087 | MySQL `user_db` | — | Profiles, vendor mgmt, admin user mgmt, **trust score/badges/ranking** |
| product-service | 8084 | MongoDB `product_db` | — | Products, categories, moderation, denormalized stock |
| review-service | 8088 | MongoDB `review_db` | — | Reviews, ratings, vendor replies |
| order-service | 8085 | MySQL `order_db` | Kafka | Orders, disputes, analytics, **priority processing**, **delivery**, commission |
| inventory-service | 8086 | MySQL `inventory_db` | Kafka | **Reserve stock**, availability, **3-hour sync** to product stock |
| payment-service | 8089 | MySQL `payment_db` | — | Razorpay order creation, signature verification, webhook |
| notification-service | 8082 | MySQL `notification_db` | Kafka | Notifications (read flags, per-user); consumes order events |
| report-service | 8092 | — (stateless) | — | Aggregates vendor/admin reports via Feign |

> Note: the gateway listens on **8090** (config) and the frontend `VITE_API_URL` and docker
> mapping both point at 8090. Keycloak is reachable at `:8080`.

---

## 3. Request & Security Flow

1. Frontend sends every API call to the **gateway** (`:8090`) with `Authorization: Bearer <JWT>`.
2. `JwtAuthenticationFilter` (gateway) lets public paths through (`/auth/login`, `/auth/register/**`,
   `/auth/refresh`, swagger, actuator); everything else must carry a valid JWT.
3. The gateway validates the token (Keycloak RS256 public key, HS256 secret fallback), then
   **injects downstream headers**: `X-User-Name` (username) and `X-User-Roles` (comma-joined roles).
4. Downstream services do a lightweight role check by substring-matching `X-User-Roles`
   (e.g. `validateRole(roles, "vendor")`). They trust the gateway as the security boundary.
5. Responses are wrapped in a standard envelope `ApiResponse<T> = { success, message, data, errors, timestamp, path }`.
   The frontend axios interceptor **unwraps** it to `data`.

### Auth lifecycle
- **Register**: `POST /auth/register/customer|vendor` → auth-service creates the user in Keycloak,
  stores a local record, and calls user-service (Feign) to create a profile. Vendors start
  **disabled/PENDING** until an admin approves.
- **Login**: `POST /auth/login` → auth-service does a Keycloak password grant → returns
  `{accessToken, refreshToken, user}`. Frontend decodes `realm_access.roles` for the primary role.
- **Refresh**: `POST /auth/refresh` (axios 401 interceptor auto-refreshes, else logs out).
- Seeded demo users (realm + DB): `admin` / `vendor` / `user`, all password `password123`.

### Identity model (important)
The **only identity that crosses services** is the **username** (the gateway injects it as
`X-User-Name`; the numeric DB id is not in the JWT). Therefore:
- Products, orders, inventory, reviews, analytics, commission all key `vendorId` = **username**.
- user-service vendor/trust endpoints accept the **username** (with numeric-id fallback) and
  return the username as the vendor id.
- The frontend uses `user.username` as the single `vendorId`/`userId` everywhere.

---

## 4. API Surface (through the gateway)

**auth-service** `/auth`
- `POST /auth/register`, `/auth/register/customer`, `/auth/register/vendor`
- `POST /auth/login`, `/auth/refresh`, `/auth/logout`
- `GET /auth/profile`, `PUT /auth/users/{id}/activation` (internal)

**user-service** `/api/v1/users`, `/api/v1/vendors`, `/api/v1/trust-scores`, `/api/v1/admin`
- `GET/PUT /api/v1/users/profile` (customer/vendor)
- `GET /api/v1/vendors?approvalStatus=`, `GET /api/v1/vendors/{username}`,
  `PUT /{username}/approve`, `PUT /{username}/reject`, `PUT /{username}`,
  `GET /api/v1/vendors/top`, `GET /api/v1/vendors/featured-new`
- `GET /api/v1/trust-scores?vendorId=`, `GET /api/v1/trust-scores`, `POST /api/v1/trust-scores/recompute`
- `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/{id}` (suspend/reactivate)

**product-service** `/api/v1/products`, `/api/v1/categories`
- `GET /api/v1/products?vendorId=&category=&approved=`, `GET /{id}`, `GET /my-products`
- `POST`, `PUT /{id}`, `DELETE /{id}`, `POST /{id}/moderate?approved=&comment=`
- `PATCH /{id}/stock` (internal, called by inventory sync)
- `GET /api/v1/categories`

**review-service** `/api/v1/reviews`
- `GET /api/v1/reviews?productId=&vendorId=`, `GET /{id}`, `POST`, `PATCH /{id}` (vendor reply)

**order-service** `/api/v1/orders`, `/disputes`, `/analytics`, `/delivery`, `/commission`
- `POST /api/v1/orders`, `GET /{id}`, `GET /my-orders`, `GET /api/v1/orders?userId=&vendorId=&status=`,
  `PATCH /{id}` (status)
- `GET/POST /api/v1/disputes`, `PATCH /api/v1/disputes/{id}` (resolve/escalate)
- `GET /api/v1/analytics?vendorId=`
- `GET /api/v1/delivery`, `POST /api/v1/delivery/assign/{orderId}`
- `GET/POST /api/v1/commission/rules`, `PATCH /rules/{id}`, `GET /api/v1/commission/ledger?vendorId=`

**payment-service** `/api/v1/payments`
- `POST /create-order`, `POST /verify`, `GET /{orderId}`, `POST /webhook`

**inventory-service** `/api/v1/inventory`
- `POST /api/v1/inventory` (upsert stock), `GET /product/{productId}`, `GET /my-stock`

**notification-service** `/notifications`
- `POST /notifications`, `GET /notifications?role=&userId=`, `PATCH /{id}` (mark read),
  `GET /notifications/history/{recipient}`

**report-service** `/api/v1/reports`
- `GET /api/v1/reports/vendor?vendorId=`, `GET /api/v1/reports/admin`

---

## 5. Event-Driven Order Saga (Kafka)

```
Customer checkout
      │  POST /api/v1/orders  (status = PLACED)
      ▼
order-service ──emit OrderPlacedEvent (per item)──► topic: order-placed
                                                          │
                                                          ▼
                                                inventory-service (OrderPlacedConsumer)
                                                reserve available stock
                                             ┌────────────┴─────────────┐
                                    reserved │                          │ not enough stock
                                             ▼                          ▼
                          topic: inventory-reserved         topic: inventory-failed
                                             │                          │
                                             ▼                          ▼
                                 order-service confirmOrder     order-service failOrder
                                   status = CONFIRMED             status = FAILED

notification-service also consumes `order-placed` → creates a CUSTOMER notification.
```

Event classes (`com.pinnacle.common.event`, duplicated in order & inventory):
`OrderPlacedEvent{orderId, productId, quantity, customerName}`,
`InventoryReservedEvent`, `InventoryReservationFailedEvent`.

> Consequence: an order is only `CONFIRMED` if inventory has a record with enough available
> stock. Products must have an inventory record (seeded on product create/edit) or orders `FAIL`.

---

## 6. Signature Features

### 6A. Inventory: reserve stock + 3-hour sync (inventory-service)
- `Inventory{ productId, quantity (on-hand), reservedQuantity }`; `availableQuantity = quantity − reserved`.
- `StockReservation{ orderId, productId, quantity, status(RESERVED/CONFIRMED/RELEASED), createdAt }`.
- On `order-placed`: if available ≥ qty → increment reserved, save reservation, emit `inventory-reserved`; else `inventory-failed`.
- **`@Scheduled` job** (`inventory.sync.interval-ms`, default 3h): releases stale reservations back to
  available, and pushes available stock to product-service (`PATCH /products/{id}/stock`, via Feign)
  so the storefront shows accurate stock.

### 6B. Priority / delayed order processing + delivery (order-service)
- `Order.priority` (STANDARD/PREMIUM/VIP, from customer tier).
- **`@Scheduled` processor** (`order.processor.interval-ms`, default 60s): advances CONFIRMED orders,
  ordered by **priority then createdAt**, and auto-assigns a delivery partner.
- `DeliveryPartner{ name, avgDeliveryHours, active, currentLoad, capacity }` (5 seeded).
  **Auto-assign** picks the active partner with the smallest `avgDeliveryHours` that has capacity;
  sets `deliveryPartnerId/Name`, `estimatedDeliveryAt`, `trackingStatus`.

### 6C. Vendor visibility: trust score + badges + ranking (user-service)
- Trust score (0–100) = `0.40·(avgRating/5·100) + 0.25·onTimeRate + 0.20·(100−cancellationRate) + 0.15·(100−disputeRate)`;
  new vendors floored at 60 so they aren't buried.
- Badges: `TOP_RATED`, `FAST_SHIPPER`, `TRUSTED`, `RISING_STAR`, `BEST_SELLER`.
- Ranking endpoints: `/api/v1/vendors/top` (by trust) and `/api/v1/vendors/featured-new`.
- **`@Scheduled` recompute** (`trust.recompute.interval-ms`, default 1h): pulls order stats
  (Feign → order analytics) + review stats (Feign → review-service), recomputes per vendor.

### 6D. Payments (payment-service, Razorpay)
- `POST /create-order` creates a Razorpay order (secret used server-side); returns `razorpayOrderId` + publishable `keyId`.
- `POST /verify` verifies `razorpay_order_id/payment_id/signature`.
- **Placeholder mode**: if the configured key id starts with `rzp_test_placeholder`, the service mocks
  order creation/verification so the flow works without real keys.
- The frontend reads the publishable key from `payment-service/.env` (`RAZORPAY_KEY_ID`) via Vite
  (`vite.config.js` exposes it as `VITE_RAZORPAY_KEY_ID`; the secret is never sent to the browser).

### 6E. Commission (order-service)
- `CommissionRule{ category, ratePercent, active }` (default 10%). On order CONFIRMED a
  `CommissionLedger{ vendorId, orderId, orderAmount, commissionAmount, netAmount }` entry is written.

---

## 7. Frontend Structure (`frontend/src`)

```
api/axiosInstance.js     → gateway client; attaches Bearer, unwraps ApiResponse, 401→refresh
app/store.js             → Redux store (redux-persist: auth, cart, wishlist)
features/
  auth/                  → login/register/refresh, role from JWT
  customer/  products, cart, wishlist, checkout, orders, reviews
  vendor/    products, inventory, orders, analytics, commission, trustScore, reviews
  admin/     vendorApprovals, productModeration, orders, commissionRules, disputes, reports, users
  notifications/
pages/       LoginPage, RegisterPage, customer/*, vendor/*, admin/*
routes/AppRoutes.jsx     → ProtectedRoute + RoleRoute (CUSTOMER/VENDOR/ADMIN portals)
theme/muiTheme.js        → light theme only (dark disabled)
```

- **Portals** are role-gated: `/customer/*`, `/vendor/*` (approved vendors only), `/admin/*`.
- Cart, wishlist and checkout stepper state are **client-only** (persisted); everything else is
  server-backed through the gateway.

---

## 8. Configuration & Deployment

- **Central config** lives in `config-repo/*.yml` (served by config-server). Each service's local
  `application.yml` only sets its name + `spring.config.import=configserver:...`.
- **Secrets/keys**: `payment-service/.env` (Razorpay), Keycloak client secret + JWT secret in
  `config-repo/application.yml`.
- **Run (Docker)**: `docker-compose up --build` starts infra (MySQL, MongoDB, Kafka+Zookeeper,
  Keycloak) + config-server, discovery, gateway and all 9 business services.
- **Run (local/IDE)**: start config-server → discovery-server → gateway → business services;
  frontend `cd frontend && npm install && npm run dev`.
- **Build checks**: `mvn -q -T1C compile` (all modules) and `cd frontend && npm run build`.
- Java compiler runs with `-parameters` (required so Spring reads `@RequestParam`/`@PathVariable`
  names at runtime) — configured in the root `pom.xml` and `.idea/compiler.xml`.

---

## 9. Data Ownership Summary

| Data | Owning service | Store |
|---|---|---|
| Users, roles, credentials | auth-service | MySQL |
| Profiles, vendor status, trust, badges | user-service | MySQL |
| Products, categories, moderation | product-service | MongoDB |
| Reviews & ratings | review-service | MongoDB |
| Orders, disputes, delivery, commission | order-service | MySQL |
| Stock, reservations | inventory-service | MySQL |
| Payments | payment-service | MySQL |
| Notifications | notification-service | MySQL |
| Reports | report-service | none (aggregates via Feign) |
