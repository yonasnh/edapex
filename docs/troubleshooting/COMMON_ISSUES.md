# 🔧 Troubleshooting Guide

This guide covers common issues you might encounter while developing or using SchoolApex Modern UI.

## Installation Issues

### Node.js Version Problems

**Problem**: `Error: Unsupported Node.js version`

**Solution**:
```bash
# Check current Node.js version
node --version

# Install Node.js 18+ using nvm
nvm install 18
nvm use 18

# Or using n
n 18
```

### pnpm Installation Issues

**Problem**: `pnpm: command not found`

**Solution**:
```bash
# Install pnpm globally
npm install -g pnpm

# Or using corepack (Node.js 16.10+)
corepack enable
corepack prepare pnpm@latest --activate

# Verify installation
pnpm --version
```

### Dependency Installation Failures

**Problem**: `Failed to install dependencies`

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstall dependencies
pnpm install

# If still failing, try with legacy peer deps
pnpm install --legacy-peer-deps
```

## Development Server Issues

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3002`

**Solution**:
```bash
# Find and kill process using the port
lsof -ti :3002 | xargs kill -9
lsof -ti :3003 | xargs kill -9
lsof -ti :3005 | xargs kill -9

# Or use the service management script
./start-services.sh cleanup

# Start services again
pnpm dev
```

### Services Not Starting

**Problem**: Development servers fail to start

**Solution**:
```bash
# Check service status
./start-services.sh status

# View service logs
./start-services.sh logs

# Restart all services
./start-services.sh restart

# Start services individually
pnpm --filter classapex-lms dev
pnpm --filter @schoolapex/lti-service dev
```

### Hot Module Replacement Not Working

**Problem**: Changes not reflected in browser

**Solution**:
```bash
# Restart development server
pnpm dev

# Clear browser cache
# Chrome: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Check Vite configuration
# Ensure HMR is enabled in vite.config.ts
```

## Build Issues

### TypeScript Compilation Errors

**Problem**: `Type errors during build`

**Solution**:
```bash
# Run type checking
pnpm type-check

# Fix common issues:
# 1. Missing type definitions
pnpm add -D @types/node @types/react

# 2. Update TypeScript configuration
# Check tsconfig.json for proper settings

# 3. Clear TypeScript cache
rm -rf .tsbuildinfo
pnpm build
```

### Bundle Size Issues

**Problem**: Large bundle sizes affecting performance

**Solution**:
```bash
# Analyze bundle size
pnpm build
pnpm --filter classapex-lms analyze

# Common fixes:
# 1. Implement code splitting
# 2. Use dynamic imports
# 3. Remove unused dependencies
# 4. Optimize images and assets
```

## Canvas Integration Issues

### API Authentication Failures

**Problem**: `401 Unauthorized` or `403 Forbidden` errors

**Solution**:
```bash
# Check API token validity
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-canvas-instance.com/api/v1/users/self

# Verify environment variables
echo $CANVAS_API_TOKEN
echo $CANVAS_API_URL

# Update .env.local files
CANVAS_API_URL=https://your-canvas-instance.com
CANVAS_API_TOKEN=your_valid_token
```

### CORS Issues

**Problem**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
```bash
# For development, Canvas needs CORS configuration
# Add to Canvas developer console:
# Account > Settings > Approved Integrations

# Or use a proxy in development
# Update vite.config.ts:
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://your-canvas-instance.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
```

### LTI Launch Failures

**Problem**: LTI tool not launching from Canvas

**Solution**:
```bash
# Check LTI service status
curl http://localhost:4001/health

# Verify JWKS endpoint
curl http://localhost:4001/.well-known/jwks.json

# Check Canvas developer key configuration
# Ensure URLs match your local development setup

# Verify RSA keys exist
ls -la packages/lti-service/keys/

# Regenerate keys if missing
cd packages/lti-service
./generate-keys.sh
```

## Database and API Issues

### GraphQL API Errors

**Problem**: GraphQL queries failing

**Solution**:
```bash
# Check GraphQL service status
curl http://localhost:4003/health

# Test GraphQL endpoint
curl -X POST http://localhost:4003/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'

# Check service logs
tail -f logs/lms-api.log

# Restart GraphQL service
pnpm --filter @classapex/lms dev
```

### Canvas API Rate Limiting

**Problem**: `429 Too Many Requests` errors

**Solution**:
```typescript
// Implement retry logic with exponential backoff
const retryRequest = async (fn: () => Promise<any>, retries = 3) => {
  try {
    return await fn()
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      const delay = Math.pow(2, 3 - retries) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1)
    }
    throw error
  }
}
```

## Performance Issues

### Slow Page Loading

**Problem**: Pages take too long to load

**Solution**:
```bash
# Enable performance monitoring
# Add to your component:
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)

# Common optimizations:
# 1. Implement lazy loading
# 2. Optimize images
# 3. Use React.memo for expensive components
# 4. Implement virtual scrolling for large lists
```

### Memory Leaks

**Problem**: Browser memory usage keeps increasing

**Solution**:
```typescript
// Clean up subscriptions and timers
useEffect(() => {
  const subscription = someObservable.subscribe()
  const timer = setInterval(() => {}, 1000)

  return () => {
    subscription.unsubscribe()
    clearInterval(timer)
  }
}, [])

// Use React DevTools Profiler to identify issues
```

## Testing Issues

### E2E Tests Failing

**Problem**: Playwright tests failing intermittently

**Solution**:
```bash
# Run tests in headed mode for debugging
pnpm test:e2e:headed

# Run specific test file
pnpm test:e2e tests/e2e/discussions.spec.ts

# Update Playwright browsers
npx playwright install

# Check test configuration
# Ensure proper wait conditions and selectors
```

### Unit Tests Failing

**Problem**: Vitest tests failing

**Solution**:
```bash
# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test src/components/Button/Button.test.tsx

# Clear test cache
rm -rf node_modules/.vitest

# Update test configuration
# Check vitest.config.ts for proper setup
```

## Browser-Specific Issues

### Safari Compatibility

**Problem**: Features not working in Safari

**Solution**:
```bash
# Check for unsupported features
# Use caniuse.com to verify browser support

# Add polyfills if needed
pnpm add core-js

# Update browserslist configuration
# .browserslistrc
> 1%
last 2 versions
not dead
not ie 11
```

### Mobile Browser Issues

**Problem**: Layout issues on mobile devices

**Solution**:
```css
/* Add proper viewport meta tag */
<meta name="viewport" content="width=device-width, initial-scale=1.0">

/* Use responsive design patterns */
@media (max-width: 768px) {
  .container {
    padding: var(--cds-spacing-03);
  }
}

/* Test on actual devices or browser dev tools */
```

## Environment-Specific Issues

### Production Build Failures

**Problem**: Build works locally but fails in production

**Solution**:
```bash
# Test production build locally
pnpm build
pnpm preview

# Check environment variables
# Ensure all required env vars are set in production

# Review build logs for specific errors
# Common issues:
# 1. Missing environment variables
# 2. Different Node.js versions
# 3. Memory limitations
```

### Docker Issues

**Problem**: Docker containers not starting

**Solution**:
```bash
# Check Docker logs
docker-compose logs -f

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check port conflicts
docker ps
netstat -tulpn | grep :3002
```

## Getting Additional Help

### Debug Information to Collect

When reporting issues, include:

1. **Environment Information**:
   ```bash
   node --version
   pnpm --version
   npm list --depth=0
   ```

2. **Error Messages**: Full error stack traces

3. **Browser Information**: Version, console errors

4. **Steps to Reproduce**: Detailed reproduction steps

5. **Configuration Files**: Relevant config files

### Support Channels

- **GitHub Issues**: [Create an issue](https://github.com/yonasnh/schoolapex/issues)
- **GitHub Discussions**: [Join discussions](https://github.com/yonasnh/schoolapex/discussions)
- **Documentation**: Check other docs in this repository

### Emergency Fixes

For critical production issues:

```bash
# Quick rollback
git revert HEAD
pnpm build
# Deploy previous version

# Emergency hotfix
git checkout -b hotfix/critical-fix
# Make minimal fix
git commit -m "hotfix: resolve critical issue"
# Deploy immediately
```

Remember: When in doubt, check the logs first! Most issues can be diagnosed by examining the console output and service logs. 🔍
