import { z } from 'zod'

export const createVaccineSchema = z.strictObject({
  catId: z.string().length(24),
  name: z.string().min(1).max(100),
  dueDate: z.string().datetime(),
  intervalMonths: z.number().int().positive().max(120).nullable().optional(),
  notes: z.string().max(500).optional(),
})

export const updateVaccineSchema = z.strictObject({
  name: z.string().min(1).max(100).optional(),
  dueDate: z.string().datetime().optional(),
  intervalMonths: z.number().int().positive().max(120).nullable().optional(),
  notes: z.string().max(500).optional(),
})

export const administerSchema = z.strictObject({
  administeredDate: z.string().datetime().optional(),
  note: z.string().max(500).optional(),
})

export const snoozeSchema = z.strictObject({
  days: z.number().int().positive().max(90).default(30),
})
