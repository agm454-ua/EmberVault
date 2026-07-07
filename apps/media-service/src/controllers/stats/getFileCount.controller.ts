import { sendErrorResponse, sendSuccessResponse } from '@agm-22/auth-utils'
import { getFileCount } from '@services/files.service.js'
import type { Request, Response } from 'express'

export async function getFileCountController(req: Request, res: Response) {
    const fileCount = await getFileCount()

    if (!fileCount && fileCount !== 0) {
        return sendErrorResponse(
            res,
            'Server Error. Could not retrieve number of files',
        )
    }

    return sendSuccessResponse(res, fileCount)
}
