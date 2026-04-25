import type {
    TCreateResourceRequest,
    TFile,
    TResourceID,
    TResourceResponse,
} from '@customTypes/resource.js'
import formatBytes from '@utils/formatBytes.js'
import { prisma } from '@utils/prisma.js'
import type { Prisma } from '../generated/prisma/client.js'
import { metaSelect } from '@mappers/meta/index.js'
import type { TUserID } from '@customTypes/user.js'
import { fileSelect, mapFile } from '@mappers/file.mapper.js'
import {
    mapResource,
    resourceSelect,
    type ResourceRow,
} from '@mappers/resource.mapper.js'
import { getRoleId } from './resource_roles.service.js'
import { randomUUID } from 'crypto'
import {
    buildStoragePath,
    copyObject,
    deleteObject,
    getFileStream,
    getHash,
    getSizeInBytes,
    getFileSignedUrl,
    getUploadUrl,
    getDownloadUrl,
} from '@utils/storage.js'
import { state } from '../generated/prisma/client.js'
import { OWNER_ROLE } from '@constants/roles.js'
import type { Response } from 'express'

const baseSelect = {
    id: true,
    mime_type: true,
    size_bytes: true,
    storage_path: true,
    checksum: true,
    thumbnail_path: true,
    resources: {
        select: {
            ...resourceSelect,
        },
    },
    ...metaSelect,
} satisfies Prisma.filesSelect

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
    const parsedTake = take ? parseInt(take, 10) : 10
    const myTake = Number.isNaN(parsedTake) || parsedTake <= 0 ? 10 : parsedTake

    const results = await prisma.files.findMany({
        take: myTake,
        ...(lastCursor && {
            skip: 1,
            cursor: {
                id: lastCursor,
            },
        }),
        // Keep cursor pagination deterministic when multiple rows share created_at.
        orderBy: [{ resources: { created_at: 'desc' } }, { id: 'desc' }],
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
        ...mapResource(file.resources as ResourceRow),
        type: 'FILE' as const,
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
            type: 'FILE' as const,
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
        type: 'FILE' as const,
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
        type: 'FILE' as const,
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

export const streamFileDownload = async (
    resourceId: TResourceID,
    res: Response,
): Promise<boolean> => {
    const file = await prisma.resources.findUnique({
        where: { id: resourceId },
        select: {
            name: true,
            state: true,
            files: { select: { storage_path: true, mime_type: true } },
        },
    })

    if (!file?.files) return false
    if (file.state !== state.ready) return false

    const stream = await getFileStream(file.files.storage_path)
    if (!stream) return false

    res.setHeader('Content-Type', file.files.mime_type ?? 'application/octet-stream')
    res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    )

    stream.on('error', (err) => {
        console.error(`Stream error for ${file.files?.storage_path}:`, err)
        if (!res.writableEnded) {
            res.destroy()
        }
    })

    stream.pipe(res)

    return true
}
