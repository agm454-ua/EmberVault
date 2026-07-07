import {
    hashPassword,
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import { getUserById, updatePassword } from '@services/users.service.js'
import { validateTOTP } from '@utils/totp.js'
import {
    validatePasswordFormat,
    type TPasswordValidationResult,
} from '@utils/validatePasswordFormat.js'
import type { NextFunction, Request, Response } from 'express'

export async function validateResetPasswordData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { code, id, password } = req.body

    if (!code || !id || !password) {
        return sendBadRequestResponse(res, 'Bad Request')
    }

    const user = await getUserById(id)

    if (!user) {
        return sendBadRequestResponse(res, 'Invalid user')
    }

    if (!validateTOTP(id, code)) {
        return sendBadRequestResponse(res, 'Invalid code')
    }

    const errors: string[] = []
    const { valid, formatErrors }: TPasswordValidationResult =
        validatePasswordFormat(password)
    if (!valid && formatErrors) {
        for (const error of formatErrors) {
            errors.push(error)
        }
        return sendBadRequestResponse(res, errors)
    }

    next()
}

export async function resetPasswordController(req: Request, res: Response) {
    const { id, password } = req.body

    const hashedPassword = await hashPassword(password)
    const userWithNewPassword = await updatePassword(id, hashedPassword)

    if (!userWithNewPassword) {
        return sendErrorResponse(res)
    }

    return sendSuccessResponse(res)
}
