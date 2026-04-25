import { sendSuccessResponse } from '@agm454-ua/auth-utils'
import { listResourceRoles } from '@services/resource_roles.service.js'
import type { Request, Response } from 'express'

export async function listAvailableResourceRolesController(req: Request, res: Response) {
    const roles = await listResourceRoles()

    sendSuccessResponse(res, roles)
}
