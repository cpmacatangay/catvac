import { ValidationError } from '../lib/errors.js'

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const messages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      return next(new ValidationError(messages.join('; ')))
    }
    req.body = result.data
    next()
  }
}

export function validateParams(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      const messages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      return next(new ValidationError(messages.join('; ')))
    }
    next()
  }
}
