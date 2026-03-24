import type { NextFunction, Request, Response } from 'express'
import { vi } from 'vitest'

const TOKEN_PROFILE: Record<string, { userId: string; systemRole: string }> = {
    admin: { userId: 'admin-1', systemRole: 'ADMIN' },
    'user-1': { userId: 'user-1', systemRole: 'USER' },
    'user-2': { userId: 'user-2', systemRole: 'USER' },
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
        userId === 'admin-1' ? 'ADMIN' : 'USER',
    ),
    getAdminRole: vi.fn(async () => 'ADMIN'),
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
        restoreResource: vi.fn(),
        sendResourceToTrash: vi.fn(),
    },
}))

vi.mock('@middlewares/authenticate.middleware.js', () => ({
    default: httpMocks.authenticate,
}))

vi.mock('@services/users.service.js', () => ({
    getUserById: vi.fn(),
    getUserRole: httpMocks.getUserRole,
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

vi.mock('@utils/logger.js', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}))

export function getHttpMocks(): typeof httpMocks {
    return httpMocks
}

export function resetHttpServiceMocks(): void {
    const m = httpMocks
    m.getUserRole.mockImplementation(async (userId: string) =>
        userId === 'admin-1' ? 'ADMIN' : 'USER',
    )
    m.getAdminRole.mockResolvedValue('ADMIN')
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
    m.resources.restoreResource.mockResolvedValue(true)
    m.resources.sendResourceToTrash.mockResolvedValue({ id: 't1' })
}

resetHttpServiceMocks()
