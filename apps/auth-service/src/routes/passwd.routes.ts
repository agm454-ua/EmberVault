import {
    changePasswordController,
    validateChangePasswordData,
} from '@controllers/passwd/changePassword.controller.js'
import {
    forgotPasswordController,
    validateForgotPasswordData,
} from '@controllers/passwd/forgotPassword.controller.js'
import {
    resetPasswordController,
    validateResetPasswordData,
} from '@controllers/passwd/resetPassword.controller.js'
import authenticate from '@middlewares/authenticate.middleware.js'
import { asyncHandler } from '@utils/asyncHandler.js'
import { Router } from 'express'

const router = Router()

/*
    POST    /auth/change-password (old and new password)
    POST    /auth/forgot-password (email)
    POST    /auth/reset-password (new password)
*/

router.post(
    '/change-password',
    authenticate,
    asyncHandler(validateChangePasswordData),
    asyncHandler(changePasswordController),
)
router.post(
    '/forgot-password',
    asyncHandler(validateForgotPasswordData),
    asyncHandler(forgotPasswordController),
)
router.post(
    '/reset-password',
    asyncHandler(validateResetPasswordData),
    asyncHandler(resetPasswordController),
)

export default router
