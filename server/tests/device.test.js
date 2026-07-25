import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long-for-env-validation'
process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret-that-is-32-chars'

const MOCK_USER = { id: '507f1f77bcf86cd799439011', email: 'test@catvac.app', prefs: { leadDays: 7 } }

vi.mock('../src/services/device.service.js', () => ({
  register: vi.fn(),
  unregister: vi.fn(),
  findByOwner: vi.fn(),
}))

import { createApp } from '../src/app.js'
import * as deviceService from '../src/services/device.service.js'

function generateToken() {
  return jwt.sign({ userId: MOCK_USER.id, email: MOCK_USER.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

describe('Device API', () => {
  let app

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(deviceService.register).mockReset()
    vi.mocked(deviceService.unregister).mockReset()
    vi.mocked(deviceService.findByOwner).mockReset()
    app = createApp()
  })

  describe('POST /api/v1/devices', () => {
    it('registers a device token and returns 201', async () => {
      const mockDevice = {
        _id: '661234567890123456789012',
        ownerId: MOCK_USER.id,
        token: 'fcm-token-123',
        platform: 'android',
        appVersion: '1.0.0',
      }
      vi.mocked(deviceService.register).mockResolvedValue(mockDevice)
      const token = generateToken()

      const res = await request(app)
        .post('/api/v1/devices')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: 'fcm-token-123', platform: 'android', appVersion: '1.0.0' })
        .expect(201)

      expect(res.body.device).toEqual(mockDevice)
      expect(deviceService.register).toHaveBeenCalledWith(MOCK_USER.id, 'fcm-token-123', 'android', '1.0.0')
    })

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/devices')
        .send({ token: 'fcm-token-123', platform: 'android' })
        .expect(401)

      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('returns 400 when token is missing', async () => {
      const token = generateToken()

      const res = await request(app)
        .post('/api/v1/devices')
        .set('Authorization', `Bearer ${token}`)
        .send({ platform: 'android' })
        .expect(400)

      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('DELETE /api/v1/devices/:token', () => {
    it('unregisters a device token', async () => {
      vi.mocked(deviceService.unregister).mockResolvedValue({ _id: 'mock-id' })
      const token = generateToken()

      const res = await request(app)
        .delete('/api/v1/devices/fcm-token-456')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.message).toBe('Device unregistered')
      expect(deviceService.unregister).toHaveBeenCalledWith(MOCK_USER.id, 'fcm-token-456')
    })

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .delete('/api/v1/devices/fcm-token-456')
        .expect(401)

      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })
  })
})
