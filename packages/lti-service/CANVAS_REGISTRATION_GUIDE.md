# Canvas LTI 1.3 Registration Guide

This guide walks you through registering the SchoolApex Modern UI as an LTI 1.3 tool in Canvas.

## Prerequisites

- Canvas administrator access
- LTI service running on accessible URL (localhost for testing, public URL for production)
- Generated RSA key pair (see Key Generation section)

## Step 1: Generate Keys (If Not Done)

```bash
cd packages/lti-service
openssl genrsa -out temp_key.pem 2048
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in temp_key.pem -out temp_key_pkcs8.pem
cat temp_key_pkcs8.pem
# Copy the output to your .env file as LTI_TOOL_PRIVATE_KEY_PEM
rm temp_key.pem temp_key_pkcs8.pem
```

## Step 2: Start the LTI Service

```bash
cd packages/lti-service
pnpm dev
# Service should start on http://localhost:4001
```

Verify endpoints:
- Health: `curl http://localhost:4001/health`
- JWKS: `curl http://localhost:4001/.well-known/jwks.json`

## Step 3: Create Developer Key in Canvas

1. **Navigate to Developer Keys**
   - Go to Admin → Developer Keys
   - Click "+ Developer Key" → "+ LTI Key"

2. **Configure Key Settings**
   - **Key Name**: `SchoolApex Modern UI`
   - **Owner Email**: Your email address
   - **Redirect URIs**: `http://localhost:4001/lti/launch`
   - **Method**: Manual Entry
   - **Title**: `SchoolApex Modern UI`
   - **Description**: `Modern Canvas UI powered by Carbon Design System`
   - **Target Link URI**: `http://localhost:4001/lti/launch`
   - **OpenID Connect Initiation Url**: `http://localhost:4001/lti/login`
   - **JWK Method**: Public JWK URL
   - **Public JWK URL**: `http://localhost:4001/.well-known/jwks.json`

3. **Configure LTI Advantage Services**
   - **Can create and view assignment data**: ✓ (for AGS)
   - **Can view submission data**: ✓ (for AGS)
   - **Can create and update submission results**: ✓ (for AGS)
   - **Can retrieve user data associated with the context**: ✓ (for NRPS)

4. **Configure Placements**
   - **Course Navigation**: ✓
     - Text: `Modern UI`
     - Target Link URI: `http://localhost:4001/lti/launch`
   - **Link Selection**: ✓ (for Deep Linking)
     - Text: `Select Modern UI Content`
     - Target Link URI: `http://localhost:4001/lti/launch?placement=link_selection`

5. **Save the Developer Key**
   - Click "Save"
   - **Important**: Copy the generated Client ID - you'll need this for your .env file

## Step 4: Update Environment Configuration

Update your `.env` file with Canvas-specific values:

```env
# Canvas Platform Configuration
LTI_ISSUER=https://your-canvas-domain.instructure.com
LTI_CLIENT_ID=your_generated_client_id_from_step_3
LTI_AUTHORIZATION_ENDPOINT=https://your-canvas-domain.instructure.com/api/lti/authorize_redirect
LTI_TOKEN_ENDPOINT=https://your-canvas-domain.instructure.com/login/oauth2/token
LTI_JWKS_ENDPOINT=https://your-canvas-domain.instructure.com/api/lti/security/jwks

# Update your tool URLs if using public domain
BASE_URL=https://your-public-domain.com
LTI_INITIATE_LOGIN_URI=https://your-public-domain.com/lti/login
LTI_REDIRECT_URI=https://your-public-domain.com/lti/launch
```

## Step 5: Enable the Tool

1. **Enable Developer Key**
   - In Canvas Admin → Developer Keys
   - Find your "SchoolApex Modern UI" key
   - Click the "Off" toggle to turn it "On"

2. **Install in Course/Account**
   - Go to the course or account where you want to use the tool
   - Navigate to Settings → Apps
   - Click "+ App"
   - **Configuration Type**: By Client ID
   - **Client ID**: Enter the Client ID from Step 3
   - Click "Submit"

## Step 6: Test the Integration

1. **Course Navigation Test**
   - Go to any course where the tool is installed
   - Look for "Modern UI" in the course navigation menu
   - Click it to launch the LTI tool

2. **Verify Launch Info**
   - Once launched, click the "ℹ️" icon in the header
   - Verify LTI claims are populated correctly
   - Check user roles, context information, and feature flags

## Troubleshooting

### Common Issues

**1. "Invalid client_id" Error**
- Verify CLIENT_ID in .env matches the Developer Key Client ID
- Ensure the Developer Key is enabled (On state)

**2. "JWKS endpoint not reachable"**
- Verify `http://localhost:4001/.well-known/jwks.json` returns valid JSON
- For production, ensure public URL is accessible from Canvas

**3. "Invalid signature" Error**
- Verify private key format in .env file
- Ensure key pair was generated correctly
- Check that JWKS endpoint serves the matching public key

**4. "Tool not appearing in course navigation"**
- Verify tool is installed in the specific course
- Check that Course Navigation placement is enabled
- Ensure Developer Key is in "On" state

### Debug Steps

1. **Check LTI Service Logs**
   ```bash
   # Monitor logs for launch attempts
   cd packages/lti-service
   pnpm dev
   ```

2. **Verify Endpoints**
   ```bash
   curl http://localhost:4001/health
   curl http://localhost:4001/.well-known/jwks.json
   ```

3. **Test Launch Info Page**
   - Use the Launch Info component to inspect claims
   - Verify user roles and context data

## Production Deployment

For production deployment:

1. **Use HTTPS URLs** - Canvas requires HTTPS for production
2. **Update all URLs** in .env and Canvas configuration
3. **Use proper domain** instead of localhost
4. **Enable security headers** and CSRF protection
5. **Set up monitoring** and error tracking

## Next Steps

After successful registration:
- Implement Canvas REST API integration (OBO)
- Add LTI Advantage services (NRPS, AGS, Deep Linking)
- Configure grade passback workflows
- Set up production monitoring and logging
