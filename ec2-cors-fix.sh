#!/bin/bash

# 🔧 EC2 Backend CORS Fix Script
# Copy and paste this entire script into your EC2 server terminal

echo "🔧 Starting backend CORS fix..."

# Navigate to backend directory
cd /home/ubuntu/bb-amp-hub-backend || {
    echo "❌ Backend directory not found. Checking alternative locations..."
    cd /home/ubuntu/bb-amp-hub/src/backend || {
        echo "❌ Cannot find backend directory. Please check the path."
        exit 1
    }
}

echo "📍 Current directory: $(pwd)"

# Pull latest changes
echo "📦 Pulling latest changes..."
git pull origin main

# Set environment variables to disable Node.js CORS
echo "🔧 Setting production environment variables..."
echo "NODE_ENV=production" >> .env
echo "BEHIND_PROXY=true" >> .env

# Show the .env file
echo "📋 Current .env configuration:"
cat .env

# Restart the backend
echo "🔄 Restarting backend service..."
pm2 restart bb-amp-hub-backend

# Show PM2 status
echo "📊 PM2 Status:"
pm2 list

# Check logs
echo "📝 Recent logs:"
pm2 logs bb-amp-hub-backend --lines 10

# Test the health endpoint
echo "🧪 Testing health endpoint..."
sleep 3
curl -s http://localhost:3001/api/health | jq . || curl -s http://localhost:3001/api/health

echo ""
echo "✅ Backend CORS fix complete!"
echo ""
echo "🎯 Next steps:"
echo "1. AWS Amplify will auto-deploy frontend changes in 2-3 minutes"
echo "2. Clear browser cache or use incognito mode"
echo "3. Test login at: https://main.d1wapgj6lifsrx.amplifyapp.com"
