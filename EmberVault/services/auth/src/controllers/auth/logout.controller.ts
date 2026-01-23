import type { Request, Response } from 'express'
import { sendSuccessResponse } from '@agm454-ua/auth-utils'
import { clearRefreshTokenCookie } from '@utils/cookieHandler.js'

export function logoutController(req: Request, res: Response) {
    clearRefreshTokenCookie(res)

    return sendSuccessResponse(res)
}
