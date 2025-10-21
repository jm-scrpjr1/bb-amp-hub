#!/bin/bash

# Diagnose why api.boldbusiness.com is returning 404
# Run this ON the EC2 server (54.226.14.229)

echo "🔍 Diagnosing API 404 Issue on api.boldbusiness.com"
echo "=================================================="
echo ""

echo "1️⃣ Checking if backend is running on port 3001..."
echo "---------------------------------------------------"
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is responding on localhost:3001"
    curl -s http://localhost:3001/api/health | jq . || curl -s http://localhost:3001/api/health
else
    echo "❌ Backend is NOT responding on localhost:3001"
    echo ""
    echo "Checking PM2 processes..."
    pm2 list
    echo ""
    echo "Recent backend logs:"
    pm2 logs bb-amp-hub-backend --lines 20 --nostream || echo "No PM2 process found"
fi

echo ""
echo "2️⃣ Checking Nginx configuration..."
echo "---------------------------------------------------"
echo "Available nginx sites:"
ls -la /etc/nginx/sites-available/

echo ""
echo "Enabled nginx sites:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "Checking for api.boldbusiness.com config:"
if [ -f "/etc/nginx/sites-available/api.boldbusiness.com" ]; then
    echo "✅ Config file exists: /etc/nginx/sites-available/api.boldbusiness.com"
    echo ""
    echo "Config content (location blocks only):"
    grep -A 10 "location" /etc/nginx/sites-available/api.boldbusiness.com
else
    echo "❌ Config file NOT found: /etc/nginx/sites-available/api.boldbusiness.com"
fi

echo ""
if [ -L "/etc/nginx/sites-enabled/api.boldbusiness.com" ]; then
    echo "✅ Site is enabled (symlink exists)"
else
    echo "❌ Site is NOT enabled (no symlink in sites-enabled)"
fi

echo ""
echo "3️⃣ Testing nginx configuration..."
echo "---------------------------------------------------"
sudo nginx -t

echo ""
echo "4️⃣ Checking nginx status..."
echo "---------------------------------------------------"
sudo systemctl status nginx --no-pager | head -20

echo ""
echo "5️⃣ Testing local API endpoint..."
echo "---------------------------------------------------"
echo "Testing: http://localhost:3001/api/health"
curl -v http://localhost:3001/api/health 2>&1 | grep -E "HTTP|Connected|error"

echo ""
echo "Testing: http://localhost:3001/api/groups"
curl -v http://localhost:3001/api/groups 2>&1 | grep -E "HTTP|Connected|error"

echo ""
echo "6️⃣ Checking nginx error logs..."
echo "---------------------------------------------------"
echo "Recent nginx errors:"
sudo tail -20 /var/log/nginx/error.log

echo ""
echo "7️⃣ Checking nginx access logs..."
echo "---------------------------------------------------"
echo "Recent nginx access (last 10 lines):"
sudo tail -10 /var/log/nginx/access.log

echo ""
echo "=================================================="
echo "✅ Diagnosis complete!"
echo ""
echo "Next steps:"
echo "1. If backend is not running: cd ~/bb-amp-hub/src/backend && pm2 start app.js --name bb-amp-hub-backend"
echo "2. If nginx config is missing: Run the setup script to create it"
echo "3. If config exists but not enabled: sudo ln -s /etc/nginx/sites-available/api.boldbusiness.com /etc/nginx/sites-enabled/"

