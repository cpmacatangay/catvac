import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { signupSchema, loginSchema } from '../schemas/auth.schema.js'

export const authRoutes = Router()

authRoutes.post('/signup', validate(signupSchema), authController.signup)
authRoutes.post('/login', validate(loginSchema), authController.login)
authRoutes.post('/logout', authController.logout)
authRoutes.get('/me', authMiddleware, authController.me)
