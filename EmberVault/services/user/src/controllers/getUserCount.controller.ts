import { sendSuccessResponse } from '@agm454-ua/auth-utils'
import { countUsers } from '@services/users.service.js'
import type { Response, Request } from 'express'

export async function getUserCountController(req: Request, res: Response) {
    const current_users = await countUsers()

    return sendSuccessResponse(res, { current_users })
}
