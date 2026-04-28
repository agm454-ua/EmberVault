import type {
    TCreateResourceRequest,
    TResourceID,
    TResourceResponse,
} from '@customTypes/resource.js'
import type { TUserID } from '@customTypes/user.js'
import { prisma } from '@utils/prisma.js'
import { getRoleId } from './resource_roles.service.js'
import { mapResource, resourceSelect } from '@mappers/resource.mapper.js'
import { state } from '../generated/prisma/client.js'
import { copyFile } from './files.service.js'
import { fileSelect } from '@mappers/file.mapper.js'
import { randomUUID } from 'crypto'
import archiver from 'archiver'
import type { Response } from 'express'
import { getFileStream } from '@utils/storage.js'
import { OWNER_ROLE } from '@constants/roles.js'
import { sendBadRequestResponse } from '@agm454-ua/auth-utils'

export const createFolder = async (
    folderData: TCreateResourceRequest,
    userId: TUserID,
): Promise<TResourceResponse | null> => {
    const ownerRoleId = await getRoleId(OWNER_ROLE)

    if (!ownerRoleId) {
        return null
    }

    const newFolder = await prisma.resources.create({
        data: {
            name: folderData.name,
            is_private: folderData.isPrivate,
            state: state.ready,
            parent_folder: folderData.parentFolder ?? null,
            folders_folders_idToresources: {
                create: {},
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
            folders_folders_idToresources: { select: { id: true } },
        },
    })

    if (!newFolder.folders_folders_idToresources) return null

    return {
        ...mapResource(newFolder),
        type: 'FOLDER' as const,
    }
}

export const copyFolder = async (
    resourceId: TResourceID,
    userId: TUserID,
    targetFolderId?: TResourceID,
    prefix: string = 'Copy of ',
): Promise<TResourceResponse | null> => {
    const original = await prisma.resources.findUnique({
        where: { id: resourceId },
        select: {
            ...resourceSelect,
            folders_folders_idToresources: { select: { id: true } },
        },
    })

    if (!original?.folders_folders_idToresources) return null

    return copyFolderRecursive(
        original,
        userId,
        targetFolderId ?? original.parent_folder,
        true,
        prefix,
    )
}

// Recursive function to copy all nested folders and files
const copyFolderRecursive = async (
    original: {
        id: TResourceID
        name: string
        is_private: boolean | null
        parent_folder: TResourceID | null
    },
    userId: TUserID,
    targetFolderId: TResourceID | null,
    isRoot = true,
    prefix: string = 'Copy of ',
): Promise<TResourceResponse | null> => {
    const ownerRoleId = await getRoleId(OWNER_ROLE)
    if (!ownerRoleId) return null

    const newFolderId = randomUUID()

    // Create the new folder
    const newFolder = await prisma.resources.create({
        data: {
            id: newFolderId,
            name: isRoot ? `${prefix}${original.name}` : original.name,
            is_private: original.is_private ?? true,
            state: state.ready,
            parent_folder: targetFolderId,
            folders_folders_idToresources: { create: {} },
            user_is_resource_role_for_resource: {
                create: {
                    user_id: userId,
                    resource_role: ownerRoleId,
                },
            },
        },
        select: {
            ...resourceSelect,
            folders_folders_idToresources: { select: { id: true } },
        },
    })

    // Load all direct children
    const children = await prisma.resources.findMany({
        where: { parent_folder: original.id },
        select: {
            ...resourceSelect,
            files: { select: fileSelect },
            folders_folders_idToresources: { select: { id: true } },
        },
    })

    // Copy each child into the new folder
    await Promise.all(
        children.map(async (child) => {
            if (child.files) {
                await copyFile(child.id, userId, newFolderId, '')
            } else if (child.folders_folders_idToresources) {
                await copyFolderRecursive(child, userId, newFolderId, false)
            }
        }),
    )

    return {
        ...mapResource(newFolder),
        type: 'FOLDER' as const,
    }
}

const collectFiles = async (
    folderId: TResourceID,
    currentPath = '',
): Promise<Array<{ storagePath: string; filePath: string }>> => {
    const children = await prisma.resources.findMany({
        where: { parent_folder: folderId, deleted_at: null },
        select: {
            ...resourceSelect,
            files: { select: { storage_path: true } },
            folders_folders_idToresources: { select: { id: true } },
        },
    })

    const files: Array<{ storagePath: string; filePath: string }> = []
    const folderJobs: Promise<
        Array<{ storagePath: string; filePath: string }>
    >[] = []

    for (const child of children) {
        const childPath = currentPath
            ? `${currentPath}/${child.name}`
            : child.name

        if (child.files?.storage_path) {
            files.push({
                storagePath: child.files.storage_path,
                filePath: childPath,
            })
        } else if (child.folders_folders_idToresources) {
            folderJobs.push(collectFiles(child.id, childPath))
        }
    }

    // Recurse into subfolders concurrently, but only after processing current level
    const nested = await Promise.all(folderJobs)
    return [...files, ...nested.flat()]
}

export const streamFolderDownload = async (
    resourceId: TResourceID,
    res: Response,
): Promise<void> => {
    try {
        const folder = await prisma.resources.findUnique({
            where: { id: resourceId },
            select: {
                name: true,
                folders_folders_idToresources: { select: { id: true } },
            },
        })

        if (!folder) {
            sendBadRequestResponse(res, 'Folder not found')
            return
        }

        const files = await collectFiles(resourceId)

        res.setHeader('Content-Type', 'application/zip')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename*=UTF-8''${encodeURIComponent(folder.name)}.zip`,
        )

        const archive = archiver('zip', { zlib: { level: 6 } })

        archive.on('error', (err) => {
            console.error('Archive error:', err)
            res.destroy()
        })

        res.on('close', () => {
            // Client disconnected early — abort the archive to stop S3 streams
            if (!res.writableEnded) {
                archive.abort()
            }
        })

        archive.pipe(res)

        for (const file of files) {
            let stream = null

            try {
                stream = await getFileStream(file.storagePath)
            } catch (err) {
                console.warn(`Skipping unreadable file: ${file.storagePath}`, err)
                continue
            }

            if (!stream) {
                console.warn(`Skipping missing file: ${file.storagePath}`)
                continue
            }

            stream.on('error', (err) => {
                console.error(`Stream error for ${file.storagePath}:`, err)
                archive.abort()
                res.destroy()
            })

            archive.append(stream, { name: file.filePath })
        }

        await new Promise<void>((resolve, reject) => {
            archive.on('finish', resolve)
            archive.on('error', reject)
            archive.finalize()
        })
    } catch (err) {
        console.error('Failed to stream folder download:', err)

        if (!res.headersSent) {
            sendBadRequestResponse(res, 'Failed to stream folder download')
            return
        }

        res.destroy()
    }
}
