import { startOfDay, addDays } from 'date-fns'
import { Vaccine } from '../models/vaccine.model.js'
import { User } from '../models/user.model.js'
import { ReminderLog } from '../models/reminderLog.model.js'
import { Cat } from '../models/cat.model.js'
import { escapeHtml } from '../lib/escape-html.js'

export class ReminderService {
  constructor(mailer, logger) {
    this.mailer = mailer
    this.logger = logger
  }

  async processReminders() {
    const today = startOfDay(new Date())
    const summary = { checked: 0, sent: 0, skipped: 0, failed: 0 }

    const vaccines = await Vaccine.find({
      administered: false,
      $or: [{ snoozedUntil: null }, { snoozedUntil: { $lte: today } }],
    }).populate('catId')

    summary.checked = vaccines.length

    for (const vaccine of vaccines) {
      const user = await User.findById(vaccine.ownerId)
      if (!user) continue

      const windows = this.getReminderWindows(vaccine, today, user.prefs?.leadDays ?? 7)

      for (const { type, windowDate, windowEnd } of windows) {
        const shouldSend = this.shouldSendReminder(type, user.prefs)
        if (!shouldSend) {
          summary.skipped++
          continue
        }

        if (today < windowDate || today > windowEnd) continue

        const existing = await ReminderLog.findOne({
          vaccineId: vaccine._id,
          type,
          windowDate,
        })

        if (existing) {
          summary.skipped++
          continue
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
            sentAt: new Date(),
            status: 'sent',
          })

          summary.sent++
        } catch (err) {
          this.logger.error({ err, vaccineId: vaccine._id, type }, 'reminder send failed')
          await ReminderLog.create({
            vaccineId: vaccine._id,
            type,
            windowDate,
            sentAt: new Date(),
            status: 'failed',
            error: err.message,
          })
          summary.failed++
        }
      }
    }

    this.logger.info({ summary }, 'reminder-run')
    return summary
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
