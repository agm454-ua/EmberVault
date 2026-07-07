import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import type { TUserID } from '@customTypes/user.js'
import { deleteUser } from '@services/users.service.js'
import type { Response, Request } from 'express'

// The user is not actually deleted but the status is changed from 'active' to 'deleted'
export async function deleteUserController(req: Request, res: Response) {
    const userId = req.params.userId as TUserID

    if (!userId) {
        return sendBadRequestResponse(res, 'User ID not provided')
    }

    const deleted = await deleteUser(userId)

    if (!deleted) {
        return sendErrorResponse(res, 'Operation failed')
    }
    return sendSuccessResponse(res)
}
