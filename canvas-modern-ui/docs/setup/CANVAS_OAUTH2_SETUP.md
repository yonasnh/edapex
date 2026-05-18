# Canvas OAuth2 Application Setup Guide

## Overview

This guide provides comprehensive instructions for setting up OAuth2 authentication with Canvas LMS for SchoolApex Modern UI. This setup enables secure, production-ready authentication following Canvas best practices.

## Prerequisites

- Canvas LMS administrator access
- SchoolApex Modern UI development environment
- SSL certificate for production domain
- Understanding of OAuth2 PKCE flow

## Phase 3.1: Canvas OAuth2 Application Registration

### Step 1: Access Canvas Developer Keys

1. **Login to Canvas Admin**
   - Navigate to your Canvas instance admin panel
   - Go to **Admin** → **Developer Keys**
   - Click **+ Developer Key** → **+ API Key**

### Step 2: Configure OAuth2 Application

#### Basic Configuration
```
Key Name: SchoolApex Modern UI
Owner Email: [your-admin-email]
Tool Configuration: Manual Entry
```

#### Redirect URIs
```
Development:
- http://localhost:3001/auth/callback
- http://localhost:3000/auth/callback

Staging:
- https://staging.schoolapex.com/auth/callback

Production:
- https://app.schoolapex.com/auth/callback
- https://[your-domain]/auth/callback
```

#### Required Scopes
```
Essential Scopes:
- url:GET|/api/v1/courses
- url:GET|/api/v1/courses/:course_id
- url:GET|/api/v1/courses/:course_id/assignments
- url:GET|/api/v1/courses/:course_id/students
- url:GET|/api/v1/courses/:course_id/enrollments
- url:GET|/api/v1/users/:user_id/profile
- url:GET|/api/v1/users/self
- url:GET|/api/v1/courses/:course_id/discussion_topics
- url:GET|/api/v1/courses/:course_id/files
- url:GET|/api/v1/calendar_events

Analytics Scopes:
- url:GET|/api/v1/courses/:course_id/analytics/assignments
- url:GET|/api/v1/courses/:course_id/analytics/student_summaries
- url:GET|/api/v1/courses/:course_id/analytics/activity

Gradebook Scopes:
- url:GET|/api/v1/courses/:course_id/gradebook_history
- url:GET|/api/v1/courses/:course_id/assignment_groups
- url:PUT|/api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id
```

### Step 3: Security Configuration

#### PKCE Settings
```
Require PKCE: Yes
Code Challenge Method: S256
Token Endpoint Auth Method: none
```

#### Additional Security
```
Enforce HTTPS: Yes (Production)
Token Expiration: 3600 seconds (1 hour)
Refresh Token Expiration: 7776000 seconds (90 days)
```

### Step 4: Save and Activate

1. **Save Configuration**
   - Click **Save Key**
   - Copy the generated **Client ID**
   - Note: Client Secret is not used with PKCE

2. **Activate Key**
   - Set state to **On**
   - Confirm activation

## Phase 3.2: Environment Configuration

### Development Environment

Create `.env.local` in `canvas-modern-ui/apps/demo/`:
```env
# Canvas OAuth2 Configuration
VITE_CANVAS_BASE_URL=https://[your-canvas-instance].instructure.com
VITE_CANVAS_CLIENT_ID=[your-client-id]
VITE_OAUTH2_REDIRECT_URI=http://localhost:3001/auth/callback

# SchoolApex Configuration
VITE_APP_NAME=SchoolApex Modern UI
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_OAUTH2=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REAL_API=true

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Production Environment

Create `.env.production` in `canvas-modern-ui/apps/demo/`:
```env
# Canvas OAuth2 Configuration
VITE_CANVAS_BASE_URL=https://[production-canvas-instance].instructure.com
VITE_CANVAS_CLIENT_ID=[production-client-id]
VITE_OAUTH2_REDIRECT_URI=https://app.schoolapex.com/auth/callback

# SchoolApex Configuration
VITE_APP_NAME=SchoolApex Modern UI
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_OAUTH2=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REAL_API=true

# Production Settings
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
VITE_SENTRY_DSN=[your-sentry-dsn]
VITE_ANALYTICS_ENDPOINT=[your-analytics-endpoint]
```

## Phase 3.3: Code Implementation

### OAuth2 Configuration Update

Update `packages/core/src/auth/oauth2.ts`:
```typescript
// Environment-based configuration
export const getOAuth2Config = (): OAuth2Config => {
  const baseUrl = import.meta.env.VITE_CANVAS_BASE_URL
  const clientId = import.meta.env.VITE_CANVAS_CLIENT_ID
  const redirectUri = import.meta.env.VITE_OAUTH2_REDIRECT_URI

  if (!baseUrl || !clientId || !redirectUri) {
    throw new Error('Missing required OAuth2 environment variables')
  }

  return {
    clientId,
    redirectUri,
    canvasBaseUrl: baseUrl,
    scopes: [
      'url:GET|/api/v1/courses',
      'url:GET|/api/v1/users/self',
      // ... additional scopes
    ],
  }
}
```

## Phase 3.4: Testing Configuration

### Manual Testing Checklist

- [ ] OAuth2 flow initiates correctly
- [ ] PKCE code challenge generates properly
- [ ] Canvas authorization page displays
- [ ] Callback handling works correctly
- [ ] Token storage is secure
- [ ] API calls authenticate successfully
- [ ] Token refresh works automatically
- [ ] Logout clears all tokens

### Automated Testing

Run OAuth2 integration tests:
```bash
cd canvas-modern-ui
pnpm test:oauth2
```

## Security Considerations

### Production Security Checklist

- [ ] HTTPS enforced for all OAuth2 endpoints
- [ ] Redirect URIs match exactly
- [ ] PKCE implementation verified
- [ ] Token storage uses secure methods
- [ ] No client secrets in frontend code
- [ ] Proper CORS configuration
- [ ] Rate limiting implemented
- [ ] Error handling doesn't leak sensitive data

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**
   - Verify exact match in Canvas configuration
   - Check for trailing slashes

2. **PKCE Verification Failed**
   - Ensure code_verifier is stored correctly
   - Verify S256 challenge method

3. **Scope Permissions**
   - Check Canvas admin has granted required scopes
   - Verify user has necessary permissions

### Debug Mode

Enable debug logging:
```typescript
localStorage.setItem('schoolapex_debug', 'true')
```

## Next Steps

After completing OAuth2 setup:
1. Configure production environment variables
2. Set up error tracking and monitoring
3. Implement security audit procedures
4. Begin Canvas API integration testing

---

**Status**: Phase 3.1 Complete ✅  
**Next**: Production Environment Configuration
