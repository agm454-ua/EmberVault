import { sendErrorResponse, sendUnauthorizedResponse } from "@agm454-ua/auth-utils"
import { getAdminRole } from "@services/system_roles.service.js"
import type { NextFunction, Response, Request } from "express"

const requireAdminOrSelf = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const payload = req.user
    const targetUserId =  req.params.userId as string
    
    if (!payload) {
        return sendErrorResponse(res)
    }

    // check if the target user is the user sending the request
    if (targetUserId === payload.userId) {
        next()
    }

    // check if admin
    const adminRole = await getAdminRole()

    if (!adminRole) {
        return sendErrorResponse(res)
    }

    if (payload.systemRole !== adminRole) {
        return sendUnauthorizedResponse(res)
    }

    next()
}

export default requireAdminOrSelf