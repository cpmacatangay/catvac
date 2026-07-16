import crypto from 'node:crypto'
import { User } from '../models/user.model.js'
import { ValidationError } from '../lib/errors.js'
import { escapeHtml } from '../lib/escape-html.js'

export async function unsubscribe(req, res, next) {
  try {
    const { token } = req.query
    if (!token) throw new ValidationError('Missing unsubscribe token')

    const decoded = Buffer.from(token, 'base64url').toString()
    const [userId, email, type, ...hmacParts] = decoded.split(':')
    const providedHmac = hmacParts.join(':')

    const expected = crypto
      .createHmac('sha256', process.env.UNSUBSCRIBE_SECRET)
      .update(`${userId}:${email}:${type}`)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(providedHmac))) {
      throw new ValidationError('Invalid unsubscribe token')
    }

    const update = type === 'all'
      ? { 'prefs.receivePreDue': false, 'prefs.receiveDue': false, 'prefs.receiveOverdue': false }
      : { [`prefs.receive${type.charAt(0).toUpperCase() + type.slice(1)}`]: false }

    await User.findByIdAndUpdate(userId, update)

    const displayType = escapeHtml(type === 'all' ? 'reminder' : type)

    res.type('html').send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h1 style="color:#1F2937;">Unsubscribed</h1>
        <p style="color:#6B7280;">You will no longer receive ${displayType} emails.</p>
      </body></html>
    `)
  } catch (err) {
    next(err)
  }
}
