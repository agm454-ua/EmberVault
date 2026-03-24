import { prisma } from '@utils/prisma.js'
import type {
    TResourceResponse,
    TUpdateResourceRequest,
} from '@customTypes/resource.js'
import type { TResourceID } from '@customTypes/resource.js'
import { mapResource, resourceSelect } from '@mappers/resource.mapper.js'
import { fileSelect, mapFile } from '@mappers/file.mapper.js'
import { state } from 'src/generated/prisma/client.js'
import type { TUserID } from '@customTypes/user.js'
import { OWNER_ROLE } from '@customTypes/roles.js'

export const getResourceById = async (
    resourceId: TResourceID,
): Promise<TResourceResponse | null> => {
    const row = await prisma.resources.findUnique({
        where: { id: resourceId },
        select: {
            ...resourceSelect,
            files: { select: fileSelect }, // null if it's a folder
            folders_folders_idToresources: { select: { id: true } }, // null if it's a file
        },
    })

    if (!row) return null

    if (row.files) {
        return {
            ...mapResource(row),
            type: 'FILE' as const,
            ...mapFile(row.files),
        }
    }

    if (row.folders_folders_idToresources) {
        return {
            ...mapResource(row),
            type: 'FOLDER' as const,
        }
    }

    return null
}

export const updateResource = async (
    resourceId: TResourceID,
    data: TUpdateResourceRequest,
): Promise<TResourceResponse | null> => {
    const parsedData = Object.fromEntries(
        Object.entries({
            name: data.name,
            is_private: data.isPrivate,
            parent_folder: data.parentFolder,
        }).filter(([, value]) => value !== undefined),
    )

    const result = await prisma.resources.update({
        where: {
            id: resourceId,
        },
        data: parsedData,
        select: {
            ...resourceSelect,
            files: { select: fileSelect }, // null if it's a folder
            folders_folders_idToresources: { select: { id: true } }, // null if it's a file
        },
    })

    if (!result) {
        return null
    }
    if (result.files) {
        return {
            ...mapResource(result),
            type: 'FILE' as const,
            ...mapFile(result.files),
        }
    }

    if (result.folders_folders_idToresources) {
        return {
            ...mapResource(result),
            type: 'FOLDER' as const,
        }
    }

    return null
}

export const deleteResource = async (
    resourceId: TResourceID,
): Promise<boolean> => {
    const result = await prisma.resources.update({
        where: {
            id: resourceId,
        },
        data: {
            state: state.deleted,
            deleted_at: new Date(),
        },
    })

    return result !== null
}

export const searchByName = async (
    query: string,
    userId: TUserID,
): Promise<TResourceResponse[]> => {
    const rows = await prisma.resources.findMany({
        where: {
            name: { contains: query, mode: 'insensitive' },
            // only search within resources the user has access to
            user_is_resource_role_for_resource: {
                some: { user_id: userId },
            },
        },
        select: {
            ...resourceSelect,
            files: { select: fileSelect },
            folders_folders_idToresources: { select: { id: true } },
        },
        orderBy: { name: 'asc' },
        take: 20,
    })

    return rows.flatMap((row): TResourceResponse[] => {
        if (row.files) {
            return [
                {
                    ...mapResource(row),
                    type: 'FILE' as const,
                    ...mapFile(row.files),
                },
            ]
        }
        if (row.folders_folders_idToresources) {
            return [
                {
                    ...mapResource(row),
                    type: 'FOLDER' as const,
                },
            ]
        }
        return []
    })
}

export const isResourceAFile = async (
    resourceId: TResourceID,
): Promise<boolean | null> => {
    const result = await prisma.resources.findFirst({
        where: { id: resourceId },
        select: {
            files: { select: { id: true } },
        },
    })

    if (!result) return null
    return !!result.files
}

export const listResourcesInFolder = async (
    folderId: TResourceID,
    includeDeleted: boolean = false,
): Promise<TResourceResponse[]> => {
    const rows = await prisma.resources.findMany({
        orderBy: {
            created_at: 'desc',
        },
        where: {
            parent_folder: folderId,
            ...(includeDeleted ? {} : { deleted_at: null }),
        },
        select: {
            ...resourceSelect,
            files: { select: fileSelect },
            folders_folders_idToresources: { select: { id: true } },
        },
    })

    return rows.flatMap((row): TResourceResponse[] => {
        if (row.files) {
            return [
                {
                    ...mapResource(row),
                    type: 'FILE' as const,
                    ...mapFile(row.files),
                },
            ]
        }
        if (row.folders_folders_idToresources) {
            return [
                {
                    ...mapResource(row),
                    type: 'FOLDER' as const,
                },
            ]
        }
        return []
    })
}

export const listResourcesInTrash = async (
    userId: TResourceID,
): Promise<TResourceResponse[]> => {
    const rows = await prisma.resources.findMany({
        orderBy: {
            created_at: 'desc',
        },
        where: {
            user_is_resource_role_for_resource: {
                some: {
                    user_id: userId,
                    resource_roles: {
                        name: OWNER_ROLE,
                    },
                },
            },
            deleted_at: { not: null },
        },
        select: {
            ...resourceSelect,
            files: { select: fileSelect },
            folders_folders_idToresources: { select: { id: true } },
        },
    })

    return rows.flatMap((row): TResourceResponse[] => {
        if (row.files) {
            return [
                {
                    ...mapResource(row),
                    type: 'FILE' as const,
                    ...mapFile(row.files),
                },
            ]
        }
        if (row.folders_folders_idToresources) {
            return [
                {
                    ...mapResource(row),
                    type: 'FOLDER' as const,
                },
            ]
        }
        return []
    })
}

export const restoreAll = async (userId: TUserID): Promise<boolean> => {
    const result = await prisma.resources.updateMany({
        where: {
            deleted_at: { not: null },
            user_is_resource_role_for_resource: {
                some: {
                    user_id: userId,
                    resource_roles: {
                        name: OWNER_ROLE,
                    },
                },
            },
        },
        data: {
            deleted_at: null,
        },
    })

    return result.count > 0
}

export const restoreResource = async (
    resourceId: TResourceID,
): Promise<TResourceResponse | null> => {
    const result = await prisma.resources.update({
        where: {
            id: resourceId,
        },
        data: {
            deleted_at: null,
        },
        select: {
            ...resourceSelect,
            files: { select: fileSelect }, // null if it's a folder
            folders_folders_idToresources: { select: { id: true } }, // null if it's a file
        },
    })

    if (!result) {
        return null
    }
    if (result.files) {
        return {
            ...mapResource(result),
            type: 'FILE' as const,
            ...mapFile(result.files),
        }
    }

    if (result.folders_folders_idToresources) {
        return {
            ...mapResource(result),
            type: 'FOLDER' as const,
        }
    }

    return null
}

export const sendResourceToTrash = async (
    resourceId: TResourceID,
): Promise<TResourceResponse | null> => {
    const result = await prisma.resources.update({
        where: {
            id: resourceId,
        },
        data: {
            deleted_at: new Date(),
        },
        select: {
            ...resourceSelect,
            files: { select: fileSelect }, // null if it's a folder
            folders_folders_idToresources: { select: { id: true } }, // null if it's a file
        },
    })

    if (!result) {
        return null
    }
    if (result.files) {
        return {
            ...mapResource(result),
            type: 'FILE' as const,
            ...mapFile(result.files),
        }
    }

    if (result.folders_folders_idToresources) {
        return {
            ...mapResource(result),
            type: 'FOLDER' as const,
        }
    }

    return null
}
