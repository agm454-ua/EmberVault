import type { TUserID, TUser } from '@customTypes/user.js'
import { prisma } from '@utils/prisma.js'
import { randomUUID } from 'crypto'
import {
    deleteProfilePictureObject,
    getProfilePictureStoragePathFromUrl,
    getProfilePictureUrl,
    uploadProfilePictureObject,
} from '@utils/storage.js'

export const getUser = async (identifier: string): Promise<TUser | null> => {
    const result = await prisma.users.findFirst({
        where: {
            OR: [{ email: identifier }, { username: identifier }],
        },
        select: {
            id: true,
            system_role: true,
        },
    })

    if (!result) {
        return null
    }

    return {
        id: result.id,
        systemRole: result.system_role,
    }
}

export const getUserById = async (id: TUserID): Promise<TUser | null> => {
    const result = await prisma.users.findFirst({
        where: {
            id: id,
        },
        select: {
            id: true,
            system_role: true,
        },
    })

    if (!result) {
        return null
    }

    return {
        id: result.id,
        systemRole: result.system_role,
    }
}

export const getUserRole = async (id: string): Promise<string | null> => {
    const result = await prisma.users.findFirst({
        where: { id },
        select: { system_role: true },
    })

    return result?.system_role ?? null
}

export const getUserAvatarUrlById = async (
    id: TUserID,
): Promise<string | null> => {
    const result = await prisma.users.findFirst({
        where: { id },
        select: { avatar_url: true },
    })

    return result?.avatar_url ?? null
}

export const updateUserAvatarUrl = async (
    id: TUserID,
    avatarUrl: string | null,
): Promise<string | null | undefined> => {
    try {
        const result = await prisma.users.update({
            where: { id },
            data: { avatar_url: avatarUrl },
            select: { avatar_url: true },
        })

        return result.avatar_url
    } catch {
        return undefined
    }
}

const fallbackMimeType = 'application/octet-stream'

const getAvatarExtension = (fileName: string): string => {
    const trimmedName = fileName.trim()
    const extension = trimmedName.includes('.')
        ? `.${trimmedName.split('.').pop()}`
        : ''

    return extension.toLowerCase()
}

const buildAvatarStoragePath = (userId: string, originalName: string): string => {
    return `users/${userId}/${randomUUID()}${getAvatarExtension(originalName)}`
}

export const uploadUserAvatar = async (
    userId: string,
    file: Express.Multer.File,
): Promise<string | null> => {
    const storagePath = buildAvatarStoragePath(userId, file.originalname)
    const oldAvatarUrl = await getUserAvatarUrlById(userId)

    await uploadProfilePictureObject(
        storagePath,
        file.buffer,
        file.mimetype || fallbackMimeType,
    )

    const avatarUrl = getProfilePictureUrl(storagePath)
    const updatedAvatarUrl = await updateUserAvatarUrl(userId, avatarUrl)

    if (!updatedAvatarUrl) {
        await deleteProfilePictureObject(storagePath)
        return null
    }

    if (oldAvatarUrl) {
        const oldStoragePath = getProfilePictureStoragePathFromUrl(oldAvatarUrl)
        if (oldStoragePath) {
            await deleteProfilePictureObject(oldStoragePath).catch(() => undefined)
        }
    }

    return updatedAvatarUrl
}

export const deleteUserAvatar = async (userId: string): Promise<boolean> => {
    const oldAvatarUrl = await getUserAvatarUrlById(userId)

    // No avatar to delete, consider it a success
    if (!oldAvatarUrl) {
        return true
    }

    const oldStoragePath = getProfilePictureStoragePathFromUrl(oldAvatarUrl)

    // Can't determine storage path, consider it a failure
    if (!oldStoragePath) {
        return false
    }

    const updateResult = await updateUserAvatarUrl(userId, null)

    // Failed to update database, consider it a failure
    if (updateResult === undefined) {
        return false
    }

    await deleteProfilePictureObject(oldStoragePath).catch(() => undefined)

    return true
}

export const checkUserStorageLimit = async (userId: string): Promise<boolean> => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { storage_used_gb: true, storage_limit_gb: true },
    })

    if (!user) return false;

    const used = user.storage_used_gb?.toNumber() ?? 0;
    const limit = user.storage_limit_gb ?? 0;

    return used < limit;

}