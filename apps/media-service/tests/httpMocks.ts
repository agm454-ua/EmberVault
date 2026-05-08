import type { NextFunction, Request, Response } from 'express'
import { vi } from 'vitest'

const ADMIN_ROLE_ID = 'role-admin-id'
const USER_ROLE_ID = 'role-user-id'

const TOKEN_PROFILE: Record<string, { userId: string; systemRole: string }> = {
    admin: { userId: 'admin-1', systemRole: ADMIN_ROLE_ID },
    'user-1': { userId: 'user-1', systemRole: USER_ROLE_ID },
    'user-2': { userId: 'user-2', systemRole: USER_ROLE_ID },
}

const httpMocks = vi.hoisted(() => ({
    authenticate: vi.fn(
        (req: Request, res: Response, next: NextFunction): void => {
            const auth = req.headers.authorization
            if (!auth || !auth.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    error: 'No token provided',
                })
                return
            }
            const token = auth.slice('Bearer '.length).trim()
            if (!token || token === 'invalid') {
                res.status(401).json({
                    success: false,
                    error: 'Invalid or expired token',
                })
                return
            }
            const profile = TOKEN_PROFILE[token]
            if (!profile) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid or expired token',
                })
                return
            }
            req.user = profile
            req.userId = profile.userId
            next()
        },
    ),
    getUserRole: vi.fn(async (userId: string) =>
        userId === 'admin-1' ? ADMIN_ROLE_ID : USER_ROLE_ID,
    ),
    checkUserStorageLimit: vi.fn(async () => true),
    getAdminRole: vi.fn(async () => ({ id: ADMIN_ROLE_ID, name: 'admin' })),
    isOwnerOfResource: vi.fn(async () => true),
    canUserPerformResourceAction: vi.fn(async () => true),
    files: {
        getStorageUsed: vi.fn(),
        getFileCount: vi.fn(),
        listAllFiles: vi.fn(),
        createFile: vi.fn(),
        completeUpload: vi.fn(),
        copyFile: vi.fn(),
        getFileThumbnail: vi.fn(),
        getFileDownloadUrl: vi.fn(),
        streamFileDownload: vi.fn(),
    },
    folders: {
        createFolder: vi.fn(),
        copyFolder: vi.fn(),
        streamFolderDownload: vi.fn(),
    },
    resources: {
        getResourceById: vi.fn(),
        updateResource: vi.fn(),
        deleteResource: vi.fn(),
        searchByName: vi.fn(),
        isResourceAFile: vi.fn(),
        listResourcesInFolder: vi.fn(),
        listResourcesInTrash: vi.fn(),
        restoreAll: vi.fn(),
        deleteAllFromTrash: vi.fn(),
        restoreResource: vi.fn(),
        deleteResourceFromTrash: vi.fn(),
        sendResourceToTrash: vi.fn(),
    },
    avatars: {
        uploadUserAvatar: vi.fn(),
    },
}))

vi.mock('@middlewares/authenticate.middleware.js', () => ({
    default: httpMocks.authenticate,
}))

vi.mock('@services/users.service.js', () => ({
    getUserById: vi.fn(),
    getUserRole: httpMocks.getUserRole,
    checkUserStorageLimit: httpMocks.checkUserStorageLimit,
}))

vi.mock('@services/system_roles.service.js', () => ({
    getAdminRole: httpMocks.getAdminRole,
}))

vi.mock('@services/resource_roles.service.js', () => ({
    isOwnerOfResource: httpMocks.isOwnerOfResource,
    canUserPerformResourceAction: httpMocks.canUserPerformResourceAction,
}))

vi.mock('@services/files.service.js', () => httpMocks.files)

vi.mock('@services/folders.service.js', () => httpMocks.folders)

vi.mock('@services/resources.service.js', () => httpMocks.resources)

vi.mock('@services/avatars.service.js', () => httpMocks.avatars)

vi.mock('@utils/logger.js', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}))


vi.mock('@utils/redisClient.js', () => ({
    default: {
        get: vi.fn(),
        setEx: vi.fn(),
        del: vi.fn(),
        keys: vi.fn(),
        isOpen: true,
        connect: vi.fn(),
    },
    connectRedis: vi.fn().mockResolvedValue(undefined),
}))

export function getHttpMocks(): typeof httpMocks {
    return httpMocks
}

export function resetHttpServiceMocks(): void {
    const m = httpMocks
    m.getUserRole.mockImplementation(async (userId: string) =>
        userId === 'admin-1' ? ADMIN_ROLE_ID : USER_ROLE_ID,
    )
    m.checkUserStorageLimit.mockResolvedValue(true)
    m.getAdminRole.mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
    m.isOwnerOfResource.mockResolvedValue(true)
    m.canUserPerformResourceAction.mockResolvedValue(true)

    m.files.getStorageUsed.mockResolvedValue('10 MB')
    m.files.getFileCount.mockResolvedValue(3)
    m.files.listAllFiles.mockResolvedValue([{ id: 'f1' }])
    m.files.createFile.mockResolvedValue([
        { id: 'new-file', name: 'x' },
        'https://upload.example/presigned',
    ])
    m.files.completeUpload.mockResolvedValue({ id: 'f1', ok: true })
    m.files.copyFile.mockResolvedValue({ id: 'copy-f' })
    m.files.getFileThumbnail.mockResolvedValue('https://thumb.example/x')
    m.files.getFileDownloadUrl.mockResolvedValue('https://download.example/x')
    m.files.streamFileDownload.mockImplementation(
        async (_id: string, res: Response) => {
            res.status(200)
            res.setHeader('Content-Type', 'application/octet-stream')
            res.send(Buffer.from('file-content'))
            return true
        },
    )

    m.folders.createFolder.mockResolvedValue({ id: 'new-folder' })
    m.folders.copyFolder.mockResolvedValue({ id: 'copy-folder' })
    m.folders.streamFolderDownload.mockImplementation(
        async (_id: string, res: Response) => {
            res.status(200)
            res.setHeader('Content-Type', 'application/zip')
            res.send(Buffer.from('PK\x03\x04'))
        },
    )

    m.resources.getResourceById.mockResolvedValue({
        id: 'r1',
        name: 'item',
    })
    m.resources.updateResource.mockResolvedValue({
        id: 'r1',
        name: 'updated',
    })
    m.resources.deleteResource.mockResolvedValue(true)
    m.resources.searchByName.mockResolvedValue([{ id: 'r1' }])
    m.resources.isResourceAFile.mockResolvedValue(true)
    m.resources.listResourcesInFolder.mockResolvedValue([{ id: 'child' }])
    m.resources.listResourcesInTrash.mockResolvedValue([{ id: 't1' }])
    m.resources.restoreAll.mockResolvedValue(true)
    m.resources.deleteAllFromTrash.mockResolvedValue(true)
    m.resources.restoreResource.mockResolvedValue(true)
    m.resources.deleteResourceFromTrash.mockResolvedValue(true)
    m.resources.sendResourceToTrash.mockResolvedValue({ id: 't1' })

    m.avatars.uploadUserAvatar.mockResolvedValue(
        'https://files.example/avatar.png',
    )
}

resetHttpServiceMocks()
