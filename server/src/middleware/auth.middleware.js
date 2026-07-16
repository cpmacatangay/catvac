import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../lib/errors.js'

export function authMiddleware(req, _res, next) {
  const token = req.cookies?.token
  if (!token) {
    return next(new UnauthorizedError('Not authenticated'))
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch {
    next(new UnauthorizedError('Invalid or expired token'))
  }
}
