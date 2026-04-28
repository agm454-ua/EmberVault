import type { TResource, TResourceState } from '@customTypes/resource.js'
import type { Prisma } from '../generated/prisma/client.js'

export const resourceSelect = {
    id: true,
    name: true,
    is_private: true,
    state: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
    parent_folder: true,
    user_is_resource_role_for_resource: {
        where: {
            resource_roles: {
                name: 'owner'
            }
        },
        select: {
            users: {
                select: {
                    id: true,
                    username: true,
                }
            }
        }
    }

} satisfies Prisma.resourcesSelect

export type ResourceRow = Prisma.resourcesGetPayload<{
    select: typeof resourceSelect
}>

export const mapResource = (row: ResourceRow): TResource => ({
    id: row.id,
    name: row.name,
    isPrivate: row.is_private ?? false,
    state: (row.state ?? 'pending') as TResourceState,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    parentFolder: row.parent_folder,
    owner: row.user_is_resource_role_for_resource[0]?.users.username ?? null,
})
