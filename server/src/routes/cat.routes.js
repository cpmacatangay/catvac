import { Router } from 'express'
import * as catController from '../controllers/cat.controller.js'
import { validate, validateParams } from '../middleware/validate.middleware.js'
import { createCatSchema, updateCatSchema } from '../schemas/cat.schema.js'
import { catIdParam } from '../schemas/params.schema.js'

export const catRoutes = Router()

catRoutes.get('/', catController.list)
catRoutes.get('/:id', validateParams(catIdParam), catController.getById)
catRoutes.post('/', validate(createCatSchema), catController.create)
catRoutes.patch('/:id', validateParams(catIdParam), validate(updateCatSchema), catController.update)
catRoutes.delete('/:id', validateParams(catIdParam), catController.remove)
