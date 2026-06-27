#!/bin/bash
# OrderLink Backend API Comprehensive Test
# Usage: bash test_api.sh

BASE_URL="http://localhost:8000/api"

echo "============================================================"
echo "ORDERLINK BACKEND API COMPREHENSIVE TEST"
echo "============================================================"
echo ""

# Test 1: Login as Admin (Distributor)
echo "1. Testing Admin Login..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" -H "Content-Type: application/json" -d '{"email":"admin@orderlink.com","password":"password"}')
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | python -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "   ✗ Admin login failed"
    exit 1
else
    echo "   ✓ Admin login successful"
    echo "   Token: ${ADMIN_TOKEN:0:15}..."
fi
echo ""

# Test 2: Dashboard Endpoint
echo "2. Testing Dashboard (Distributor)..."
DASHBOARD=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/dashboard")
echo "$DASHBOARD" | python -m json.tool 2>/dev/null | head -20
echo ""

# Test 3: Products List
echo "3. Testing Products Endpoint..."
PRODUCTS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/products")
PRODUCT_COUNT=$(echo "$PRODUCTS" | python -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
echo "   Products returned: $PRODUCT_COUNT"
echo ""

# Test 4: Orders List (Distributor)
echo "4. Testing Orders Endpoint (Distributor access)..."
ORDERS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/orders")
ORDER_COUNT=$(echo "$ORDERS" | python -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
echo "   Orders returned: $ORDER_COUNT"
echo ""

# Test 5: Categories
echo "5. Testing Categories Endpoint..."
CATEGORIES=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/categories")
CAT_COUNT=$(echo "$CATEGORIES" | python -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
echo "   Categories returned: $CAT_COUNT"
echo ""

# Test 6: Profile
echo "6. Testing Profile Endpoint..."
PROFILE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/profile")
echo "$PROFILE" | python -m json.tool 2>/dev/null | head -15
echo ""

# Test 7: Login as Retailer
echo "7. Testing Retailer Login..."
RETAILER_RESPONSE=$(curl -s -X POST "$BASE_URL/login" -H "Content-Type: application/json" -d '{"email":"retailer@orderlink.com","password":"password"}')
RETAILER_TOKEN=$(echo $RETAILER_RESPONSE | python -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

if [ -z "$RETAILER_TOKEN" ]; then
    echo "   ✗ Retailer login failed"
else
    echo "   ✓ Retailer login successful"
    echo "   Token: ${RETAILER_TOKEN:0:15}..."
fi
echo ""

# Test 8: Retailer My Orders
echo "8. Testing My Orders (Retailer)..."
MY_ORDERS=$(curl -s -H "Authorization: Bearer $RETAILER_TOKEN" "$BASE_URL/my-orders")
MY_ORDER_COUNT=$(echo "$MY_ORDERS" | python -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
echo "   My orders returned: $MY_ORDER_COUNT"
echo ""

# Test 9: RBAC - Retailer accessing all orders (should fail)
echo "9. Testing RBAC (Retailer accessing /orders - should be blocked)..."
RBAC_TEST=$(curl -s -H "Authorization: Bearer $RETAILER_TOKEN" "$BASE_URL/orders")
RBAC_MSG=$(echo "$RBAC_TEST" | python -c "import sys,json; print(json.load(sys.stdin).get('message',''))" 2>/dev/null)
if [[ "$RBAC_MSG" == *"Akses ditolak"* ]]; then
    echo "   ✓ RBAC working - Retailer blocked from /orders"
else
    echo "   ✗ RBAC issue - Retailer can access /orders"
fi
echo ""

# Test 10: Login as Driver
echo "10. Testing Driver Login..."
DRIVER_RESPONSE=$(curl -s -X POST "$BASE_URL/login" -H "Content-Type: application/json" -d '{"email":"driver@orderlink.com","password":"password"}')
DRIVER_TOKEN=$(echo $DRIVER_RESPONSE | python -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

if [ -z "$DRIVER_TOKEN" ]; then
    echo "   ✗ Driver login failed"
else
    echo "   ✓ Driver login successful"
    echo "   Token: ${DRIVER_TOKEN:0:15}..."
fi
echo ""

# Test 11: Driver My Deliveries
echo "11. Testing My Deliveries (Driver)..."
MY_DELIVERIES=$(curl -s -H "Authorization: Bearer $DRIVER_TOKEN" "$BASE_URL/my-deliveries")
MY_DELIVERY_COUNT=$(echo "$MY_DELIVERIES" | python -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
echo "   My deliveries returned: $MY_DELIVERY_COUNT"
echo ""

# Test 12: Notifications
echo "12. Testing Notifications (Admin)..."
NOTIFICATIONS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/notifications")
NOTIF_COUNT=$(echo "$NOTIFICATIONS" | python -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
echo "   Notifications returned: $NOTIF_COUNT"
echo ""

echo "============================================================"
echo "API TEST COMPLETE"
echo "============================================================"
