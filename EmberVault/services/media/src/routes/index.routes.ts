import { requestLogger } from '@middlewares/requestLogger.middleware.js'
import { Router } from 'express'
import { asyncHandler } from '@utils/asyncHandler.js'
import authenticate from '@middlewares/authenticate.middleware.js'

// for code readability
const a = asyncHandler

const router = Router()

// Request Logger
router.use(requestLogger)

// Health route
router.get('/health', (_req, res) => {
    res.status(200).json({ message: 'ok' })
})

export default router
