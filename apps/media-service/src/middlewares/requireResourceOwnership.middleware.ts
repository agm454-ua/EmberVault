import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendUnauthorizedResponse,
} from '@agm-22/auth-utils'
import { isOwnerOfResource } from '@services/resource_roles.service.js'
import { getAdminRole } from '@services/system_roles.service.js'
import { getUserRole } from '@services/users.service.js'
import type { Request, Response, NextFunction } from 'express'

// check if user is admin or owner
const requireResourceOwnership = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const userId = req.userId
    const resourceId = req.params.resourceId as string

    if (!userId || !resourceId) {
        return sendBadRequestResponse(res, 'No user ID or resource ID provided')
    }

    // Is the user an administrator?
    const adminRole = await getAdminRole()
    if (!adminRole) {
        return sendErrorResponse(res)
    }

    const userRole = await getUserRole(userId)
    if (!userRole) {
        return sendErrorResponse(res)
    }

    if (adminRole.id === userRole) {
        return next()
    }

    // Is the user the owner of the resource?
    const isOwner = await isOwnerOfResource(userId, resourceId)
    if (isOwner) {
        return next()
    }

    return sendUnauthorizedResponse(res)
}

export default requireResourceOwnership
