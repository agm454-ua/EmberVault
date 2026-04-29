import { prisma } from '@utils/prisma.js'
import type { TRegisterRequest } from '@customTypes/auth.js'
import type { TUserData } from '@customTypes/user.js'
import { cached, invalidate, invalidatePattern } from '@utils/cache.js'

// Cache keys
const CK = {
    userById: (id: string) => `user:id:${id}`,
    userByIdentifier: (identifier: string) => `user:ident:${identifier}`,
    userRoleById: (id: string) => `user:role:${id}`,
}

export const getUser = async (
    identifier: string,
): Promise<TUserData | null> => {
    return cached(
        CK.userByIdentifier(identifier),
        async () => {
            const result = await prisma.users.findFirst({
                where: {
                    OR: [{ email: identifier }, { username: identifier }],
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    system_role: true,
                    system_roles: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    password: true,
                    root_folder: true,
                    birth_date: true,
                    avatar_url: true,
                    storage_limit_gb: true,
                    storage_used_gb: true,
                    status: true,
                },
            })

            if (!result) {
                return null
            }

            return {
                id: result.id,
                email: result.email,
                username: result.username,
                system_role: {
                    id: result.system_role,
                    name: result.system_roles.name,
                },
                password: result.password,
                root_folder: result.root_folder,
                birthdate: result.birth_date
                    ? result.birth_date.toISOString().split('T')[0]
                    : undefined,
                profile_picture_url: result.avatar_url,
                storage_limit_gb: result.storage_limit_gb,
                storage_used_gb: result.storage_used_gb?.toNumber(),
                status: result.status,
            }
        },
    )
}

export const login = async (identifier: string, ip: string): Promise<boolean | null> => {
    const response = await prisma.users.updateMany({
        where: {
            OR: [{ email: identifier }, { username: identifier }],
        },
        data: {
            last_login_at: new Date(),
            last_login_ip: ip,
        }
    })

    await invalidate(CK.userByIdentifier(identifier))

    return !!response

}

export const getUserById = async (id: string): Promise<TUserData | null> => {
    return cached(
        CK.userById(id),
        async () => {
            const result = await prisma.users.findFirst({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    system_role: true,
                    system_roles: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    password: true,
                    root_folder: true,
                    birth_date: true,
                    avatar_url: true,
                    storage_limit_gb: true,
                    storage_used_gb: true,
                    status: true,
                },
            })

            if (!result) {
                return null
            }

            return {
                id: result.id,
                email: result.email,
                username: result.username,
                system_role: {
                    id: result.system_role,
                    name: result.system_roles.name,
                },
                password: result.password,
                root_folder: result.root_folder,
                birthdate: result.birth_date
                    ? result.birth_date.toISOString().split('T')[0]
                    : undefined,
                profile_picture_url: result.avatar_url,
                storage_limit_gb: result.storage_limit_gb,
                storage_used_gb: result.storage_used_gb?.toNumber(),
                status: result.status,
            }
        },
    )
}

export const getUserRole = async (id: string): Promise<string | null> => {
    return cached(
        CK.userRoleById(id),
        async () => {
            const result = await prisma.users.findFirst({
                where: { id },
                select: {
                    system_role: true,
                },
            })

            return result?.system_role ?? null
        },
    )
}

export const createUser = async (userData: TRegisterRequest) => {
    const result = await prisma.users.create({
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
            system_roles: {
                select: {
                    id: true,
                    name: true,
                }
            },
            password: true,
            root_folder: true,
            birth_date: true,
            avatar_url: true,
            storage_limit_gb: true,
            storage_used_gb: true,
            status: true,
        },
    })

    if (!result) {
        return null
    }

    await invalidatePattern('user:*')

    return {
        id: result.id,
        email: result.email,
        username: result.username,
        system_role: {
            id: result.system_role,
            name: result.system_roles.name,
        },
        password: result.password,
        root_folder: result.root_folder,
        birthdate: result.birth_date ? result.birth_date.toISOString().split('T')[0] : undefined,
        profile_picture_url: result.avatar_url,
        storage_limit_gb: result.storage_limit_gb,
        storage_used_gb: result.storage_used_gb?.toNumber(),
        status: result.status,
    }
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
        select: {
            password: true,
            email: true,
            username: true,
        },
    })

    if (!result) {
        return null
    }

    await invalidate(
        CK.userById(id),
        CK.userByIdentifier(result.email),
        CK.userByIdentifier(result.username),
    )

    return result.password
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
            system_roles: {
                connect: {
                    id: roleId.id,
                },
            },
        },
        select: {
            email: true,
            username: true,
            system_roles: {
                select: {
                    name: true,
                },
            },
        },
    })

    await invalidate(
        CK.userById(id),
        CK.userByIdentifier(result.email),
        CK.userByIdentifier(result.username),
        CK.userRoleById(id),
    )

    return result.system_roles.name ?? null
}
