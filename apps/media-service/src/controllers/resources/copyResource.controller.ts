import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import { copyFile } from '@services/files.service.js'
import { copyFolder } from '@services/folders.service.js'
import { isResourceAFile } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function copyResourceController(req: Request, res: Response) {
    const userId = req.userId as string
    const resourceId = req.params.resourceId as string
    const { targetFolderId, prefix } = req.body

    if (!userId || !resourceId) {
        return sendBadRequestResponse(res, 'Missing user ID or resource ID')
    }

    const isFile = await isResourceAFile(resourceId)

    // If not found
    if (isFile === null) {
        return sendBadRequestResponse(res, 'Resource not found')
    }

    if (isFile) {
        const copied = await copyFile(
            resourceId,
            userId,
            targetFolderId,
            prefix,
        )
        if (!copied) {
            return sendBadRequestResponse(res, 'Failed to copy file')
        }
        return sendSuccessResponse(res, copied)
    } else {
        // is folder
        const copied = await copyFolder(
            resourceId,
            userId,
            targetFolderId,
            prefix,
        )
        if (!copied) {
            return sendBadRequestResponse(res, 'Failed to copy folder')
        }
        return sendSuccessResponse(res, copied)
    }
}
