import { Router } from 'express'
import * as deviceController from '../controllers/device.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { registerDeviceSchema } from '../schemas/device.schema.js'

export const deviceRoutes = Router()

deviceRoutes.post('/', validate(registerDeviceSchema), deviceController.register)
deviceRoutes.delete('/:token', deviceController.unregister)
