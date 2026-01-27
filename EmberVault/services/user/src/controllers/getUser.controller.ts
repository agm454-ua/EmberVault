import { sendBadRequestResponse, sendSuccessResponse } from "@agm454-ua/auth-utils"
import type { TUserID } from "@customTypes/user.js"
import { getUserById } from "@services/users.service.js"
import type { Response, Request } from "express"

export async function getUserController(req: Request, res: Response) {
    const userId = req.params.userId as TUserID

    if (!userId) {
        return sendBadRequestResponse(res, "No User ID provided")
    }

    const user = await getUserById(userId)
    if(!user) {
        return sendBadRequestResponse(res, "User not found")
    }

    sendSuccessResponse(res, user)
}