import mongoose from 'mongoose'
import { createApp } from './app.js'
import { startReminderEngine } from './cron/index.js'
import { validateEnv } from './lib/env.js'

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catvac'

validateEnv()

async function main() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  const app = createApp()

  startReminderEngine()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

main().catch((err) => {
  console.error('Failed to start server', err)
  process.exit(1)
})
