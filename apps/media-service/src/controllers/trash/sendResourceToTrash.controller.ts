import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import { sendResourceToTrash } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function sendResourceToTrashController(
    req: Request,
    res: Response,
) {
    const resourceId = req.params.resourceId as string

    if (!resourceId) {
        return sendBadRequestResponse(res, 'Missing resource ID')
    }

    const result = await sendResourceToTrash(resourceId)

    if (!result) {
        return sendBadRequestResponse(res, 'Failed to send resource to trash')
    }

    return sendSuccessResponse(res, result)
}
