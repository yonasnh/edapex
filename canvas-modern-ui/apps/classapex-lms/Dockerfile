# Multi-stage build for ClassApex LMS
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files for workspace resolution
COPY packages/*/package.json ./packages/
COPY apps/*/package.json ./apps/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build only classapex-lms frontend and its workspace dependencies
# Skips @classapex/lms (broken Prisma backend) and other unrelated packages
RUN npx turbo run build --filter=@classapex/lms-frontend

# Production stage
FROM nginx:alpine AS production

# Copy built static files
COPY --from=base /app/apps/classapex-lms/dist /usr/share/nginx/html

# Copy nginx config as a template
COPY apps/classapex-lms/nginx-container.conf /etc/nginx/nginx.conf.template

# Pre-create empty nginx.conf and adjust permissions for non-root user nginx
RUN touch /etc/nginx/nginx.conf && \
    (addgroup -g 1001 -S nginx || true) && \
    (adduser -S nginx -u 1001 -G nginx || true) && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx

USER nginx

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3003 || exit 1

CMD ["/bin/sh", "-c", "envsubst '$CANVAS_API_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
