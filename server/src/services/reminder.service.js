import { startOfDay, addDays } from 'date-fns'
import { Vaccine } from '../models/vaccine.model.js'
import { User } from '../models/user.model.js'
import { ReminderLog } from '../models/reminderLog.model.js'
import { Cat } from '../models/cat.model.js'
import { escapeHtml } from '../lib/escape-html.js'

export class ReminderService {
  constructor(mailer, logger, pushService = null) {
    this.mailer = mailer
    this.logger = logger
    this.pushService = pushService
  }

  async processReminders() {
    const today = startOfDay(new Date())
    const summary = { checked: 0, emailSent: 0, emailSkipped: 0, emailFailed: 0, pushSent: 0, pushSkipped: 0, pushFailed: 0 }

    const vaccines = await Vaccine.find({
      administered: false,
      $or: [{ snoozedUntil: null }, { snoozedUntil: { $lte: today } }],
    }).populate('catId')

    summary.checked = vaccines.length

    for (const vaccine of vaccines) {
      try {
        const user = await User.findById(vaccine.ownerId)
        if (!user) continue

        const windows = this.getReminderWindows(vaccine, today, user.prefs?.leadDays ?? 7)

        for (const { type, windowDate, windowEnd } of windows) {
          if (today < windowDate || today > windowEnd) continue

          await this.sendEmailReminder(vaccine, user, type, windowDate, summary)
          if (this.pushService) {
            await this.sendPushReminder(vaccine, user, type, windowDate, summary)
          }
        }
      } catch (err) {
        this.logger.error(`Reminder skipped for vaccine ${vaccine._id}: ${err.message}`)
      }
    }

    this.logger.info(
      `Reminder run — checked: ${summary.checked}, ` +
      `email sent: ${summary.emailSent}, skipped: ${summary.emailSkipped}, failed: ${summary.emailFailed}, ` +
      `push sent: ${summary.pushSent}, skipped: ${summary.pushSkipped}, failed: ${summary.pushFailed}`
    )
    return summary
  }

  async sendEmailReminder(vaccine, user, type, windowDate, summary) {
    const shouldSend = this.shouldSendReminder(type, user.prefs)
    if (!shouldSend) {
      summary.emailSkipped++
      return
    }

    const existing = await ReminderLog.findOne({
      vaccineId: vaccine._id,
      type,
      windowDate,
      channel: 'email',
    })

    if (existing) {
      summary.emailSkipped++
      return
    }

    try {
      await this.mailer.send({
        to: user.email,
        subject: this.getSubject(type, vaccine),
        html: this.getTemplate(type, vaccine, user),
      })

      await ReminderLog.create({
        vaccineId: vaccine._id,
        type,
        windowDate,
        channel: 'email',
        sentAt: new Date(),
        status: 'sent',
      })

      summary.emailSent++
    } catch (err) {
      this.logger.error(`Email send failed for vaccine ${vaccine._id} (${type}): ${err.message}`)
      await ReminderLog.create({
        vaccineId: vaccine._id,
        type,
        windowDate,
        channel: 'email',
        sentAt: new Date(),
        status: 'failed',
        error: err.message,
      })
      summary.emailFailed++
    }
  }

  async sendPushReminder(vaccine, user, type, windowDate, summary) {
    const existing = await ReminderLog.findOne({
      vaccineId: vaccine._id,
      type,
      windowDate,
      channel: 'push',
    })

    if (existing) {
      summary.pushSkipped++
      return
    }

    try {
      const result = await this.pushService.send(vaccine, type, user._id)

      if (result.sent > 0) {
        await ReminderLog.create({
          vaccineId: vaccine._id,
          type,
          windowDate,
          channel: 'push',
          sentAt: new Date(),
          status: 'sent',
        })
        summary.pushSent += result.sent
      }

      if (result.failed > 0) {
        await ReminderLog.create({
          vaccineId: vaccine._id,
          type,
          windowDate,
          channel: 'push',
          sentAt: new Date(),
          status: 'failed',
          error: `Push failed for ${result.failed} devices`,
        })
        summary.pushFailed += result.failed
      }
    } catch (err) {
      this.logger.error(`Push send failed for vaccine ${vaccine._id} (${type}): ${err.message}`)
      await ReminderLog.create({
        vaccineId: vaccine._id,
        type,
        windowDate,
        channel: 'push',
        sentAt: new Date(),
        status: 'failed',
        error: err.message,
      })
      summary.pushFailed++
    }
  }

  getReminderWindows(vaccine, today, leadDays) {
    const windows = []

    windows.push({
      type: 'pre',
      windowDate: addDays(vaccine.dueDate, -leadDays),
      windowEnd: addDays(vaccine.dueDate, -1),
    })

    windows.push({
      type: 'due',
      windowDate: vaccine.dueDate,
      windowEnd: vaccine.dueDate,
    })

    windows.push({
      type: 'overdue',
      windowDate: addDays(vaccine.dueDate, 1),
      windowEnd: addDays(vaccine.dueDate, 30),
    })

    return windows
  }

  shouldSendReminder(type, prefs) {
    if (!prefs) return true
    if (type === 'pre' && prefs.receivePreDue === false) return false
    if (type === 'due' && prefs.receiveDue === false) return false
    if (type === 'overdue' && prefs.receiveOverdue === false) return false
    return true
  }

  shouldSendPush(prefs) {
    if (!prefs) return true
    return prefs.receivePush !== false
  }

  getSubject(type, vaccine) {
    const vname = vaccine.name
    const cname = vaccine.catId?.name || 'your cat'
    const subjects = {
      pre: `Reminder: ${vname} due soon for ${cname}`,
      due: `${vname} is due today for ${cname}`,
      overdue: `Overdue: ${vname} for ${cname}`,
    }
    return subjects[type] || 'CatVac Reminder'
  }

  getTemplate(type, vaccine, user) {
    const catName = escapeHtml(vaccine.catId?.name) || 'your cat'
    const vname = escapeHtml(vaccine.name)
    const desc = type === 'pre' ? 'coming due soon' : type === 'due' ? 'due today' : 'overdue'
    const dueStr = vaccine.dueDate ? vaccine.dueDate.toDateString() : ''
    return `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">
        <div style="background:#8B5CF6;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">CatVac</h1>
        </div>
        <div style="padding:30px;background:white;">
          <h2 style="color:#1F2937;margin-top:0;">${escapeHtml(this.getSubject(type, vaccine))}</h2>
          <p style="color:#6B7280;line-height:1.5;">
            ${catName}'s ${vname} vaccine is ${desc}.
          </p>
          ${dueStr ? `<p style="color:#6B7280;">Due date: ${escapeHtml(dueStr)}</p>` : ''}
          <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/dashboard"
             style="display:inline-block;background:#8B5CF6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
            View Dashboard
          </a>
        </div>
        <div style="padding:20px;text-align:center;font-size:12px;color:#9CA3AF;">
          <p>You received this because you set up reminders on CatVac.</p>
          <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/api/v1/unsubscribe?token=PLACEHOLDER"
             style="color:#8B5CF6;">Unsubscribe</a>
        </div>
      </div>
    `
  }
}
