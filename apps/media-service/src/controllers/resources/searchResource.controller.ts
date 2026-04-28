import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendNotFoundResponse,
    sendSuccessResponse,
} from '@agm454-ua/auth-utils'
import type { TUserID } from '@customTypes/user.js'
import { searchByName } from '@services/resources.service.js'
import type { Request, Response } from 'express'

export async function searchResourceController(req: Request, res: Response) {
    const userId = req.params.userId as TUserID
    const query = req.query.name as string | undefined

    if (!userId || !query) {
        return sendBadRequestResponse(
            res,
            'Missing required parameters: userId and query',
        )
    }

    const matches = await searchByName(query, userId)

    if (Array.isArray(matches) && matches.length === 0) {
        return sendNotFoundResponse(res, 'No matches found')
    }
    if (!matches) {
        return sendErrorResponse(res, 'Server Error')
    }

    return sendSuccessResponse(res, matches)
}
