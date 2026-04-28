import { prisma } from '@utils/prisma.js'
import type { TSystemRole, TSystemRoleID } from '@customTypes/roles.js'

export const listSystemRoles = async (): Promise<TSystemRole[]> => {
    return await prisma.system_roles.findMany({
        select: {
            name: true,
            description: true,
        },
    })
}

export const getStandardRole = async (): Promise<TSystemRoleID | null> => {
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
