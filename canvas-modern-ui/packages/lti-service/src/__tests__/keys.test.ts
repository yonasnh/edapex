import { describe, it, expect, beforeAll, vi } from 'vitest'

// Mock the config module to avoid validation issues
vi.mock('../lib/config.js', () => ({
  config: {
    LTI_TOOL_PRIVATE_KEY_PEM: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCeLwX4djnDmKku
71ViRfONmdL6aQtEkMJXNGpq0RXv4AMOyAHSL8XYYHcr53zlyOsiIfaWROXAovMG
woo4kn7+WIWqRubwDCsKz4M3+5mJ9CHOOmMD65iOQZC2He5+u/01dlPVTfulq+aS
PYuoo6kSZK0J0APLMK6Av/PNzrP3LO4B86bgVd0PRbKwROGV8AdJ+FQLUZEHefIX
9AMOEbgFJp8+Re04dpfuDbqSX6DgqdXvaX9zQjEPl2JQ8EYIJhYyipy09ZaZqAGL
tQAkqvVU340fLuGI8KSBvG7hKnqiXdE7jsyIeYSCsZ6IV7gokxjhgeKJKeMongEu
y8oZoGrHAgMBAAECggEAIc7dENB74hEjv7NJZXqb5lzFGd4PmXTzBF5gjDnp3V3c
aXFX6ktplqhvcAPGzvnVP3NQ16ccD8MD/CLiFdtBpyzWTKFgxFdlb6cQXYu5siFq
hEA4X2MgNO9QdYwKKC4XnTCQFFvZd/w4iHL9AWsRPKwly54Y4XmjIkNkYU1Xa3Fp
241rFa/I6I1WxMUNMrY45Kapp6t0NIjljkIKEBIz4zlR/tl4TfsJkdaOMlFg9wcb
CHbHs0OAgTeek8yfJsAnOfdm+TWdx/wbagXTWNEmkAl6ZYC27CLMGw2UIbBrN2Mt
sBBbGNqTZGx/7/857KviqbLhAVMpWU9zc9xzcx+T2QKBgQDKxUdhygU4nB+pbWED
YAizY5EAVjfDHDzNgSXe935wd8poG+koWfdEhQE6NKWDsz/6OfeA3M/fezoeLWtP
mL/hhMENVR66+IYpeRlKGPGa2tK7gLVaOJce/SmTpO2+B3Uva43p9zk99KxYthgK
MH3gLVC5MrHs7Gm1y6eSpL1FRQKBgQDHtWJ5xtB1N4tNArTAZ+Hjdv9rRzOmVQDm
1GeagAa7vzJW+AspSmoPYx/7zvVJ0dQLRbSqGCIpbljGHTXYIDOGdt9+OEJ9JZWn
yJodQpl43gWu23ra4Inp2+eoBPojfMzLpKaPKuPUA/YYuVEGhV1C+6ARs9KCjdly
KhofTYAymwKBgQC8MRbMGqx32ubD38FPWZ0ZqUoVru94BUglTzzv0HIoPfW8ZFMk
YUNN88es1tna/s1dFtmwXsALYZoSEgNrz5Ae5ZArKJop26jg6wTesYHjQD6fSZiH
UMhpOXuSDVudp9xKE5+Vyx70cpZWi0KKinD5U/V8vSFHjC+cS5SOVJlZpQKBgBl7
MUdscKikH6gB0mJCXvYQ9uIPQa3VZroNG/MApttJt/iUyYfJMOMpuKj+bRmwJigS
Cs0xKxqyM62DiJ087pYXkMigEQu6we+YjuFw3/gmC/+VjYVj5PTr1BECIZBpmg/Z
wE7AIDWrE7lv28DDP3UOegwIL7Hsu3Pvn0mjL9pFAoGAcqtyUoZb4A7nr3yrnfgj
BAAsdoQz8YeNTUwoDHvlz6E3s9+JfvLoLrCOVVeCrKuNYm/Od8EMMyx/SixDMHpS
KdI0pB+ji+QVjzCG5ILV4AN3CuP5PoeD6Tx/6OhGqVo6BdENDOJL7SXjHpcZjmss
/Cdm0tkQ7w8AfZhQ7fo9+tU=
-----END PRIVATE KEY-----`,
    LTI_TOOL_KID: 'test-key-1'
  }
}))

import { getToolKeyPair, getPublicJWK } from '../lib/keys.js'

describe('LTI Keys', () => {
  beforeAll(() => {
    // Set up test environment
    process.env.LTI_TOOL_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCeLwX4djnDmKku
71ViRfONmdL6aQtEkMJXNGpq0RXv4AMOyAHSL8XYYHcr53zlyOsiIfaWROXAovMG
woo4kn7+WIWqRubwDCsKz4M3+5mJ9CHOOmMD65iOQZC2He5+u/01dlPVTfulq+aS
PYuoo6kSZK0J0APLMK6Av/PNzrP3LO4B86bgVd0PRbKwROGV8AdJ+FQLUZEHefIX
9AMOEbgFJp8+Re04dpfuDbqSX6DgqdXvaX9zQjEPl2JQ8EYIJhYyipy09ZaZqAGL
tQAkqvVU340fLuGI8KSBvG7hKnqiXdE7jsyIeYSCsZ6IV7gokxjhgeKJKeMongEu
y8oZoGrHAgMBAAECggEAIc7dENB74hEjv7NJZXqb5lzFGd4PmXTzBF5gjDnp3V3c
aXFX6ktplqhvcAPGzvnVP3NQ16ccD8MD/CLiFdtBpyzWTKFgxFdlb6cQXYu5siFq
hEA4X2MgNO9QdYwKKC4XnTCQFFvZd/w4iHL9AWsRPKwly54Y4XmjIkNkYU1Xa3Fp
241rFa/I6I1WxMUNMrY45Kapp6t0NIjljkIKEBIz4zlR/tl4TfsJkdaOMlFg9wcb
CHbHs0OAgTeek8yfJsAnOfdm+TWdx/wbagXTWNEmkAl6ZYC27CLMGw2UIbBrN2Mt
sBBbGNqTZGx/7/857KviqbLhAVMpWU9zc9xzcx+T2QKBgQDKxUdhygU4nB+pbWED
YAizY5EAVjfDHDzNgSXe935wd8poG+koWfdEhQE6NKWDsz/6OfeA3M/fezoeLWtP
mL/hhMENVR66+IYpeRlKGPGa2tK7gLVaOJce/SmTpO2+B3Uva43p9zk99KxYthgK
MH3gLVC5MrHs7Gm1y6eSpL1FRQKBgQDHtWJ5xtB1N4tNArTAZ+Hjdv9rRzOmVQDm
1GeagAa7vzJW+AspSmoPYx/7zvVJ0dQLRbSqGCIpbljGHTXYIDOGdt9+OEJ9JZWn
yJodQpl43gWu23ra4Inp2+eoBPojfMzLpKaPKuPUA/YYuVEGhV1C+6ARs9KCjdly
KhofTYAymwKBgQC8MRbMGqx32ubD38FPWZ0ZqUoVru94BUglTzzv0HIoPfW8ZFMk
YUNN88es1tna/s1dFtmwXsALYZoSEgNrz5Ae5ZArKJop26jg6wTesYHjQD6fSZiH
UMhpOXuSDVudp9xKE5+Vyx70cpZWi0KKinD5U/V8vSFHjC+cS5SOVJlZpQKBgBl7
MUdscKikH6gB0mJCXvYQ9uIPQa3VZroNG/MApttJt/iUyYfJMOMpuKj+bRmwJigS
Cs0xKxqyM62DiJ087pYXkMigEQu6we+YjuFw3/gmC/+VjYVj5PTr1BECIZBpmg/Z
wE7AIDWrE7lv28DDP3UOegwIL7Hsu3Pvn0mjL9pFAoGAcqtyUoZb4A7nr3yrnfgj
BAAsdoQz8YeNTUwoDHvlz6E3s9+JfvLoLrCOVVeCrKuNYm/Od8EMMyx/SixDMHpS
KdI0pB+ji+QVjzCG5ILV4AN3CuP5PoeD6Tx/6OhGqVo6BdENDOJL7SXjHpcZjmss
/Cdm0tkQ7w8AfZhQ7fo9+tU=
-----END PRIVATE KEY-----`
    process.env.LTI_TOOL_KID = 'test-key-1'
  })

  describe('getToolKeyPair', () => {
    it('should load and cache key pair successfully', async () => {
      const keyPair1 = await getToolKeyPair()
      const keyPair2 = await getToolKeyPair()
      
      expect(keyPair1).toBeDefined()
      expect(keyPair1.privateKey).toBeDefined()
      expect(keyPair1.publicKey).toBeDefined()
      
      // Should return cached instance
      expect(keyPair1).toBe(keyPair2)
    })

    it('should cache key pair correctly', async () => {
      // Test that the key pair is cached (this is the correct behavior)
      const keyPair1 = await getToolKeyPair()
      const keyPair2 = await getToolKeyPair()

      // Should return the same cached instance
      expect(keyPair1).toBe(keyPair2)
      expect(keyPair1.privateKey).toBeDefined()
      expect(keyPair1.publicKey).toBeDefined()
    })
  })

  describe('getPublicJWK', () => {
    it('should generate valid public JWK', async () => {
      const jwk = await getPublicJWK()
      
      expect(jwk).toBeDefined()
      expect(jwk.kty).toBe('RSA')
      expect(jwk.use).toBe('sig')
      expect(jwk.alg).toBe('RS256')
      expect(jwk.kid).toBe('test-key-1')
      expect(jwk.n).toBeDefined() // RSA modulus
      expect(jwk.e).toBeDefined() // RSA exponent
      
      // Should not contain private key components
      expect(jwk.d).toBeUndefined()
      expect(jwk.p).toBeUndefined()
      expect(jwk.q).toBeUndefined()
    })

    it('should generate consistent JWK', async () => {
      const jwk1 = await getPublicJWK()
      const jwk2 = await getPublicJWK()
      
      expect(jwk1).toEqual(jwk2)
    })
  })
})
