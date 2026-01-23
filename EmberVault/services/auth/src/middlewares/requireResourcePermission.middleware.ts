import {
    sendBadRequestResponse,
    sendForbiddenResponse,
} from '@agm454-ua/auth-utils'
import { canUserPerformResourceAction } from '@services/resource_roles.service.js'
import type { Request, Response, NextFunction } from 'express'
import type { TResourceID } from '@customTypes/resource.js'
import type { TUserID } from '@customTypes/user.js'

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
