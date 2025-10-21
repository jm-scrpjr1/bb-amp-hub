#!/bin/bash

# Setup git authentication and deploy DELETE endpoint fix
# This script configures git with PAT and pulls latest code

set -e

EC2_HOST="54.226.14.229"
EC2_USER="ubuntu"
KEY_PATH="$HOME/Downloads/AI Workbench SSH.pem"
GITHUB_TOKEN="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"

echo "🚀 Setting up Git and deploying DELETE endpoint fix"
echo "===================================================="
echo ""
echo "Target: ${EC2_USER}@${EC2_HOST}"
echo ""

# Check if key exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ SSH key not found at: $KEY_PATH"
    exit 1
fi

# Set correct permissions on key
chmod 400 "$KEY_PATH"

echo "📦 Connecting to EC2 and setting up git..."
echo ""

ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << ENDSSH
    set -e
    
    echo "📍 Current directory: \$(pwd)"
    echo ""
    
    # Navigate to backend directory
    cd ~/bb-amp-hub-backend
    
    echo "🔧 Step 1: Configuring git credentials..."

    # Set git user (required for some operations)
    git config --global user.email "jlope@boldbusiness.com"
    git config --global user.name "BB AMP Hub Server"

    echo "✅ Git credentials configured"
    echo ""

    echo "🔧 Step 2: Setting up repository..."

    # Check current git status
    echo "Current git status:"
    git status --short | head -5 || echo "Git not initialized yet"

    # Remove the broken git repo and set up properly
    rm -rf .git

    # Initialize fresh git repo
    git init

    # Add remote with token embedded in URL
    git remote add origin https://${GITHUB_TOKEN}@github.com/jm-scrpjr1/bb-amp-hub.git

    # Fetch the latest code
    echo ""
    echo "📥 Fetching latest code from GitHub..."
    git fetch origin main

    # Reset to match the remote main branch
    git reset --hard origin/main
    
    # Check if we're in the right directory structure
    if [ -f "app.js" ]; then
        echo "✅ We're in the backend directory"
    else
        echo "⚠️  Looking for backend files..."
        if [ -d "src/backend" ]; then
            echo "Found src/backend, need to adjust..."
            # We cloned the whole repo, need to move to backend dir
            cd src/backend
        fi
    fi
    
    echo ""
    echo "🔍 Step 3: Verifying DELETE endpoint exists..."
    
    if grep -q "app.delete('/api/groups/:groupId/members/:userId'" app.js; then
        echo "✅ DELETE endpoint found in app.js!"
        echo ""
        echo "Endpoint details:"
        grep -A 3 "app.delete('/api/groups/:groupId/members/:userId'" app.js
    else
        echo "❌ DELETE endpoint NOT found!"
        echo "Checking what we have..."
        grep -n "groups.*members" app.js | tail -10
        exit 1
    fi
    
    echo ""
    echo "🔄 Step 4: Restarting backend with PM2..."
    
    # Make sure we're in the right directory for PM2
    cd ~/bb-amp-hub-backend
    
    # Create backup of current app.js
    cp app.js app.js.backup.\$(date +%Y%m%d_%H%M%S)
    
    # Restart PM2
    pm2 restart bb-amp-hub-backend
    
    echo ""
    echo "⏳ Waiting for backend to start..."
    sleep 3
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 list
    
    echo ""
    echo "📝 Recent logs:"
    pm2 logs bb-amp-hub-backend --lines 20 --nostream
    
    echo ""
    echo "🧪 Testing DELETE endpoint locally..."
    echo "Note: Will return 401 (Unauthorized) without auth token - that's expected"
    curl -X DELETE http://localhost:3001/api/groups/test-id/members/test-user -v 2>&1 | grep -E "HTTP|401|403|404|200" || echo "Request completed"
    
ENDSSH

echo ""
echo "=================================================="
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing from external..."
echo "Testing: https://api.boldbusiness.com/api/health"
curl -s https://api.boldbusiness.com/api/health | jq . || curl -s https://api.boldbusiness.com/api/health

echo ""
echo "=================================================="
echo "✅ All done! The DELETE member endpoint should now work!"
echo ""
echo "Next steps:"
echo "1. Try deleting a member from a group in the UI"
echo "2. Check the browser console for any errors"
echo "3. Verify the member is removed from the database"

