import cron from 'node-cron'
import { createTransport } from 'nodemailer'
import pino from 'pino'
import { ReminderService } from '../services/reminder.service.js'

function createMailer() {
  return createTransport({
    host: process.env.SMTP_HOST || 'mailhog',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
}

export function startReminderEngine() {
  const logger = pino().child({ module: 'reminder-engine' })
  const mailer = createMailer()
  const reminderService = new ReminderService(mailer, logger)

  cron.schedule('0 2 * * *', async () => {
    logger.info('Starting nightly reminder scan')
    try {
      const summary = await reminderService.processReminders()
      logger.info({ summary }, 'Reminder scan complete')
    } catch (err) {
      logger.error({ err }, 'Reminder scan failed')
    }
  })

  logger.info('Reminder engine scheduled for 02:00 daily')
}
