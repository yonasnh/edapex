#!/bin/bash

echo "🎓 SchoolApex Canvas Registration Helper"
echo "======================================"
echo ""

echo "📋 Pre-Registration Checklist:"
echo "✅ LTI Service running at http://localhost:4001"
echo "✅ Modern UI running at http://localhost:3001"
echo "✅ JWKS endpoint available at http://localhost:4001/.well-known/jwks.json"
echo ""

echo "🔗 Quick Links:"
echo "• Canvas Admin: http://localhost:3000 (if Canvas is running locally)"
echo "• Tool Config: $(pwd)/packages/lti-service/canvas-tool-config.json"
echo "• Registration Guide: $(pwd)/canvas-registration-guide.md"
echo ""

echo "📝 Key Information for Canvas Registration:"
echo "=========================================="
echo "Tool Name: SchoolApex Modern UI"
echo "OIDC Initiation URL: http://localhost:4001/lti/login"
echo "Target Link URI: http://localhost:4001/lti/launch"
echo "Public JWK URL: http://localhost:4001/.well-known/jwks.json"
echo ""

echo "🎯 Registration Steps:"
echo "1. Open Canvas Admin → Developer Keys"
echo "2. Click '+ Developer Key' → '+ LTI Key'"
echo "3. Paste the JSON from packages/lti-service/canvas-tool-config.json"
echo "4. Save and enable the developer key"
echo "5. Add to course navigation in course settings"
echo "6. Test launch from course navigation"
echo ""

echo "🧪 Test URLs:"
echo "• Health: http://localhost:4001/health"
echo "• JWKS: http://localhost:4001/.well-known/jwks.json"
echo "• Modern UI: http://localhost:3001"
echo ""

echo "📖 For detailed instructions, see: canvas-registration-guide.md"
echo ""
echo "🚀 Ready to register SchoolApex in Canvas!"
