import { sendSuccessResponse } from '@agm454-ua/auth-utils'
import { countUsers } from '@services/users.service.js'
import type { Response } from 'express'

export async function getUserCountController(res: Response) {
    const current_users = await countUsers()

    return sendSuccessResponse(res, { current_users })
}
