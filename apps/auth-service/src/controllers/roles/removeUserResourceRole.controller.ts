import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import { deleteUserRoleFromResource } from '@services/resource_roles.service.js'
import type { Request, Response } from 'express'
import type { TResourceID } from '@customTypes/resource.js'
import type { TUserID } from '@customTypes/user.js'

export async function removeUserRoleFromResource(req: Request, res: Response) {
    const user = req.params.userId as TUserID
    const resource = req.params.resourceId as TResourceID

    if (!user || !resource) {
        return sendBadRequestResponse(res, 'Missing fields')
    }

    const operationSuccessful = await deleteUserRoleFromResource(user, resource)
    if (!operationSuccessful) {
        return sendErrorResponse(res)
    }

    return sendSuccessResponse(res)
}
