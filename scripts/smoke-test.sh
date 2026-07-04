#!/usr/bin/env bash
#
# Vendra end-to-end smoke test.
# Run AFTER the full stack is up (docker-compose up --build) and all services have
# registered with Eureka. It exercises real Keycloak login through the gateway and
# hits representative endpoints across every service.
#
# Usage:  GATEWAY=http://localhost:8080 ./scripts/smoke-test.sh
#
set -uo pipefail

GATEWAY="${GATEWAY:-http://localhost:8080}"
PASS=0
FAIL=0

pass() { echo "  [PASS] $1"; PASS=$((PASS+1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }

# JSON field extractor (no jq dependency): grabs the first "key":"value" or "key":value.
jval() { sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\{0,1\}\([^\",}]*\).*/\1/p" | head -1; }

login() { # $1=username $2=password -> echoes accessToken
  curl -s -X POST "$GATEWAY/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$1\",\"password\":\"$2\"}" | jval accessToken
}

check() { # $1=label $2=method $3=path $4=token [$5=body]
  local code
  if [ -n "${5:-}" ]; then
    code=$(curl -s -o /dev/null -w '%{http_code}' -X "$2" "$GATEWAY$3" \
      -H "Authorization: Bearer $4" -H 'Content-Type: application/json' -d "$5")
  else
    code=$(curl -s -o /dev/null -w '%{http_code}' -X "$2" "$GATEWAY$3" \
      -H "Authorization: Bearer $4")
  fi
  if [ "$code" = "200" ] || [ "$code" = "201" ]; then pass "$1 ($code)"; else fail "$1 (HTTP $code)"; fi
}

echo "== Vendra smoke test against $GATEWAY =="

echo "-- Auth (real Keycloak JWT) --"
ADMIN_TOKEN=$(login admin password123)
VENDOR_TOKEN=$(login vendor password123)
CUST_TOKEN=$(login user password123)
[ -n "$ADMIN_TOKEN" ]  && pass "admin login"  || fail "admin login (no token)"
[ -n "$VENDOR_TOKEN" ] && pass "vendor login" || fail "vendor login (no token)"
[ -n "$CUST_TOKEN" ]   && pass "customer login" || fail "customer login (no token)"

echo "-- Product / catalog --"
check "list products"       GET  "/api/v1/products"                     "$CUST_TOKEN"
check "list categories"     GET  "/api/v1/categories"                   "$CUST_TOKEN"

echo "-- Vendors / trust / visibility --"
check "list vendors"        GET  "/api/v1/vendors"                      "$ADMIN_TOKEN"
check "top vendors"         GET  "/api/v1/vendors/top"                  "$CUST_TOKEN"
check "featured-new vendors" GET "/api/v1/vendors/featured-new"         "$CUST_TOKEN"
check "trust scores"        GET  "/api/v1/trust-scores"                 "$CUST_TOKEN"

echo "-- Orders / analytics / delivery --"
check "admin all orders"    GET  "/api/v1/orders"                       "$ADMIN_TOKEN"
check "vendor analytics"    GET  "/api/v1/analytics?vendorId=3"         "$VENDOR_TOKEN"
check "delivery partners"   GET  "/api/v1/delivery"                     "$ADMIN_TOKEN"

echo "-- Commission / disputes --"
check "commission rules"    GET  "/api/v1/commission/rules"            "$ADMIN_TOKEN"
check "commission ledger"   GET  "/api/v1/commission/ledger?vendorId=3" "$VENDOR_TOKEN"
check "disputes"            GET  "/api/v1/disputes"                     "$ADMIN_TOKEN"

echo "-- Inventory (reserve stock) --"
check "vendor stock"        GET  "/api/v1/inventory/my-stock"          "$VENDOR_TOKEN"

echo "-- Reviews --"
check "reviews by vendor"   GET  "/api/v1/reviews?vendorId=3"          "$CUST_TOKEN"

echo "-- Admin / reports / users --"
check "admin users"         GET  "/api/v1/admin/users"                 "$ADMIN_TOKEN"
check "admin report"        GET  "/api/v1/reports/admin"               "$ADMIN_TOKEN"

echo "-- Payments (Razorpay placeholder mode) --"
check "create payment"      POST "/api/v1/payments/create-order"       "$CUST_TOKEN" '{"orderId":"demo-1","amount":100}'

echo "-- Notifications --"
check "notifications"       GET  "/notifications?role=ADMIN"           "$ADMIN_TOKEN"

echo
echo "== Result: $PASS passed, $FAIL failed =="
[ "$FAIL" -eq 0 ]
