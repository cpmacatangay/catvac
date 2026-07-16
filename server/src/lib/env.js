const required = ['JWT_SECRET', 'UNSUBSCRIBE_SECRET']

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }

  if (process.env.UNSUBSCRIBE_SECRET.length < 16) {
    throw new Error('UNSUBSCRIBE_SECRET must be at least 16 characters')
  }

  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string')
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_ORIGIN) {
      throw new Error('FRONTEND_ORIGIN is required in production')
    }
    if (process.env.JWT_SECRET === 'change-me-to-a-random-64-char-string') {
      throw new Error('JWT_SECRET must be changed from the default placeholder in production')
    }
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UNSUBSCRIBE_SECRET: process.env.UNSUBSCRIBE_SECRET,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  SMTP_HOST: process.env.SMTP_HOST || 'mailhog',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '1025', 10),
  SMTP_USER: process.env.SMTP_USER || null,
  SMTP_PASS: process.env.SMTP_PASS || null,
  FROM_EMAIL: process.env.FROM_EMAIL || 'reminders@catvac.app',
  SENTRY_DSN: process.env.SENTRY_DSN || null,
  PROXY_COUNT: process.env.PROXY_COUNT ? parseInt(process.env.PROXY_COUNT, 10) : null,
}
