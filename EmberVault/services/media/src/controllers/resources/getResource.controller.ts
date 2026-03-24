import {
    sendBadRequestResponse,
    sendNotFoundResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import { getResourceById } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function getResourceController(req: Request, res: Response) {
    const userId = req.params.userId as string
    const resourceId = req.params.resourceId as string

    if (!userId || !resourceId) {
        return sendBadRequestResponse(res, 'Missing userId or resourceId')
    }

    const resource = await getResourceById(resourceId)

    if (!resource) {
        return sendNotFoundResponse(res, 'Resource not found')
    }

    return sendSuccessResponse(res, resource)
}
