import {
    sendBadRequestResponse,
    sendNotFoundResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import type { TUpdateResourceRequest } from '@customTypes/resource.js'
import { updateResource } from '@services/resources.service.js'
import type { NextFunction, Request, Response } from 'express'

export async function validateUpdateResourceRequest(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { type, name, isPrivate, parentFolder } =
        req.body as TUpdateResourceRequest

    if (type !== undefined && type !== 'FILE' && type !== 'FOLDER') {
        return sendBadRequestResponse(
            res,
            'Invalid type (must be "FILE" or "FOLDER")',
        )
    }

    if (name !== undefined && typeof name !== 'string') {
        return sendBadRequestResponse(res, 'Invalid name (must be a string)')
    }

    if (isPrivate !== undefined && typeof isPrivate !== 'boolean') {
        return sendBadRequestResponse(
            res,
            'Invalid isPrivate (must be a boolean)',
        )
    }

    if (parentFolder !== undefined && typeof parentFolder !== 'string') {
        return sendBadRequestResponse(
            res,
            'Invalid parentFolder (must be a string)',
        )
    }

    next()
}

export async function updateResourceController(req: Request, res: Response) {
    const userId = req.params.userId as string
    const resourceId = req.params.resourceId as string
    const updateData = req.body as TUpdateResourceRequest

    if (!userId || !resourceId) {
        return sendBadRequestResponse(res, 'Missing userId or resourceId')
    }

    const updatedResource = await updateResource(resourceId, updateData)

    if (!updatedResource) {
        return sendNotFoundResponse(res, 'Resource not found or update failed')
    }

    return sendSuccessResponse(res, updatedResource)
}
