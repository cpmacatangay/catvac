import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { NotFoundError, UnauthorizedError, ConflictError } from '../lib/errors.js'

const BCRYPT_COST = 12

export async function signup(email, password) {
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    throw new ConflictError('Email already registered')
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST)
  const user = await User.create({ email: email.toLowerCase(), passwordHash })
  const token = generateToken(user)

  return { token, user: { id: user._id, email: user.email, prefs: user.prefs } }
}

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    throw new UnauthorizedError('Invalid credentials')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials')
  }

  const token = generateToken(user)

  return { token, user: { id: user._id, email: user.email, prefs: user.prefs } }
}

export async function getMe(userId) {
  const user = await User.findById(userId)
  if (!user) {
    throw new NotFoundError('User not found')
  }
  return { id: user._id, email: user.email, prefs: user.prefs }
}

function generateToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' },
  )
}
