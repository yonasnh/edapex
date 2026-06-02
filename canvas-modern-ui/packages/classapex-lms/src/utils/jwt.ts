import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'classapex-lms-super-secret-key-change-in-production'

interface JWTPayload {
  userId: string
  email: string
  roles: string[]
  canvasToken?: string
  exp?: number
}

function base64UrlEncode(str: string | Buffer): string {
  const buf = Buffer.isBuffer(str) ? str : Buffer.from(str)
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString('utf8')
}

export function signJwt(payload: Omit<JWTPayload, 'exp'>, expiresInSeconds: number = 86400): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  const fullPayload = { ...payload, exp }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))

  const hmac = crypto.createHmac('sha256', JWT_SECRET)
  hmac.update(`${encodedHeader}.${encodedPayload}`)
  const signature = base64UrlEncode(hmac.digest())

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function verifyJwt(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts

    const hmac = crypto.createHmac('sha256', JWT_SECRET)
    hmac.update(`${encodedHeader}.${encodedPayload}`)
    const expectedSignature = base64UrlEncode(hmac.digest())

    if (signature !== expectedSignature) return null

    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload))

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null // Expired
    }

    return payload
  } catch (error) {
    return null
  }
}
