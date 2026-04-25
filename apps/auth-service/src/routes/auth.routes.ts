import { Router } from 'express'
import authenticate from '@middlewares/authenticate.middleware.js'
import {
    validateLoginData,
    loginController,
} from '@controllers/auth/login.controller.js'
import { logoutController } from '@controllers/auth/logout.controller.js'
import { refreshController } from '@controllers/auth/refresh.controller.js'
import {
    registerController,
    validateRegisterData,
} from '@controllers/auth/register.controller.js'
import { meController } from '@controllers/auth/me.controller.js'
import { asyncHandler } from '@utils/asyncHandler.js'

const router = Router()

/*
    POST    /auth/login
    POST    /auth/logout
    POST    /auth/refresh
    POST    /auth/register

    GET     /auth/me (returns id, username and email)
*/

router.post('/login', validateLoginData, asyncHandler(loginController))
router.post('/logout', authenticate, logoutController)
router.post('/refresh', asyncHandler(refreshController))
router.post('/register', validateRegisterData, asyncHandler(registerController))
router.get('/me', authenticate, asyncHandler(meController))

export default router
