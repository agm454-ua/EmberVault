import { hashPassword, sendBadRequestResponse, sendSuccessResponse } from "@agm454-ua/auth-utils"
import type { TUpdateUserRequest, TUserID } from "@customTypes/user.js"
import { updateUser } from "@services/users.service.js"
import logger from "@utils/logger.js"
import type { Response, Request, NextFunction } from "express"
import validateBirthDate from "src/validators/birthDate.validator.js"
import validateMail from "src/validators/mail.validator.js"
import validatePassword from "src/validators/password.validator.js"
import validateUsername from "src/validators/username.validator.js"

export function validateUpdateUserRequest(req: Request, res: Response, next: NextFunction) {
    const {
        username,
        email,
        password,
        birthDate,
    }: TUpdateUserRequest = req.body
    const errors: string[] = []

    // Run validators
    if (username) {
        const usernameError = validateUsername(username)
        if (usernameError) errors.push(usernameError)
    }
    if (email) {
        const emailError = validateMail(email)
        if (emailError) errors.push(emailError)
    }
    if (password) {
        const passwordError = validatePassword(password)
        if (passwordError) errors.push(passwordError)
    }
    if (birthDate) {
        const birthDateError = validateBirthDate(birthDate)
        if (birthDateError) errors.push(birthDateError)
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
        return sendBadRequestResponse(res, "Missing request body data")
    }
    if (!userId) {
        return sendBadRequestResponse(res, "Missing User ID in request params")
    }

    // hash password
    if (userUpdateRequest.password) {
        userUpdateRequest.password = await hashPassword(userUpdateRequest.password)
    }

    // try/catch so the error message is clear
    try {
        const newUser = await updateUser(userId, userUpdateRequest)
        if (!newUser) {
            return sendBadRequestResponse(res, "Couldn't update user with given data")
        }
        return sendSuccessResponse(res, newUser)
    }
    catch (error) {
        logger.error(error)
        return sendBadRequestResponse(res, "Couldn't update user with given data")
    }
}