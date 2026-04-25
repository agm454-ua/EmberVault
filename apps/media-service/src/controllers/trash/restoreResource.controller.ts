import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import { restoreResource } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function restoreResourceController(req: Request, res: Response) {
    const resourceId = req.params.resourceId as string

    if (!resourceId) {
        return sendBadRequestResponse(res, 'Missing resource ID')
    }

    const restored = await restoreResource(resourceId)

    if (!restored) {
        return sendBadRequestResponse(res, 'Failed to restore resource')
    }

    return sendSuccessResponse(res)
}
