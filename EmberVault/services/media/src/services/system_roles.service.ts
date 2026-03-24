import { prisma } from '@utils/prisma.js'
import type { TSystemRoleID } from '@customTypes/roles.js'

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

export const getAdminRole = async (): Promise<TSystemRoleID | null> => {
    const result = await prisma.system_roles.findFirst({
        where: {
            name: 'admin',
        },
        select: {
            id: true,
        },
    })

    return result?.id ?? null
}
