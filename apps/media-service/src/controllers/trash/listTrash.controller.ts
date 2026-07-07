import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import { listResourcesInTrash } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function listTrashController(req: Request, res: Response) {
    const userId = req.params.userId as string

    if (!userId) {
        return sendBadRequestResponse(res, 'Missing user ID')
    }

    const resources = await listResourcesInTrash(userId)

    if (!resources) {
        return sendBadRequestResponse(res, 'Failed to retrieve trash')
    }

    return sendSuccessResponse(res, resources)
}
