# 🔗 Canvas LMS Integration Guide

This guide explains how to integrate SchoolApex Modern UI with your Canvas LMS instance.

## Overview

SchoolApex Modern UI can operate in two modes:
1. **Standalone Mode**: Demo functionality without Canvas integration
2. **Integrated Mode**: Full functionality with Canvas LMS integration

## Canvas LMS Setup

### Prerequisites

- Canvas LMS instance (local or hosted)
- Admin access to Canvas
- Canvas API access token

### 1. Generate Canvas API Token

1. Log into your Canvas instance as an admin
2. Navigate to **Account** → **Settings**
3. Scroll down to **Approved Integrations**
4. Click **+ New Access Token**
5. Enter purpose: "SchoolApex Modern UI Integration"
6. Set expiration date (optional)
7. Copy the generated token

### 2. Configure Canvas Developer Keys

For LTI integration, you'll need to set up developer keys:

1. Navigate to **Admin** → **Developer Keys**
2. Click **+ Developer Key** → **+ LTI Key**
3. Configure the key:

```json
{
  "title": "SchoolApex Modern UI",
  "description": "Modern UI/UX system for Canvas LMS",
  "target_link_uri": "http://localhost:4001/launch",
  "oidc_initiation_url": "http://localhost:4001/login",
  "public_jwk_url": "http://localhost:4001/.well-known/jwks.json",
  "scopes": [
    "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
    "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly",
    "https://purl.imsglobal.org/spec/lti-ags/scope/score",
    "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly"
  ]
}
```

4. Save and enable the developer key
5. Copy the **Client ID** for configuration

## SchoolApex Configuration

### Environment Variables

Create or update your environment files:

```bash
# apps/classapex-lms/.env.local
CANVAS_API_URL=https://your-canvas-instance.com
CANVAS_API_TOKEN=your_api_token_here
CANVAS_CLIENT_ID=your_client_id_here
CANVAS_CLIENT_SECRET=your_client_secret_here

# LTI Configuration
LTI_ISSUER=https://your-canvas-instance.com
LTI_CLIENT_ID=your_lti_client_id_here
LTI_DEPLOYMENT_ID=your_deployment_id_here
LTI_PUBLIC_KEY_URL=https://your-canvas-instance.com/api/lti/security/jwks
LTI_AUTH_LOGIN_URL=https://your-canvas-instance.com/api/lti/authorize_redirect
LTI_AUTH_TOKEN_URL=https://your-canvas-instance.com/login/oauth2/token

# Development
NODE_ENV=development
VITE_CANVAS_API_URL=https://your-canvas-instance.com
```

### LTI Service Configuration

The LTI service requires additional setup:

```bash
# packages/lti-service/.env.local
PORT=4001
LTI_ISSUER=https://your-canvas-instance.com
LTI_CLIENT_ID=your_lti_client_id_here
LTI_DEPLOYMENT_ID=your_deployment_id_here
LTI_PUBLIC_KEY_URL=https://your-canvas-instance.com/api/lti/security/jwks
LTI_AUTH_LOGIN_URL=https://your-canvas-instance.com/api/lti/authorize_redirect
LTI_AUTH_TOKEN_URL=https://your-canvas-instance.com/login/oauth2/token

# Generate RSA key pair for LTI
LTI_PRIVATE_KEY_PATH=./keys/private.pem
LTI_PUBLIC_KEY_PATH=./keys/public.pem
```

### Generate LTI Keys

```bash
# Navigate to LTI service directory
cd packages/lti-service

# Generate RSA key pair
./generate-keys.sh

# Or manually:
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

## Canvas External Tool Setup

### 1. Add External Tool

1. Navigate to **Settings** → **Apps**
2. Click **+ App**
3. Choose **By Client ID**
4. Enter the Client ID from your developer key
5. Click **Submit**

### 2. Configure Tool Placement

Configure where SchoolApex appears in Canvas:

```json
{
  "placements": [
    {
      "placement": "course_navigation",
      "message_type": "LtiResourceLinkRequest",
      "target_link_uri": "http://localhost:4001/launch",
      "text": "SchoolApex",
      "icon_url": "http://localhost:4001/icon.png"
    },
    {
      "placement": "account_navigation",
      "message_type": "LtiResourceLinkRequest",
      "target_link_uri": "http://localhost:4001/launch",
      "text": "SchoolApex Admin"
    }
  ]
}
```

## Testing Integration

### 1. Start Services

```bash
# Start all services
pnpm dev

# Or use the service management script
./start-services.sh start
```

### 2. Verify LTI Service

Check that the LTI service is running:

```bash
# Health check
curl http://localhost:4001/health

# JWKS endpoint
curl http://localhost:4001/.well-known/jwks.json
```

### 3. Test Canvas Integration

1. Navigate to a Canvas course
2. Look for "SchoolApex" in the course navigation
3. Click to launch the application
4. Verify that Canvas user data is passed correctly

## API Integration Testing

### Canvas API Endpoints

Test Canvas API integration:

```bash
# Test API connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-canvas-instance.com/api/v1/courses

# Test through SchoolApex API
curl http://localhost:4003/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ courses { id name } }"}'
```

### Common API Endpoints Used

- `/api/v1/courses` - Course data
- `/api/v1/users/self` - Current user information
- `/api/v1/courses/:id/assignments` - Course assignments
- `/api/v1/courses/:id/discussion_topics` - Discussions
- `/api/v1/courses/:id/files` - Course files
- `/api/v1/calendar_events` - Calendar events

## Troubleshooting

### Common Issues

#### LTI Launch Fails
- Verify developer key is enabled
- Check LTI configuration URLs
- Ensure RSA keys are generated correctly
- Verify deployment ID matches

#### API Authentication Fails
- Check API token validity
- Verify Canvas instance URL
- Ensure proper CORS configuration
- Check network connectivity

#### Missing Canvas Data
- Verify API token permissions
- Check Canvas API rate limits
- Ensure proper error handling
- Review API endpoint accessibility

### Debug Mode

Enable debug logging:

```bash
# Enable debug mode
DEBUG=lti:* pnpm dev

# Or set environment variable
NODE_ENV=development
DEBUG_CANVAS_API=true
```

### Logs and Monitoring

Check service logs:

```bash
# View LTI service logs
tail -f logs/lti-service.log

# View API service logs
tail -f logs/lms-api.log

# View all service logs
./start-services.sh logs
```

## Security Considerations

### Production Setup

For production deployment:

1. Use HTTPS for all endpoints
2. Implement proper CORS policies
3. Secure API tokens and keys
4. Enable request rate limiting
5. Implement proper error handling
6. Use environment-specific configurations

### Key Management

- Store private keys securely
- Rotate API tokens regularly
- Use environment variables for secrets
- Implement proper access controls

## Next Steps

After successful Canvas integration:

1. Review [API Documentation](../api/CANVAS.md)
2. Explore [LTI Service Documentation](../api/LTI.md)
3. Set up [Production Deployment](../deployment/DEPLOYMENT.md)
4. Configure [Security Settings](../deployment/SECURITY.md)

## Support

For Canvas integration issues:

- Check [Canvas API Documentation](https://canvas.instructure.com/doc/api/)
- Review [LTI 1.3 Specification](https://www.imsglobal.org/spec/lti/v1p3/)
- Search [GitHub Issues](https://github.com/yonasnh/schoolapex/issues)
- Contact Canvas support for platform-specific issues
