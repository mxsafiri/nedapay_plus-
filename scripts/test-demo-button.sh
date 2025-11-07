#!/bin/bash

echo "🧪 Testing Demo Button Functionality..."
echo "========================================"
echo ""

# Test 1: Trigger Demo Order
echo "1️⃣ Testing Demo Trigger API..."
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/demo/trigger \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000000, "toCurrency": "CNY"}')

if echo "$ORDER_RESPONSE" | grep -q "success"; then
  echo "   ✅ Demo trigger API works"
  ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"orderId":"[^"]*' | cut -d'"' -f4)
  echo "   📝 Order ID: $ORDER_ID"
else
  echo "   ❌ Demo trigger API failed"
  echo "   Response: $ORDER_RESPONSE"
  exit 1
fi

echo ""

# Test 2: Check Order Status
echo "2️⃣ Testing Order Status API..."
sleep 2

STATUS_RESPONSE=$(curl -s http://localhost:3000/api/demo/status/$ORDER_ID)

if echo "$STATUS_RESPONSE" | grep -q "success"; then
  echo "   ✅ Status API works"
  STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
  echo "   📊 Current Status: $STATUS"
else
  echo "   ❌ Status API failed"
  echo "   Response: $STATUS_RESPONSE"
  exit 1
fi

echo ""

# Test 3: Check if Virtual Bot is Running
echo "3️⃣ Checking Virtual Bot Status..."
PENDING_ORDERS=$(curl -s http://localhost:3000/api/demo/trigger | grep -o '"pendingOrders":[0-9]*' | cut -d':' -f2)

if [ ! -z "$PENDING_ORDERS" ]; then
  echo "   📊 Pending orders in queue: $PENDING_ORDERS"
  if [ "$PENDING_ORDERS" -gt 0 ]; then
    echo "   ℹ️  Virtual Bot should process these"
    echo "   💡 Start bot with: npm run demo:bot"
  else
    echo "   ✅ All orders processed (bot might be running)"
  fi
else
  echo "   ⚠️  Could not check pending orders"
fi

echo ""
echo "========================================"
echo "✅ Demo Button Functionality Test Complete"
echo ""
echo "📌 Summary:"
echo "   • Demo Trigger API: ✅ Working"
echo "   • Order Status API: ✅ Working"  
echo "   • Order Created: $ORDER_ID"
echo "   • Current Status: $STATUS"
echo ""
echo "🎬 To test in browser:"
echo "   1. Login: demo@crdbbank.co.tz / Demo2025!"
echo "   2. Hard refresh: Cmd + Shift + R"
echo "   3. Click 'Run Demo' button"
echo "   4. Watch order status update"
echo ""
