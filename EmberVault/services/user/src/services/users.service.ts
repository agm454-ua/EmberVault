import type {
    TCreateUserRequest,
    TUpdateUserRequest,
    TUser,
    TUserID,
} from '@customTypes/user.js'
import { prisma } from '@utils/prisma.js'
import type { TSystemRoleID } from '@customTypes/roles.js'
import type { Decimal } from '@prisma/client/runtime/client'

const mapUser = (user: {
    id: TUserID
    email: string
    username: string
    system_role: TSystemRoleID
    avatar_url: string | null
    status?: string | null
    storage_limit_gb?: number | null
    storage_used_gb?: Decimal | null
}): TUser => ({
    id: user.id,
    username: user.username,
    email: user.email,
    profile_picture_url: user.avatar_url,
    systemRole: user.system_role,
    ...(user.status !== undefined && { status: user.status }),
    ...(user.storage_limit_gb !== undefined && {
        storageLimitGB: user.storage_limit_gb,
    }),
    ...(user.storage_used_gb !== undefined && {
        storageUsedGB: user.storage_used_gb,
    }),
})

export const getUser = async (identifier: string): Promise<TUser | null> => {
    const result = await prisma.users.findFirst({
        where: {
            OR: [{ email: identifier }, { username: identifier }],
        },
        select: {
            id: true,
            email: true,
            username: true,
            system_role: true,
            avatar_url: true,
            status: true,
            storage_limit_gb: true,
            storage_used_gb: true,
        },
    })

    if (!result) {
        return null
    }

    return mapUser(result)
}

export const getUserById = async (id: string): Promise<TUser | null> => {
    const result = await prisma.users.findFirst({
        where: {
            id: id,
        },
        select: {
            id: true,
            email: true,
            username: true,
            system_role: true,
            avatar_url: true,
            status: true,
            storage_limit_gb: true,
            storage_used_gb: true,
        },
    })

    if (!result) {
        return null
    }

    return mapUser(result)
}

export const createUser = async (
    userData: TCreateUserRequest,
): Promise<TUser | null> => {
    const result = await prisma.users.create({
        data: {
            email: userData.email,
            username: userData.username,
            birth_date: new Date(userData.birthDate),
            password: userData.password,
            avatar_url: userData.profile_picture_url ?? null, // in case the profile picture wasn't set
            system_roles: {
                connect: {
                    name: 'user',
                },
            },
        },
        select: {
            id: true,
            email: true,
            username: true,
            system_role: true,
            avatar_url: true,
            status: true,
            storage_limit_gb: true,
            storage_used_gb: true,
        },
    })

    return mapUser(result)
}

export const countUsers = async (): Promise<number> => {
    return await prisma.users.count()
}

export const usersAddedLastWeek = async (): Promise<number> => {
    const now = new Date()

    const lastWeek = new Date()
    lastWeek.setDate(now.getDate() - now.getDay() - 7)
    lastWeek.setHours(0, 0, 0, 0)

    return await prisma.users.count({
        where: {
            created_at: {
                gte: lastWeek,
            },
        },
    })
}

export const updateUser = async (
    userId: TUserID,
    data: TUpdateUserRequest,
): Promise<TUser | null> => {
    const parsedBirthDate =
        data.birthDate === undefined ? undefined : new Date(data.birthDate)

    // only uses values that are defined
    const parsedData = Object.fromEntries(
        Object.entries({
            username: data.username,
            email: data.email,
            birth_date: parsedBirthDate,
            status: data.status,
            storage_limit_gb: data.storageLimitGB,
        }).filter(([, value]) => value !== undefined),
    )

    const result = await prisma.users.update({
        where: {
            id: userId,
        },
        data: parsedData,
        select: {
            id: true,
            email: true,
            username: true,
            system_role: true,
            avatar_url: true,
            status: true,
            storage_limit_gb: true,
            storage_used_gb: true,
        },
    })

    if (!result) {
        return null
    }

    return mapUser(result)
}

export const deleteUser = async (userId: TUserID): Promise<boolean> => {
    const result = await prisma.users.update({
        where: {
            id: userId,
        },
        data: {
            status: 'deleted',
        },
    })

    return result !== null
}

export const getUsers = async (
    lastCursor?: TUserID,
    take?: string,
): Promise<TUser[] | null> => {
    const parsedTake = take ? parseInt(take, 10) : 10
    const myTake = Number.isNaN(parsedTake) || parsedTake <= 0 ? 10 : parsedTake

    const results = await prisma.users.findMany({
        take: myTake,
        ...(lastCursor && {
            skip: 1,
            cursor: {
                id: lastCursor,
            },
        }),
        // Keep pagination deterministic when many users share the same created_at.
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        select: {
            id: true,
            email: true,
            username: true,
            system_role: true,
            avatar_url: true,
            status: true,
            storage_limit_gb: true,
            storage_used_gb: true,
        },
    })

    if (!results) {
        return null
    }

    return results.map(mapUser)
}
