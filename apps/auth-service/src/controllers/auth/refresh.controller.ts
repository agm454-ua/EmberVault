import type { Request, Response } from 'express'
import { ENV } from '@config/env.js'
import type { Token, TokenPayload } from '@agm454-ua/auth-utils'
import { generateToken, validateToken } from '@agm454-ua/auth-utils'
import { getUserById } from '@services/users.service.js'
import {
    sendSuccessResponse,
    sendUnauthorizedResponse,
} from '@agm454-ua/auth-utils'
import type { TUserWithToken } from '@customTypes/user.js'
import { sendRefreshTokenCookie } from '@utils/cookieHandler.js'

export async function refreshController(req: Request, res: Response) {
    // get token
    const refreshToken: Token = req.cookies.refreshToken
    if (!refreshToken) {
        return sendUnauthorizedResponse(res, 'No token provided.')
    }

    // check if token is valid
    const refreshPayload = await validateToken(refreshToken, ENV.REFRESH_SECRET)
    if (!refreshPayload) {
        return sendUnauthorizedResponse(res, 'Invalid refresh token.')
    }

    // check if user exists before generating the new token
    const user = await getUserById(refreshPayload.userId)
    if (!user) {
        return sendUnauthorizedResponse(res, 'User not found.')
    }

    const payload: TokenPayload = {
        userId: user.id,
        systemRole: user.system_role.id,
    }

    // refresh the access token
    const jwt = generateToken(
        payload,
        ENV.JWT_SECRET,
        ENV.JWT_EXPIRATION_MINUTES,
    )

    // refresh the refresh token as well to implement sliding expiration
    const newRefreshToken = generateToken(
        payload,
        ENV.REFRESH_SECRET,
        ENV.REFRESH_TOKEN_EXPIRATION_MINUTES,
    )
    sendRefreshTokenCookie(req, res, newRefreshToken)

    const responseData: TUserWithToken = {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            system_role: user.system_role.name,
            root_folder: user.root_folder,
        },
        token: jwt,
    }

    return sendSuccessResponse(res, responseData)
}
