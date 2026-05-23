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
CANVAS_API_BASE_URL=https://your-canvas.instructure.com

# Required: Update with your production domain  
BASE_URL=https://your-domain.com
MODERN_UI_URL=https://your-domain.com
```

### 3. Deploy
```bash
# Deploy with Docker Compose
export $(cat .env.production.local | grep -v '^#' | xargs)
docker-compose -f docker-compose.yml up -d --build
```

---

## 🔧 **DETAILED CONFIGURATION**

### **Environment Variables Reference**

#### **Modern UI Configuration**
```bash
# Frontend Environment
VITE_CANVAS_API_URL=https://your-canvas.instructure.com
```

---

## 🏗️ **DEPLOYMENT OPTIONS**

### **Option 1: Docker Compose (Recommended)**
```bash
# Deploy services
export $(cat .env.production.local | grep -v '^#' | xargs)
docker-compose -f docker-compose.yml up -d --build

# Services will be available at:
# - Modern UI: http://localhost:3003
```

### **Option 2: Manual Deployment**
```bash
# Build Modern UI
cd apps/classapex-lms
pnpm install
pnpm build
# Serve dist/ with your web server
```

---

## 🔐 **SECURITY CHECKLIST**

### **Before Production**
- [ ] Configure HTTPS with valid SSL certificates
- [ ] Set up proper secrets management
- [ ] Enable security monitoring and alerting

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks**
```bash
# Modern UI
curl https://your-domain.com
```

### **Log Monitoring**
```bash
# Docker logs
docker-compose logs -f modern-ui
```

---

## ✅ **PRODUCTION READY CHECKLIST**

- [ ] Environment variables configured
- [ ] HTTPS certificates installed
- [ ] End-to-end testing completed
- [ ] Monitoring configured
- [ ] Backup procedures established

**🎉 SchoolApex Modern UI is ready for production deployment!**
