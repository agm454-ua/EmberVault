import { prisma } from '@utils/prisma.js'
import type { TRegisterRequest } from '@customTypes/auth.js'
import type { TUserData } from '@customTypes/user.js'

export const getUser = async (
    identifier: string,
): Promise<TUserData | null> => {
    return await prisma.users.findFirst({
        where: {
            OR: [{ email: identifier }, { username: identifier }],
        },
        select: {
            id: true,
            email: true,
            username: true,
            system_role: true,
            password: true,
        },
    })
}

export const getUserById = async (id: string): Promise<TUserData | null> => {
    return await prisma.users.findFirst({
        where: {
            id: id,
        },
        select: {
            id: true,
            email: true,
            username: true,
            system_role: true,
            password: true,
        },
    })
}

export const getUserRole = async (id: string): Promise<string | null> => {
    const result = await prisma.users.findFirst({
        where: { id },
        select: { system_role: true },
    })

    return result?.system_role ?? null
}

export const createUser = async (userData: TRegisterRequest) => {
    return await prisma.users.create({
        data: {
            email: userData.email,
            username: userData.username,
            birth_date: new Date(userData.birthDate),
            password: userData.password,
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
        },
    })
}

export const updatePassword = async (
    id: string,
    newPassword: string,
): Promise<string | null> => {
    const result = await prisma.users.update({
        where: {
            id: id,
        },
        data: {
            password: newPassword,
        },
    })

    return result?.password ?? null
}

export const updateUserSystemRole = async (
    id: string,
    roleName: string,
): Promise<string | null> => {
    const roleId = await prisma.system_roles.findFirst({
        where: {
            name: roleName,
        },
        select: {
            id: true,
        },
    })

    if (!roleId) {
        throw new Error('Role ID not found')
    }

    const result = await prisma.users.update({
        where: {
            id: id,
        },
        data: {
            system_role: roleId.id,
        },
    })

    return result?.system_role ?? null
}
