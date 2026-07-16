import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller.js'

export const dashboardRoutes = Router()

dashboardRoutes.get('/', dashboardController.getDashboard)
