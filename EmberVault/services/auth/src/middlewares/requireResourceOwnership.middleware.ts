import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendUnauthorizedResponse,
} from '@agm454-ua/auth-utils'
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
    const user = req.userId
    const resource = req.params.resourceId as string

    if (!user || !resource) {
        return sendBadRequestResponse(res, 'Bad Request')
    }

    // Is the user an administrator?
    const adminRole = await getAdminRole()
    if (!adminRole) {
        return sendErrorResponse(res)
    }

    const userRole = await getUserRole(user)
    if (!userRole) {
        return sendErrorResponse(res)
    }

    if (adminRole.id === userRole) {
        return next()
    }

    // Is the user the owner of the resource?
    const isOwner = await isOwnerOfResource(user, resource)
    if (isOwner) {
        return next()
    }

    return sendUnauthorizedResponse(res)
}

export default requireResourceOwnership
