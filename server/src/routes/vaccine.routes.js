import { Router } from 'express'
import * as vaccineController from '../controllers/vaccine.controller.js'
import { validate, validateParams } from '../middleware/validate.middleware.js'
import {
  createVaccineSchema,
  updateVaccineSchema,
  administerSchema,
  snoozeSchema,
} from '../schemas/vaccine.schema.js'
import { vaccineIdParam, vaccinesByCatParam } from '../schemas/params.schema.js'

export const vaccineRoutes = Router()

vaccineRoutes.get('/cat/:catId', validateParams(vaccinesByCatParam), vaccineController.listByCat)
vaccineRoutes.post('/', validate(createVaccineSchema), vaccineController.create)
vaccineRoutes.patch('/:id', validateParams(vaccineIdParam), validate(updateVaccineSchema), vaccineController.update)
vaccineRoutes.patch('/:id/administer', validateParams(vaccineIdParam), validate(administerSchema), vaccineController.administer)
vaccineRoutes.patch('/:id/snooze', validateParams(vaccineIdParam), validate(snoozeSchema), vaccineController.snooze)
vaccineRoutes.delete('/:id', validateParams(vaccineIdParam), vaccineController.remove)
