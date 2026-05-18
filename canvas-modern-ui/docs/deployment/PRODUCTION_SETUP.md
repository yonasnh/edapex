# SchoolApex Modern UI - Production Setup Guide

## 🚀 **QUICK START (5 Minutes)**

### 1. Clone and Setup
```bash
git clone <your-repo>
cd canvas-modern-ui
cp .env.production .env.production.local
```

### 2. Configure Environment
Edit `.env.production.local` with your values:
```bash
# Required: Update these with your Canvas domain
LTI_ISSUER=https://your-canvas.instructure.com
CANVAS_API_BASE_URL=https://your-canvas.instructure.com

# Required: Update with your production domain  
BASE_URL=https://your-domain.com
LTI_INITIATE_LOGIN_URI=https://your-domain.com/lti/login
LTI_REDIRECT_URI=https://your-domain.com/lti/launch
MODERN_UI_URL=https://your-domain.com

# Required: Generate secure session secret (32+ bytes)
SESSION_SECRET=$(openssl rand -base64 32)

# Required: Generate LTI keys
cd packages/lti-service && ./generate-keys.sh
# Copy the generated private key to LTI_TOOL_PRIVATE_KEY_PEM
```

### 3. Deploy
```bash
./deploy.sh
```

### 4. Register in Canvas
```bash
# Use the generated configuration
cat packages/lti-service/canvas-tool-config.json

# Register in Canvas Admin → Developer Keys → LTI Key
# JWKS URL: https://your-domain.com/.well-known/jwks.json
```

---

## 🔧 **DETAILED CONFIGURATION**

### **Environment Variables Reference**

#### **LTI Service Configuration**
```bash
# Core Service
NODE_ENV=production
PORT=4001
LOG_LEVEL=info

# Session Security
SESSION_SECRET=your_secure_32_byte_session_secret

# LTI Tool Identity
LTI_TOOL_KID=lti-tool-key-1
LTI_TOOL_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Canvas Platform (UPDATE WITH YOUR CANVAS DOMAIN)
LTI_ISSUER=https://your-canvas.instructure.com
LTI_CLIENT_ID=your_developer_key_client_id
LTI_AUTHORIZATION_ENDPOINT=https://your-canvas.instructure.com/api/lti/authorize_redirect
LTI_TOKEN_ENDPOINT=https://your-canvas.instructure.com/login/oauth2/token
LTI_JWKS_ENDPOINT=https://your-canvas.instructure.com/api/lti/security/jwks

# Tool URLs (UPDATE WITH YOUR DOMAIN)
BASE_URL=https://your-domain.com
LTI_INITIATE_LOGIN_URI=https://your-domain.com/lti/login
LTI_REDIRECT_URI=https://your-domain.com/lti/launch
MODERN_UI_URL=https://your-domain.com

# Canvas REST API
CANVAS_API_BASE_URL=https://your-canvas.instructure.com
CANVAS_OAUTH_CLIENT_ID=your_oauth_client_id
CANVAS_OAUTH_CLIENT_SECRET=your_oauth_client_secret

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

#### **Modern UI Configuration**
```bash
# Frontend Environment
VITE_LTI_SERVICE_URL=https://your-domain.com
VITE_CANVAS_API_URL=https://your-canvas.instructure.com
```

---

## 🏗️ **DEPLOYMENT OPTIONS**

### **Option 1: Docker Compose (Recommended)**
```bash
# Production deployment with Docker
./deploy.sh

# Services will be available at:
# - LTI Service: http://localhost:4001
# - Modern UI: http://localhost:3001
# - Combined: http://localhost (via nginx)
```

### **Option 2: Manual Deployment**
```bash
# Build LTI Service
cd packages/lti-service
pnpm install --prod
pnpm build
node dist/server.js

# Build Modern UI
cd apps/demo  
pnpm install
pnpm build
# Serve dist/ with your web server
```

### **Option 3: Cloud Deployment**
```bash
# Deploy to cloud platforms
# - Heroku: Use Procfile
# - AWS: Use ECS/Fargate
# - Azure: Use Container Instances
# - GCP: Use Cloud Run
```

---

## 🔐 **SECURITY CHECKLIST**

### **Before Production**
- [ ] Generate unique RSA key pair for production
- [ ] Use secure session secret (32+ bytes, cryptographically random)
- [ ] Configure HTTPS with valid SSL certificates
- [ ] Set up proper secrets management (not .env files)
- [ ] Configure Canvas domain whitelist
- [ ] Enable security monitoring and alerting

### **Canvas Configuration**
- [ ] Register OAuth2 application with minimal scopes
- [ ] Configure tool placements appropriately
- [ ] Set proper visibility (public/admin only)
- [ ] Test with different user roles
- [ ] Verify JWKS endpoint accessibility

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks**
```bash
# Service health
curl https://your-domain.com/health

# JWKS availability
curl https://your-domain.com/.well-known/jwks.json

# Modern UI
curl https://your-domain.com
```

### **Log Monitoring**
```bash
# Docker logs
docker-compose logs -f lti-service
docker-compose logs -f modern-ui

# Application logs
tail -f packages/lti-service/logs/app.log
```

### **Performance Monitoring**
- **Response Times**: Monitor API endpoint performance
- **Error Rates**: Track 4xx/5xx responses
- **Memory Usage**: Monitor container resource usage
- **Canvas API**: Monitor OBO token exchange success rates

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues**

**1. JWKS Endpoint Not Working**
```bash
# Check key loading
curl http://localhost:4001/.well-known/jwks.json
# Should return: {"keys":[{"kty":"RSA",...}]}
```

**2. LTI Launch Fails**
```bash
# Check Canvas configuration
# Verify JWKS URL in Canvas matches your endpoint
# Check Canvas logs for JWT validation errors
```

**3. Canvas API Integration Issues**
```bash
# Test OBO token exchange
curl -X POST http://localhost:4001/api/canvas/token
# Should return token or 401 (expected without session)
```

**4. Modern UI Not Loading**
```bash
# Check if services are running
curl http://localhost:3001
curl http://localhost:4001/health
```

---

## ✅ **PRODUCTION READY CHECKLIST**

- [ ] Environment variables configured
- [ ] RSA keys generated and secured
- [ ] HTTPS certificates installed
- [ ] Canvas tool registered
- [ ] End-to-end testing completed
- [ ] Security audit passed
- [ ] Monitoring configured
- [ ] Backup procedures established

**🎉 SchoolApex Modern UI is ready for production deployment!**
