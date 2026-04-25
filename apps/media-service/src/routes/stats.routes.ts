import { Router } from 'express'
import { asyncHandler } from '@utils/asyncHandler.js'
import requireAdmin from '@middlewares/requireAdmin.middleware.js'
import authenticate from '@middlewares/authenticate.middleware.js'
import { getStorageUsedController } from '@controllers/stats/getStorageUsed.controller.js'
import { getFileCountController } from '@controllers/stats/getFileCount.controller.js'
import { listFilesController } from '@controllers/stats/listFiles.controller.js'

// for code readability
const a = asyncHandler

const router = Router()

router.get(
    '/stats/storage-used',
    authenticate,
    requireAdmin,
    a(getStorageUsedController),
)
router.get(
    '/stats/files/count',
    authenticate,
    requireAdmin,
    a(getFileCountController),
)
router.get('/stats/files', authenticate, requireAdmin, a(listFilesController))

export default router
