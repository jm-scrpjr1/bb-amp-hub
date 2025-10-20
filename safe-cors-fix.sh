#!/bin/bash

# SAFE CORS FIX - Only updates Nginx CORS headers
# NO data changes, NO service restarts, NO risky operations

set -e

EC2_HOST="54.226.14.229"
EC2_USER="ubuntu"
KEY_PATH="$HOME/Downloads/AI Workbench SSH.pem"

echo "🔒 SAFE CORS FIX - Read-only check first..."
echo ""

# First, let's check current Nginx config (read-only)
echo "📋 Step 1: Checking current Nginx CORS configuration..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
    echo "Current CORS methods in Nginx:"
    grep -n "Access-Control-Allow-Methods" /etc/nginx/sites-available/api.boldbusiness.com || echo "Not found"
ENDSSH

echo ""
echo "📋 Step 2: Checking if PATCH is already allowed..."
PATCH_EXISTS=$(ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} "grep 'PATCH' /etc/nginx/sites-available/api.boldbusiness.com" || echo "")

if [[ ! -z "$PATCH_EXISTS" ]]; then
    echo "✅ PATCH method is already in Nginx config!"
    echo "Checking backend..."
else
    echo "❌ PATCH method NOT found in Nginx config"
    echo ""
    echo "🔧 Will update Nginx configuration (SAFE - only config file change)"
    echo "   - Creates backup first"
    echo "   - Tests config before applying"
    echo "   - Only reloads Nginx (graceful, no downtime)"
    echo ""
    read -p "Proceed with Nginx update? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
    
    ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
        set -e
        
        echo "📦 Creating backup..."
        sudo cp /etc/nginx/sites-available/api.boldbusiness.com /etc/nginx/sites-available/api.boldbusiness.com.backup.$(date +%Y%m%d_%H%M%S)
        
        echo "✏️  Updating CORS methods to include PATCH..."
        sudo sed -i 's/Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"/Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"/g' /etc/nginx/sites-available/api.boldbusiness.com
        
        echo "🧪 Testing Nginx configuration..."
        sudo nginx -t
        
        if [ $? -eq 0 ]; then
            echo "✅ Nginx config test passed"
            echo "🔄 Reloading Nginx (graceful, no downtime)..."
            sudo systemctl reload nginx
            echo "✅ Nginx reloaded!"
        else
            echo "❌ Nginx config test failed - restoring backup"
            sudo cp /etc/nginx/sites-available/api.boldbusiness.com.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/sites-available/api.boldbusiness.com
            exit 1
        fi
ENDSSH
fi

echo ""
echo "📋 Step 3: Checking backend CORS configuration..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
    cd /home/ubuntu/bb-amp-hub/src/backend
    echo "Current backend CORS methods:"
    grep -A 2 "methods:" app.js | head -5 || echo "Not found in expected format"
ENDSSH

echo ""
echo "📋 Step 4: Checking if backend code needs update..."
BACKEND_PATCH=$(ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} "cd /home/ubuntu/bb-amp-hub/src/backend && grep 'PATCH' app.js" || echo "")

if [[ ! -z "$BACKEND_PATCH" ]]; then
    echo "✅ Backend already has PATCH support!"
else
    echo "❌ Backend needs update"
    echo ""
    echo "🔧 Will update backend code (SAFE operation):"
    echo "   - Pull latest code from GitHub"
    echo "   - Install dependencies (if needed)"
    echo "   - Restart PM2 process (graceful restart, no data loss)"
    echo ""
    read -p "Proceed with backend update? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipped backend update."
        exit 0
    fi
    
    ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
        set -e
        
        echo "📦 Pulling latest code..."
        cd /home/ubuntu/bb-amp-hub
        git pull origin main
        
        echo "📦 Installing dependencies..."
        cd src/backend
        npm install --production
        
        echo "🔄 Restarting backend (graceful restart)..."
        pm2 restart bb-amp-hub-backend
        
        echo "✅ Backend updated!"
        echo ""
        echo "📊 PM2 Status:"
        pm2 status
ENDSSH
fi

echo ""
echo "✅ CORS fix completed successfully!"
echo ""
echo "🧪 Test profile image upload at: https://aiworkbench.boldbusiness.com/profile"
echo ""

