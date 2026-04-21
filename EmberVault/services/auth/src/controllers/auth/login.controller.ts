import {
    validatePassword,
    generateToken,
    sendBadRequestResponse,
} from '@agm454-ua/auth-utils'
import type { TokenPayload } from '@agm454-ua/auth-utils'
import type { Request, Response, NextFunction } from 'express'
import { getUser, login } from '@services/users.service.js'
import { ENV } from '@config/env.js'
import {
    sendUnauthorizedResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import { sendRefreshTokenCookie } from '@utils/cookieHandler.js'
import type { TUserWithToken } from '@customTypes/user.js'
import type { TLoginRequest } from '@customTypes/auth.js'
import { validateMailFormat } from '@utils/validateEmailFormat.js'

export function validateLoginData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const loginRequest = req.body as TLoginRequest
    const errors: string[] = []

    if (!loginRequest.email && !loginRequest.username) {
        errors.push('Email or username is required')
    } else if (loginRequest.email && !validateMailFormat(loginRequest.email)) {
        errors.push('Email must be valid')
    }

    if (!loginRequest.password) {
        errors.push('Password is required')
    } else if (loginRequest.password.length < 8) {
        errors.push('Password must be at least 8 characters')
    }

    if (errors.length > 0) {
        return sendBadRequestResponse(res, errors)
    }

    next()
}

export async function loginController(req: Request, res: Response) {
    const loginRequest = req.body as TLoginRequest

    // Identify via username or email
    const identifier = loginRequest.username ?? loginRequest.email
    const user = await getUser(identifier!)

    if (!user) {
        return sendUnauthorizedResponse(res, 'User not found.')
    }

    // Check password in db
    const dbPassword = user.password
    const passwordsMatch = await validatePassword(
        loginRequest.password,
        dbPassword,
    )

    if (!passwordsMatch) {
        return sendUnauthorizedResponse(res, 'Wrong password.')
    }

    // Update last login time and ip
    const ip = req.ip || ''
    await login(identifier!, ip)

    const payload: TokenPayload = {
        userId: user.id,
        systemRole: user.system_role.id!,
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
            id: user.id,
            username: user.username,
            email: user.email,
            birthdate: user.birthdate,
            root_folder: user.root_folder,
            system_role: user.system_role,
            profile_picture_url: user.profile_picture_url,
            storage_limit_gb: user.storage_limit_gb,
            storage_used_gb: user.storage_used_gb,
            status: user.status,
        },
        token: jwt,
    }

    return sendSuccessResponse(res, responseData)
}
