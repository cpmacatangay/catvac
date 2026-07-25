import * as deviceService from './device.service.js'

export class PushService {
  constructor(fcmClient, logger) {
    this.fcmClient = fcmClient
    this.logger = logger
  }

  async send(vaccine, type, ownerId) {
    const tokens = await deviceService.findByOwner(ownerId)
    if (tokens.length === 0) return { sent: 0, failed: 0 }

    const registrationTokens = tokens.map((d) => d.token)
    const catName = vaccine.catId?.name || 'your cat'
    const vname = vaccine.name
    const title = this.getTitle(type, vname, catName)
    const body = this.getBody(type, vaccine)

    const message = {
      notification: { title, body },
      tokens: registrationTokens,
    }

    try {
      const response = await this.fcmClient.sendEachForMulticast(message)
      const sent = response.successCount || 0
      const failed = response.failureCount || 0

      if (failed > 0) {
        this.logger.warn(`Push send partially failed for vaccine ${vaccine._id} (${type}): ${failed}/${registrationTokens.length} failed`)
      }
      return { sent, failed }
    } catch (err) {
      this.logger.error(`Push send failed for vaccine ${vaccine._id} (${type}): ${err.message}`)
      return { sent: 0, failed: registrationTokens.length }
    }
  }

  getTitle(type, vname, catName) {
    const titles = {
      pre: `${vname} due soon - ${catName}`,
      due: `${vname} is due today - ${catName}`,
      overdue: `Overdue: ${vname} - ${catName}`,
    }
    return titles[type] || 'CatVac Reminder'
  }

  getBody(type, vaccine) {
    const dueStr = vaccine.dueDate ? vaccine.dueDate.toLocaleDateString() : ''
    if (type === 'pre') return `Remember to vaccinate by ${dueStr}`
    if (type === 'due') return `Due today! ${dueStr}`
    return `Was due on ${dueStr} — please administer soon`
  }
}
