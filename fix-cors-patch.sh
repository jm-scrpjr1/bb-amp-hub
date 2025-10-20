#!/bin/bash

# Fix CORS to allow PATCH method
# This script updates both Nginx and the backend application

set -e

echo "🚀 Fixing CORS to allow PATCH method..."
echo ""

# Configuration
EC2_HOST="54.226.14.229"
EC2_USER="ubuntu"
BACKEND_DIR="/home/ubuntu/bb-amp-hub/src/backend"

echo "📋 This script will:"
echo "  1. Update Nginx CORS configuration to allow PATCH"
echo "  2. Pull latest backend code with PATCH support"
echo "  3. Restart backend service"
echo "  4. Reload Nginx"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "🔧 Connecting to EC2 server..."

ssh -t ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
    set -e
    
    echo "📦 Step 1: Backup and update Nginx configuration..."
    
    # Backup current config
    sudo cp /etc/nginx/sites-available/api.boldbusiness.com /etc/nginx/sites-available/api.boldbusiness.com.backup.$(date +%Y%m%d_%H%M%S)
    
    # Update CORS methods to include PATCH
    sudo sed -i 's/Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"/Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"/g' /etc/nginx/sites-available/api.boldbusiness.com
    
    # Test Nginx configuration
    echo "🧪 Testing Nginx configuration..."
    sudo nginx -t
    
    echo ""
    echo "📦 Step 2: Update backend code..."
    cd /home/ubuntu/bb-amp-hub
    
    # Pull latest changes
    git pull origin main
    
    # Navigate to backend
    cd src/backend
    
    # Install dependencies (in case there are new ones)
    npm install
    
    echo ""
    echo "🔄 Step 3: Restart backend service..."
    pm2 restart bb-amp-hub-backend || pm2 start npm --name "bb-amp-hub-backend" -- start
    
    echo ""
    echo "🔄 Step 4: Reload Nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "✅ All done!"
    echo ""
    echo "📊 Backend status:"
    pm2 status
    
    echo ""
    echo "🌐 Nginx status:"
    sudo systemctl status nginx --no-pager -l
    
ENDSSH

echo ""
echo "✅ CORS fix deployed successfully!"
echo ""
echo "🧪 Test the fix by uploading a profile image at:"
echo "   https://aiworkbench.boldbusiness.com/profile"
echo ""

