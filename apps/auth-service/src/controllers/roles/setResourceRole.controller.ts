import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import { assignUserRoleToResource } from '@services/resource_roles.service.js'
import type { Request, Response } from 'express'
import type { TResourceID } from '@customTypes/resource.js'
import type { TUserID } from '@customTypes/user.js'

export async function setResourceRoleController(req: Request, res: Response) {
    const user = req.params.userId as TUserID
    const resource = req.params.resourceId as TResourceID
    const { role } = req.body

    if (!user || !resource || !role) {
        return sendBadRequestResponse(res, 'Missing fields')
    }

    const operationSuccessful = await assignUserRoleToResource(
        user,
        resource,
        role,
    )

    if (!operationSuccessful) {
        return sendErrorResponse(res)
    }

    return sendSuccessResponse(res)
}
