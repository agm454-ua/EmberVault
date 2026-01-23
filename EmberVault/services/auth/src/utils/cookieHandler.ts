import { ENV } from '@config/env.js'
import type { Response } from 'express'

// It is set to sameSite: 'lax' and secure:false as it will run on localhost over http

// Cookie with access token
export const sendRefreshTokenCookie = (
    res: Response,
    token: string,
): Response => {
    return res.cookie('refreshToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: ENV.REFRESH_TOKEN_EXPIRATION_MINUTES * 60 * 1000,
        path: '/',
    })
}

// Clear cookie with refresh token
export const clearRefreshTokenCookie = (res: Response): Response => {
    return res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
    })
}
