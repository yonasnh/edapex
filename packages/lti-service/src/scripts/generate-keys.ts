#!/usr/bin/env tsx

import { generateKeyPair, exportJWK } from 'jose'

async function main() {
  console.log('Generating LTI Tool key pair...\n')

  try {
    // Generate key pair
    const { publicKey, privateKey } = await generateKeyPair('RS256', {
      modulusLength: 2048
    })

    // Export public key as JWK
    const publicJWK = await exportJWK(publicKey)
    const publicJWKWithMetadata = {
      ...publicJWK,
      kid: 'lti-tool-key-1',
      alg: 'RS256',
      use: 'sig'
    }

    // Export private key as PEM
    const privateKeyArrayBuffer = await crypto.subtle.exportKey('pkcs8', privateKey)
    const privateKeyPEM = [
      '-----BEGIN PRIVATE KEY-----',
      Buffer.from(privateKeyArrayBuffer).toString('base64').match(/.{1,64}/g)?.join('\n'),
      '-----END PRIVATE KEY-----'
    ].join('\n')
    
    console.log('🔑 Generated RSA-2048 key pair for LTI Tool')
    console.log('\n📋 Add this to your .env file:')
    console.log('=' .repeat(50))
    console.log(`LTI_TOOL_PRIVATE_KEY_PEM="${privateKeyPEM.replace(/\n/g, '\\n')}"`)
    console.log('=' .repeat(50))
    
    console.log('\n🔓 Public JWK (for verification):')
    console.log(JSON.stringify(publicJWKWithMetadata, null, 2))
    
    console.log('\n✅ Key generation complete!')
    console.log('   • Copy the private key to your .env file')
    console.log('   • The public key will be served at /.well-known/jwks.json')
    console.log('   • Use this JWKS URL when registering the tool in Canvas')
    
  } catch (error) {
    console.error('❌ Failed to generate keys:', error)
    process.exit(1)
  }
}

main().catch(console.error)
