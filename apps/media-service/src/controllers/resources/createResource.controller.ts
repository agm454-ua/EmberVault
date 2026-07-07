import {
    sendBadRequestResponse,
    sendSuccessResponse,
} from '@agm-22/auth-utils'
import type { TCreateResourceRequest } from '@customTypes/resource.js'
import { createFile } from '@services/files.service.js'
import { createFolder } from '@services/folders.service.js'
import { checkUserStorageLimit } from '@services/users.service.js'
import type { NextFunction, Request, Response } from 'express'

export async function validateCreateResourceRequest(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const {
        name,
        isPrivate,
        parentFolder,
        type,
        mimeType,
    }: TCreateResourceRequest = req.body

    if (!name || typeof name !== 'string') {
        return sendBadRequestResponse(res, 'Missing or invalid "name" field')
    }
    if (isPrivate && typeof isPrivate !== 'boolean') {
        return sendBadRequestResponse(res, 'Invalid "isPrivate" field')
    }
    if (
        parentFolder !== undefined &&
        parentFolder !== null &&
        typeof parentFolder !== 'string'
    ) {
        return sendBadRequestResponse(res, 'Invalid "parentFolder" field')
    }
    if (type !== 'FILE' && type !== 'FOLDER') {
        return sendBadRequestResponse(res, 'Missing or invalid "type" field')
    }
    if (type === 'FILE' && (!mimeType || typeof mimeType !== 'string')) {
        return sendBadRequestResponse(
            res,
            'Missing or invalid "mimeType" field for FILE resource',
        )
    }

    next()
}

export async function createResourceController(req: Request, res: Response) {
    const requestData: TCreateResourceRequest = req.body
    const userId = req.params.userId as string

    // Create folder
    if (requestData.type === 'FOLDER') {
        const folder = await createFolder(requestData, userId)
        if (!folder) {
            return sendBadRequestResponse(res, 'Failed to create folder')
        }
        return sendSuccessResponse(res, folder)
    }
    // Create file
    else if (requestData.type === 'FILE') {
        const hasUserUsedAllowedStorage = await checkUserStorageLimit(userId)
        if (!hasUserUsedAllowedStorage) {
            return sendBadRequestResponse(res, 'User has exceeded storage limit')
        }
        const result = await createFile(requestData, userId)
        if (!result) {
            return sendBadRequestResponse(res, 'Failed to create file')
        }
        const [file, uploadUrl] = result
        return sendSuccessResponse(res, { ...file, uploadUrl })
    }

    return sendBadRequestResponse(res, 'Invalid resource type')
}
