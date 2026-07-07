import { sendErrorResponse, sendSuccessResponse } from '@agm-22/auth-utils'
import { restoreAll } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function restoreAllController(req: Request, res: Response) {
    const userId = req.params.userId as string

    if (!userId) {
        return sendErrorResponse(res, 'Missing user ID')
    }

    const restored = await restoreAll(userId)

    if (!restored) {
        return sendErrorResponse(res, 'Failed to restore the file')
    }

    return sendSuccessResponse(res)
}
