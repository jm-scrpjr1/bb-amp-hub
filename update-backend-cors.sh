#!/bin/bash

# 🔧 Update Backend CORS Configuration
# Run this script ON your EC2 server (54.160.207.35)

set -e

echo "🔧 Updating backend CORS configuration..."

# Navigate to backend directory
cd /home/ubuntu/bb-amp-hub-backend || {
    echo "❌ Backend directory not found. Checking alternative locations..."
    cd /home/ubuntu/bb-amp-hub/src/backend || {
        echo "❌ Cannot find backend directory. Please check the path."
        exit 1
    }
}

echo "📍 Current directory: $(pwd)"

# Pull latest changes from repository
echo "📦 Pulling latest changes..."
git pull origin main

# Set production environment variables to disable Node.js CORS
echo "🔧 Setting production environment variables..."
export NODE_ENV=production
export BEHIND_PROXY=true

# Update .env file if it exists
if [ -f .env ]; then
    echo "📝 Updating .env file..."
    # Remove existing NODE_ENV and BEHIND_PROXY if they exist
    sed -i '/^NODE_ENV=/d' .env
    sed -i '/^BEHIND_PROXY=/d' .env
    # Add new values
    echo "NODE_ENV=production" >> .env
    echo "BEHIND_PROXY=true" >> .env
else
    echo "📝 Creating .env file..."
    echo "NODE_ENV=production" > .env
    echo "BEHIND_PROXY=true" >> .env
fi

# Show the updated CORS configuration
echo "🔍 Updated CORS configuration:"
grep -A 20 "CORS Configuration" app.js || echo "CORS config not found in expected format"

# Restart the backend service
echo "🔄 Restarting backend service..."

# Check if PM2 is running the app
if pm2 list | grep -q "bb-amp-hub-backend"; then
    echo "🔄 Restarting existing PM2 process..."
    pm2 restart bb-amp-hub-backend
    pm2 logs bb-amp-hub-backend --lines 10
else
    echo "🚀 Starting new PM2 process..."
    pm2 start app.js --name bb-amp-hub-backend
fi

# Show PM2 status
echo "📊 PM2 Status:"
pm2 list

# Test the health endpoint
echo "🧪 Testing health endpoint..."
sleep 3
curl -s http://localhost:3001/api/health | jq . || curl -s http://localhost:3001/api/health

echo ""
echo "✅ Backend CORS fix complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Test the frontend at: https://main.d1wapgj6lifsrx.amplifyapp.com"
echo "2. Check browser console for any remaining CORS errors"
echo "3. If issues persist, check PM2 logs: pm2 logs bb-amp-hub-backend"
