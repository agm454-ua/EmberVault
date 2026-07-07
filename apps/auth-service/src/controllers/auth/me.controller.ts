import { getUserById } from '@services/users.service.js'
import {
    sendSuccessResponse,
    sendUnauthorizedResponse,
} from '@agm-22/auth-utils'
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
        birthdate: user.birthdate,
        root_folder: user.root_folder,
        system_role: user.system_role,
        profile_picture_url: user.profile_picture_url,
        storage_limit_gb: user.storage_limit_gb,
        storage_used_gb: user.storage_used_gb,
        status: user.status,
    }

    return sendSuccessResponse(res, responseData)
}
