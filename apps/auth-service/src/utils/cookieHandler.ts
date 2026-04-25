import { ENV } from '@config/env.js'
import type { Request, Response } from 'express'

function getCookieSecurity(): { sameSite: 'lax' | 'none'; secure: boolean } {
    if (ENV.COOKIE_SAME_SITE === 'none') {
        return { sameSite: 'none', secure: true }
    }
    return { sameSite: 'lax', secure: ENV.NODE_ENV === 'production' }
}

const cookieSecurity = getCookieSecurity()

export const sendRefreshTokenCookie = (
    req: Request,
    res: Response,
    token: string,
): Response => {
    return res.cookie('refreshToken', token, {
        httpOnly: true,
        ...cookieSecurity,
        maxAge: ENV.REFRESH_TOKEN_EXPIRATION_MINUTES * 60 * 1000,
        path: '/auth/api/refresh',
    })
}

export const clearRefreshTokenCookie = (req: Request, res: Response): Response => {
    return res.clearCookie('refreshToken', {
        httpOnly: true,
        ...cookieSecurity,
        path: '/auth/api/refresh',
    })
}