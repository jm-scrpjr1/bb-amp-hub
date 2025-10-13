#!/bin/bash

# 🚀 Update Backend with AI Assessment APIs
# Run this script ON your EC2 server (54.226.14.229)

set -e

echo "🚀 Updating Backend with AI Assessment APIs..."

# Navigate to backend directory
cd /home/ubuntu/bb-amp-hub || {
    echo "❌ Repository directory not found. Please check the path."
    exit 1
}

echo "📍 Current directory: $(pwd)"

# Pull latest changes from repository (includes AI Assessment code)
echo "📦 Pulling latest changes from GitHub..."
git pull origin main

# Navigate to backend directory
cd src/backend

echo "📦 Installing/updating dependencies..."
npm install

# Install pg if not already installed (for database connections)
npm install pg

echo "🔧 Setting up environment variables..."
# Update .env file with production settings
if [ -f .env ]; then
    echo "📝 Updating existing .env file..."
    # Remove existing entries if they exist
    sed -i '/^NODE_ENV=/d' .env
    sed -i '/^BEHIND_PROXY=/d' .env
    sed -i '/^DATABASE_URL=/d' .env
else
    echo "📝 Creating new .env file..."
    touch .env
fi

# Add production environment variables
cat >> .env << 'EOF'
NODE_ENV=production
BEHIND_PROXY=true
DATABASE_URL=postgresql://postgresadmin:UDGDYf4ET3s6dfyAeusD@ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com:5432/ai_workbench
EOF

echo "✅ Environment variables updated"

# Show current PM2 processes
echo "📊 Current PM2 processes:"
pm2 list

# Restart the backend service
echo "🔄 Restarting backend service..."

# Check if PM2 is running the app
if pm2 list | grep -q "bb-amp-hub-backend"; then
    echo "🔄 Restarting existing PM2 process..."
    pm2 restart bb-amp-hub-backend
else
    echo "🚀 Starting new PM2 process..."
    pm2 start app.js --name bb-amp-hub-backend
fi

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Show PM2 status
echo "📊 Updated PM2 Status:"
pm2 list

# Test the health endpoint
echo "🧪 Testing health endpoint..."
curl -s http://localhost:3001/api/hello | jq . || curl -s http://localhost:3001/api/hello || echo "Health endpoint test failed"

# Test the new AI Assessment endpoints
echo "🧪 Testing AI Assessment endpoints..."
echo "Testing /api/assessment/questions..."
curl -s -H "Authorization: Bearer test" http://localhost:3001/api/assessment/questions?limit=5 | head -200 || echo "AI Assessment endpoint test failed"

# Show recent logs
echo "📋 Recent backend logs:"
pm2 logs bb-amp-hub-backend --lines 20

echo ""
echo "✅ Backend update complete!"
echo ""
echo "🎯 New AI Assessment endpoints available:"
echo "  - GET  /api/assessment/questions"
echo "  - POST /api/assessment/start"
echo "  - POST /api/assessment/answer"
echo "  - POST /api/assessment/complete"
echo "  - GET  /api/assessment/history"
echo "  - GET  /api/assessment/session/:id"
echo ""
echo "🔗 Backend is available at:"
echo "  - HTTP: http://54.226.14.229:3001/api"
echo "  - HTTPS (via nginx): https://54.226.14.229/api"
echo ""
echo "🔍 To check logs: pm2 logs bb-amp-hub-backend"
echo "🔄 To restart: pm2 restart bb-amp-hub-backend"
