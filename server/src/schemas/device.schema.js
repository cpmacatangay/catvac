import { z } from 'zod'

export const registerDeviceSchema = z.strictObject({
  token: z.string().min(1).max(500),
  platform: z.enum(['android']),
  appVersion: z.string().max(20).optional(),
})
