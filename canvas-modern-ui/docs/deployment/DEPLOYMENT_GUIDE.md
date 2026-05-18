# SchoolApex Modern UI - Production Deployment Guide

## Overview

This comprehensive guide covers the complete deployment process for SchoolApex Modern UI, from initial setup to production monitoring. Follow these steps to ensure a secure, performant, and reliable deployment.

## Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **pnpm**: 8.0.0 or higher
- **Git**: Latest version
- **SSL Certificate**: Valid certificate for HTTPS
- **Canvas LMS**: Admin access for OAuth2 configuration

### Infrastructure Requirements

- **Web Server**: Nginx, Apache, or CDN (Cloudflare, AWS CloudFront)
- **SSL/TLS**: Certificate for HTTPS enforcement
- **Monitoring**: Error tracking (Sentry) and analytics
- **CI/CD**: GitHub Actions, GitLab CI, or similar

## Phase 1: Pre-Deployment Setup

### 1.1 Canvas OAuth2 Configuration

1. **Access Canvas Admin Panel**
   ```
   Navigate to: Admin → Developer Keys → + Developer Key → + API Key
   ```

2. **Configure OAuth2 Application**
   ```
   Key Name: SchoolApex Modern UI
   Owner Email: [admin-email]
   Redirect URIs:
   - https://[your-domain]/auth/callback
   - https://[staging-domain]/auth/callback (if applicable)
   
   Required Scopes:
   - url:GET|/api/v1/courses
   - url:GET|/api/v1/users/self
   - url:GET|/api/v1/courses/:course_id/assignments
   - url:GET|/api/v1/courses/:course_id/students
   - url:GET|/api/v1/courses/:course_id/enrollments
   - url:GET|/api/v1/courses/:course_id/analytics/assignments
   ```

3. **Security Settings**
   ```
   Require PKCE: Yes
   Code Challenge Method: S256
   Token Endpoint Auth Method: none
   Enforce HTTPS: Yes
   ```

### 1.2 Environment Configuration

1. **Create Production Environment File**
   ```bash
   cp apps/demo/.env.example apps/demo/.env.production
   ```

2. **Configure Production Variables**
   ```env
   # Canvas OAuth2 Configuration
   VITE_CANVAS_BASE_URL=https://[your-canvas-instance].instructure.com
   VITE_CANVAS_CLIENT_ID=[your-production-client-id]
   VITE_OAUTH2_REDIRECT_URI=https://[your-domain]/auth/callback

   # Application Settings
   VITE_APP_NAME=SchoolApex Modern UI
   VITE_ENVIRONMENT=production
   VITE_APP_BASE_URL=https://[your-domain]

   # Security Settings
   VITE_DEBUG_MODE=false
   VITE_LOG_LEVEL=error
   VITE_ENABLE_CONSOLE_LOGS=false

   # Monitoring
   VITE_SENTRY_DSN=[your-sentry-dsn]
   VITE_ANALYTICS_ENDPOINT=[your-analytics-endpoint]
   VITE_PERFORMANCE_ENDPOINT=[your-performance-endpoint]

   # CDN Configuration
   VITE_CDN_BASE_URL=[your-cdn-url]
   VITE_ASSETS_BASE_URL=[your-assets-url]
   ```

### 1.3 Security Validation

1. **Run Security Audit**
   ```bash
   pnpm test:security
   ```

2. **Validate Configuration**
   ```bash
   node scripts/validate-config.js
   ```

## Phase 2: Build and Optimization

### 2.1 Production Build

1. **Install Dependencies**
   ```bash
   pnpm install --frozen-lockfile
   ```

2. **Run Type Checking**
   ```bash
   pnpm type-check
   ```

3. **Run Tests**
   ```bash
   pnpm test
   pnpm test:e2e
   ```

4. **Build for Production**
   ```bash
   NODE_ENV=production pnpm build
   ```

### 2.2 Build Optimization

1. **Verify Bundle Size**
   ```bash
   # Check bundle analyzer output
   ls -la apps/demo/dist/assets/
   ```

2. **Validate Performance**
   ```bash
   # Run Lighthouse audit
   npx lighthouse https://[staging-url] --output=json --output-path=lighthouse-report.json
   ```

### 2.3 Security Hardening

1. **Content Security Policy**
   ```nginx
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://[canvas-domain] https://[analytics-domain];";
   ```

2. **Security Headers**
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-Content-Type-Options "nosniff";
   add_header Referrer-Policy "strict-origin-when-cross-origin";
   add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
   ```

## Phase 3: Deployment

### 3.1 Web Server Configuration

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name [your-domain];
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Root directory
    root /var/www/schoolapex/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass https://[canvas-domain]/api/;
        proxy_set_header Host [canvas-domain];
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name [your-domain];
    return 301 https://$server_name$request_uri;
}
```

### 3.2 CDN Configuration

#### Cloudflare Settings

1. **SSL/TLS Settings**
   - SSL/TLS encryption mode: Full (strict)
   - Always Use HTTPS: On
   - Minimum TLS Version: 1.2

2. **Speed Optimization**
   - Auto Minify: CSS, JavaScript, HTML
   - Brotli compression: On
   - Rocket Loader: Off (to avoid conflicts)

3. **Security Settings**
   - Security Level: Medium
   - Bot Fight Mode: On
   - Browser Integrity Check: On

### 3.3 Deployment Scripts

#### GitHub Actions Workflow

```yaml
name: Deploy SchoolApex Modern UI

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install pnpm
      run: npm install -g pnpm
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Run tests
      run: |
        pnpm test
        pnpm test:security
    
    - name: Build application
      run: pnpm build
      env:
        NODE_ENV: production
        VITE_CANVAS_BASE_URL: ${{ secrets.CANVAS_BASE_URL }}
        VITE_CANVAS_CLIENT_ID: ${{ secrets.CANVAS_CLIENT_ID }}
        VITE_OAUTH2_REDIRECT_URI: ${{ secrets.OAUTH2_REDIRECT_URI }}
        VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/schoolapex
          git pull origin main
          pnpm install --frozen-lockfile
          pnpm build
          sudo systemctl reload nginx
```

## Phase 4: Post-Deployment Validation

### 4.1 Functional Testing

1. **OAuth2 Flow**
   ```bash
   # Test authentication flow
   curl -I https://[your-domain]/auth/callback
   ```

2. **API Integration**
   ```bash
   # Test Canvas API connectivity
   curl -H "Authorization: Bearer [test-token]" \
        https://[canvas-domain]/api/v1/courses
   ```

### 4.2 Performance Validation

1. **Core Web Vitals**
   ```bash
   npx lighthouse https://[your-domain] --only-categories=performance
   ```

2. **Load Testing**
   ```bash
   # Using Artillery.js
   npx artillery quick --count 10 --num 5 https://[your-domain]
   ```

### 4.3 Security Validation

1. **SSL/TLS Check**
   ```bash
   nmap --script ssl-enum-ciphers -p 443 [your-domain]
   ```

2. **Security Headers**
   ```bash
   curl -I https://[your-domain]
   ```

## Phase 5: Monitoring and Maintenance

### 5.1 Error Monitoring

1. **Sentry Configuration**
   ```javascript
   // Already configured in the application
   // Monitor dashboard at https://sentry.io/[your-org]/schoolapex/
   ```

2. **Log Monitoring**
   ```bash
   # Monitor Nginx logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

### 5.2 Performance Monitoring

1. **Web Vitals Dashboard**
   - Monitor Core Web Vitals metrics
   - Set up alerts for performance degradation
   - Track user experience metrics

2. **Uptime Monitoring**
   ```bash
   # Set up monitoring with services like:
   # - Pingdom
   # - UptimeRobot
   # - StatusCake
   ```

### 5.3 Regular Maintenance

1. **Weekly Tasks**
   - Review error logs and fix issues
   - Monitor performance metrics
   - Check security alerts

2. **Monthly Tasks**
   - Update dependencies
   - Run security audits
   - Review and optimize performance

3. **Quarterly Tasks**
   - Conduct penetration testing
   - Review and update documentation
   - Plan feature updates

## Troubleshooting

### Common Issues

1. **OAuth2 Authentication Fails**
   - Verify Canvas OAuth2 configuration
   - Check redirect URI matches exactly
   - Validate client ID and scopes

2. **Performance Issues**
   - Check bundle size and optimize
   - Verify CDN configuration
   - Monitor server resources

3. **CORS Errors**
   - Verify Canvas domain configuration
   - Check browser console for specific errors
   - Validate CORS headers

### Emergency Procedures

1. **Rollback Deployment**
   ```bash
   # Rollback to previous version
   git checkout [previous-commit]
   pnpm build
   # Deploy previous build
   ```

2. **Emergency Maintenance Mode**
   ```nginx
   # Add to Nginx configuration
   location / {
       return 503 "SchoolApex is temporarily unavailable for maintenance";
   }
   ```

## Support and Documentation

- **Technical Documentation**: `/docs/`
- **API Documentation**: `/docs/api/`
- **User Guide**: `/docs/user-guide/`
- **Troubleshooting**: `/docs/troubleshooting/`

For additional support, contact the SchoolApex development team.

---

**Last Updated**: [Current Date]  
**Version**: 1.0.0  
**Maintained by**: SchoolApex Development Team
