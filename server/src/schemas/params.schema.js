import { z } from 'zod'

const objectId = z.string().length(24, 'Invalid ID format')

export const catIdParam = z.object({ id: objectId }).strict()
export const vaccineIdParam = z.object({ id: objectId }).strict()
export const vaccinesByCatParam = z.object({ catId: objectId }).strict()
