# SchoolApex Canvas LMS - Services Management

This document explains how to manage all Canvas LMS services using the provided scripts.

## 🚀 Quick Start

### Option 1: Quick Start (Recommended for Development)
```bash
./quick-start.sh
```

### Option 2: Full Control
```bash
./start-services.sh start
```

## 📋 Available Services

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| **demo** | 3001 | SchoolApex Demo App | http://localhost:3001 |
| **lms-frontend** | 3002 | LMS Frontend App | http://localhost:3002 |
| **lti-service** | 4001 | LTI Service | http://localhost:4001 |
| **lms-api** | 4003 | GraphQL LMS API | http://localhost:4003/graphql |
| **canvas-lms** | 3000 | Canvas LMS (if running locally) | http://localhost:3000 |

## 🔧 Service Management Commands

### Start Services
```bash
# Start all services
./start-services.sh start
# or simply
./start-services.sh
```

### Stop Services
```bash
./start-services.sh stop
```

### Restart Services
```bash
./start-services.sh restart
```

### Check Status
```bash
./start-services.sh status
```

### View Logs
```bash
# View logs for a specific service
./start-services.sh logs demo
./start-services.sh logs lms-frontend
./start-services.sh logs lti-service
./start-services.sh logs lms-api

# List available services
./start-services.sh logs
```

### Clean Up Ports Only
```bash
./start-services.sh cleanup
```

### Help
```bash
./start-services.sh help
```

## 🔍 What the Scripts Do

### Port Management
- **Automatically detects** processes using required ports
- **Gracefully terminates** existing processes (SIGTERM first, then SIGKILL if needed)
- **Frees up ports** 3001, 3002, 4001, 4003, and 3000 (Canvas LMS)

### Service Startup
- **Installs dependencies** using pnpm
- **Starts services in order** with proper dependencies
- **Runs in background** with logging to `logs/` directory
- **Tracks PIDs** for proper process management

### Logging
- All service logs are saved to `logs/<service-name>.log`
- PIDs are tracked in `logs/<service-name>.pid`
- Real-time log viewing with `./start-services.sh logs <service>`

## 🛠️ Troubleshooting

### Port Already in Use
The script automatically handles port conflicts by killing existing processes. If you see "EADDRINUSE" errors, run:
```bash
./start-services.sh cleanup
./start-services.sh start
```

### Service Won't Start
1. Check the logs:
   ```bash
   ./start-services.sh logs <service-name>
   ```

2. Verify dependencies are installed:
   ```bash
   pnpm install
   ```

3. Check if the service directory exists and has the correct package.json

### Permission Denied
Make sure the scripts are executable:
```bash
chmod +x start-services.sh quick-start.sh
```

### Services Not Responding
If services appear to be running but aren't responding:
```bash
./start-services.sh restart
```

## 📁 File Structure

```
canvas-modern-ui/
├── start-services.sh      # Main service management script
├── quick-start.sh         # Quick start script for development
├── logs/                  # Service logs and PID files
│   ├── demo.log
│   ├── demo.pid
│   ├── lms-frontend.log
│   ├── lms-frontend.pid
│   ├── lti-service.log
│   ├── lti-service.pid
│   ├── lms-api.log
│   └── lms-api.pid
├── apps/
│   ├── demo/              # Demo app (port 3001)
│   └── schoolapex-lms/    # LMS frontend (port 3002)
└── packages/
    ├── lti-service/       # LTI service (port 4001)
    └── schoolapex-lms/    # GraphQL API (port 4003)
```

## 🔄 Development Workflow

### Daily Development
```bash
# Start everything
./quick-start.sh

# Check what's running
./start-services.sh status

# View logs if needed
./start-services.sh logs <service>

# Stop when done
./start-services.sh stop
```

### After Code Changes
```bash
# Restart specific service (manual)
cd packages/lti-service
pnpm dev

# Or restart everything
./start-services.sh restart
```

### Before Committing
```bash
# Stop all services to free up resources
./start-services.sh stop
```

## 🚨 Important Notes

1. **Dependencies**: Make sure you have `node`, `pnpm`, and `lsof` installed
2. **Ports**: The script manages ports 3000-3002 and 4001-4003
3. **Background Processes**: Services run in the background; use the script to manage them
4. **Logs**: Check logs if services fail to start or behave unexpectedly
5. **Canvas LMS**: If you're running Canvas LMS locally on port 3000, the script will detect and manage it

## 🎯 Next Steps

After starting the services:

1. **Visit the Demo App**: http://localhost:3001
2. **Test LMS Frontend**: http://localhost:3002  
3. **Check LTI Service**: http://localhost:4001/health
4. **Explore GraphQL**: http://localhost:4003/graphql
5. **Monitor logs** for any issues

For production deployment, see `PRODUCTION_SETUP.md` and use `./deploy.sh` instead.
