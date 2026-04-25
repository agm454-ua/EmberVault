import { sendBadRequestResponse, sendSuccessResponse } from '@agm454-ua/auth-utils'
import { deleteUserAvatar } from '@services/users.service.js'
import type { Request, Response } from 'express'


export async function deleteUserAvatarController(
    req: Request,
    res: Response,
) {
    const userId = req.params.userId

    if (!userId || Array.isArray(userId)) {
        return sendBadRequestResponse(res, 'Missing userId')
    }

    const deleted = await deleteUserAvatar(userId)

    if (!deleted) {
        return sendBadRequestResponse(res, 'Failed to delete avatar', 400)
    }

    return sendSuccessResponse(res, 'Avatar deleted successfully')
}