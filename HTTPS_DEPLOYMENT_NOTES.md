# HTTPS Backend Deployment - Implementation Notes

## 🔧 Changes Made on EC2 Server (54.226.14.229)

### 1. SSL Certificate Setup
```bash
# Created self-signed SSL certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/bb-amp-hub.key \
  -out /etc/ssl/certs/bb-amp-hub.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=54.226.14.229"
```

### 2. Nginx Configuration
Created `/etc/nginx/sites-available/bb-amp-hub`:
```nginx
server {
    listen 80;
    server_name 54.226.14.229;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 54.226.14.229;

    ssl_certificate /etc/ssl/certs/bb-amp-hub.crt;
    ssl_certificate_key /etc/ssl/private/bb-amp-hub.key;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        # CORS headers - Updated for current AWS Amplify domain
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }

        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. JWT Token Configuration
Updated `/home/ubuntu/bb-amp-hub-backend/app.js`:
```javascript
// Changed JWT token expiration from 24h to 7d
{ expiresIn: "7d" }
```

### 4. Firewall Configuration
```bash
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 80/tcp   # HTTP (redirects to HTTPS)
sudo ufw allow 3001/tcp # Backend (for direct access if needed)
```

### 5. Backend CORS Update
```javascript
// Removed generic CORS middleware since Nginx handles CORS
// app.use(cors()); // CORS handled by Nginx proxy
```

## 🎯 Results

### Fixed Issues:
1. ✅ **Mixed Content Error**: HTTPS → HTTPS communication
2. ✅ **JWT Token Expiration**: Extended from 24h to 7d for better UX
3. ✅ **CORS Configuration**: Proper headers for frontend domain
4. ✅ **SSL Security**: All traffic encrypted

### New Endpoints:
- **HTTPS API**: `https://54.226.14.229/api`
- **Health Check**: `https://54.226.14.229/api/health`
- **Database Test**: `https://54.226.14.229/api/test-db`
- **Authentication**: `https://54.226.14.229/api/auth/google`

### AWS Amplify Environment Variables:
```
REACT_APP_API_URL=https://54.226.14.229/api
REACT_APP_GOOGLE_CLIENT_ID=1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com
REACT_APP_ENABLE_BACKEND_AUTH=true
```

## 🔄 Deployment Status
- Backend: ✅ Running with PM2
- HTTPS: ✅ SSL certificate active
- CORS: ✅ Configured for frontend
- JWT: ✅ 7-day expiration
- Database: ✅ Connected and ready

---

## 🔧 CORS Fix Applied (Oct 12, 2025)

**Issue**: Production React app on `https://main.d2j9kw8p4v6431.amplifyapp.com` was getting 403 Forbidden errors when accessing group members API.

**Root Cause**: Nginx CORS configuration was set to allow only `https://aiworkbench.boldbusiness.com`, but the actual production app runs on AWS Amplify domain `https://main.d2j9kw8p4v6431.amplifyapp.com`.

**Solution Applied**:
```bash
# Updated nginx configuration to allow all origins temporarily
sudo sed -i "s|https://aiworkbench.boldbusiness.com|*|g" /etc/nginx/sites-available/default
sudo nginx -t && sudo systemctl reload nginx
```

**Files Modified on Production Server**:
- `/etc/nginx/sites-available/default` - Updated CORS headers to `Access-Control-Allow-Origin: *`
- `/home/ubuntu/bb-amp-hub-backend/.env` - Cleaned up duplicate environment variables

**Backend Environment Variables**:
- `NODE_ENV=production` - Ensures backend runs in production mode
- `BEHIND_PROXY=true` - Disables Node.js CORS, lets nginx handle CORS

**Result**: ✅ General group members and all group API calls now work successfully from production React app.

**Security Note**: For production, consider restricting CORS to specific domains instead of `*` for better security.
