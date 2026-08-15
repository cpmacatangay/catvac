import { z } from 'zod'

const objectId = z.string().length(24, 'Invalid ID format')

export const catIdParam = z.strictObject({ id: objectId })
export const vaccineIdParam = z.strictObject({ id: objectId })
export const vaccinesByCatParam = z.strictObject({ catId: objectId })
