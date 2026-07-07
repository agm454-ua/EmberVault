import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendSuccessResponse,
    sendUnauthorizedResponse,
} from '@agm-22/auth-utils'
import {
    getUserResourceRole,
    isOwnerOfResource,
} from '@services/resource_roles.service.js'
import { getAdminRole } from '@services/system_roles.service.js'
import { getUserRole } from '@services/users.service.js'
import type { Request, Response } from 'express'
import type { TResourceID } from '@customTypes/resource.js'
import type { TUserID } from '@customTypes/user.js'
async function isUserOwnerAdminOrSelf(
    user: string,
    resource: string,
    targetUser: string,
): Promise<boolean> {
    // Is the user the target?
    if (user === targetUser) {
        return true
    }

    const adminRole = await getAdminRole()
    if (!adminRole) {
        return false
    }

    const userRole = await getUserRole(user)
    if (!userRole) {
        return false
    }

    if (adminRole.id === userRole) {
        return true
    }

    // Is the user the owner of the resource?
    return await isOwnerOfResource(user, resource)
}

export async function getUserResourceRoleController(
    req: Request,
    res: Response,
) {
    const userId = req.userId as TUserID
    const resource = req.params.resourceId as TResourceID
    const targetUser = req.params.userId as TUserID

    if (!userId) {
        return sendErrorResponse(res)
    }
    if (!resource || !targetUser) {
        return sendBadRequestResponse(res, 'Invalid request')
    }

    // The user has permission to check the role if the user is admin or owner of the resource
    // or if the user is the target
    const hasPermission = await isUserOwnerAdminOrSelf(
        userId,
        resource,
        targetUser,
    )
    if (!hasPermission) {
        return sendUnauthorizedResponse(res)
    }

    const data = getUserResourceRole(resource, targetUser)
    if (!data) {
        return sendErrorResponse(res)
    }

    sendSuccessResponse(res, data)
}
