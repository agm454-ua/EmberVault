import { sendErrorResponse, sendSuccessResponse } from "@agm454-ua/auth-utils"
import { getUsers } from "@services/users.service.js"
import type { Response, Request } from "express"


export async function listUsersController(req: Request, res: Response) {
    const { take, lastCursor } = req.body

    const users = await getUsers(lastCursor, take)

    if (!users) {
        return sendErrorResponse(res, "No users found")
    }

    return sendSuccessResponse(res, users)
}