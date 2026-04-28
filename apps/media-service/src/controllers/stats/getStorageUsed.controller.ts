import { sendErrorResponse, sendSuccessResponse } from '@agm454-ua/auth-utils'
import { getStorageUsed } from '@services/files.service.js'
import type { Request, Response } from 'express'

export async function getStorageUsedController(req: Request, res: Response) {
    const storageUsed = await getStorageUsed()

    if (!storageUsed) {
        return sendErrorResponse(
            res,
            'Server Error. Could not retrieve storage used',
        )
    }

    return sendSuccessResponse(res, storageUsed)
}
