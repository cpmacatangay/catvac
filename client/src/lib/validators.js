import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const catSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  breed: z.string().max(100).nullable().optional(),
  sex: z.enum(['M', 'F']).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const vaccineSchema = z.object({
  name: z.string().min(1, 'Vaccine name is required').max(100),
  dueDate: z.string().min(1, 'Due date is required'),
  intervalMonths: z.coerce.number().int().positive().max(120).nullable().optional(),
  notes: z.string().max(500).optional(),
})
