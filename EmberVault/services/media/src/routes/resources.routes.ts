import {
    DOWNLOAD_PERMISSION,
    READ_PERMISSION,
    WRITE_PERMISSION,
} from '@constants/permissions.js'
import { completeUploadController } from '@controllers/resources/completeUpload.controller.js'
import { copyResourceController } from '@controllers/resources/copyResource.controller.js'
import {
    createResourceController,
    validateCreateResourceRequest,
} from '@controllers/resources/createResource.controller.js'
import { deleteResourceController } from '@controllers/resources/deleteResource.controller.js'
import { downloadResourceController } from '@controllers/resources/downloadResource.controller.js'
import { getResourceController } from '@controllers/resources/getResource.controller.js'
import { getThumbnailController } from '@controllers/resources/getThumbnail.controller.js'
import { listFolderResourcesController } from '@controllers/resources/listFolderResources.controller.js'
import { searchResourceController } from '@controllers/resources/searchResource.controller.js'
import {
    updateResourceController,
    validateUpdateResourceRequest,
} from '@controllers/resources/updateResource.controller.js'
import authenticate from '@middlewares/authenticate.middleware.js'
import requireResourceOwnership from '@middlewares/requireResourceOwnership.middleware.js'
import { requireResourcePermission } from '@middlewares/requireResourcePermission.middleware.js'
import { asyncHandler } from '@utils/asyncHandler.js'
import { Router } from 'express'

// for code readability
const a = asyncHandler

const router = Router()

router.get(
    '/users/:userId/resources/:resourceId',
    authenticate,
    requireResourcePermission(READ_PERMISSION),
    a(getResourceController),
)
router.put(
    '/users/:userId/resources/:resourceId',
    authenticate,
    requireResourcePermission(WRITE_PERMISSION),
    a(validateUpdateResourceRequest),
    a(updateResourceController),
)
router.delete(
    '/users/:userId/resources/:resourceId',
    authenticate,
    requireResourceOwnership,
    a(deleteResourceController),
)

router.get(
    '/users/:userId/resources',
    authenticate,
    a(searchResourceController),
)
router.post(
    '/users/:userId/resources',
    authenticate,
    a(validateCreateResourceRequest),
    a(createResourceController),
)

router.post(
    '/users/:userId/resources/:resourceId/upload-complete',
    authenticate,
    requireResourceOwnership,
    a(completeUploadController),
)

router.post(
    '/users/:userId/resources/:resourceId/copy',
    authenticate,
    requireResourcePermission(WRITE_PERMISSION),
    a(copyResourceController),
)

router.get(
    '/users/:userId/resources/:resourceId/thumbnail',
    authenticate,
    requireResourcePermission(READ_PERMISSION),
    a(getThumbnailController),
)

router.get(
    '/users/:userId/resources/:resourceId/download',
    authenticate,
    requireResourcePermission(DOWNLOAD_PERMISSION),
    a(downloadResourceController),
)

router.get(
    '/users/:userId/resources/:resourceId/resources',
    authenticate,
    requireResourcePermission(READ_PERMISSION),
    a(listFolderResourcesController),
)

export default router
