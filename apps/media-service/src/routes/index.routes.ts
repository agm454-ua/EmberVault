import { requestLogger } from '@middlewares/requestLogger.middleware.js'
import { Router } from 'express'
import statsRoutes from './stats.routes.js'
import resourceRoutes from './resources.routes.js'
import trashRoutes from './trash.routes.js'

const router = Router()

// Request Logger
router.use(requestLogger)

// Health route
router.get('/health', (_req, res) => {
    res.status(200).json({ message: 'ok' })
})

// Routes
router.use(statsRoutes)
router.use(resourceRoutes)
router.use(trashRoutes)

export default router
