import { generateKeyPair, exportJWK, importPKCS8 } from 'jose'
import { config } from './config.js'

let cachedKeyPair: { publicKey: CryptoKey; privateKey: CryptoKey } | null = null

export async function getToolKeyPair() {
  if (cachedKeyPair) {
    return cachedKeyPair
  }

  try {
    console.log('Loading private key from config...')
    console.log('Key starts with:', config.LTI_TOOL_PRIVATE_KEY_PEM.substring(0, 50))

    // Import private key from PEM
    const privateKey = await importPKCS8(config.LTI_TOOL_PRIVATE_KEY_PEM, 'RS256')
    console.log('Private key imported successfully')

    // For RSA keys, we can derive the public key from the private key
    // But it's easier to just use the private key for signing and export its public part
    const publicKeyData = await crypto.subtle.exportKey('spki', privateKey)
    const publicKey = await crypto.subtle.importKey(
      'spki',
      publicKeyData,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      true,
      ['verify']
    )
    console.log('Public key derived successfully')

    cachedKeyPair = { publicKey, privateKey }
    return cachedKeyPair
  } catch (error) {
    console.error('Key loading error details:', {
      message: error.message,
      stack: error.stack,
      keyLength: config.LTI_TOOL_PRIVATE_KEY_PEM?.length,
      keyStart: config.LTI_TOOL_PRIVATE_KEY_PEM?.substring(0, 100)
    })
    throw new Error(`Failed to load tool key pair: ${error.message}`)
  }
}

export async function getPublicJWK() {
  try {
    const { publicKey } = await getToolKeyPair()

    const jwk = await exportJWK(publicKey)
    return {
      ...jwk,
      kid: config.LTI_TOOL_KID,
      alg: 'RS256',
      use: 'sig'
    }
  } catch (error) {
    console.error('getPublicJWK error:', error)
    throw error
  }
}

export async function generateToolKeyPair() {
  const { publicKey, privateKey } = await generateKeyPair('RS256', {
    modulusLength: 2048
  })

  const publicJWK = await exportJWK(publicKey)
  const privateKeyPEM = await crypto.subtle.exportKey('pkcs8', privateKey)
  
  // Convert to PEM format
  const privateKeyPEMString = [
    '-----BEGIN PRIVATE KEY-----',
    Buffer.from(privateKeyPEM).toString('base64').match(/.{1,64}/g)?.join('\n'),
    '-----END PRIVATE KEY-----'
  ].join('\n')

  return {
    publicJWK: {
      ...publicJWK,
      kid: config.LTI_TOOL_KID,
      alg: 'RS256',
      use: 'sig'
    },
    privateKeyPEM: privateKeyPEMString
  }
}
