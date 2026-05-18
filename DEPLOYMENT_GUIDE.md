# SchoolApex Modern UI - Deployment Guide

## Quick Start (Local Development)

### 1. Start LTI Service
```bash
cd packages/lti-service
pnpm install
pnpm dev
# Service runs on http://localhost:4001
```

### 2. Start Modern UI
```bash
cd apps/demo
pnpm dev
# UI runs on http://localhost:3001
```

### 3. Test Integration
- Visit http://localhost:3001 (mock mode)
- Click ℹ️ icon in header to see Launch Info
- Verify LTI context providers are working

## Canvas Registration

### 1. Generate Keys
```bash
cd packages/lti-service
./generate-keys.sh
# Copy output to .env file
```

### 2. Configure Environment
Update `packages/lti-service/.env`:
```env
LTI_ISSUER=https://your-canvas-domain.instructure.com
LTI_CLIENT_ID=your_developer_key_client_id
# ... other Canvas-specific settings
```

### 3. Register in Canvas
Follow `packages/lti-service/CANVAS_REGISTRATION_GUIDE.md`

## Production Deployment

### Prerequisites
- Node.js 18+ 
- HTTPS domain
- Canvas administrator access

### 1. Environment Setup
```bash
# Clone and install
git clone <repository>
cd canvas-modern-ui
pnpm install
pnpm build
```

### 2. Configure Production Environment
```env
NODE_ENV=production
BASE_URL=https://your-domain.com
MODERN_UI_URL=https://your-domain.com
# ... update all URLs to production domain
```

### 3. Deploy Services
```bash
# LTI Service
cd packages/lti-service
pnpm start

# Modern UI (serve built files)
cd apps/demo
pnpm build
# Serve dist/ folder with your web server
```

### 4. Update Canvas Registration
- Update all localhost URLs to production domain
- Verify HTTPS endpoints are accessible
- Test LTI launch from Canvas

## Architecture Overview

```
Canvas LMS
    ↓ (LTI 1.3 Launch)
LTI Service (:4001)
    ↓ (Bootstrap Token)
Modern UI (:3001)
    ↓ (Optional: Canvas REST API)
Canvas API (OBO)
```

## Key Files

- `packages/lti-service/` - LTI 1.3 backend service
- `packages/core/src/contexts/lti-context.tsx` - LTI integration
- `packages/components/src/ui/LaunchInfo/` - Debug component
- `apps/demo/` - Modern UI demo application
- `packages/lti-service/CANVAS_REGISTRATION_GUIDE.md` - Detailed setup

## Monitoring & Debugging

### Health Checks
- LTI Service: `GET /health`
- JWKS: `GET /.well-known/jwks.json`

### Debug Tools
- Launch Info component (ℹ️ icon in header)
- Browser developer tools
- LTI service logs (structured JSON)

### Common Issues
1. **JWKS endpoint errors** - Check private key format
2. **Invalid client_id** - Verify Canvas Developer Key
3. **CORS issues** - Ensure proper domain configuration
4. **Session issues** - Check cookie settings for iframe

## Next Steps

After successful deployment:
1. Implement Canvas REST API (OBO) integration
2. Add LTI Advantage services (NRPS, AGS, Deep Linking)
3. Configure grade passback workflows
4. Set up production monitoring and error tracking
5. Add automated testing and CI/CD pipeline
