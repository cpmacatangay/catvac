import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import { nanoid } from 'nanoid'

import { authRoutes } from './routes/auth.routes.js'
import { catRoutes } from './routes/cat.routes.js'
import { vaccineRoutes } from './routes/vaccine.routes.js'
import { dashboardRoutes } from './routes/dashboard.routes.js'
import { unsubscribeRoutes } from './routes/unsubscribe.routes.js'
import { authMiddleware } from './middleware/auth.middleware.js'
import { errorHandler } from './middleware/error.middleware.js'
import { notFoundHandler } from './middleware/notFound.middleware.js'

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN

const AUTH_LIMIT_WINDOW_MS = 60 * 1000
const AUTH_LIMIT_MAX = 5
const GLOBAL_LIMIT_WINDOW_MS = 60 * 1000
const GLOBAL_LIMIT_MAX = 100

export function createApp() {
  const app = express()

  if (process.env.PROXY_COUNT) {
    app.set('trust proxy', parseInt(process.env.PROXY_COUNT, 10))
  }

  app.use(pinoHttp({ genReqId: () => nanoid() }))
  app.use(helmet())
  app.use(
    cors({
      origin: FRONTEND_ORIGIN || (process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5173'),
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '10kb' }))
  app.use(cookieParser())

  const authLimiter = rateLimit({
    windowMs: AUTH_LIMIT_WINDOW_MS,
    max: AUTH_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: 'Too many requests, please try again later', code: 'RATE_LIMITED' } },
  })

  const globalLimiter = rateLimit({
    windowMs: GLOBAL_LIMIT_WINDOW_MS,
    max: GLOBAL_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: 'Too many requests', code: 'RATE_LIMITED' } },
    skip: (req) => req.path.startsWith('/api/v1/auth'),
  })

  app.use('/api/v1', globalLimiter)
  app.use('/api/v1/auth', authLimiter, authRoutes)
  app.use('/api/v1/unsubscribe', unsubscribeRoutes)

  app.use('/api/v1', authMiddleware)
  app.use('/api/v1/cats', catRoutes)
  app.use('/api/v1/vaccines', vaccineRoutes)
  app.use('/api/v1/dashboard', dashboardRoutes)

  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() })
  })

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
