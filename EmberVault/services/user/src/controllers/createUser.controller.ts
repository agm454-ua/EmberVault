import {
    hashPassword,
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import type { TCreateUserRequest } from '@customTypes/user.js'
import { createUser } from '@services/users.service.js'
import type { Response, Request, NextFunction } from 'express'
import validateBirthDate from '@validators/birthDate.validator.js'
import validateMail from '@validators/mail.validator.js'
import validatePassword from '@validators/password.validator.js'
import validateUsername from '@validators/username.validator.js'

export function validateCreateUserRequest(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { username, email, password, birthDate }: TCreateUserRequest =
        req.body
    const errors: string[] = []

    // Run validators
    const usernameError = validateUsername(username)
    if (usernameError) errors.push(usernameError)

    const emailError = validateMail(email)
    if (emailError) errors.push(emailError)

    const birthDateError = validateBirthDate(birthDate)
    if (birthDateError) errors.push(birthDateError)

    const passwordError = validatePassword(password)
    if (passwordError) errors.push(passwordError)

    if (errors.length > 0) {
        return sendBadRequestResponse(res, errors)
    }

    next()
}

export async function createUserController(req: Request, res: Response) {
    const createUserData = req.body as TCreateUserRequest
    createUserData.password = await hashPassword(createUserData.password)

    const user = await createUser(createUserData)

    if (!user) {
        return sendErrorResponse(res)
    }

    return sendSuccessResponse(res, { user })
}
