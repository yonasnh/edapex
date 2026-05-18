#!/bin/bash

# Generate RSA key pair for LTI Tool
echo "🔑 Generating RSA-2048 key pair for LTI Tool..."

# Generate private key
openssl genrsa -out temp_private.pem 2048

# Convert to PKCS#8 format (required by jose library)
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in temp_private.pem -out temp_private_pkcs8.pem

# Extract public key
openssl rsa -in temp_private.pem -pubout -out temp_public.pem

echo ""
echo "✅ Key pair generated successfully!"
echo ""
echo "📋 Add this to your .env file:"
echo "=================================="
echo "LTI_TOOL_PRIVATE_KEY_PEM=\"$(cat temp_private_pkcs8.pem | tr '\n' '\\n' | sed 's/\\n$//')\""
echo "=================================="
echo ""
echo "🔓 Public key (for verification):"
cat temp_public.pem
echo ""
echo "🧹 Cleaning up temporary files..."
rm temp_private.pem temp_private_pkcs8.pem temp_public.pem

echo ""
echo "✅ Key generation complete!"
echo "   • Copy the private key to your .env file"
echo "   • The public key will be served at /.well-known/jwks.json"
echo "   • Use this JWKS URL when registering the tool in Canvas"
