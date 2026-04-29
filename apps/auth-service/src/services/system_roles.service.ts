import { prisma } from '@utils/prisma.js'
import type { TSystemRole, TSystemRoleID } from '@customTypes/roles.js'
import { cached } from '@utils/cache.js'

const CK = {
    systemRoles: 'system_roles',
    standardRole: () => `system_role:standard`,
    adminRole: () => `system_role:admin`,
}

export const listSystemRoles = async (): Promise<TSystemRole[]> => {
    return cached(
        CK.systemRoles,
        async () => {
            return await prisma.system_roles.findMany({
                select: {
                    name: true,
                    description: true,
                },
            })
        }
    )
}

export const getStandardRole = async (): Promise<TSystemRoleID | null> => {
    return cached(
        CK.standardRole(),
        async () => {
            const result = await prisma.system_roles.findFirst({
                where: {
                    name: 'user',
                },
                select: {
                    id: true,
                },
            })
            return result?.id ?? null

        }
    )
}



export const getAdminRole = async (): Promise<TSystemRole | null> => {
    const result = await prisma.system_roles.findFirst({
        where: {
            name: 'admin',
        },
        select: {
            id: true,
            name: true
        },
    })

    return result ?? null
}
