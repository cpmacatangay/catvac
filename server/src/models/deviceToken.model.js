import mongoose from 'mongoose'

const deviceTokenSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token: { type: String, required: true },
  platform: { type: String, required: true, enum: ['android'] },
  appVersion: { type: String, default: null, maxlength: 20 },
  lastSeenAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: true, updatedAt: false } })

deviceTokenSchema.index({ ownerId: 1, token: 1 }, { unique: true })

export const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema)
