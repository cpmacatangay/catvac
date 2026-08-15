import { z } from 'zod'

const password = z
  .string()
  .min(8)
  .max(128)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const signupSchema = z.strictObject({
  email: z.email().max(255).transform((v) => v.toLowerCase()),
  password,
})

export const loginSchema = z.strictObject({
  email: z.email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
})
