import {
    sendBadRequestResponse,
    sendNotFoundResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import {
    isResourceAFile,
    listResourcesInFolder,
} from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function listFolderResourcesController(
    req: Request,
    res: Response,
) {
    const resourceId = req.params.resourceId as string
    const includeDeleted = req.query.includeDeleted

    if (!resourceId) {
        return sendBadRequestResponse(res, 'Missing Reource ID')
    }

    const isFile = await isResourceAFile(resourceId)
    if (isFile === null) return sendNotFoundResponse(res, 'Resource not found')

    if (isFile) {
        return sendBadRequestResponse(res, 'Cannot list a file')
    } else {
        const resources = await listResourcesInFolder(
            resourceId,
            includeDeleted === 'true',
        )
        return sendSuccessResponse(res, resources)
    }
}
