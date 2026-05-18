#!/bin/bash

# SchoolApex Modern UI - Production Deployment Script
set -e

echo "🚀 SchoolApex Modern UI - Production Deployment"
echo "=============================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is required but not installed"
    exit 1
fi

if [ ! -f ".env.production.local" ]; then
    echo "❌ .env.production.local file not found"
    echo "   Copy .env.production to .env.production.local and update with your values"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Build and deploy
echo ""
echo "🔨 Building services..."

# Build LTI service
echo "Building LTI service..."
cd packages/lti-service
pnpm install
pnpm build
cd ../..

# Build Modern UI
echo "Building Modern UI..."
cd apps/demo
pnpm install
pnpm build
cd ../..

echo "✅ Build completed"

# Deploy with Docker Compose
echo ""
echo "🐳 Deploying with Docker Compose..."

# Load production environment
export $(cat .env.production.local | grep -v '^#' | xargs)

# Deploy services
docker-compose -f docker-compose.yml up -d --build

echo "✅ Deployment completed"

# Health checks
echo ""
echo "🏥 Running health checks..."

sleep 10 # Wait for services to start

# Check LTI service
if curl -f http://localhost:4001/health > /dev/null 2>&1; then
    echo "✅ LTI Service: Healthy"
else
    echo "❌ LTI Service: Unhealthy"
fi

# Check JWKS endpoint
if curl -f http://localhost:4001/.well-known/jwks.json > /dev/null 2>&1; then
    echo "✅ JWKS Endpoint: Working"
else
    echo "❌ JWKS Endpoint: Failed"
fi

# Check Modern UI
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Modern UI: Healthy"
else
    echo "❌ Modern UI: Unhealthy"
fi

echo ""
echo "🎉 Deployment Summary:"
echo "• LTI Service: http://localhost:4001"
echo "• Modern UI: http://localhost:3001"
echo "• Health Check: http://localhost:4001/health"
echo "• JWKS: http://localhost:4001/.well-known/jwks.json"

echo ""
echo "📋 Next Steps:"
echo "1. Update Canvas tool configuration with production URLs"
echo "2. Register tool in Canvas using updated configuration"
echo "3. Test LTI launch from Canvas"
echo "4. Monitor logs: docker-compose logs -f"

echo ""
echo "🔧 Management Commands:"
echo "• View logs: docker-compose logs -f"
echo "• Stop services: docker-compose down"
echo "• Restart: docker-compose restart"
echo "• Update: git pull && ./deploy.sh"
