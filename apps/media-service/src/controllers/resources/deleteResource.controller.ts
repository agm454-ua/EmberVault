import {
    sendBadRequestResponse,
    sendNotFoundResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import type { TResourceID } from '@customTypes/resource.js'
import { deleteResource } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function deleteResourceController(req: Request, res: Response) {
    const resourceId = req.params.resourceId as TResourceID

    if (!resourceId) {
        return sendBadRequestResponse(res, 'Missing Resource ID')
    }

    const deleted = await deleteResource(resourceId)

    if (!deleted) {
        return sendNotFoundResponse(
            res,
            'Resource not found or could not be deleted',
        )
    }

    return sendSuccessResponse(res, 'Resource deleted successfully')
}
