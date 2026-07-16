import { Router } from 'express'
import * as unsubscribeController from '../controllers/unsubscribe.controller.js'

export const unsubscribeRoutes = Router()

unsubscribeRoutes.get('/', unsubscribeController.unsubscribe)
