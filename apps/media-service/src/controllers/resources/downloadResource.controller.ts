import {
    sendBadRequestResponse,
} from '@agm-22/auth-utils'
import { streamFileDownload } from '@services/files.service.js'
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
        const streamStarted = await streamFileDownload(resourceId, res)

        if (!streamStarted) {
            return sendBadRequestResponse(
                res,
                'Failed to stream file download',
            )
        }

        return
    } else {
        // if it is a folder, all the logic is managed in the service
        return streamFolderDownload(resourceId, res)
    }
}
