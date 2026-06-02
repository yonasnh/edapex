// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolvers } from '../index'
import { signJwt, verifyJwt } from '../../utils/jwt'
import { hashPassword } from '../../utils/auth-crypto'

describe('Authentication Resolvers', () => {
  let mockPrisma: any
  let mockContext: any

  beforeEach(() => {
    mockPrisma = {
      pseudonyms: {
        findFirst: vi.fn(),
      },
      users: {
        findUnique: vi.fn(),
      },
      account_users: {
        findFirst: vi.fn(),
      },
      enrollments: {
        findMany: vi.fn(),
      },
      accounts: {
        findFirst: vi.fn(),
      },
      enrollment_terms: {
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(),
    }

    mockContext = {
      prisma: mockPrisma,
      req: {} as any,
      res: {} as any,
    }
  })

  describe('Mutation.loginWithCredentials', () => {
    it('should successfully log in a user with correct credentials', async () => {
      const password = 'mySecurePassword123'
      const salt = 'randomSaltHexValue'
      const cryptedPassword = await hashPassword(password, salt)

      const mockPseudonym = {
        id: 101n,
        user_id: 202n,
        unique_id: 'test@schoolapex.edu',
        unique_id_normalized: 'test@schoolapex.edu',
        crypted_password: cryptedPassword,
        password_salt: salt,
        workflow_state: 'active',
      }

      const mockUser = {
        id: 202n,
        name: 'John Doe',
        workflow_state: 'active',
      }

      mockPrisma.pseudonyms.findFirst.mockResolvedValue(mockPseudonym)
      mockPrisma.users.findUnique.mockResolvedValue(mockUser)
      mockPrisma.account_users.findFirst.mockResolvedValue(null) // Not an admin
      mockPrisma.enrollments.findMany.mockResolvedValue([
        { type: 'StudentEnrollment', workflow_state: 'active' },
      ])

      const result = await resolvers.Mutation.loginWithCredentials(
        null,
        { email: 'test@schoolapex.edu', password },
        mockContext
      )

      expect(result.error).toBeUndefined()
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(result.user).toEqual(mockUser)

      // Decode and check JWT payload
      const decoded = verifyJwt(result.accessToken!)
      expect(decoded).not.toBeNull()
      expect(decoded!.userId).toBe('202')
      expect(decoded!.email).toBe('test@schoolapex.edu')
      expect(decoded!.roles).toContain('student')
    })

    it('should return an error if pseudonym (email) is not found', async () => {
      mockPrisma.pseudonyms.findFirst.mockResolvedValue(null)

      const result = await resolvers.Mutation.loginWithCredentials(
        null,
        { email: 'nonexistent@schoolapex.edu', password: 'password123' },
        mockContext
      )

      expect(result.accessToken).toBeUndefined()
      expect(result.error).toBe('Invalid email or password')
    })

    it('should return an error if the password does not match', async () => {
      const salt = 'randomSaltHexValue'
      const cryptedPassword = await hashPassword('correctPassword', salt)

      const mockPseudonym = {
        id: 101n,
        user_id: 202n,
        unique_id: 'test@schoolapex.edu',
        unique_id_normalized: 'test@schoolapex.edu',
        crypted_password: cryptedPassword,
        password_salt: salt,
        workflow_state: 'active',
      }

      mockPrisma.pseudonyms.findFirst.mockResolvedValue(mockPseudonym)

      const result = await resolvers.Mutation.loginWithCredentials(
        null,
        { email: 'test@schoolapex.edu', password: 'wrongPassword' },
        mockContext
      )

      expect(result.accessToken).toBeUndefined()
      expect(result.error).toBe('Invalid email or password')
    })

    it('should return an error if the user account is inactive', async () => {
      const password = 'mySecurePassword123'
      const salt = 'randomSaltHexValue'
      const cryptedPassword = await hashPassword(password, salt)

      const mockPseudonym = {
        id: 101n,
        user_id: 202n,
        unique_id: 'test@schoolapex.edu',
        unique_id_normalized: 'test@schoolapex.edu',
        crypted_password: cryptedPassword,
        password_salt: salt,
        workflow_state: 'active',
      }

      const mockUser = {
        id: 202n,
        name: 'John Doe',
        workflow_state: 'deleted', // Inactive user
      }

      mockPrisma.pseudonyms.findFirst.mockResolvedValue(mockPseudonym)
      mockPrisma.users.findUnique.mockResolvedValue(mockUser)

      const result = await resolvers.Mutation.loginWithCredentials(
        null,
        { email: 'test@schoolapex.edu', password },
        mockContext
      )

      expect(result.accessToken).toBeUndefined()
      expect(result.error).toBe('User account is inactive or deleted')
    })
  })

  describe('Mutation.signUpUser', () => {
    it('should successfully sign up a new student', async () => {
      mockPrisma.pseudonyms.findFirst.mockResolvedValue(null) // No existing email
      mockPrisma.accounts.findFirst.mockResolvedValue({ id: 1n })
      mockPrisma.enrollment_terms.findFirst.mockResolvedValue({ id: 1n })

      const mockUserRecord = { id: 303n, name: 'Alice Smith', workflow_state: 'active' }
      
      const mockTx = {
        users: {
          create: vi.fn().mockResolvedValue(mockUserRecord),
        },
        pseudonyms: {
          create: vi.fn(),
        },
        communication_channels: {
          create: vi.fn(),
        },
        roles: {
          findFirst: vi.fn().mockResolvedValue({ id: 3n }),
        },
        courses: {
          findFirst: vi.fn().mockResolvedValue({ id: 10n }),
        },
        course_sections: {
          findFirst: vi.fn().mockResolvedValue({ id: 20n }),
        },
        enrollments: {
          create: vi.fn(),
        },
      }

      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        return cb(mockTx)
      })

      const result = await resolvers.Mutation.signUpUser(
        null,
        {
          name: 'Alice Smith',
          email: 'alice@schoolapex.edu',
          password: 'securePassword123',
          role: 'student',
          joinCode: 'CS101-JOIN',
        },
        mockContext
      )

      expect(result.error).toBeUndefined()
      expect(result.accessToken).toBeDefined()
      expect(result.user).toEqual(mockUserRecord)
      
      // Verify transaction database updates
      expect(mockTx.users.create).toHaveBeenCalled()
      expect(mockTx.pseudonyms.create).toHaveBeenCalled()
      expect(mockTx.communication_channels.create).toHaveBeenCalled()
      expect(mockTx.courses.findFirst).toHaveBeenCalledWith({
        where: { self_enrollment_code: 'CS101-JOIN', workflow_state: { in: ['available', 'published'] } },
      })
      expect(mockTx.enrollments.create).toHaveBeenCalled()
    })

    it('should successfully sign up a new educator and create a sandbox course', async () => {
      mockPrisma.pseudonyms.findFirst.mockResolvedValue(null) // No existing email
      mockPrisma.accounts.findFirst.mockResolvedValue({ id: 1n })
      mockPrisma.enrollment_terms.findFirst.mockResolvedValue({ id: 1n })

      const mockUserRecord = { id: 404n, name: 'Dr. Jones', workflow_state: 'active' }
      const mockSandboxCourse = { id: 505n, name: "Dr. Jones's Sandbox", workflow_state: 'available' }
      const mockSandboxSection = { id: 606n, name: 'Default Section' }

      const mockTx = {
        users: {
          create: vi.fn().mockResolvedValue(mockUserRecord),
        },
        pseudonyms: {
          create: vi.fn(),
        },
        communication_channels: {
          create: vi.fn(),
        },
        courses: {
          create: vi.fn().mockResolvedValue(mockSandboxCourse),
        },
        course_sections: {
          create: vi.fn().mockResolvedValue(mockSandboxSection),
        },
        roles: {
          findFirst: vi.fn().mockResolvedValue({ id: 2n }),
        },
        enrollments: {
          create: vi.fn(),
        },
      }

      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        return cb(mockTx)
      })

      const result = await resolvers.Mutation.signUpUser(
        null,
        {
          name: 'Dr. Jones',
          email: 'jones@schoolapex.edu',
          password: 'securePassword123',
          role: 'educator',
        },
        mockContext
      )

      expect(result.error).toBeUndefined()
      expect(result.accessToken).toBeDefined()
      expect(result.user).toEqual(mockUserRecord)

      // Verify transaction database updates
      expect(mockTx.users.create).toHaveBeenCalled()
      expect(mockTx.pseudonyms.create).toHaveBeenCalled()
      expect(mockTx.communication_channels.create).toHaveBeenCalled()
      
      // Verify sandbox course and section creation
      expect(mockTx.courses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Dr. Jones's Sandbox",
            workflow_state: 'available',
          }),
        })
      )
      expect(mockTx.course_sections.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            course_id: mockSandboxCourse.id,
            name: 'Default Section',
          }),
        })
      )
      expect(mockTx.enrollments.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user_id: mockUserRecord.id,
            course_id: mockSandboxCourse.id,
            type: 'TeacherEnrollment',
          }),
        })
      )
    })

    it('should return an error if email is already in use', async () => {
      mockPrisma.pseudonyms.findFirst.mockResolvedValue({ id: 101n, unique_id: 'existing@schoolapex.edu' })

      const result = await resolvers.Mutation.signUpUser(
        null,
        {
          name: 'Alice Smith',
          email: 'existing@schoolapex.edu',
          password: 'password123',
          role: 'student',
        },
        mockContext
      )

      expect(result.accessToken).toBeUndefined()
      expect(result.error).toBe('Email is already in use')
    })
  })

  describe('Mutation.refreshUserSession', () => {
    it('should successfully refresh the session for an authenticated user', async () => {
      const mockUser = { id: 202n, name: 'John Doe', workflow_state: 'active' }
      mockPrisma.users.findUnique.mockResolvedValue(mockUser)

      const currentUser = {
        userId: '202',
        email: 'test@schoolapex.edu',
        roles: ['student'],
      }

      const result = await resolvers.Mutation.refreshUserSession(
        null,
        {},
        { ...mockContext, currentUser }
      )

      expect(result.error).toBeUndefined()
      expect(result.accessToken).toBeDefined()
      expect(result.user).toEqual(mockUser)
    })

    it('should return session expired error if currentUser is not present', async () => {
      const result = await resolvers.Mutation.refreshUserSession(
        null,
        {},
        { ...mockContext, currentUser: null }
      )

      expect(result.accessToken).toBeUndefined()
      expect(result.error).toBe('Session expired')
    })

    it('should return user not found error if user record is missing in db', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)

      const currentUser = {
        userId: '202',
        email: 'test@schoolapex.edu',
        roles: ['student'],
      }

      const result = await resolvers.Mutation.refreshUserSession(
        null,
        {},
        { ...mockContext, currentUser }
      )

      expect(result.accessToken).toBeUndefined()
      expect(result.error).toBe('User not found')
    })
  })
})
