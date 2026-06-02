import crypto from 'crypto'

/**
 * Canvas LMS Hashing Compatibility Utility
 * ========================================
 * Supports verifying scrypt and SHA-512 crypted passwords stored in the pseudonyms table.
 */

interface ScryptParams {
  N: number
  r: number
  p: number
  salt: Buffer
  hash: Buffer
}

/**
 * Parses the scrypt hash format from the Canvas database:
 * Format: N$r$p$salt_hex$hash_hex
 * Example cost header: 4000$8$1$ where N = 0x4000 = 16384
 */
export function parseScryptHash(cryptedPassword: string): ScryptParams | null {
  const parts = cryptedPassword.split('$')
  if (parts.length !== 5) return null

  const N_hex = parts[0]
  const r_str = parts[1]
  const p_str = parts[2]
  const salt_hex = parts[3]
  const hash_hex = parts[4]

  const N = parseInt(N_hex, 16)
  const r = parseInt(r_str, 10)
  const p = parseInt(p_str, 10)

  if (isNaN(N) || isNaN(r) || isNaN(p)) return null

  return {
    N,
    r,
    p,
    salt: Buffer.from(salt_hex, 'hex'),
    hash: Buffer.from(hash_hex, 'hex')
  }
}

/**
 * Verifies a plaintext password against the stored Canvas crypted password.
 * Supports:
 * 1. SCRYPT (post-August 2019 standard)
 * 2. SHA-512 (pre-August 2019 transition standard)
 */
export async function verifyPassword(password: string, cryptedPassword: string, salt: string): Promise<boolean> {
  if (!cryptedPassword) return false

  // 1. Check if it matches SCRYPT pattern
  const scryptParams = parseScryptHash(cryptedPassword)
  if (scryptParams) {
    return new Promise((resolve) => {
      // Authlogic joins password and salt: password + salt
      const token = password + salt
      crypto.scrypt(
        token,
        scryptParams.salt,
        scryptParams.hash.length,
        {
          N: scryptParams.N,
          r: scryptParams.r,
          p: scryptParams.p,
          maxmem: 32 * 1024 * 1024 // 32MB max mem limit
        },
        (err, derivedKey) => {
          if (err) {
            resolve(false)
            return
          }
          resolve(crypto.timingSafeEqual(scryptParams.hash, derivedKey))
        }
      )
    })
  }

  // 2. Check if it matches SHA-512 pattern (hex length 128)
  if (/^[a-fA-F0-9]{128}$/.test(cryptedPassword)) {
    // Authlogic SHA-512 concatenates password and salt: password + salt
    const token = password + salt
    const sha512Hash = crypto.createHash('sha512').update(token).digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(cryptedPassword, 'hex'),
      Buffer.from(sha512Hash, 'hex')
    )
  }

  return false
}

/**
 * Creates a production-ready SCRYPT password hash compatible with Canvas cost settings.
 * Returns the exact string format expected by Canvas: N$r$p$salt_hex$hash_hex
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const N = 16384 // cost 4000 hex
  const r = 8
  const p = 1
  const keyLen = 32

  const saltBuffer = crypto.randomBytes(32)
  const token = password + salt

  return new Promise((resolve, reject) => {
    crypto.scrypt(
      token,
      saltBuffer,
      keyLen,
      { N, r, p, maxmem: 32 * 1024 * 1024 },
      (err, derivedKey) => {
        if (err) {
          reject(err)
          return
        }
        const N_hex = N.toString(16)
        const salt_hex = saltBuffer.toString('hex')
        const hash_hex = derivedKey.toString('hex')
        resolve(`${N_hex}$${r}$${p}$${salt_hex}$${hash_hex}`)
      }
    )
  })
}
