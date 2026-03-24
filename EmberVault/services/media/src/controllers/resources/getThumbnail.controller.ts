import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import { getFileThumbnail } from '@services/files.service.js'
import type { Request, Response } from 'express'

export async function getThumbnailController(req: Request, res: Response) {
    const resourceId = req.params.resourceId as string

    if (!resourceId) {
        return sendBadRequestResponse(res, 'Missing Reource ID')
    }

    const thumbnailUrl = await getFileThumbnail(resourceId)

    return sendSuccessResponse(res, thumbnailUrl)
}
