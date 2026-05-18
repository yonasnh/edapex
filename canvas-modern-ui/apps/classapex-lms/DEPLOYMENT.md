# ClassApex LMS — Deployment Guide

## Overview

This document describes how to deploy ClassApex LMS to staging and production environments. The application is a Vite + React + TypeScript frontend served via Nginx, proxying API requests to a Canvas LMS backend.

## Prerequisites

- Docker & Docker Compose (recommended)
- Node.js 18+ (for manual builds)
- pnpm 8+ (for manual builds)
- Access to a Canvas LMS instance (the backend)

## Environments

| Environment | Config File | Canvas Backend |
|------------|-------------|----------------|
| Development | `.env` | Local Rails (port 3000) |
| Staging | `.env.staging` | staging-canvas.example.com |
| Production | `.env.production` | canvas.example.com |

## Quick Deploy (Docker)

### 1. Build the image

```bash
docker build -t classapex-lms:latest -f Dockerfile .
```

### 2. Run with environment

**Staging:**
```bash
docker run -d \
  --name classapex-staging \
  -p 3003:3003 \
  -e CANVAS_API_URL=https://canvas-staging.example.com \
  classapex-lms:latest
```

**Production:**
```bash
docker run -d \
  --name classapex-production \
  -p 3003:3003 \
  -e CANVAS_API_URL=https://canvas.example.com \
  -e NODE_ENV=production \
  classapex-lms:latest
```

## Manual Build & Deploy

### 1. Install dependencies

```bash
pnpm install --frozen-lockfile
```

### 2. Build for target environment

```bash
# Staging
cp .env.staging .env.production
pnpm build

# Production
cp .env.production .env.production
pnpm build
```

### 3. Serve built files

The output is in `apps/classapex-lms/dist/`. Serve with any static server:

```bash
# Using the provided Nginx config
cp -r apps/classapex-lms/dist /usr/share/nginx/html
cp apps/classapex-lms/nginx-container.conf /etc/nginx/nginx.conf
nginx -g "daemon off;"
```

## GitHub Actions CI/CD

The project includes a CI pipeline (`.github/workflows/ci.yml`) that:

1. Installs dependencies
2. Runs linting (`yarn lint`)
3. Runs type checking (`yarn check:ts`)
4. Runs tests (`yarn test`)
5. Builds the application

For CD, add a deployment step to the workflow:

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to production
      run: |
        docker build -t classapex-lms:latest .
        docker tag classapex-lms:latest registry.example.com/classapex-lms:${{ github.sha }}
        docker push registry.example.com/classapex-lms:${{ github.sha }}
        # Deploy to your container orchestration (Kubernetes, ECS, etc.)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GRAPHQL_ENDPOINT` | Yes | GraphQL endpoint (use `/api/graphql` for proxy) |
| `VITE_CANVAS_API_TOKEN` | No | Optional API token for development |
| `VITE_ENABLE_PERFORMANCE_MONITORING` | No | Enable web vitals tracking |
| `VITE_SENTRY_DSN` | No | Sentry DSN for error tracking |
| `VITE_SENTRY_ENVIRONMENT` | No | Sentry environment name |
| `VITE_API_PROXY_TARGET` | Staging/Prod | Canvas backend URL for the Nginx proxy |
| `CANVAS_API_URL` | Docker | Canvas backend URL (used by Nginx proxy_pass) |

## Nginx Configuration

The `nginx-container.conf` file includes:

- **Static file serving** with 1-year cache for assets
- **Gzip compression** for JS/CSS/JSON/SVG
- **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- **API proxy** to Canvas backend via `$CANVAS_API_URL`

## Health Check

The Docker container exposes a health check endpoint:

```bash
curl -f http://localhost:3003
```

## Monitoring & Error Tracking

- **Sentry** is configured for error tracking (set `VITE_SENTRY_DSN` in env)
- **Web Vitals** are tracked when `VITE_ENABLE_PERFORMANCE_MONITORING=true`
- **Lighthouse CI** can be integrated for performance budgets (see `lighthouserc.js` if present)

## Rollback

To roll back to a previous version:

```bash
docker stop classapex-production
docker rm classapex-production
docker run -d --name classapex-production -p 3003:3003 classapex-lms:<previous-tag>
```

## Troubleshooting

### "Proxy error: Could not proxy request /api/..."

Ensure the Canvas backend is running and accessible at the URL set in `CANVAS_API_URL` or the Vite proxy target.

### Static assets returning 404

Make sure `try_files $uri $uri/ /index.html` is present in the Nginx config for SPA routing.

### CORS errors

The Nginx proxy handles API calls — no CORS headers needed. In development, the Vite dev server proxies `/api` requests automatically.
