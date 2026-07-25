import { DeviceToken } from '../models/deviceToken.model.js'

export async function register(ownerId, token, platform, appVersion) {
  return DeviceToken.findOneAndUpdate(
    { ownerId, token },
    { ownerId, token, platform, appVersion, lastSeenAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
}

export async function unregister(ownerId, token) {
  const device = await DeviceToken.findOneAndDelete({ ownerId, token })
  return device
}

export async function findByOwner(ownerId) {
  return DeviceToken.find({ ownerId })
}
