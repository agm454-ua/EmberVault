import { sendErrorResponse, sendSuccessResponse } from '@agm454-ua/auth-utils'
import { deleteAllFromTrash } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function deleteAllFromTrashController(req: Request, res: Response) {
    const userId = req.params.userId as string

    if (!userId) {
        return sendErrorResponse(res, 'Missing user ID')
    }

    const deleted = await deleteAllFromTrash(userId)

    if (!deleted) {
        return sendErrorResponse(res, 'Failed to delete all resources from trash')
    }

    return sendSuccessResponse(res)
}
