#!/bin/bash

# Fix nginx configuration for api.boldbusiness.com
# Run this ON the EC2 server (54.226.14.229)

echo "🔧 Fixing nginx configuration for api.boldbusiness.com"
echo "======================================================"
echo ""

# Backup existing config if it exists
if [ -f "/etc/nginx/sites-available/api.boldbusiness.com" ]; then
    echo "📦 Backing up existing config..."
    sudo cp /etc/nginx/sites-available/api.boldbusiness.com /etc/nginx/sites-available/api.boldbusiness.com.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
fi

echo ""
echo "📝 Creating nginx configuration for api.boldbusiness.com..."

sudo tee /etc/nginx/sites-available/api.boldbusiness.com > /dev/null << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name api.boldbusiness.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.boldbusiness.com;

    # SSL configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.boldbusiness.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.boldbusiness.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS headers
    add_header Access-Control-Allow-Origin "https://aiworkbench.boldbusiness.com" always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://aiworkbench.boldbusiness.com" always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Max-Age 86400;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/api/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Root location (optional - return API info)
    location = / {
        default_type application/json;
        return 200 '{"status":"ok","message":"BB AMP Hub API","version":"1.0"}';
    }
}
EOF

echo "✅ Nginx config created"

echo ""
echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/api.boldbusiness.com /etc/nginx/sites-enabled/api.boldbusiness.com

echo ""
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    echo ""
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Nginx reloaded successfully!"
    
    echo ""
    echo "🧪 Testing API endpoint..."
    sleep 2
    
    echo "Testing: https://api.boldbusiness.com/api/health"
    curl -s https://api.boldbusiness.com/api/health | jq . || curl -s https://api.boldbusiness.com/api/health
    
else
    echo "❌ Nginx configuration test failed!"
    echo "Restoring backup if it exists..."
    if [ -f "/etc/nginx/sites-available/api.boldbusiness.com.backup."* ]; then
        sudo cp /etc/nginx/sites-available/api.boldbusiness.com.backup.* /etc/nginx/sites-available/api.boldbusiness.com
    fi
    exit 1
fi

echo ""
echo "======================================================"
echo "✅ Configuration complete!"
echo ""
echo "API should now be accessible at:"
echo "  - https://api.boldbusiness.com/api/health"
echo "  - https://api.boldbusiness.com/api/groups"
echo "  - https://api.boldbusiness.com/api/user/profile"

