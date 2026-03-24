import type { TUserID, TUser } from '@customTypes/user.js'
import { prisma } from '@utils/prisma.js'

export const getUser = async (identifier: string): Promise<TUser | null> => {
    const result = await prisma.users.findFirst({
        where: {
            OR: [{ email: identifier }, { username: identifier }],
        },
        select: {
            id: true,
            system_role: true,
        },
    })

    if (!result) {
        return null
    }

    return {
        id: result.id,
        systemRole: result.system_role,
    }
}

export const getUserById = async (id: TUserID): Promise<TUser | null> => {
    const result = await prisma.users.findFirst({
        where: {
            id: id,
        },
        select: {
            id: true,
            system_role: true,
        },
    })

    if (!result) {
        return null
    }

    return {
        id: result.id,
        systemRole: result.system_role,
    }
}

export const getUserRole = async (id: string): Promise<string | null> => {
    const result = await prisma.users.findFirst({
        where: { id },
        select: { system_role: true },
    })

    return result?.system_role ?? null
}
