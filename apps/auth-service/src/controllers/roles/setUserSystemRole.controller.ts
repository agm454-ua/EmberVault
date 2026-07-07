import { sendErrorResponse, sendSuccessResponse } from '@agm-22/auth-utils'
import { updateUserSystemRole } from '@services/users.service.js'
import type { Request, Response } from 'express'
import type { TSystemRoleID } from '@customTypes/roles.js'
import type { TUserID } from '@customTypes/user.js'

export async function setUserSystemRoleController(req: Request, res: Response) {
    const solicitedUserId = req.params.userId as TUserID
    const solicitedRole = req.params.role as TSystemRoleID

    const updatedUser = await updateUserSystemRole(
        solicitedUserId,
        solicitedRole,
    )
    if (!updatedUser) {
        return sendErrorResponse(res)
    }

    sendSuccessResponse(res, `User role updated to: ${solicitedRole}`)
}
