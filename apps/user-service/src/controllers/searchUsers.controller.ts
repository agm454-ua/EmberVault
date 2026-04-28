import { sendErrorResponse, sendSuccessResponse } from '@agm454-ua/auth-utils'
import { searchUsers } from '@services/users.service.js'
import type { Response, Request } from 'express'

export async function searchUsersController(req: Request, res: Response) {
    const { query} = req.query as {query: string}

    if (!query) {
        return sendErrorResponse(res, 'No search query provided')
    }

    const users = await searchUsers(query)

    if (!users) {
        return sendErrorResponse(res, 'No users found')
    }

    return sendSuccessResponse(res, users)
}