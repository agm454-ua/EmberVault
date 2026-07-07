import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import { completeUpload } from '@services/files.service.js'
import type { Request, Response } from 'express'

export async function completeUploadController(req: Request, res: Response) {
    const resourceId = req.params.resourceId as string

    if (!resourceId) {
        return sendBadRequestResponse(res, 'Missing resource ID')
    }

    const result = await completeUpload(resourceId)

    if (!result) {
        return sendErrorResponse(
            res,
            'Failed to complete upload. Resource may not exist or is not in a valid state',
            400,
        )
    }

    return sendSuccessResponse(res, result)
}
