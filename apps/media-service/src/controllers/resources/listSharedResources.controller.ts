import { sendBadRequestResponse, sendSuccessResponse } from '@agm-22/auth-utils'
import { listSharedResources } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function listSharedResourcesController(
    req: Request,
    res: Response,
) {
    const userId = req.params.userId as string

    if (!userId) {
        return sendBadRequestResponse(res, 'Missing User ID')
    }

    const sharedResources = await listSharedResources(userId)

    if (!sharedResources) {
        return sendBadRequestResponse(res, 'No shared resources found for this user')
    }

    return sendSuccessResponse(res, sharedResources)
}