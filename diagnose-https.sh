#!/bin/bash

# HTTPS Backend Diagnostic Script
# Run this on the EC2 server to diagnose HTTPS issues

echo "🔍 BB AMP Hub HTTPS Diagnostic Script"
echo "======================================"

# Check if running as root or with sudo access
if [[ $EUID -eq 0 ]]; then
    echo "✅ Running as root"
else
    echo "⚠️  Running as non-root user. Some commands may need sudo."
fi

echo ""
echo "📊 System Status:"
echo "=================="

# Check Nginx status
echo "🔍 Nginx Status:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
    systemctl status nginx --no-pager -l
else
    echo "❌ Nginx is NOT running"
    echo "🔧 Starting Nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

echo ""
echo "🔍 Nginx Configuration:"
echo "======================="

# Check if our site is enabled
if [ -f "/etc/nginx/sites-available/bb-amp-hub" ]; then
    echo "✅ Nginx config file exists: /etc/nginx/sites-available/bb-amp-hub"
else
    echo "❌ Nginx config file missing: /etc/nginx/sites-available/bb-amp-hub"
fi

if [ -L "/etc/nginx/sites-enabled/bb-amp-hub" ]; then
    echo "✅ Site is enabled: /etc/nginx/sites-enabled/bb-amp-hub"
else
    echo "❌ Site is NOT enabled"
    echo "🔧 Enabling site..."
    sudo ln -sf /etc/nginx/sites-available/bb-amp-hub /etc/nginx/sites-enabled/
fi

# Test Nginx configuration
echo ""
echo "🧪 Testing Nginx Configuration:"
sudo nginx -t

echo ""
echo "🔍 SSL Certificate Status:"
echo "=========================="

# Check SSL certificate files
if [ -f "/etc/ssl/certs/bb-amp-hub.crt" ]; then
    echo "✅ SSL certificate exists: /etc/ssl/certs/bb-amp-hub.crt"
    echo "📅 Certificate details:"
    openssl x509 -in /etc/ssl/certs/bb-amp-hub.crt -text -noout | grep -E "(Subject:|Not Before:|Not After:)"
else
    echo "❌ SSL certificate missing: /etc/ssl/certs/bb-amp-hub.crt"
fi

if [ -f "/etc/ssl/private/bb-amp-hub.key" ]; then
    echo "✅ SSL private key exists: /etc/ssl/private/bb-amp-hub.key"
else
    echo "❌ SSL private key missing: /etc/ssl/private/bb-amp-hub.key"
fi

echo ""
echo "🔍 Firewall Status:"
echo "==================="

# Check UFW status
sudo ufw status

echo ""
echo "🔍 Port Status:"
echo "==============="

# Check what's listening on ports
echo "📡 Listening ports:"
sudo netstat -tlnp | grep -E ":(80|443|3001)"

echo ""
echo "🔍 Backend Status:"
echo "=================="

# Check PM2 status
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "🧪 Backend Health Check:"
curl -s http://localhost:3001/health | jq . 2>/dev/null || curl -s http://localhost:3001/health

echo ""
echo "🔍 Recent Nginx Logs:"
echo "====================="
echo "📝 Access logs (last 10 lines):"
sudo tail -10 /var/log/nginx/access.log 2>/dev/null || echo "No access logs found"

echo ""
echo "📝 Error logs (last 10 lines):"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error logs found"

echo ""
echo "🧪 Testing HTTPS Locally:"
echo "========================="

# Test HTTPS locally
echo "🔗 Testing https://localhost..."
curl -k -s https://localhost/health | head -5 2>/dev/null || echo "HTTPS test failed"

echo ""
echo "🔗 Testing https://54.226.14.229..."
curl -k -s https://54.226.14.229/health | head -5 2>/dev/null || echo "External HTTPS test failed"

echo ""
echo "🎯 Diagnostic Complete!"
echo "======================="
echo ""
echo "📋 Quick Fixes to Try:"
echo "1. If Nginx is not running: sudo systemctl start nginx"
echo "2. If site not enabled: sudo ln -sf /etc/nginx/sites-available/bb-amp-hub /etc/nginx/sites-enabled/"
echo "3. If config errors: sudo nginx -t"
echo "4. Reload Nginx: sudo systemctl reload nginx"
echo "5. Check firewall: sudo ufw allow 443/tcp"
