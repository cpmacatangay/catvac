import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { addDays } from 'date-fns'
import { User } from './src/models/user.model.js'
import { Cat } from './src/models/cat.model.js'
import { Vaccine } from './src/models/vaccine.model.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catvac'

async function seed() {
  await mongoose.connect(MONGODB_URI)

  await Promise.all([
    User.deleteMany({}),
    Cat.deleteMany({}),
    Vaccine.deleteMany({}),
  ])

  const user = await User.create({
    email: 'demo@catvac.app',
    passwordHash: await bcrypt.hash('password123', 12),
    isVerified: true,
    prefs: { leadDays: 7, receivePreDue: true, receiveDue: true, receiveOverdue: true },
  })

  const [milo, luna] = await Cat.create([
    { ownerId: user._id, name: 'Milo', breed: 'Tabby', dob: new Date('2020-03-15'), sex: 'M' },
    { ownerId: user._id, name: 'Luna', breed: 'Siamese', dob: new Date('2022-07-01'), sex: 'F' },
  ])

  await Vaccine.create([
    { ownerId: user._id, catId: milo._id, name: 'Rabies', dueDate: addDays(new Date(), 10), intervalMonths: 12 },
    { ownerId: user._id, catId: milo._id, name: 'FVRCP', dueDate: addDays(new Date(), 40), intervalMonths: 12 },
    {
      ownerId: user._id, catId: milo._id, name: 'FeLV', dueDate: addDays(new Date(), -30),
      intervalMonths: 12, administered: true, administeredDate: addDays(new Date(), -30),
    },
    { ownerId: user._id, catId: luna._id, name: 'Rabies', dueDate: addDays(new Date(), -5), intervalMonths: 12 },
    { ownerId: user._id, catId: luna._id, name: 'FVRCP', dueDate: new Date(), intervalMonths: 12 },
    { ownerId: user._id, catId: luna._id, name: 'FeLV', dueDate: addDays(new Date(), 90), intervalMonths: 12 },
  ])

  console.log('Seeded: demo@catvac.app / password123')
  await mongoose.disconnect()
}

seed().catch(console.error)
