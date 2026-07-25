import mongoose from 'mongoose'

const reminderLogSchema = new mongoose.Schema({
  vaccineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vaccine', required: true },
  type: { type: String, required: true, enum: ['pre', 'due', 'overdue'] },
  windowDate: { type: Date, required: true },
  channel: { type: String, default: 'email', enum: ['email', 'push'] },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, default: 'sent', enum: ['sent', 'failed'] },
  error: { type: String, default: null, maxlength: 500 },
})

reminderLogSchema.index({ vaccineId: 1, type: 1, windowDate: 1, channel: 1 }, { unique: true })
reminderLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 })

export const ReminderLog = mongoose.model('ReminderLog', reminderLogSchema)
