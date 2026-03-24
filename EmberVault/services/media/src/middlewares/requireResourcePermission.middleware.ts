import {
    sendBadRequestResponse,
    sendErrorResponse,
    sendForbiddenResponse,
} from '@agm454-ua/auth-utils'
import {
    canUserPerformResourceAction,
    isOwnerOfResource,
} from '@services/resource_roles.service.js'
import type { Request, Response, NextFunction } from 'express'
import type { TResourceID } from '@customTypes/resource.js'
import type { TUserID } from '@customTypes/user.js'
import { getAdminRole } from '@services/system_roles.service.js'
import { getUserRole } from '@services/users.service.js'

export const requireResourcePermission =
    (permissionName: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.userId as TUserID
        const resourceId = req.params.resourceId as TResourceID

        if (!userId || !resourceId) {
            return sendBadRequestResponse(
                res,
                'No user ID or resource ID provided',
            )
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

        if (adminRole === userRole) {
            return next()
        }

        // Is the user the owner of the resource?
        const isOwner = await isOwnerOfResource(userId, resourceId)
        if (isOwner) {
            return next()
        }

        // else, check if the user has the required permission for the resource
        const allowed = await canUserPerformResourceAction(
            userId,
            resourceId,
            permissionName,
        )

        if (!allowed) {
            return sendForbiddenResponse(res)
        }

        next()
    }
