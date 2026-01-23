import { getUserResourceRoleController } from '@controllers/roles/getUserResourceRole.controller.js'
import { getUserSystemRoleController } from '@controllers/roles/getUserSystemRole.controller.js'
import { listResourcePermissionsController } from '@controllers/roles/listResourcePermissions.controller.js'
import { listSystemRolesController } from '@controllers/roles/listSystemRoles.controller.js'
import { setUserSystemRoleController } from '@controllers/roles/setUserSystemRole.controller.js'
import requireAdmin from '@middlewares/requireAdmin.middleware.js'
import requireResourceOwnership from '@middlewares/requireResourceOwnership.middleware.js'
import authenticate from '@middlewares/authenticate.middleware.js'
import { Router } from 'express'
import { setResourceRoleController } from '@controllers/roles/setResourceRole.controller.js'
import { removeUserRoleFromResource } from '@controllers/roles/removeUserResourceRole.controller.js'
import { asyncHandler } from '@utils/asyncHandler.js'

const router = Router()

/*
    GET     /auth/users/roles
    GET     /auth/users/:userId/roles
    POST    /auth/users/:userId/roles/:role

    GET     /auth/resource/:resourceId/roles
    GET     /auth/resource/:resourceId/roles/:userId
    POST    /auth/resource/:resourceId/roles/:userId (role)
    DELETE  /auth/resource/:resourceId/roles/:userId
*/

router.get(
    '/users/roles',
    authenticate,
    requireAdmin,
    asyncHandler(listSystemRolesController),
)
router.get(
    '/users/:userId/roles',
    authenticate,
    asyncHandler(getUserSystemRoleController),
)
router.post(
    '/users/:userId/roles/:role',
    authenticate,
    requireAdmin,
    asyncHandler(setUserSystemRoleController),
)

router.get(
    '/resource/:resourceId/roles',
    authenticate,
    asyncHandler(requireResourceOwnership),
    asyncHandler(listResourcePermissionsController),
)
router.get(
    '/resource/:resourceId/roles/:userId',
    authenticate,
    asyncHandler(getUserResourceRoleController),
)
router.post(
    '/resource/:resourceId/roles/:userId',
    authenticate,
    asyncHandler(requireResourceOwnership),
    asyncHandler(setResourceRoleController),
)
router.delete(
    '/resource/:resourceId/roles/:userId',
    authenticate,
    asyncHandler(requireResourceOwnership),
    asyncHandler(removeUserRoleFromResource),
)

export default router
