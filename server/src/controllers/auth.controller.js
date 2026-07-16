import * as authService from '../services/auth.service.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

export async function signup(req, res, next) {
  try {
    const { token, user } = await authService.signup(req.body.email, req.body.password)
    req.log.info({ userId: user.id, email: user.email }, 'signup success')
    res.cookie('token', token, COOKIE_OPTIONS)
    res.status(201).json({ user })
  } catch (err) {
    req.log.warn({ email: req.body.email, error: err.message }, 'signup failed')
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { token, user } = await authService.login(req.body.email, req.body.password)
    req.log.info({ userId: user.id, email: user.email }, 'login success')
    res.cookie('token', token, COOKIE_OPTIONS)
    res.json({ user })
  } catch (err) {
    req.log.warn({ email: req.body.email, error: err.message }, 'login failed')
    next(err)
  }
}

export async function logout(req, res) {
  res.clearCookie('token', { path: '/' })
  res.json({ message: 'Logged out' })
}

export async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.userId)
    res.json({ user })
  } catch (err) {
    next(err)
  }
}
