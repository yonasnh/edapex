# 🎓 SchoolApex Canvas Registration Guide

## **STEP 1: Canvas Admin Setup**

### Access Canvas Admin Panel
1. Open your Canvas instance
2. Go to **Admin** → **Developer Keys**
3. Click **+ Developer Key** → **+ LTI Key**

## **STEP 2: Tool Configuration**

### Method A: JSON Configuration (Recommended)
Copy and paste this entire JSON configuration:

```json
{
  "title": "SchoolApex Modern UI",
  "description": "Modern Canvas UI powered by Carbon Design System with LTI 1.3 integration",
  "oidc_initiation_url": "http://localhost:4001/lti/login",
  "target_link_uri": "http://localhost:4001/lti/launch",
  "scopes": [
    "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
    "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly",
    "https://purl.imsglobal.org/spec/lti-ags/scope/score",
    "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly"
  ],
  "extensions": [
    {
      "domain": "localhost:4001",
      "tool_id": "schoolapex_modern_ui",
      "platform": "canvas.instructure.com",
      "settings": {
        "text": "SchoolApex Modern UI",
        "placements": [
          {
            "text": "Modern UI",
            "enabled": true,
            "placement": "course_navigation",
            "message_type": "LtiResourceLinkRequest",
            "target_link_uri": "http://localhost:4001/lti/launch",
            "canvas_icon_class": "icon-lti",
            "windowTarget": "_self"
          }
        ]
      }
    }
  ],
  "public_jwk_url": "http://localhost:4001/.well-known/jwks.json",
  "custom_fields": {
    "canvas_user_id": "$Canvas.user.id",
    "canvas_course_id": "$Canvas.course.id",
    "canvas_assignment_id": "$Canvas.assignment.id",
    "canvas_user_login_id": "$Canvas.user.loginId"
  }
}
```

### Method B: Manual Configuration
If JSON paste doesn't work, configure manually:

**Basic Settings:**
- **Key Name**: SchoolApex Modern UI
- **Owner Email**: your-email@domain.com
- **Redirect URIs**: http://localhost:4001/lti/launch
- **Method**: Manual Entry

**LTI Settings:**
- **Title**: SchoolApex Modern UI
- **Description**: Modern Canvas UI powered by Carbon Design System
- **Target Link URI**: http://localhost:4001/lti/launch
- **OpenID Connect Initiation Url**: http://localhost:4001/lti/login
- **JWK Method**: Public JWK URL
- **Public JWK URL**: http://localhost:4001/.well-known/jwks.json

**Placements:**
- **Course Navigation**: ✅ Enabled
  - Text: "Modern UI"
  - Target Link URI: http://localhost:4001/lti/launch

**Scopes:**
- ✅ Can create and view assignment data (AGS)
- ✅ Can view assignment data (AGS)
- ✅ Can create and update assignment results (AGS)
- ✅ Can retrieve user data associated with the context (NRPS)

## **STEP 3: Enable the Tool**

1. **Save** the developer key
2. **Turn ON** the developer key (toggle switch)
3. **Copy the Client ID** (you'll need this)

## **STEP 4: Add to Course**

1. Go to a **Canvas Course**
2. **Settings** → **Navigation**
3. Find **"Modern UI"** in the disabled tools
4. **Drag it** to the enabled section
5. **Save** the navigation settings

## **STEP 5: Test LTI Launch**

1. **Refresh** the course page
2. **Click** "Modern UI" in the course navigation
3. **Verify** the launch works and shows SchoolApex

## **TROUBLESHOOTING**

### Common Issues:

**1. JWKS Not Loading**
- Verify: http://localhost:4001/.well-known/jwks.json returns JSON
- Check: LTI service is running

**2. Launch Fails**
- Check Canvas error logs
- Verify all URLs use http://localhost:4001
- Ensure developer key is enabled

**3. Tool Not Appearing**
- Refresh course navigation settings
- Check developer key is ON
- Verify course navigation placement is enabled

### Debug URLs:
- **Health Check**: http://localhost:4001/health
- **JWKS**: http://localhost:4001/.well-known/jwks.json
- **Modern UI**: http://localhost:3001

## **SUCCESS INDICATORS**

✅ Developer key created and enabled  
✅ Tool appears in course navigation  
✅ LTI launch redirects to SchoolApex Modern UI  
✅ User sees beautiful Carbon Design System interface  
✅ LTI context data is displayed correctly  

**🎉 SchoolApex is now integrated with Canvas!**
