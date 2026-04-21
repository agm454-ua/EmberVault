import type { NextFunction, Request, Response } from 'express'
import {
    hashPassword,
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import { validateMailFormat } from '@utils/validateEmailFormat.js'
import { generateToken, type TokenPayload } from '@agm454-ua/auth-utils'
import { ENV } from '@config/env.js'
import { createUser } from '@services/users.service.js'

import type { TRegisterRequest } from '@customTypes/auth.js'
import { sendRefreshTokenCookie } from '@utils/cookieHandler.js'
import type { TUserWithToken } from '@customTypes/user.js'
import {
    validatePasswordFormat,
    type TPasswordValidationResult,
} from '@utils/validatePasswordFormat.js'

const validationRules = {
    username: {
        minLength: 3,
        maxLength: 30,
    },
    birthDate: {
        minAge: 13,
    },
}

function validateEmail(email?: string): string | null {
    if (!email) return 'Email is required'

    if (!validateMailFormat(email)) {
        return 'Invalid mail format'
    }

    return null
}

function validateUsername(username?: string): string | null {
    if (!username) return 'Username is required'

    if (username.length < validationRules.username.minLength) {
        return `Username must be at least ${validationRules.username.minLength} characters`
    }

    if (username.length > validationRules.username.maxLength) {
        return `Username must be at most ${validationRules.username.maxLength} characters`
    }

    return null
}

function validateBirthDate(birthDate?: string): string | null {
    if (!birthDate) return 'Birth date is required'

    const date = new Date(birthDate)
    if (isNaN(date.getTime())) return 'Birth date is invalid'

    const now = new Date()
    if (date >= now) return 'Birth date must be in the past'

    const age =
        now.getFullYear() -
        date.getFullYear() -
        (now.getMonth() < date.getMonth() ||
            (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
            ? 1
            : 0)

    if (age < validationRules.birthDate.minAge) {
        return `You must be at least ${validationRules.birthDate.minAge} years old`
    }

    return null
}

function validatePassword(
    password?: string,
    confirmPassword?: string,
): string | null {
    if (!password) return 'Password is required'

    if (password !== confirmPassword) {
        return 'Passwords do not match'
    }

    const { valid, formatErrors }: TPasswordValidationResult =
        validatePasswordFormat(password)
    if (!valid && formatErrors?.length) {
        return formatErrors[0] ?? null
    }

    return null
}

export function validateRegisterData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const {
        username,
        email,
        password,
        birthDate,
        confirmPassword,
    }: TRegisterRequest = req.body
    const errors: string[] = []

    // Run validators
    const usernameError = validateUsername(username)
    if (usernameError) errors.push(usernameError)

    const emailError = validateEmail(email)
    if (emailError) errors.push(emailError)

    const birthDateError = validateBirthDate(birthDate)
    if (birthDateError) errors.push(birthDateError)

    const passwordError = validatePassword(password, confirmPassword)
    if (passwordError) errors.push(passwordError)

    if (errors.length > 0) {
        return sendBadRequestResponse(res, errors)
    }

    next()
}

// TODO - send profile picture to media service once created
export async function registerController(req: Request, res: Response) {
    const {
        username,
        email,
        password,
        birthDate,
        confirmPassword,
    }: TRegisterRequest = req.body

    const hashedPassword = await hashPassword(password)

    const userData: TRegisterRequest = {
        username: username,
        email: email,
        password: hashedPassword,
        birthDate: birthDate,
        confirmPassword: confirmPassword, // useless
    }
    const newUser = await createUser(userData)

    if (!newUser) {
        return sendBadRequestResponse(res, 'User could not be created.')
    }

    const payload: TokenPayload = {
        userId: newUser.id,
        systemRole: newUser.system_role.id!,
    }

    // Generate access and refresh tokens
    const refreshToken = generateToken(
        payload,
        ENV.REFRESH_SECRET,
        ENV.REFRESH_TOKEN_EXPIRATION_MINUTES,
    )
    sendRefreshTokenCookie(req, res, refreshToken)

    const jwt = generateToken(
        payload,
        ENV.JWT_SECRET,
        ENV.JWT_EXPIRATION_MINUTES,
    )

    const responseData: TUserWithToken = {
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            birthdate: newUser.birthdate,
            root_folder: newUser.root_folder,
            system_role: newUser.system_role,
            profile_picture_url: newUser.profile_picture_url,
            storage_limit_gb: newUser.storage_limit_gb,
            storage_used_gb: newUser.storage_used_gb,
            status: newUser.status,
        },
        token: jwt,
    }

    return sendSuccessResponse(res, responseData)
}
