#!/bin/bash

# Update Nginx CORS configuration to allow PATCH method
# Run this on the EC2 server

echo "🔧 Updating Nginx CORS configuration to allow PATCH method..."

# Backup current config
sudo cp /etc/nginx/sites-available/api.boldbusiness.com /etc/nginx/sites-available/api.boldbusiness.com.backup.$(date +%Y%m%d_%H%M%S)

# Update the CORS methods to include PATCH
sudo sed -i 's/Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"/Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"/g' /etc/nginx/sites-available/api.boldbusiness.com

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
    echo ""
    echo "CORS configuration updated to allow PATCH method"
else
    echo "❌ Nginx configuration test failed!"
    echo "Restoring backup..."
    sudo cp /etc/nginx/sites-available/api.boldbusiness.com.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/sites-available/api.boldbusiness.com
    exit 1
fi

