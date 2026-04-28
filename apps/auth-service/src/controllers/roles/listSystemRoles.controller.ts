import { sendSuccessResponse } from '@agm454-ua/auth-utils'
import { listSystemRoles } from '@services/system_roles.service.js'
import type { Request, Response } from 'express'

export async function listSystemRolesController(req: Request, res: Response) {
    const roles = await listSystemRoles()

    sendSuccessResponse(res, roles)
}
