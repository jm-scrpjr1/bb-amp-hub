#!/bin/bash

# Deploy the DELETE member endpoint to production
# This script pulls the latest code and restarts the backend

set -e

EC2_HOST="54.226.14.229"
EC2_USER="ubuntu"
KEY_PATH="$HOME/Downloads/AI Workbench SSH.pem"

echo "🚀 Deploying DELETE member endpoint to production"
echo "=================================================="
echo ""
echo "Target: ${EC2_USER}@${EC2_HOST}"
echo "SSH Key: ${KEY_PATH}"
echo ""

# Check if key exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ SSH key not found at: $KEY_PATH"
    exit 1
fi

# Set correct permissions on key
chmod 400 "$KEY_PATH"

read -p "This will pull latest code and restart the backend. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "📦 Step 1: Connecting to EC2 and pulling latest code..."

ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no -t ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
    set -e

    echo "📍 Current directory: $(pwd)"

    # Navigate to backend directory
    cd ~/bb-amp-hub-backend
    
    echo ""
    echo "📦 Pulling latest changes from main branch..."
    git fetch origin
    git pull origin main
    
    echo ""
    echo "📋 Recent commits:"
    git log --oneline -5
    
    echo ""
    echo "🔍 Verifying DELETE endpoint exists in code..."
    if grep -q "app.delete('/api/groups/:groupId/members/:userId'" app.js; then
        echo "✅ DELETE endpoint found in app.js"
    else
        echo "❌ DELETE endpoint NOT found in app.js"
        echo "This is unexpected. Checking file..."
        grep -n "groups.*members" app.js | tail -10
        exit 1
    fi
    
    echo ""
    echo "🔄 Restarting backend with PM2..."
    pm2 restart bb-amp-hub-backend
    
    echo ""
    echo "⏳ Waiting for backend to start..."
    sleep 3
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 list
    
    echo ""
    echo "📝 Recent logs:"
    pm2 logs bb-amp-hub-backend --lines 15 --nostream
    
    echo ""
    echo "🧪 Testing DELETE endpoint locally..."
    echo "Note: This will return 401 (Unauthorized) which is expected without auth token"
    curl -X DELETE http://localhost:3001/api/groups/test-group-id/members/test-user-id -v 2>&1 | grep -E "HTTP|401|403|404" || echo "Request sent"
    
ENDSSH

echo ""
echo "=================================================="
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing from external..."
echo "Testing: https://api.boldbusiness.com/api/health"
curl -s https://api.boldbusiness.com/api/health | jq . || curl -s https://api.boldbusiness.com/api/health

echo ""
echo "📋 Next steps:"
echo "1. Test DELETE member functionality in the UI"
echo "2. Check browser console for any errors"
echo "3. Verify the member is removed from the database"
echo ""
echo "If you still get 404, check nginx logs on the server:"
echo "  ssh ${EC2_USER}@${EC2_HOST} 'sudo tail -50 /var/log/nginx/error.log'"

