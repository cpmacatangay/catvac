import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { ConflictError, UnauthorizedError, NotFoundError } from '../src/lib/errors.js'

process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long-for-env-validation'
process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret-that-is-32-chars'

const MOCK_USER = { id: '507f1f77bcf86cd799439011', email: 'test@catvac.app', prefs: { leadDays: 7 } }

vi.mock('../src/services/auth.service.js', () => ({
  signup: vi.fn(),
  login: vi.fn(),
  getMe: vi.fn(),
}))

import { createApp } from '../src/app.js'
import * as authService from '../src/services/auth.service.js'

function generateToken() {
  return jwt.sign({ userId: MOCK_USER.id, email: MOCK_USER.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

function signedCookie(token) {
  return [`token=${token}`]
}

describe('Auth API', () => {
  let app

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.signup).mockReset()
    vi.mocked(authService.login).mockReset()
    vi.mocked(authService.getMe).mockReset()
    app = createApp()
  })

  describe('POST /api/v1/auth/signup', () => {
    it('returns 201, sets httpOnly cookie, and returns user on success', async () => {
      vi.mocked(authService.signup).mockResolvedValue({
        token: generateToken(),
        user: MOCK_USER,
      })

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: 'test@catvac.app', password: 'Password1' })
        .expect(201)

      expect(res.body.user).toEqual(MOCK_USER)
      expect(res.headers['set-cookie']).toBeDefined()
      const cookie = res.headers['set-cookie'][0]
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('SameSite=Lax')
      expect(cookie).toContain('Path=/')
      expect(authService.signup).toHaveBeenCalledWith('test@catvac.app', 'Password1')
    })

    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ password: 'Password1' })
        .expect(400)

      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: 'notanemail', password: 'Password1' })
        .expect(400)

      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 400 when password is too short (< 8 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: 'test@catvac.app', password: '1234567' })
        .expect(400)

      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 409 when email is already registered', async () => {
      vi.mocked(authService.signup).mockRejectedValue(new ConflictError('Email already registered'))

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: 'test@catvac.app', password: 'Password1' })
        .expect(409)

      expect(res.body.error.code).toBe('CONFLICT')
    })

    it('returns 400 when extra fields are passed', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: 'test@catvac.app', password: 'Password1', role: 'admin' })
        .expect(400)

      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('returns 200, sets cookie, and returns user on success', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        token: generateToken(),
        user: MOCK_USER,
      })

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@catvac.app', password: 'Password1' })
        .expect(200)

      expect(res.body.user).toEqual(MOCK_USER)
      expect(res.headers['set-cookie']).toBeDefined()
      expect(authService.login).toHaveBeenCalledWith('test@catvac.app', 'Password1')
    })

    it('returns 401 for invalid credentials', async () => {
      vi.mocked(authService.login).mockRejectedValue(new UnauthorizedError('Invalid credentials'))

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@catvac.app', password: 'wrong' })
        .expect(401)

      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'Password1' })
        .expect(400)

      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    it('clears cookie and returns success message', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .expect(200)

      expect(res.body.message).toBe('Logged out')
      expect(res.headers['set-cookie']).toBeDefined()
      const cookie = res.headers['set-cookie'][0]
      expect(cookie).toContain('token=;')
    })
  })

  describe('GET /api/v1/auth/me', () => {
    it('returns user when valid token is provided', async () => {
      vi.mocked(authService.getMe).mockResolvedValue(MOCK_USER)
      const token = generateToken()

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `token=${token}`)
        .expect(200)

      expect(res.body.user).toEqual(MOCK_USER)
      expect(authService.getMe).toHaveBeenCalledWith(MOCK_USER.id)
    })

    it('returns 401 when no cookie is present', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .expect(401)

      expect(res.body.error.code).toBe('UNAUTHORIZED')
      expect(res.body.error.message).toBe('Not authenticated')
    })

    it('returns 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', 'token=invalid-token')
        .expect(401)

      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('returns 401 when token is expired', async () => {
      const expiredToken = jwt.sign(
        { userId: MOCK_USER.id, email: MOCK_USER.email },
        process.env.JWT_SECRET,
        { expiresIn: '0s' },
      )

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `token=${expiredToken}`)
        .expect(401)

      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('returns 404 when authenticated user no longer exists', async () => {
      vi.mocked(authService.getMe).mockRejectedValue(new NotFoundError('User not found'))
      const token = generateToken()

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `token=${token}`)
        .expect(404)

      expect(res.body.error.code).toBe('NOT_FOUND')
    })
  })

  describe('Rate limiting', () => {
    it('returns 429 after exceeding 5 requests per minute on /auth/*', async () => {
      vi.mocked(authService.login).mockRejectedValue(new UnauthorizedError('Invalid credentials'))

      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@catvac.app', password: 'wrong' })
      }

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@catvac.app', password: 'wrong' })
        .expect(429)

      expect(res.body.error).toBeDefined()
    })
  })
})
