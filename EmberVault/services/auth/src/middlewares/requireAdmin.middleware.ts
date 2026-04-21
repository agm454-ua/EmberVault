import {
    sendErrorResponse,
    sendUnauthorizedResponse,
} from '@agm454-ua/auth-utils'
import { getAdminRole } from '@services/system_roles.service.js'
import type { Request, Response, NextFunction } from 'express'

const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const payload = req.user

    if (!payload) {
        return sendErrorResponse(res)
    }

    const adminRole = await getAdminRole()

    if (!adminRole) {
        return sendErrorResponse(res)
    }

    if (payload.systemRole !== adminRole.id) {
        return sendUnauthorizedResponse(res)
    }

    next()
}

export default requireAdmin
