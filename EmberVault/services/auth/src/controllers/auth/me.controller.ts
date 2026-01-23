import { getUserById } from '@services/users.service.js'
import {
    sendSuccessResponse,
    sendUnauthorizedResponse,
} from '@agm454-ua/auth-utils'
import type { Request, Response } from 'express'
import type { TUser } from '@customTypes/user.js'

export async function meController(req: Request, res: Response) {
    const userId = req.userId

    if (!userId) {
        return sendUnauthorizedResponse(res, 'User not authenticated.')
    }

    const user = await getUserById(userId)

    if (!user) {
        return sendUnauthorizedResponse(res, 'User not found.')
    }

    const responseData: TUser = {
        id: user.id,
        username: user.username,
        email: user.email,
    }

    return sendSuccessResponse(res, responseData)
}
