# Vendra: Multi-Vendor E-Commerce Order Management Platform

Vendra is an enterprise-grade, highly-configurable, full-stack multi-vendor marketplace and order management ecosystem. It features a complete service mesh infrastructure powered by Spring Boot microservices on the backend, integrated with Keycloak OAuth2 security and Apache Kafka event-driven pipelines, alongside a modern role-based React dashboard on the frontend.

---

## Architecture Overview

Vendra is designed with a decentralized, container-ready microservices architecture. Here is the overall service interaction and routing diagram:

```mermaid
graph TD
    Client[React 19 Frontend - Port 3000] -->|HTTP / REST| Gateway[API Gateway - Port 8090]
    
    Gateway -->|Service Routing| Eureka[Eureka Discovery Server - Port 8761]
    Gateway -->|Token Validation & SSO| Keycloak[Keycloak Identity - Port 8083]
    
    subgraph Infrastructure Services
        ConfigServer[Config Server - Port 8888]
        Eureka
        Keycloak
    end
    
    subgraph Microservices Mesh
        AuthService[Auth Service - Port 8081]
        UserService[User Service - Port 8087]
        ProductService[Product Service - Port 8084]
        InventoryService[Inventory Service - Port 8086]
        OrderService[Order Service - Port 8085]
        ReviewService[Review Service - Port 8088]
        PaymentService[Payment Service - Port 8089]
        NotificationService[Notification Service - Port 8082]
        ReportService[Report Service - Port 8092]
    end
    
    subgraph Storage & Middleware
        MySQL[(MySQL DB)]
        MongoDB[(MongoDB)]
        Kafka[[Apache Kafka]]
    end

    %% Configuration loading
    Microservices Mesh -.->|Fetch Configuration| ConfigServer
    
    %% Databases connections
    AuthService & UserService & InventoryService & OrderService & PaymentService & NotificationService -->|Read/Write| MySQL
    ProductService & ReviewService -->|Read/Write| MongoDB
    
    %% Kafka messaging
    OrderService & InventoryService & NotificationService -.->|Produce/Consume Events| Kafka
```

### Module & Service Directory Mapping

*   [api-gateway](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/api-gateway): Spring Cloud Gateway acting as the single entry point. Performs global CORS configuration, routing, and Swagger API documentation aggregating. Exposes port **8090**.
*   [auth-service](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/auth-service): Integrates with Keycloak to manage SSO, user registration, token exchanges, and role assignments. Exposes port **8081**.
*   [config-server](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/config-server): Centralized configuration hub pulling profiles from the local configuration files repository. Exposes port **8888**.
*   [config-repo](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/config-repo): YAML-based configuration store containing environment settings for each downstream microservice.
*   [discovery-server](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/discovery-server): Eureka Discovery Server to allow dynamic lookups, health-monitoring, and internal routing. Exposes port **8761**.
*   [user-service](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/user-service): Manages user/vendor accounts, metadata, admin operations, and Trust Score calculations. Exposes port **8087**.
*   [product-service](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/product-service): Manages product catalogues, onboarding, categories, and moderation statuses. Backed by MongoDB. Exposes port **8084**.
*   [inventory-service](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/inventory-service): Handles vendor-specific product stock levels, inventory updates, reservation logic, and low-stock Kafka alerting. Exposes port **8086**.
*   [order-service](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/order-service): Core order engine handling order placement, commission calculations, disputes, and delivery statuses. Exposes port **8085**.
*   [payment-service](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/payment-service): Coordinates Razorpay payment processing and stores payment records. Exposes port **8089**.
*   [review-service](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/review-service): Handles customer-submitted product reviews and ratings. Backed by MongoDB. Exposes port **8088**.
*   [notification-service](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/notification-service): Kafka-driven event listener dispatching real-time notifications (Email/SMS simulation). Exposes port **8082**.
*   [report-service](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/report-service): Gathers cross-service analytics for admin and vendor reporting. Exposes port **8092**.
*   [frontend](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/frontend): Vite-powered React 19 single-page app displaying clean, premium dashboards using Material UI (MUI v6) and Redux Toolkit. Exposes port **3000**.

---

## Key Features

### 👤 Customer Portal
*   **Discovery**: Product catalog browsing, keyword search, category filtering.
*   **Reviews & Ratings**: Share feedback and check other users' product ratings.
*   **Cart & Checkout**: Manage local shopping cart, input shipping details, checkout.
*   **Secure Payment**: Razorpay payment checkout integration.
*   **Order Tracking**: Real-time order processing and shipment status updates.
*   **Wishlist**: Save favorite items for later.

### 🏢 Vendor Portal
*   **Onboarding**: Registration and profile verification system (subject to Admin approval).
*   **Product Listing**: Upload products, descriptions, pricing, and media assets.
*   **Inventory Control**: Update stock counts and avoid inventory mismatch penalties.
*   **Order Fulfillment**: View assigned customer orders, update tracking statuses.
*   **Sales & Earnings Analytics**: Comprehensive dashboard showing income, order volumes, and performance graphs.
*   **Vendor Trust Score**: Scoring system evaluating vendor reliability, order completion rate, and shipping speeds.

### 👑 Admin Portal
*   **Verification Dashboard**: Approve/Reject onboarding vendors.
*   **Product Moderation**: Moderate new product listings before they go public.
*   **Commission Manager**: Create and fine-tune platform fee and commission rules.
*   **Dispute Resolution**: Oversee customer-vendor disputes and issue refunds.
*   **Analytics Reports**: System-wide performance, active users, total revenue, and commission yields.
*   **User Management**: Monitor, edit, or suspend customer and vendor accounts.

---

## Technology Stack

*   **Frontend**: React 19, Vite, Material UI (MUI v6), Axios, Formik + Yup, Redux Toolkit.
*   **Backend Framework**: Spring Boot 3.x, Spring Cloud Gateway, Spring Cloud Config, Spring Cloud Eureka.
*   **Security & SSO**: Keycloak 24, Spring Security, JWT (JSON Web Tokens).
*   **Databases**:
    *   **Relational**: MySQL 8.0 (Schema schemas: `auth_db`, `notification_db`, `order_db`, `inventory_db`, `user_db`, `payment_db`).
    *   **Document**: MongoDB 6.0 (Collections: products, reviews).
*   **Message Broker**: Apache Kafka + Zookeeper (handling inventory updates and notifications).
*   **Build & Containerization**: Maven, Docker, Docker Compose.

---

## Quick Start (Run with Docker Compose)

To spin up the entire application stack including databases, Keycloak, Kafka, and the microservices:

### 1. Build Backend Microservices
Compile all Spring Boot projects into JARs:
```bash
mvn clean package -DskipTests
```

### 2. Launch Stack via Docker Compose
From the root directory, spin up all services:
```bash
docker-compose up --build
```
> **Note**: Keycloak imports the preset realm dynamically on startup. It might take up to a minute for all database schema creations and services to stabilize.

### 3. Service Access Endpoints

| Service / App | Host URL | Port |
| :--- | :--- | :--- |
| **React Customer/Vendor/Admin UI** | [http://localhost:3000](http://localhost:3000) | `3000` |
| **API Gateway Router** | [http://localhost:8090](http://localhost:8090) | `8090` |
| **Eureka Registry Dashboard** | [http://localhost:8761](http://localhost:8761) | `8761` |
| **Keycloak Admin UI** | [http://localhost:8083](http://localhost:8083) | `8083` |
| **Config Server JSON Endpoint** | [http://localhost:8888/auth-service/default](http://localhost:8888/auth-service/default) | `8888` |
| **Swagger OpenAPI Documentation Hub** | [http://localhost:8090/swagger-ui.html](http://localhost:8090/swagger-ui.html) | `8090` |

### 🔑 Default Credentials
*   **Keycloak Administrator Account**: `admin` / `admin`
*   **Standard Customer Profile**: `customer` / `password`
*   **Standard Vendor Profile**: `vendor` / `password`
*   **Platform Admin Profile**: `admin` / `password`

---

## Running Locally (Without Docker)

If you prefer to run services on your host machine without Docker containerization, ensure you have MySQL, MongoDB, and Kafka running locally.

### 1. Set Up Database Schemas
Log in to your local MySQL instance and run:
```sql
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS notification_db;
CREATE DATABASE IF NOT EXISTS order_db;
CREATE DATABASE IF NOT EXISTS inventory_db;
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS payment_db;
```

### 2. Local Environment Variables
Load the variables defined in the root [.env.example](file:///C:/Users/delegate/Downloads/hackathon-template-main/vendra/.env.example) file into your terminal sessions.

*   **Windows (PowerShell)**:
    ```powershell
    Get-Content .env.example | ForEach-Object {
        if ($_ -notmatch '^\s*#' -and $_ -like '*=*') {
            $name, $value = $_ -split '=', 2
            [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), [System.EnvironmentVariableTarget]::Process)
        }
    }
    ```
*   **Linux / macOS / Git Bash**:
    ```bash
    export $(grep -v '^#' .env.example | xargs)
    ```

### 3. Service Startup Order
Start services in the following order to ensure proper configuration retrieval and discovery registration:
1. `config-server` (Port 8888)
2. `discovery-server` (Port 8761)
3. `auth-service` (Port 8081) & `user-service` (Port 8087)
4. All other microservices (`product-service`, `inventory-service`, `order-service`, `payment-service`, `review-service`, `notification-service`, `report-service`)
5. `api-gateway` (Port 8090)
6. `frontend` (Port 3000) - run `npm install` followed by `npm run dev` in the `/frontend` directory.
