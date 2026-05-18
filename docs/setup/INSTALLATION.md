# 🚀 Installation Guide

This guide will help you set up SchoolApex Modern UI on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 ([Installation Guide](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))
- **Canvas LMS** instance (optional, for full functionality)

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output v18.0.0 or higher

# Check pnpm version
pnpm --version
# Should output 8.0.0 or higher

# Check Git version
git --version
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yonasnh/schoolapex.git
cd schoolapex
```

### 2. Install Dependencies

```bash
# Install all dependencies for the monorepo
pnpm install
```

This will install dependencies for all packages and applications in the monorepo.

### 3. Environment Configuration (Optional)

Create environment files for Canvas integration:

```bash
# Copy example environment files
cp apps/classapex-lms/.env.example apps/classapex-lms/.env.local
cp apps/demo/.env.example apps/demo/.env.local
```

Edit the `.env.local` files with your Canvas configuration:

```bash
# Canvas API Configuration
CANVAS_API_URL=http://localhost:3000
CANVAS_API_TOKEN=your_canvas_api_token
CANVAS_CLIENT_ID=your_client_id
CANVAS_CLIENT_SECRET=your_client_secret

# Development
NODE_ENV=development
VITE_API_URL=http://localhost:4003
```

### 4. Start Development Servers

```bash
# Start all development servers
pnpm dev
```

This will start:
- **ClassApex LMS**: http://localhost:3005/
- **SchoolApex LMS**: http://localhost:3003/
- **Demo App**: http://localhost:3002/
- **GraphQL API**: http://localhost:4003/graphql
- **LTI Service**: http://localhost:4001

### 5. Verify Installation

Open your browser and navigate to:
- http://localhost:3005/ - Main ClassApex LMS application
- http://localhost:3002/ - Demo application with all components

## Alternative Installation Methods

### Using the Service Management Script

For a more comprehensive setup with proper port management:

```bash
# Make the script executable
chmod +x start-services.sh

# Start all services
./start-services.sh start

# Check service status
./start-services.sh status

# Stop all services
./start-services.sh stop
```

### Docker Installation (Coming Soon)

```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## Troubleshooting

### Common Issues

#### Port Already in Use
If you encounter port conflicts:

```bash
# Kill processes on specific ports
lsof -ti :3002 | xargs kill -9
lsof -ti :3003 | xargs kill -9
lsof -ti :3005 | xargs kill -9

# Or use the service management script
./start-services.sh cleanup
```

#### Node Version Issues
If you're using an older Node.js version:

```bash
# Using nvm (Node Version Manager)
nvm install 18
nvm use 18

# Or using n
n 18
```

#### pnpm Installation Issues
If pnpm is not installed:

```bash
# Install pnpm globally
npm install -g pnpm

# Or using corepack (Node.js 16.10+)
corepack enable
corepack prepare pnpm@latest --activate
```

#### TypeScript Compilation Errors
If you encounter TypeScript errors:

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](../troubleshooting/COMMON_ISSUES.md)
2. Search [GitHub Issues](https://github.com/yonasnh/schoolapex/issues)
3. Create a new issue with detailed error information

## Next Steps

After successful installation:

1. Read the [Development Guide](../development/GETTING_STARTED.md)
2. Explore the [Component Documentation](../development/COMPONENTS.md)
3. Set up [Canvas Integration](./CANVAS_INTEGRATION.md) (optional)
4. Review the [API Documentation](../api/GRAPHQL.md)

## Verification Checklist

- [ ] Node.js >= 18.0.0 installed
- [ ] pnpm >= 8.0.0 installed
- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors
- [ ] Development servers start successfully
- [ ] Applications accessible in browser
- [ ] No console errors in browser developer tools

Congratulations! You now have SchoolApex Modern UI running locally. 🎉
