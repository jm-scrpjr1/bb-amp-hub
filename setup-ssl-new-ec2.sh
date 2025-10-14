#!/bin/bash

# 🔐 Setup SSL Certificate on New EC2 Instance (54.226.14.229)
# Run this script ON the new EC2 server

set -e

echo "🔐 Setting up SSL certificate on new EC2 instance..."

# Configuration
NEW_IP="54.226.14.229"

echo "📋 Step 1: Installing required packages..."
sudo apt update
sudo apt install -y nginx openssl

echo "🔑 Step 2: Creating self-signed SSL certificate..."
sudo mkdir -p /etc/ssl/private /etc/ssl/certs

# Create self-signed certificate for the new IP
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/bb-amp-hub.key \
  -out /etc/ssl/certs/bb-amp-hub.crt \
  -subj "/C=US/ST=State/L=City/O=BoldBusiness/CN=${NEW_IP}"

echo "🌐 Step 3: Configuring Nginx..."
sudo tee /etc/nginx/sites-available/bb-amp-hub > /dev/null << EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ${NEW_IP};
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${NEW_IP};

    # SSL configuration
    ssl_certificate /etc/ssl/certs/bb-amp-hub.crt;
    ssl_certificate_key /etc/ssl/private/bb-amp-hub.key;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CORS headers for API
    add_header Access-Control-Allow-Origin "https://main.d1wapgj6lifsrx.amplifyapp.com" always;
    add_header Access-Control-Allow-Origin "https://aiworkbench.boldbusiness.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
    add_header Access-Control-Allow-Credentials "true" always;

    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://main.d1wapgj6lifsrx.amplifyapp.com" always;
        add_header Access-Control-Allow-Origin "https://aiworkbench.boldbusiness.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Additional proxy settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo "🔗 Step 4: Enabling site and restarting Nginx..."
sudo ln -sf /etc/nginx/sites-available/bb-amp-hub /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "🔥 Step 5: Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

echo "✅ SSL setup complete!"
echo ""
echo "🔗 Your backend should now be available at:"
echo "  - HTTPS: https://${NEW_IP}/api"
echo "  - Health Check: https://${NEW_IP}/api/health"
echo ""
echo "🧪 Test with:"
echo "  curl -k https://${NEW_IP}/api/health"
echo ""
echo "⚠️  Note: This uses a self-signed certificate."
echo "   Browsers will show a security warning that you need to accept."
