#!/bin/bash

# 🔧 Fix CORS Issues on Deployed Backend
# This script updates the backend with proper CORS configuration

set -e

echo "🔧 Fixing CORS configuration on backend server..."

# Configuration
EC2_IP="54.226.14.229"
EC2_USER="ubuntu"
BACKEND_DIR="/home/ubuntu/bb-amp-hub-backend"

echo "📡 Connecting to EC2 instance: $EC2_IP"

# Check if we can connect
if ! ping -c 1 $EC2_IP &> /dev/null; then
    echo "❌ Cannot reach EC2 instance. Please check the IP address."
    exit 1
fi

echo "📦 Updating backend files..."

# Copy the updated app.js to the server
scp -o StrictHostKeyChecking=no src/backend/app.js $EC2_USER@$EC2_IP:$BACKEND_DIR/

echo "🔄 Restarting backend service..."

# SSH into the server and restart the backend
ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP << 'EOF'
cd /home/ubuntu/bb-amp-hub-backend

# Check if PM2 is running the app
if pm2 list | grep -q "bb-amp-hub-backend"; then
    echo "🔄 Restarting PM2 process..."
    pm2 restart bb-amp-hub-backend
else
    echo "🚀 Starting new PM2 process..."
    pm2 start app.js --name bb-amp-hub-backend
fi

# Show PM2 status
pm2 list

# Test the health endpoint
echo "🧪 Testing health endpoint..."
sleep 3
curl -s http://localhost:3001/api/health || echo "❌ Health check failed"

EOF

echo "✅ CORS fix deployment complete!"
echo ""
echo "🧪 Testing CORS from your domain..."
echo "You can now test the frontend at: https://main.d1wapgj6lifsrx.amplifyapp.com"
echo ""
echo "🔍 If issues persist, check the browser console for CORS errors."
