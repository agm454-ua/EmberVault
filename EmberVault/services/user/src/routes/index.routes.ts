import { createUserController, validateCreateUserRequest } from '@controllers/createUser.controller.js'
import { deleteUserController } from '@controllers/deleteUser.controller.js'
import { getUserController } from '@controllers/getUser.controller.js'
import { getUserCountController } from '@controllers/getUserCount.controller.js'
import { getUsersAddedLastWeekController } from '@controllers/getUsersAddedLastWeek.controller.js'
import { listUsersController } from '@controllers/listUsers.controller.js'
import { updateUserController, validateUpdateUserRequest } from '@controllers/updateUser.controller.js'
import authenticate from '@middlewares/authenticate.middleware.js'
import { requestLogger } from '@middlewares/requestLogger.middleware.js'
import requireAdmin from '@middlewares/requireAdmin.middleware.js'
import requireAdminOrSelf from '@middlewares/requireAdminOrSelf.middleware.js'
import { Router } from 'express'

const router = Router()

/*
    GET     /users/count
    GET     /users/all
    GET     /users/added-last-week
    POST    /users
    GET     /users/:userId
    PUT     /users/:userId
    DELETE  /users/:userId
*/

// Request Logger
router.use(requestLogger)

router.get('users/count', authenticate, requireAdmin, getUserCountController)
router.get('users/all', authenticate, requireAdmin, listUsersController)
router.get('users/added-last-week', authenticate, requireAdmin, getUsersAddedLastWeekController)
router.post('users', authenticate, requireAdmin, validateCreateUserRequest,createUserController)
router.get('users/:userId', authenticate, getUserController)
router.put('users/:userId', authenticate, requireAdminOrSelf, validateUpdateUserRequest, updateUserController)
router.delete('users/:userId', authenticate, requireAdminOrSelf, deleteUserController)

export default router
