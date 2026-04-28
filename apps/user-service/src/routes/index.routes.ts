import {
    createUserController,
    validateCreateUserRequest,
} from '@controllers/createUser.controller.js'
import { deleteUserController } from '@controllers/deleteUser.controller.js'
import { getUserController } from '@controllers/getUser.controller.js'
import { getUserCountController } from '@controllers/getUserCount.controller.js'
import { getUsersAddedLastWeekController } from '@controllers/getUsersAddedLastWeek.controller.js'
import { listUsersController } from '@controllers/listUsers.controller.js'
import {
    updateUserController,
    validateUpdateUserRequest,
} from '@controllers/updateUser.controller.js'
import { requestLogger } from '@middlewares/requestLogger.middleware.js'
import requireAdmin from '@middlewares/requireAdmin.middleware.js'
import requireAdminOrSelf from '@middlewares/requireAdminOrSelf.middleware.js'
import { Router } from 'express'
import { asyncHandler } from '@utils/asyncHandler.js'
import authenticate from '@middlewares/authenticate.middleware.js'
import { searchUsersController } from '@controllers/searchUsers.controller.js'

// for code readability
const a = asyncHandler

const router = Router()

// Request Logger
router.use(requestLogger)

// Health route
router.get('/health', (_req, res) => {
    res.status(200).json({ message: 'ok' })
})

/*
    GET     /users/count
    GET     /users/all
    GET     /users/added-last-week
    POST    /users
    GET     /users/:userId
    PUT     /users/:userId
    DELETE  /users/:userId
*/

router.get(
    '/users/count',
    a(authenticate),
    a(requireAdmin),
    a(getUserCountController),
)
router.get(
    '/users/all',
    a(authenticate),
    a(requireAdmin),
    a(listUsersController),
)
router.get(
    '/users/added-last-week',
    a(authenticate),
    a(requireAdmin),
    a(getUsersAddedLastWeekController),
)
router.post(
    '/users',
    a(authenticate),
    a(requireAdmin),
    validateCreateUserRequest,
    a(createUserController),
)
router.get(
    '/users/search',
    a(authenticate),
    a(searchUsersController)
)
router.get('/users/:userId', a(authenticate), getUserController)
router.put(
    '/users/:userId',
    a(authenticate),
    a(requireAdminOrSelf),
    validateUpdateUserRequest,
    a(updateUserController),
)
router.delete(
    '/users/:userId',
    a(authenticate),
    a(requireAdminOrSelf),
    a(deleteUserController),
)

export default router
