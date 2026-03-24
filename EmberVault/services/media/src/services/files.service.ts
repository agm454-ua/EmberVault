import type {
    TCreateResourceRequest,
    TFile,
    TResourceID,
    TResourceResponse,
    TResourceState,
} from '@customTypes/resource.js'
import formatBytes from '@utils/formatBytes.js'
import { prisma } from '@utils/prisma.js'
import type { Prisma } from 'src/generated/prisma/client.js'
import { metaSelect, extractMetadata } from '@mappers/meta/index.js'
import type { TUserID } from '@customTypes/user.js'
import { fileSelect } from '@mappers/file.mapper.js'
import { mapResource, resourceSelect } from '@mappers/resource.mapper.js'
import { getRoleId } from './resource_roles.service.js'
import { randomUUID } from 'crypto'
import {
    buildStoragePath,
    copyObject,
    deleteObject,
    getHash,
    getSizeInBytes,
    getFileSignedUrl,
    getUploadUrl,
    getDownloadUrl,
} from '@utils/storage.js'
import { state } from 'src/generated/prisma/client.js'
import { OWNER_ROLE } from '@customTypes/roles.js'

const baseSelect = {
    id: true,
    mime_type: true,
    size_bytes: true,
    storage_path: true,
    checksum: true,
    thumbnail_path: true,
    resources: {
        select: {
            name: true,
            is_private: true,
            state: true,
            created_at: true,
            updated_at: true,
            deleted_at: true,
            parent_folder: true,
        },
    },
    ...metaSelect,
} satisfies Prisma.filesSelect
type FileWithResource = Prisma.filesGetPayload<{ select: typeof baseSelect }>

const mapFile = (file: FileWithResource): TFile => ({
    id: file.id,
    name: file.resources.name,
    isPrivate: file.resources.is_private ?? false,
    state: (file.resources.state ?? 'pending') as TResourceState,
    createdAt: file.resources.created_at,
    updatedAt: file.resources.updated_at,
    deletedAt: file.resources.deleted_at,
    parentFolder: file.resources.parent_folder,
    type: 'FILE',
    mimeType: file.mime_type ?? '',
    size: formatBytes(file.size_bytes ?? 0),
    storagePath: file.storage_path,
    checksum: file.checksum,
    thumbnailPath: file.thumbnail_path,
    metadata: extractMetadata(file), // ✅ registry handles it
})

export const getStorageUsed = async (): Promise<string> => {
    const result = await prisma.files.aggregate({
        _sum: {
            size_bytes: true,
        },
    })

    return formatBytes(result._sum.size_bytes || 0)
}

export const getFileCount = async (): Promise<number> => {
    return await prisma.files.count()
}

export const listAllFiles = async (
    includeDeleted: boolean | null = false,
    lastCursor: TResourceID | null = null,
    take?: string,
): Promise<TFile[] | null> => {
    const myTake = take ? parseInt(take) : 10

    const results = await prisma.files.findMany({
        take: myTake,
        ...(lastCursor && {
            skip: 1,
            cursor: {
                id: lastCursor,
            },
        }),
        orderBy: {
            resources: { created_at: 'desc' },
        },
        where: {
            resources: {
                ...(includeDeleted ? {} : { deleted_at: null }),
            },
        },
        select: {
            ...baseSelect,
        },
    })

    if (!results) {
        return null
    }

    return results.map((file) => ({
        ...mapResource(file.resources),
        ...mapFile(file),
    }))
}

export const createFile = async (
    fileData: TCreateResourceRequest,
    userId: TUserID,
): Promise<[TResourceResponse, string] | null> => {
    const ownerRoleId = await getRoleId(OWNER_ROLE)

    if (!ownerRoleId) {
        return null
    }

    const resourceId = randomUUID()
    const storagePath = buildStoragePath(resourceId, fileData.name)

    const newFile = await prisma.resources.create({
        data: {
            id: resourceId,
            name: fileData.name,
            is_private: fileData.isPrivate,
            parent_folder: fileData.parentFolder ?? null,
            files: {
                create: {
                    mime_type: fileData.mimeType ?? null,
                    storage_path: storagePath,
                },
            },
            user_is_resource_role_for_resource: {
                create: {
                    user_id: userId,
                    resource_role: ownerRoleId,
                },
            },
        },
        select: {
            ...resourceSelect,
            files: { select: fileSelect },
        },
    })

    if (!newFile.files) return null

    const uploadUrl = await getUploadUrl(
        storagePath,
        fileData.mimeType ?? 'application/octet-stream',
    )

    return [
        {
            ...mapResource(newFile),
            ...mapFile(newFile.files),
        },
        uploadUrl,
    ]
}

export const completeUpload = async (
    resourceId: TResourceID,
): Promise<TResourceResponse | null> => {
    const file = await prisma.files.findUnique({
        where: { id: resourceId },
        select: { storage_path: true, resources: { select: { state: true } } },
    })

    if (!file) return null
    if (!['pending', 'uploading'].includes(file.resources?.state ?? ''))
        return null

    const sizeBytes = await getSizeInBytes(file.storage_path)
    const checksum = await getHash(file.storage_path)

    const updated = await prisma.resources.update({
        where: { id: resourceId },
        data: {
            state: state.ready,
            updated_at: new Date(),
            files: {
                update: {
                    size_bytes: sizeBytes,
                    checksum,
                },
            },
        },
        select: {
            ...resourceSelect,
            files: { select: fileSelect },
        },
    })

    if (!updated.files) return null

    return {
        ...mapResource(updated),
        ...mapFile(updated.files),
    }
}

export const copyFile = async (
    resourceId: TResourceID,
    userId: TUserID,
    targetFolderId?: TResourceID,
    prefix: string = 'Copy of ',
): Promise<TResourceResponse | null> => {
    const original = await prisma.resources.findUnique({
        where: { id: resourceId },
        select: {
            ...resourceSelect,
            files: { select: fileSelect },
        },
    })

    if (!original?.files) return null

    const ownerRoleId = await getRoleId(OWNER_ROLE)
    if (!ownerRoleId) return null

    const newResourceId = randomUUID()
    const ext = original.files.storage_path.includes('.')
        ? `.${original.files.storage_path.split('.').pop()}`
        : ''
    const newStoragePath = `${newResourceId}${ext}`

    const copySuccess = await copyObject(
        original.files.storage_path,
        newStoragePath,
    )
    if (!copySuccess) return null

    const newFile = await prisma.resources
        .create({
            data: {
                id: newResourceId,
                name: `${prefix}${original.name}`,
                is_private: original.is_private ?? true,
                state: state.ready,
                parent_folder: targetFolderId ?? original.parent_folder,
                files: {
                    create: {
                        mime_type: original.files.mime_type,
                        storage_path: newStoragePath,
                        size_bytes: original.files.size_bytes,
                        checksum: original.files.checksum,
                        thumbnail_path: original.files.thumbnail_path,
                    },
                },
                user_is_resource_role_for_resource: {
                    create: {
                        user_id: userId,
                        resource_role: ownerRoleId,
                    },
                },
            },
            select: {
                ...resourceSelect,
                files: { select: fileSelect },
            },
        })
        .catch(async (err) => {
            await deleteObject(newStoragePath)
            throw err
        })

    if (!newFile?.files) return null

    return {
        ...mapResource(newFile),
        ...mapFile(newFile.files),
    }
}

export const getFileThumbnail = async (
    resourceId: TResourceID,
): Promise<string | null> => {
    const file = await prisma.files.findUnique({
        where: { id: resourceId },
        select: { thumbnail_path: true },
    })

    if (!file?.thumbnail_path) return null

    return getFileSignedUrl(file.thumbnail_path)
}

export const getFileDownloadUrl = async (
    resourceId: TResourceID,
): Promise<string | null> => {
    const file = await prisma.resources.findUnique({
        where: { id: resourceId },
        select: {
            name: true,
            state: true,
            files: { select: { storage_path: true } },
        },
    })

    if (!file?.files) return null
    if (file.state !== state.ready) return null // don't allow downloading incomplete uploads

    return getDownloadUrl(file.files.storage_path, file.name)
}
