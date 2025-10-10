# BB AMP Hub Backend Deployment Guide

## 🎯 Deployment to Existing EC2 Instance

Since you already have an EC2 instance running PostgreSQL, we'll deploy the backend to the same instance.

### Prerequisites

1. **EC2 Instance** with PostgreSQL running
2. **SSH access** to the EC2 instance
3. **Security Group** allowing inbound traffic on port 3001
4. **Domain/IP** for the EC2 instance

### 🚀 Quick Deployment

#### Option 1: Automated Deployment Script

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/jm-scrpjr1/bb-amp-hub.git
   cd bb-amp-hub/src/backend
   ```

3. **Run the deployment script:**
   ```bash
   chmod +x deploy-to-ec2.sh
   ./deploy-to-ec2.sh
   ```

4. **Configure environment variables:**
   ```bash
   nano .env.production
   # Fill in the required secrets (see .env.production.example)
   ```

5. **Restart the application:**
   ```bash
   pm2 restart bb-amp-hub-backend
   ```

#### Option 2: Manual Deployment

1. **Install Node.js (if not installed):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone and setup:**
   ```bash
   git clone https://github.com/jm-scrpjr1/bb-amp-hub.git
   cd bb-amp-hub/src/backend
   npm install --production
   ```

4. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Configure environment:**
   ```bash
   cp .env.production.example .env.production
   nano .env.production  # Edit with your values
   ```

6. **Start with PM2:**
   ```bash
   pm2 start app.js --name bb-amp-hub-backend
   pm2 save
   pm2 startup
   ```

### 🔧 Configuration

#### Required Environment Variables

```bash
# Generate JWT secret
openssl rand -base64 32

# Get Google Client Secret from Google Cloud Console
# Use your OpenAI API key
# Upload google-service-account.json securely
```

#### Security Group Configuration

Ensure your EC2 security group allows:
- **Port 22** (SSH)
- **Port 5432** (PostgreSQL - localhost only)
- **Port 3001** (Backend API - from anywhere or specific IPs)

### 🌐 Update Frontend Configuration

After backend deployment, update AWS Amplify environment variables:

```
REACT_APP_API_URL=https://YOUR_EC2_IP/api
REACT_APP_ENABLE_BACKEND_AUTH=true
```

**Note**: Backend now uses HTTPS with Nginx reverse proxy and 7-day JWT token expiration.

### 🧪 Testing

1. **Health check:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Database connection:**
   ```bash
   curl http://localhost:3001/api/test-db
   ```

3. **From frontend:**
   - Try signing in with @boldbusiness.com account
   - Check browser console for successful backend authentication

### 📊 Monitoring

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs bb-amp-hub-backend

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart bb-amp-hub-backend
```

### 🔒 Security Considerations

1. **Firewall:** Only allow necessary ports
2. **Environment Variables:** Keep secrets secure
3. **SSL/TLS:** Consider adding HTTPS with nginx reverse proxy
4. **Updates:** Regularly update dependencies

### 🚨 Troubleshooting

#### Common Issues:

1. **Port already in use:**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 PID
   ```

2. **Database connection failed:**
   - Check PostgreSQL is running: `sudo systemctl status postgresql`
   - Verify DATABASE_URL in .env.production

3. **Permission denied:**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   ```

4. **PM2 not starting on boot:**
   ```bash
   pm2 unstartup
   pm2 startup
   pm2 save
   ```

### 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs bb-amp-hub-backend`
2. Verify environment variables
3. Test database connectivity
4. Check security group settings
