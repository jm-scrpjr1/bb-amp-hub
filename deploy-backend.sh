#!/bin/bash

# Deploy Backend to AWS EC2
# This script updates the backend server with the latest code including AI Assessment APIs

echo "🚀 Deploying Backend to AWS EC2..."

# Configuration
EC2_HOST="54.160.207.35"
EC2_USER="ubuntu"  # or ec2-user depending on AMI
BACKEND_DIR="/home/ubuntu/bb-amp-hub/src/backend"
REPO_URL="https://github.com/jm-scrpjr1/bb-amp-hub.git"

echo "📦 Step 1: Preparing deployment package..."

# Create a temporary directory for deployment
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy backend files to temp directory
cp -r src/backend/* $TEMP_DIR/
echo "✅ Backend files copied to temp directory"

echo "🔄 Step 2: Connecting to EC2 and updating backend..."

# SSH into EC2 and update the backend
ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST << 'EOF'
echo "🔍 Checking current backend status..."
cd /home/ubuntu/bb-amp-hub

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo "📦 Installing/updating dependencies..."
cd src/backend
npm install

echo "🔄 Restarting backend server..."
# Kill existing node processes
pkill -f "node app.js" || true
pkill -f "npm start" || true

# Wait a moment for processes to stop
sleep 2

echo "🚀 Starting backend server..."
# Start the backend server in the background
nohup npm start > backend.log 2>&1 &

# Wait a moment for server to start
sleep 5

echo "✅ Backend deployment completed!"

# Check if server is running
if pgrep -f "node app.js" > /dev/null; then
    echo "✅ Backend server is running"
    echo "📊 Server status:"
    ps aux | grep "node app.js" | grep -v grep
else
    echo "❌ Backend server failed to start"
    echo "📋 Last 20 lines of log:"
    tail -20 backend.log
fi

echo "🔍 Testing backend health..."
curl -k http://localhost:3001/api/hello || echo "❌ Health check failed"

EOF

echo "🧹 Cleaning up temporary files..."
rm -rf $TEMP_DIR

echo "🎉 Deployment script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test the backend: curl -k https://54.160.207.35/api/hello"
echo "2. Test AI Assessment: curl -k https://54.160.207.35/api/assessment/questions"
echo "3. Check backend logs if needed: ssh $EC2_USER@$EC2_HOST 'cd /home/ubuntu/bb-amp-hub/src/backend && tail -50 backend.log'"
echo ""
echo "🔗 Backend should now be available at:"
echo "   - HTTP: http://54.160.207.35:3001/api"
echo "   - HTTPS (via nginx): https://54.160.207.35/api"
