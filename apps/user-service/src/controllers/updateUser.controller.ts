import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import type { TUpdateUserRequest, TUserID } from '@customTypes/user.js'
import { updateUser } from '@services/users.service.js'
import logger from '@utils/logger.js'
import type { Response, Request, NextFunction } from 'express'
import validateBirthDate from '@validators/birthDate.validator.js'
import validateMail from '@validators/mail.validator.js'
import validateUsername from '@validators/username.validator.js'
import { validateUserStatus } from '@validators/status.validator.js'

export function validateUpdateUserRequest(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { username, email, birthDate, status, storageLimitGB }: TUpdateUserRequest =
        req.body
    const errors: string[] = []

    // Run validators
    if (username !== undefined) {
        const usernameError = validateUsername(username)
        if (usernameError) errors.push(usernameError)
    }
    if (email !== undefined) {
        const emailError = validateMail(email)
        if (emailError) errors.push(emailError)
    }
    if (birthDate !== undefined) {
        const birthDateError = validateBirthDate(birthDate)
        if (birthDateError) errors.push(birthDateError)
    }
    if (status !== undefined) {
        const statusError = validateUserStatus(status)
        if (statusError) errors.push(statusError)
    }
    if (storageLimitGB !== undefined) {
        if (isNaN(storageLimitGB) || storageLimitGB < 0) {
            errors.push('Storage limit must be a non-negative number')
        }
    }

    if (errors.length > 0) {
        return sendBadRequestResponse(res, errors)
    }

    next()
}

export async function updateUserController(req: Request, res: Response) {
    const userUpdateRequest = req.body as TUpdateUserRequest
    const userId = req.params.userId as TUserID

    if (!userUpdateRequest) {
        return sendBadRequestResponse(res, 'Missing request body data')
    }
    if (!userId) {
        return sendBadRequestResponse(res, 'Missing User ID in request params')
    }


    // try/catch so the error message is clear
    try {
        const newUser = await updateUser(userId, userUpdateRequest)
        if (!newUser) {
            return sendBadRequestResponse(
                res,
                "Couldn't update user with given data",
            )
        }
        return sendSuccessResponse(res, newUser)
    } catch (error) {
        logger.error(error)
        return sendBadRequestResponse(
            res,
            "Couldn't update user with given data",
        )
    }
}
