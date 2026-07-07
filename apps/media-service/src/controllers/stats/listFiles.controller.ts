import { sendErrorResponse, sendSuccessResponse } from '@agm-22/auth-utils'
import { listAllFiles } from '@services/files.service.js'
import type { Request, Response } from 'express'

export async function listFilesController(req: Request, res: Response) {
    const { includeDeleted, lastCursor, take } = req.query as {
        includeDeleted?: string
        lastCursor?: string
        take?: string
    }

    const files = await listAllFiles(
        includeDeleted === 'true' || includeDeleted === '1',
        lastCursor,
        take,
    )

    if (!files) {
        return sendErrorResponse(res, 'Server Error. Could not retrieve files')
    }

    return sendSuccessResponse(res, files)
}
