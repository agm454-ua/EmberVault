import { prisma } from '@utils/prisma.js'
import type {
    TResourceRole,
    TUserIsResourceRoleForResource,
    TUserResourcePermissions,
} from '@customTypes/roles.js'


export const canUserPerformResourceAction = async (
    userId: string,
    resourceId: string,
    permissionName: string,
): Promise<boolean> => {
    const permission =
        await prisma.user_is_resource_role_for_resource.findFirst({
            where: {
                user_id: userId,
                resource_id: resourceId,
                resource_roles: {
                    resource_role_permissions: {
                        some: {
                            resource_permissions: {
                                name: permissionName,
                            },
                        },
                    },
                },
            },
        })

    return permission !== null
}


export const listResourceRoles = async (): Promise<TResourceRole[]> => {
    return await prisma.resource_roles.findMany({
        select: {
            name: true,
            description: true,
        },
    })
}


export const listResourcePermissions = async (
    resourceId: string,
): Promise<TUserResourcePermissions[] | null> => {
    const results = await prisma.user_is_resource_role_for_resource.findMany({
        where: {
            resource_id: resourceId,
        },
        select: {
            user_id: true,
            resource_role: true,

            users: {
                select: {
                    username: true,
                    email: true,
                },
            },

            resource_roles: {
                select: {
                    name: true,
                },
            },

            resources: {
                select: {
                    name: true,
                },
            },
        },
    })

    // Flatten response
    return results.map((r) => ({
        userId: r.user_id,
        resourceRoleId: r.resource_role,
        roleName: r.resource_roles.name,
        username: r.users.username,
        email: r.users.email,
        resourceName: r.resources.name,
    }))
}

export const getUserResourceRole = async (
    resourceId: string,
    userId: string,
): Promise<TUserResourcePermissions | null> => {
    const result = await prisma.user_is_resource_role_for_resource.findFirst({
        where: {
            resource_id: resourceId,
            user_id: userId,
        },
        select: {
            user_id: true,
            resource_role: true,

            users: {
                select: {
                    username: true,
                    email: true,
                },
            },

            resource_roles: {
                select: {
                    name: true,
                },
            },

            resources: {
                select: {
                    name: true,
                },
            },
        },
    })

    if (!result) {
        return null
    }

    // Flatten response
    return {
        userId: result.user_id,
        resourceRoleId: result.resource_role,
        roleName: result.resource_roles.name,
        username: result.users.username,
        email: result.users.email,
        resourceName: result.resources.name,
    }
}

export const isOwnerOfResource = async (
    userId: string,
    resourceId: string,
): Promise<boolean> => {
    const ownership = await prisma.user_is_resource_role_for_resource.findFirst(
        {
            where: {
                user_id: userId,
                resource_id: resourceId,
                resource_roles: {
                    name: 'owner',
                },
            },
        },
    )

    return ownership !== null
}

export const assignUserRoleToResource = async (
    userId: string,
    resourceId: string,
    roleName: string,
): Promise<TUserIsResourceRoleForResource | null> => {
    return prisma.$transaction(async (tx) => {
        const role = await tx.resource_roles.findUnique({
            where: { name: roleName },
            select: { id: true },
        })

        if (!role) {
            return null
        }

        const existing = await tx.user_is_resource_role_for_resource.findFirst({
            where: {
                user_id: userId,
                resource_id: resourceId,
            },
        })

        if (existing) {
            // delete old composite PK row
            await tx.user_is_resource_role_for_resource.delete({
                where: {
                    user_id_resource_role_resource_id: {
                        user_id: userId,
                        resource_role: existing.resource_role,
                        resource_id: resourceId,
                    },
                },
            })
        }

        const result = await tx.user_is_resource_role_for_resource.create({
            data: {
                user_id: userId,
                resource_role: role.id,
                resource_id: resourceId,
            },
        })

        return {
            userId: result.user_id,
            resourceRoleId: result.resource_role,
            resourceId: result.resource_id,
        }
    })
}

export const deleteUserRoleFromResource = async (
    userId: string,
    resourceId: string,
): Promise<TUserIsResourceRoleForResource | null> => {
    const existing = await prisma.user_is_resource_role_for_resource.findFirst({
        where: {
            user_id: userId,
            resource_id: resourceId,
        },
        select: {
            resource_role: true,
        },
    })

    if (!existing) {
        return null
    }

    const result = await prisma.user_is_resource_role_for_resource.delete({
        where: {
            user_id_resource_role_resource_id: {
                user_id: userId,
                resource_role: existing.resource_role,
                resource_id: resourceId,
            },
        },
    })

    return {
        userId: result.user_id,
        resourceRoleId: result.resource_role,
        resourceId: result.resource_id,
    }
}
