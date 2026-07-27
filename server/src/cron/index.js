import cron from 'node-cron'
import { createTransport } from 'nodemailer'
import { ReminderService } from '../services/reminder.service.js'
import { PushService } from '../services/push.service.js'
import { createFcmClient } from '../lib/fcmClient.js'

function createMailer() {
  return createTransport({
    host: process.env.SMTP_HOST || 'mailhog',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
}

const cronLogger = {
  info: (msg) => console.log(`[reminder-engine] ${msg}`),
  error: (msg) => console.error(`[reminder-engine] ${msg}`),
}

export function startReminderEngine() {
  const mailer = createMailer()

  Promise.resolve(createFcmClient())
    .then((messaging) => {
      let pushService = null
      if (messaging) {
        pushService = new PushService(messaging, cronLogger)
        cronLogger.info('FCM initialized for push notifications')
      }
      return pushService
    })
    .catch((err) => {
      cronLogger.error(`FCM initialization failed: ${err.message}. Push disabled.`)
      return null
    })
    .then((pushService) => {
      const reminderService = new ReminderService(mailer, cronLogger, pushService)

      cron.schedule('0 2 * * *', async () => {
        cronLogger.info('Starting nightly reminder scan')
        try {
          const summary = await reminderService.processReminders()
          cronLogger.info(`Reminder scan complete — checked: ${summary.checked}, email sent: ${summary.emailSent}, push sent: ${summary.pushSent}`)
        } catch (err) {
          cronLogger.error(`Reminder scan failed: ${err.message}`)
        }
      })

      console.log('[reminder-engine] Scheduled for 02:00 daily')
    })
}
