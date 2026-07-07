import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import { uploadUserAvatar } from '@services/users.service.js'
import type { Request, Response } from 'express'

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024

export async function uploadUserAvatarController(
    req: Request,
    res: Response,
) {
    const userId = req.params.userId

    if (!userId || Array.isArray(userId)) {
        return sendBadRequestResponse(res, 'Missing userId')
    }

    const file = req.file

    if (!file) {
        return sendBadRequestResponse(res, 'Missing avatar file')
    }

    if (!file.mimetype.startsWith('image/')) {
        return sendBadRequestResponse(res, 'Avatar must be an image')
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
        return sendBadRequestResponse(res, 'Avatar file is too large (max 5MB)')
    }

    const avatarUrl = await uploadUserAvatar(userId, file)

    if (!avatarUrl) {
        return sendErrorResponse(res, 'Failed to upload avatar', 400)
    }

    return sendSuccessResponse(res, {
        avatarURL: avatarUrl,
    })

}