#!/bin/bash

# Update CORS configuration on production server
# This script updates the CORS_ORIGIN environment variable to include the custom domain

echo "🔧 Updating CORS configuration on production server..."

# SSH connection details (update these with your actual details)
EC2_HOST="54.160.207.35"
EC2_USER="ubuntu"  # or "ec2-user" depending on your AMI
KEY_PATH="~/.ssh/your-key.pem"  # Update with your actual key path

# New CORS configuration
NEW_CORS_ORIGIN="http://localhost:3000,https://main.d1wapgj6lifsrx.amplifyapp.com,https://aiworkbench.boldbusiness.com"

echo "📡 Connecting to EC2 instance..."

# Update the .env.production file on the server
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" << EOF
    echo "🔍 Current working directory:"
    pwd
    
    echo "📁 Navigating to backend directory..."
    cd /home/ubuntu/bb-amp-hub-backend || cd /home/ec2-user/bb-amp-hub-backend || cd ~/bb-amp-hub-backend
    
    echo "📝 Current .env.production content:"
    cat .env.production 2>/dev/null || echo "File not found"
    
    echo "🔧 Updating CORS_ORIGIN..."
    # Remove existing CORS_ORIGIN line and add new one
    grep -v "^CORS_ORIGIN=" .env.production > .env.production.tmp 2>/dev/null || touch .env.production.tmp
    echo "CORS_ORIGIN=$NEW_CORS_ORIGIN" >> .env.production.tmp
    mv .env.production.tmp .env.production
    
    echo "✅ Updated .env.production content:"
    cat .env.production
    
    echo "🔄 Restarting backend service..."
    pm2 restart bb-amp-hub-backend || pm2 restart all
    
    echo "📊 PM2 status:"
    pm2 status
    
    echo "🏥 Testing backend health:"
    sleep 3
    curl -s http://localhost:3001/api/health || echo "Health check failed"
EOF

echo "✅ CORS configuration update completed!"
echo ""
echo "🧪 Test the updated configuration:"
echo "1. Open your browser to https://aiworkbench.boldbusiness.com"
echo "2. Try to sign in with Google"
echo "3. Check browser console for CORS errors"
echo ""
echo "🔍 If you still see CORS errors, check the backend logs:"
echo "ssh -i $KEY_PATH $EC2_USER@$EC2_HOST 'pm2 logs bb-amp-hub-backend'"
