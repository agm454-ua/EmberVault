import { Router } from 'express'
import authRoutes from './auth.routes.js'
import healthRoutes from './health.routes.js'
import passwdRoutes from './passwd.routes.js'
import rolesRoutes from './roles.routes.js'
import { requestLogger } from '@middlewares/requestLogger.middleware.js'

const router = Router()

// Logger
router.use(requestLogger)

// Routes
router.use(authRoutes)
router.use(passwdRoutes)
router.use(rolesRoutes)
router.use(healthRoutes)

export default router
