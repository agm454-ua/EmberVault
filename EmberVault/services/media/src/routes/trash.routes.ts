import { listTrashController } from '@controllers/trash/listTrash.controller.js'
import { restoreAllController } from '@controllers/trash/restoreAll.controller.js'
import { restoreResourceController } from '@controllers/trash/restoreResource.controller.js'
import { sendResourceToTrashController } from '@controllers/trash/sendResourceToTrash.controller.js'
import authenticate from '@middlewares/authenticate.middleware.js'
import requireAdminOrSelf from '@middlewares/requireAdminOrSelf.middleware.js'
import { asyncHandler } from '@utils/asyncHandler.js'
import { Router } from 'express'

// for code readability
const a = asyncHandler

const router = Router()

router.get(
    '/users/:userId/trash',
    authenticate,
    requireAdminOrSelf,
    a(listTrashController),
)
router.delete(
    '/users/:userId/trash',
    authenticate,
    requireAdminOrSelf,
    a(restoreAllController),
)
router.post(
    '/users/:userId/resources/:resourceId/trash',
    authenticate,
    requireAdminOrSelf,
    a(sendResourceToTrashController),
)
router.post(
    '/users/:userId/resources/:resourceId/restore',
    authenticate,
    requireAdminOrSelf,
    a(restoreResourceController),
)

export default router
