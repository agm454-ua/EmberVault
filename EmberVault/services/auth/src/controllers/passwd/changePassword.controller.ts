import {
    hashPassword,
    sendUnauthorizedResponse,
    validatePassword,
} from '@agm454-ua/auth-utils'
import { getUserById, updatePassword } from '@services/users.service.js'
import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import type { NextFunction, Request, Response } from 'express'
import type { TChangePasswordRequest } from '@customTypes/passwd.js'
import {
    validatePasswordFormat,
    type TPasswordValidationResult,
} from '@utils/validatePasswordFormat.js'

export async function validateChangePasswordData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const {
        oldPassword,
        newPassword,
        confirmNewPassword,
    }: TChangePasswordRequest = req.body
    const errors: string[] = []

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        errors.push('All fields required')
    }

    if (errors.length > 0) {
        return sendBadRequestResponse(res, errors)
    }

    if (newPassword !== confirmNewPassword) {
        errors.push('New passwords must match')
    }

    const { valid, formatErrors }: TPasswordValidationResult =
        validatePasswordFormat(newPassword)
    if (!valid && formatErrors) {
        for (const error of formatErrors) {
            errors.push(error)
        }
    }

    if (errors.length > 0) {
        return sendBadRequestResponse(res, errors)
    }

    // get user from the validateRequest middleware
    const user = req.user!.userId
    const userDB = await getUserById(user)

    if (!userDB) {
        return sendUnauthorizedResponse(res)
    }

    // check if the old password is correct
    const passwordsMatch = await validatePassword(oldPassword, userDB.password)
    if (!passwordsMatch) {
        return sendBadRequestResponse(res, 'Incorrect password')
    }

    next()
}

export async function changePasswordController(req: Request, res: Response) {
    const user = req.user!.userId
    const { newPassword }: Partial<TChangePasswordRequest> = req.body

    const newPasswordHash = await hashPassword(newPassword!)

    await updatePassword(user, newPasswordHash)

    sendSuccessResponse(res)
}
