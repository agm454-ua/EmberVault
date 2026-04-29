import { prisma } from '@utils/prisma.js'
import type {
    TResourceRoleID,
    TUserIsResourceRoleForResource,
    TUserResourcePermissions,
} from '@customTypes/roles.js'
import type { TUserID } from '@customTypes/user.js'
import type { TResourceID } from '@customTypes/resource.js'
import { PUBLIC_PERMISSIONS } from '@constants/permissions.js'
import { cached, invalidate, invalidatePattern } from '@utils/cache.js'

const CK = {
    resourcePermissions: (resourceId: TResourceID) =>
        `resource:permissions:${resourceId}`,
    userResourceRole: (resourceId: TResourceID, userId: TUserID) =>
        `resource:user-role:${resourceId}:${userId}`,
    isOwner: (userId: TUserID, resourceId: TResourceID) =>
        `resource:owner:${userId}:${resourceId}`,
    canUserAction: (
        userId: TUserID,
        resourceId: TResourceID,
        permission: string,
    ) => `resource:can:${userId}:${resourceId}:${permission}`,
    roleId: (roleName: TResourceRoleID) => `resource:role-id:${roleName}`,
    sharedResources: (userId: TUserID) => `resource:shared:${userId}`,
    trashResources: (userId: TUserID) => `resource:trash:${userId}`,
}

export const canUserPerformResourceAction = async (
    userId: TUserID,
    resourceId: TResourceID,
    permissionName: string,
): Promise<boolean> => {
    return cached(
        CK.canUserAction(userId, resourceId, permissionName),
        async () => {
            // If the resource is public, some permissions may be granted without explicit roles
            if (PUBLIC_PERMISSIONS.has(permissionName)) {
                const resource = await prisma.resources.findFirst({
                    where: {
                        id: resourceId,
                        is_private: false,
                        deleted_at: null,
                    },
                    select: { id: true },
                })

                if (resource !== null) return true
            }

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
        },
    )
}

export const listResourcePermissions = async (
    resourceId: TResourceID,
): Promise<TUserResourcePermissions[] | null> => {
    return cached(
        CK.resourcePermissions(resourceId),
        async () => {
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
        },
    )
}

export const getUserResourceRole = async (
    resourceId: TResourceID,
    userId: TUserID,
): Promise<TUserResourcePermissions | null> => {
    return cached(
        CK.userResourceRole(resourceId, userId),
        async () => {
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
        },
    )
}

export const isOwnerOfResource = async (
    userId: TUserID,
    resourceId: TResourceID,
): Promise<boolean> => {
    return cached(
        CK.isOwner(userId, resourceId),
        async () => {
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
        },
    )
}

export const assignUserRoleToResource = async (
    userId: TUserID,
    resourceId: TResourceID,
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

        await invalidate(
            CK.resourcePermissions(resourceId),
            CK.userResourceRole(resourceId, userId),
            CK.isOwner(userId, resourceId),
            CK.sharedResources(userId),
            CK.trashResources(userId),
        )

        await invalidatePattern(`resource:can:${userId}:${resourceId}:*`)

        return {
            userId: result.user_id,
            resourceRoleId: result.resource_role,
            resourceId: result.resource_id,
        }
    })
}

export const deleteUserRoleFromResource = async (
    userId: TUserID,
    resourceId: TResourceID,
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

    await invalidate(
        CK.resourcePermissions(resourceId),
        CK.userResourceRole(resourceId, userId),
        CK.isOwner(userId, resourceId),
        CK.sharedResources(userId),
        CK.trashResources(userId),
    )

    await invalidatePattern(`resource:can:${userId}:${resourceId}:*`)

    return {
        userId: result.user_id,
        resourceRoleId: result.resource_role,
        resourceId: result.resource_id,
    }
}

export const getRoleId = async (
    roleName: TResourceRoleID,
): Promise<TResourceRoleID | null> => {
    return cached(
        CK.roleId(roleName),
        async () => {
            const role = await prisma.resource_roles.findUnique({
                where: { name: roleName },
                select: { id: true },
            })

            return role ? role.id : null
        },
    )
}
