import { sendErrorResponse, sendSuccessResponse } from '@agm-22/auth-utils'
import { usersAddedLastWeek } from '@services/users.service.js'
import type { Response, Request } from 'express'

export async function getUsersAddedLastWeekController(
    req: Request,
    res: Response,
) {
    const added_last_week = await usersAddedLastWeek()

    if (!added_last_week) {
        return sendErrorResponse(res)
    }

    return sendSuccessResponse(res, { added_last_week })
}
