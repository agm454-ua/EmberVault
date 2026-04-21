import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import type { TResourceID } from '@customTypes/resource.js'
import { listResourcePermissions } from '@services/resource_roles.service.js'
import type { Request, Response } from 'express'

export async function listResourcePermissionsController(
    req: Request,
    res: Response,
) {
    const resource = req.params.resourceId as TResourceID

    if (!resource) {
        return sendBadRequestResponse(res, 'Missing resource ID')
    }

    const data = await listResourcePermissions(resource)
    return sendSuccessResponse(res, data)
}
