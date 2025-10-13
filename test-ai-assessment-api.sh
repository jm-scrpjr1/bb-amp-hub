#!/bin/bash

# 🧪 Test AI Assessment API Endpoints
# Run this script to test the AI Assessment functionality

echo "🧪 Testing AI Assessment API Endpoints..."

# Configuration
BASE_URL="https://54.226.14.229/api"
# For testing, we'll use a simple token (in production, this would be a real auth token)
AUTH_TOKEN="dGVzdEBib2xkYnVzaW5lc3MuY29tOjE2OTc1NjgwMDA="  # base64 encoded test@boldbusiness.com:timestamp

echo "🔗 Testing against: $BASE_URL"
echo ""

# Test 1: Get Assessment Questions
echo "📝 Test 1: Getting assessment questions..."
curl -k -s -H "Authorization: Bearer $AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/assessment/questions?limit=5" | jq . || echo "❌ Questions endpoint failed"

echo ""
echo "---"
echo ""

# Test 2: Start Assessment Session
echo "🚀 Test 2: Starting assessment session..."
SESSION_RESPONSE=$(curl -k -s -H "Authorization: Bearer $AUTH_TOKEN" \
                        -H "Content-Type: application/json" \
                        -X POST "$BASE_URL/assessment/start")

echo "$SESSION_RESPONSE" | jq . || echo "❌ Start session failed"

# Extract session ID for further tests
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.session.sessionId' 2>/dev/null)

echo ""
echo "---"
echo ""

if [ "$SESSION_ID" != "null" ] && [ "$SESSION_ID" != "" ]; then
    echo "✅ Session created with ID: $SESSION_ID"
    
    # Test 3: Save an answer
    echo "💾 Test 3: Saving a test answer..."
    curl -k -s -H "Authorization: Bearer $AUTH_TOKEN" \
         -H "Content-Type: application/json" \
         -X POST "$BASE_URL/assessment/answer" \
         -d "{
           \"sessionId\": \"$SESSION_ID\",
           \"questionId\": 1,
           \"userAnswer\": \"I have hands-on experience with AI tools\",
           \"timeSpentSeconds\": 30
         }" | jq . || echo "❌ Save answer failed"
    
    echo ""
    echo "---"
    echo ""
    
    # Test 4: Complete Assessment
    echo "🏁 Test 4: Completing assessment..."
    curl -k -s -H "Authorization: Bearer $AUTH_TOKEN" \
         -H "Content-Type: application/json" \
         -X POST "$BASE_URL/assessment/complete" \
         -d "{\"sessionId\": \"$SESSION_ID\"}" | jq . || echo "❌ Complete assessment failed"
    
    echo ""
    echo "---"
    echo ""
    
    # Test 5: Get Assessment History
    echo "📊 Test 5: Getting assessment history..."
    curl -k -s -H "Authorization: Bearer $AUTH_TOKEN" \
         -H "Content-Type: application/json" \
         "$BASE_URL/assessment/history" | jq . || echo "❌ History endpoint failed"
    
else
    echo "❌ Could not extract session ID, skipping dependent tests"
fi

echo ""
echo "---"
echo ""

# Test 6: Basic health check
echo "❤️ Test 6: Health check..."
curl -k -s "$BASE_URL/hello" | jq . || echo "❌ Health check failed"

echo ""
echo ""
echo "🎉 AI Assessment API testing completed!"
echo ""
echo "📋 Summary:"
echo "  - If you see JSON responses above, the APIs are working ✅"
echo "  - If you see error messages, check the backend logs 🔍"
echo "  - The frontend should now be able to use the AI Assessment feature 🚀"
