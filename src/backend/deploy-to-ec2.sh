#!/bin/bash

# BB AMP Hub Backend Deployment Script for EC2
# This script deploys the Node.js backend to your existing EC2 instance

set -e  # Exit on any error

echo "🚀 Starting BB AMP Hub Backend Deployment to EC2..."

# Configuration
APP_NAME="bb-amp-hub-backend"
APP_DIR="/home/ubuntu/$APP_NAME"
SERVICE_NAME="bb-amp-hub-backend"
PORT=3001

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_success "Node.js already installed: $(node --version)"
fi

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
else
    print_success "PM2 already installed: $(pm2 --version)"
fi

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy application files
print_status "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install --production

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Create production environment file
print_status "Creating production environment file..."
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=$PORT

# Database Configuration (using existing EC2 PostgreSQL)
DATABASE_URL="postgresql://postgresadmin:UDGDYf4ET3s6dfyAeusD@localhost:5432/ai-workbench"

# Google OAuth Configuration
GOOGLE_CLIENT_ID=1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET}

# Google Workspace Integration
GOOGLE_ADMIN_EMAIL=jmadrino@boldbusiness.com
GOOGLE_WORKSPACE_DOMAIN=boldbusiness.com
GOOGLE_SERVICE_ACCOUNT_PATH=./google-service-account.json

# OpenAI Configuration
OPENAI_API_KEY=\${OPENAI_API_KEY}
OPENAI_ORG_ID=org-cRVzeAj1CBsZgGArW3a3aVIx
OPENAI_ASSISTANT_ID=asst_R5RXI0LcyRxsgR80xb05oNQb

# JWT Secret (generate a secure one)
JWT_SECRET=\${JWT_SECRET}

# CORS Configuration
CORS_ORIGIN=https://main.d1wapgj6lifsrx.amplifyapp.com,http://localhost:3000

# Auto-sync disabled in production
AUTO_SYNC_ON_STARTUP=false
EOF

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'app.js',
    env_file: '.env.production',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Configure firewall to allow backend port
print_status "Configuring firewall..."
sudo ufw allow $PORT/tcp

# Stop existing PM2 process if running
print_status "Stopping existing application..."
pm2 stop $SERVICE_NAME 2>/dev/null || true
pm2 delete $SERVICE_NAME 2>/dev/null || true

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

print_success "🎉 Backend deployment completed!"
print_status "Application is running on port $PORT"
print_status "You can check status with: pm2 status"
print_status "View logs with: pm2 logs $SERVICE_NAME"
print_status "Restart with: pm2 restart $SERVICE_NAME"

# Display next steps
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in .env.production:"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - OPENAI_API_KEY"
echo "   - JWT_SECRET (generate a secure random string)"
echo ""
echo "2. Update AWS Amplify environment variables:"
echo "   - REACT_APP_API_URL=http://YOUR_EC2_IP:$PORT/api"
echo "   - REACT_APP_ENABLE_BACKEND_AUTH=true"
echo ""
echo "3. Test the backend:"
echo "   curl http://localhost:$PORT/api/health"
echo ""
