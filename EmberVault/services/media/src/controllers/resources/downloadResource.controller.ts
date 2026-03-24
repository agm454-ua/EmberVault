import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import { getFileDownloadUrl } from '@services/files.service.js'
import { streamFolderDownload } from '@services/folders.service.js'
import { isResourceAFile } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function downloadResourceController(req: Request, res: Response) {
    const resourceId = req.params.resourceId as string

    if (!resourceId) {
        return sendBadRequestResponse(res, 'Missing Reource ID')
    }

    const isFile = await isResourceAFile(resourceId)
    if (isFile === null)
        return sendBadRequestResponse(res, 'Resource not found')

    if (isFile) {
        const downloadUrl = await getFileDownloadUrl(resourceId)

        if (!downloadUrl) {
            return sendBadRequestResponse(
                res,
                'Failed to generate download url',
            )
        }

        return sendSuccessResponse(res, downloadUrl)
    } else {
        // if it is a folder, all the logic is managed in the service
        return streamFolderDownload(resourceId, res)
    }
}
