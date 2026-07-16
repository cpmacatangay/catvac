import { z } from 'zod'

export const createCatSchema = z
  .object({
    name: z.string().min(1).max(100),
    breed: z.string().max(100).nullable().optional(),
    dob: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .refine(
        (v) => {
          if (v === null || v === undefined) return true
          return new Date(v) < new Date()
        },
        { message: 'Date of birth must be in the past' },
      ),
    sex: z.enum(['M', 'F']).nullable().optional(),
    photoUrl: z.string().url().max(500).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
  })
  .strict()

export const updateCatSchema = createCatSchema.partial()
