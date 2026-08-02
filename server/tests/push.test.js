import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/services/device.service.js', () => ({
  findByOwner: vi.fn(),
  unregister: vi.fn(),
}))

import { PushService } from '../src/services/push.service.js'
import * as deviceService from '../src/services/device.service.js'

const MOCK_OWNER = '507f1f77bcf86cd799439011'

const makeVaccine = () => ({
  _id: '661234567890123456789012',
  name: 'Rabies',
  dueDate: new Date('2026-09-15'),
  catId: { name: 'Luna' },
})

function mockLogger() {
  return { warn: vi.fn(), error: vi.fn() }
}

function makeFcmClient(response) {
  return { sendEachForMulticast: vi.fn().mockResolvedValue(response) }
}

describe('PushService', () => {
  let logger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = mockLogger()
  })

  describe('send', () => {
    it('returns { sent:0, failed:0 } when owner has no registered tokens', async () => {
      vi.mocked(deviceService.findByOwner).mockResolvedValue([])
      const fcmClient = makeFcmClient({})
      const pushService = new PushService(fcmClient, logger)

      const result = await pushService.send(makeVaccine(), 'due', MOCK_OWNER)

      expect(result).toEqual({ sent: 0, failed: 0 })
      expect(fcmClient.sendEachForMulticast).not.toHaveBeenCalled()
    })

    it('returns { sent, failed:0 } on full success', async () => {
      vi.mocked(deviceService.findByOwner).mockResolvedValue([
        { token: 'token-a' },
        { token: 'token-b' },
      ])
      const fcmClient = makeFcmClient({ successCount: 2, failureCount: 0, responses: [] })
      const pushService = new PushService(fcmClient, logger)

      const result = await pushService.send(makeVaccine(), 'due', MOCK_OWNER)

      expect(result).toEqual({ sent: 2, failed: 0 })
      expect(fcmClient.sendEachForMulticast).toHaveBeenCalledTimes(1)
    })

    it('returns { sent, failed } on partial success and prunes dead tokens', async () => {
      vi.mocked(deviceService.findByOwner).mockResolvedValue([
        { token: 'token-ok' },
        { token: 'token-dead' },
        { token: 'token-ok-2' },
      ])
      const fcmClient = makeFcmClient({
        successCount: 2,
        failureCount: 1,
        responses: [
          { success: true },
          { error: { code: 'messaging/registration-token-not-registered', message: 'Not registered' } },
          { success: true },
        ],
      })
      const pushService = new PushService(fcmClient, logger)

      const result = await pushService.send(makeVaccine(), 'due', MOCK_OWNER)

      expect(result).toEqual({ sent: 2, failed: 1 })
      expect(deviceService.unregister).toHaveBeenCalledTimes(1)
      expect(deviceService.unregister).toHaveBeenCalledWith(MOCK_OWNER, 'token-dead')
    })

    it('prunes all dead-token variants (not-registered, invalid-registration, invalid-registration-token)', async () => {
      vi.mocked(deviceService.findByOwner).mockResolvedValue([
        { token: 't1' },
        { token: 't2' },
        { token: 't3' },
      ])
      const fcmClient = makeFcmClient({
        successCount: 0,
        failureCount: 3,
        responses: [
          { error: { code: 'messaging/registration-token-not-registered' } },
          { error: { code: 'messaging/invalid-registration' } },
          { error: { code: 'messaging/invalid-registration-token' } },
        ],
      })
      const pushService = new PushService(fcmClient, logger)

      await pushService.send(makeVaccine(), 'overdue', MOCK_OWNER)

      expect(deviceService.unregister).toHaveBeenCalledTimes(3)
      expect(deviceService.unregister).toHaveBeenCalledWith(MOCK_OWNER, 't1')
      expect(deviceService.unregister).toHaveBeenCalledWith(MOCK_OWNER, 't2')
      expect(deviceService.unregister).toHaveBeenCalledWith(MOCK_OWNER, 't3')
    })

    it('does NOT prune recoverable errors (unavailable, quota, etc.)', async () => {
      vi.mocked(deviceService.findByOwner).mockResolvedValue([
        { token: 'token-alive' },
      ])
      const fcmClient = makeFcmClient({
        successCount: 0,
        failureCount: 1,
        responses: [
          { error: { code: 'messaging/server-unavailable' } },
        ],
      })
      const pushService = new PushService(fcmClient, logger)

      await pushService.send(makeVaccine(), 'due', MOCK_OWNER)

      expect(deviceService.unregister).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalled()
    })

    it('continues pruning other tokens if one unregister throws', async () => {
      vi.mocked(deviceService.findByOwner).mockResolvedValue([
        { token: 't1' },
        { token: 't2' },
      ])
      vi.mocked(deviceService.unregister)
        .mockRejectedValueOnce(new Error('DB error'))
        .mockResolvedValueOnce(undefined)
      const fcmClient = makeFcmClient({
        successCount: 0,
        failureCount: 2,
        responses: [
          { error: { code: 'messaging/registration-token-not-registered' } },
          { error: { code: 'messaging/registration-token-not-registered' } },
        ],
      })
      const pushService = new PushService(fcmClient, logger)

      await pushService.send(makeVaccine(), 'due', MOCK_OWNER)

      expect(deviceService.unregister).toHaveBeenCalledTimes(2)
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to prune dead token'))
    })

    it('returns { sent:0, failed:N } when sendEachForMulticast throws', async () => {
      vi.mocked(deviceService.findByOwner).mockResolvedValue([
        { token: 'token-a' },
        { token: 'token-b' },
      ])
      const fcmClient = { sendEachForMulticast: vi.fn().mockRejectedValue(new Error('Network down')) }
      const pushService = new PushService(fcmClient, logger)

      const result = await pushService.send(makeVaccine(), 'due', MOCK_OWNER)

      expect(result).toEqual({ sent: 0, failed: 2 })
      expect(logger.error).toHaveBeenCalled()
    })
  })
})
