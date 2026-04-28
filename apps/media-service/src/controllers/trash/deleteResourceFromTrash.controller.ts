import {
    sendBadRequestResponse,
    sendNotFoundResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import { deleteResourceFromTrash } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function deleteResourceFromTrashController(req: Request, res: Response) {
    const userId = req.params.userId as string
    const resourceId = req.params.resourceId as string

    if (!userId) {
        return sendBadRequestResponse(res, 'Missing user ID')
    }

    if (!resourceId) {
        return sendBadRequestResponse(res, 'Missing resource ID')
    }

    const deleted = await deleteResourceFromTrash(resourceId, userId)

    if (!deleted) {
        return sendNotFoundResponse(res, 'Resource not found in trash or could not be deleted')
    }

    return sendSuccessResponse(res)
}
