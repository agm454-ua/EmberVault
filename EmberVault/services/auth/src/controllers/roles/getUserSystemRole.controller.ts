import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
    sendUnauthorizedResponse,
} from '@agm454-ua/auth-utils'
import { getAdminRole } from '@services/system_roles.service.js'
import { getUserRole } from '@services/users.service.js'
import type { Request, Response } from 'express'
import type { TUserID } from '@customTypes/user.js'

export async function getUserSystemRoleController(req: Request, res: Response) {
    const requesterUser = req.user
    const solicitedUserId = req.params.userId as TUserID

    if (!requesterUser) {
        return sendErrorResponse(res)
    }

    if (!solicitedUserId) {
        return sendBadRequestResponse(res, 'No user id provided')
    }

    // check if user is admin or is soliciting their own role
    const adminRole = await getAdminRole()

    if (!adminRole) {
        return sendErrorResponse(res)
    }

    if (
        requesterUser.userId !== solicitedUserId && // same user
        requesterUser.systemRole !== adminRole
    ) {
        // is admin
        return sendUnauthorizedResponse(res)
    }

    const role = await getUserRole(solicitedUserId)

    sendSuccessResponse(res, role)
}
