import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockVaccineFind,
  mockUserFindById,
  mockReminderLogFindOne,
  mockReminderLogCreate,
  mockStartOfDay,
} = vi.hoisted(() => ({
  mockVaccineFind: vi.fn(),
  mockUserFindById: vi.fn(),
  mockReminderLogFindOne: vi.fn(),
  mockReminderLogCreate: vi.fn(),
  mockStartOfDay: vi.fn(),
}))

vi.mock('../src/models/vaccine.model.js', () => ({
  Vaccine: {
    find: (...args) => mockVaccineFind(...args),
  },
}))

vi.mock('../src/models/user.model.js', () => ({
  User: {
    findById: (...args) => mockUserFindById(...args),
  },
}))

vi.mock('../src/models/reminderLog.model.js', () => ({
  ReminderLog: {
    findOne: (...args) => mockReminderLogFindOne(...args),
    create: (...args) => mockReminderLogCreate(...args),
  },
}))

vi.mock('../src/models/cat.model.js', () => ({
  Cat: {},
}))

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    startOfDay: (...args) => mockStartOfDay(...args),
  }
})

import { ReminderService } from '../src/services/reminder.service.js'

const MOCK_OWNER = '507f1f77bcf86cd799439011'

const makeVaccine = (overrides = {}) => ({
  _id: '661234567890123456789012',
  name: 'Rabies',
  dueDate: new Date('2026-09-15'),
  catId: { _id: '661234567890123456789099', name: 'Luna' },
  ownerId: MOCK_OWNER,
  administered: false,
  intervalMonths: 12,
  snoozedUntil: null,
  ...overrides,
})

const makeUser = (prefs = {}) => ({
  _id: MOCK_OWNER,
  email: 'test@catvac.app',
  prefs: { leadDays: 7, ...prefs },
})

function mockMailer() {
  return { send: vi.fn().mockResolvedValue(undefined) }
}

function mockPushService() {
  return { send: vi.fn().mockResolvedValue({ sent: 1, failed: 0 }) }
}

function mockLogger() {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}

describe('ReminderService — push channel', () => {
  let mailer, pushService, logger, service

  beforeEach(() => {
    vi.clearAllMocks()
    mailer = mockMailer()
    pushService = mockPushService()
    logger = mockLogger()
    service = new ReminderService(mailer, logger, pushService)
  })

  describe('sendPushReminder', () => {
    it('skips push when ReminderLog already exists (dedup)', async () => {
      mockReminderLogFindOne.mockResolvedValue({ _id: 'existing-log', channel: 'push' })
      const summary = { checked: 0, emailSent: 0, emailSkipped: 0, emailFailed: 0, pushSent: 0, pushSkipped: 0, pushFailed: 0 }
      const vaccine = makeVaccine()
      const user = makeUser()
      const windowDate = vaccine.dueDate

      await service.sendPushReminder(vaccine, user, 'due', windowDate, summary)

      expect(summary.pushSkipped).toBe(1)
      expect(summary.pushSent).toBe(0)
      expect(pushService.send).not.toHaveBeenCalled()
      expect(mockReminderLogFindOne).toHaveBeenCalledWith({
        vaccineId: vaccine._id,
        type: 'due',
        windowDate,
        channel: 'push',
      })
    })

    it('sends push and creates a sent ReminderLog on success', async () => {
      mockReminderLogFindOne.mockResolvedValue(null)
      mockReminderLogCreate.mockResolvedValue({ _id: 'new-log' })
      const summary = { checked: 0, emailSent: 0, emailSkipped: 0, emailFailed: 0, pushSent: 0, pushSkipped: 0, pushFailed: 0 }
      const vaccine = makeVaccine()
      const user = makeUser()

      await service.sendPushReminder(vaccine, user, 'due', vaccine.dueDate, summary)

      expect(pushService.send).toHaveBeenCalledWith(vaccine, 'due', MOCK_OWNER)
      expect(summary.pushSent).toBe(1)
      expect(summary.pushFailed).toBe(0)
      expect(mockReminderLogCreate).toHaveBeenCalledWith(expect.objectContaining({
        vaccineId: vaccine._id,
        type: 'due',
        windowDate: vaccine.dueDate,
        channel: 'push',
        status: 'sent',
      }))
    })

    it('creates failed ReminderLog when pushService.send returns 0 sent', async () => {
      pushService.send.mockResolvedValueOnce({ sent: 0, failed: 3 })
      mockReminderLogFindOne.mockResolvedValue(null)
      mockReminderLogCreate.mockResolvedValue({ _id: 'failed-log' })
      const summary = { checked: 0, emailSent: 0, emailSkipped: 0, emailFailed: 0, pushSent: 0, pushSkipped: 0, pushFailed: 0 }
      const vaccine = makeVaccine()
      const user = makeUser()

      await service.sendPushReminder(vaccine, user, 'overdue', vaccine.dueDate, summary)

      expect(summary.pushSent).toBe(0)
      expect(summary.pushFailed).toBe(3)
      expect(mockReminderLogCreate).toHaveBeenCalledWith(expect.objectContaining({
        channel: 'push',
        status: 'failed',
      }))
    })

    it('catches pushService.send errors and creates failed ReminderLog', async () => {
      pushService.send.mockRejectedValueOnce(new Error('FCM timeout'))
      mockReminderLogFindOne.mockResolvedValue(null)
      mockReminderLogCreate.mockResolvedValue({ _id: 'error-log' })
      const summary = { checked: 0, emailSent: 0, emailSkipped: 0, emailFailed: 0, pushSent: 0, pushSkipped: 0, pushFailed: 0 }
      const vaccine = makeVaccine()
      const user = makeUser()

      await service.sendPushReminder(vaccine, user, 'pre', vaccine.dueDate, summary)

      expect(summary.pushFailed).toBe(1)
      expect(summary.pushSent).toBe(0)
      expect(logger.error).toHaveBeenCalled()
      expect(mockReminderLogCreate).toHaveBeenCalledWith(expect.objectContaining({
        channel: 'push',
        status: 'failed',
        error: 'FCM timeout',
      }))
    })
  })

  describe('processReminders — push integration', () => {
    it('calls sendPushReminder for each vaccine + window combination', async () => {
      const dueDate = new Date('2026-09-15T12:00:00Z')
      const today = new Date('2026-09-12T00:00:00Z')
      mockStartOfDay.mockReturnValue(today)
      const vaccine = makeVaccine({ dueDate })
      const user = makeUser({ leadDays: 7 })

      mockVaccineFind.mockReturnValue({ populate: vi.fn().mockResolvedValue([vaccine]) })
      mockUserFindById.mockResolvedValue(user)
      mockReminderLogFindOne.mockResolvedValue(null)
      mockReminderLogCreate.mockResolvedValue({ _id: 'log-1' })

      await service.processReminders()

      expect(mockVaccineFind).toHaveBeenCalled()
      expect(mockUserFindById).toHaveBeenCalledWith(MOCK_OWNER)
      expect(pushService.send).toHaveBeenCalled()
    })
  })
})

describe('ReminderService — without pushService', () => {
  it('does not attempt push when pushService is null', async () => {
    const mailer = mockMailer()
    const logger = mockLogger()
    const service = new ReminderService(mailer, logger, null)

    const vaccine = makeVaccine({ dueDate: new Date('2026-09-15') })
    const user = makeUser()

    mockVaccineFind.mockReturnValue({ populate: vi.fn().mockResolvedValue([vaccine]) })
    mockUserFindById.mockResolvedValue(user)
    mockReminderLogFindOne.mockResolvedValue(null)
    mockReminderLogCreate.mockResolvedValue({ _id: 'log-1' })

    await service.processReminders()

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('push sent: 0'))
  })
})
