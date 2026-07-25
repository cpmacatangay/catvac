import * as deviceService from '../services/device.service.js'

export async function register(req, res, next) {
  try {
    const device = await deviceService.register(
      req.userId,
      req.body.token,
      req.body.platform,
      req.body.appVersion,
    )
    res.status(201).json({ device })
  } catch (err) {
    next(err)
  }
}

export async function unregister(req, res, next) {
  try {
    await deviceService.unregister(req.userId, req.params.token)
    res.json({ message: 'Device unregistered' })
  } catch (err) {
    next(err)
  }
}
