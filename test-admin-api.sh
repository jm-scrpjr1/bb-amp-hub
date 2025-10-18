#!/bin/bash

# Test admin panel API endpoints
# This script tests if the Prisma fix worked

echo "🧪 Testing Admin Panel API Endpoints..."
echo ""

# Get a test token (base64 encoded email:timestamp)
TOKEN=$(echo -n "jmadrino@boldbusiness.com:$(date +%s)000" | base64)

echo "📝 Using token: ${TOKEN:0:30}..."
echo ""

# Test 1: Analytics endpoint
echo "1️⃣ Testing /api/admin/analytics..."
ANALYTICS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  https://api.boldbusiness.com/api/admin/analytics)

HTTP_STATUS=$(echo "$ANALYTICS_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$ANALYTICS_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Analytics endpoint: SUCCESS (200)"
  echo "   Response: ${RESPONSE_BODY:0:100}..."
else
  echo "❌ Analytics endpoint: FAILED ($HTTP_STATUS)"
  echo "   Response: $RESPONSE_BODY"
fi
echo ""

# Test 2: Groups endpoint
echo "2️⃣ Testing /api/groups..."
GROUPS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  https://api.boldbusiness.com/api/groups)

HTTP_STATUS=$(echo "$GROUPS_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$GROUPS_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Groups endpoint: SUCCESS (200)"
  echo "   Response: ${RESPONSE_BODY:0:100}..."
else
  echo "❌ Groups endpoint: FAILED ($HTTP_STATUS)"
  echo "   Response: $RESPONSE_BODY"
fi
echo ""

# Test 3: Check backend logs for errors
echo "3️⃣ Checking backend logs for errors..."
ssh -i ~/Downloads/"AI\ Workbench\ SSH.pem" ubuntu@api.boldbusiness.com \
  "pm2 logs bb-amp-hub-backend --err --lines 10 --nostream | tail -5" > /tmp/backend_errors.log

if grep -q "Cannot read properties of undefined" /tmp/backend_errors.log; then
  echo "❌ Backend logs: ERRORS FOUND"
  cat /tmp/backend_errors.log
else
  echo "✅ Backend logs: NO NEW ERRORS"
fi
echo ""

echo "🏁 Test complete!"

