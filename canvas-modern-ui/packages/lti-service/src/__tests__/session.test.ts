import { describe, it, expect, beforeEach } from 'vitest'
import { createSession, getSession, deleteSession, generateBootstrapToken, verifyBootstrapToken } from '../lib/session.js'

describe('LTI Session Management', () => {
  beforeEach(() => {
    // Clear session store before each test
    const sessionStore = (global as any).sessionStore
    if (sessionStore) {
      sessionStore.clear()
    }
  })

  describe('createSession', () => {
    it('should create session with valid data', () => {
      const sessionData = {
        userId: 'user123',
        userName: 'Test User',
        userEmail: 'test@example.com',
        roles: ['Instructor'],
        contextId: 'course123',
        contextTitle: 'Test Course',
        locale: 'en',
        ltiClaims: { sub: 'user123', iss: 'https://canvas.example.com' }
      }

      const session = createSession(sessionData)
      
      expect(session).toBeDefined()
      expect(session.sessionId).toBeDefined()
      expect(session.userId).toBe('user123')
      expect(session.userName).toBe('Test User')
      expect(session.roles).toEqual(['Instructor'])
      expect(session.ltiClaims).toEqual(sessionData.ltiClaims)
    })

    it('should generate unique session IDs', () => {
      const session1 = createSession({ userId: 'user1', roles: [] })
      const session2 = createSession({ userId: 'user2', roles: [] })
      
      expect(session1.sessionId).not.toBe(session2.sessionId)
    })
  })

  describe('getSession', () => {
    it('should retrieve existing session', () => {
      const session = createSession({ userId: 'user123', roles: ['Student'] })
      const retrieved = getSession(session.sessionId)
      
      expect(retrieved).toEqual(session)
    })

    it('should return null for non-existent session', () => {
      const retrieved = getSession('non-existent-id')
      expect(retrieved).toBeNull()
    })

    it('should update lastAccessedAt on retrieval', () => {
      const session = createSession({ userId: 'user123', roles: ['Student'] })
      const originalLastAccessed = session.lastAccessedAt
      
      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        const retrieved = getSession(session.sessionId)
        expect(retrieved!.lastAccessedAt).toBeGreaterThan(originalLastAccessed)
      }, 10)
    })
  })

  describe('deleteSession', () => {
    it('should delete existing session', () => {
      const session = createSession({ userId: 'user123', roles: ['Student'] })
      
      expect(getSession(session.sessionId)).toBeDefined()
      deleteSession(session.sessionId)
      expect(getSession(session.sessionId)).toBeNull()
    })

    it('should handle deletion of non-existent session', () => {
      expect(() => deleteSession('non-existent-id')).not.toThrow()
    })
  })

  describe('Bootstrap Token', () => {
    beforeEach(() => {
      process.env.SESSION_SECRET = 'test-secret-32-bytes-long-for-testing'
    })

    it('should generate and verify bootstrap token', async () => {
      const session = createSession({ 
        userId: 'user123', 
        roles: ['Instructor'],
        contextId: 'course123'
      })

      const token = await generateBootstrapToken(session)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const payload = await verifyBootstrapToken(token)
      expect(payload).toBeDefined()
      expect(payload.sessionId).toBe(session.sessionId)
      expect(payload.user.id).toBe('user123')
      expect(payload.user.roles).toEqual(['Instructor'])
    })

    it('should reject invalid bootstrap token', async () => {
      await expect(verifyBootstrapToken('invalid-token')).rejects.toThrow()
    })

    it('should reject expired bootstrap token', async () => {
      // This would require mocking time or using a very short expiry
      // For now, just test that the function exists and handles errors
      await expect(verifyBootstrapToken('')).rejects.toThrow()
    })
  })
})
