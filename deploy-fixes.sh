#!/bin/bash

# Deploy fixes to production server
echo "🚀 Deploying fixes to production server..."

# SSH into production and update
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.160.207.35 << 'EOF'
    echo "📁 Navigating to backend directory..."
    cd /home/ubuntu/bb-amp-hub-backend
    
    echo "📥 Pulling latest code from GitHub..."
    git pull origin main
    
    echo "🔄 Restarting PM2 process..."
    pm2 restart bb-amp-hub-backend
    
    echo "📊 Checking PM2 status..."
    pm2 status
    
    echo "✅ Deployment complete!"
EOF

echo "🎯 Testing the API..."
echo "Testing group members endpoint..."
curl -k -s -H "Authorization: Bearer $(echo -n 'jmadrino@boldbusiness.com:1729000000' | base64)" "https://54.160.207.35/api/groups/cmfpjuuwnys8/members" | jq .

echo "✅ Deployment script completed!"
