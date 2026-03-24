import { getHttpMocks, resetHttpServiceMocks } from './httpMocks.js'
import { createHttpTestApp } from './helpers/httpApp.js'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

describe('HTTP stats routes', () => {
    beforeEach(() => {
        resetHttpServiceMocks()
    })

    it('GET /api/health → 200', async () => {
        const res = await request(createHttpTestApp())
            .get('/api/health')
            .expect(200)
        expect(res.body).toEqual({ message: 'ok' })
    })

    it('GET /api/stats/storage-used → 401 without token', async () => {
        await request(createHttpTestApp())
            .get('/api/stats/storage-used')
            .expect(401)
    })

    it('GET /api/stats/storage-used → 401 for non-admin', async () => {
        await request(createHttpTestApp())
            .get('/api/stats/storage-used')
            .set('Authorization', 'Bearer user-1')
            .expect(401)
    })

    it('GET /api/stats/storage-used → 500 when admin role is not configured', async () => {
        getHttpMocks().getAdminRole.mockResolvedValue(null as unknown as string)
        const res = await request(createHttpTestApp())
            .get('/api/stats/storage-used')
            .set('Authorization', 'Bearer admin')
            .expect(500)
        expect(res.body.success).toBe(false)
    })

    it('GET /api/stats/storage-used → 200 with data for admin', async () => {
        const res = await request(createHttpTestApp())
            .get('/api/stats/storage-used')
            .set('Authorization', 'Bearer admin')
            .expect(200)

        expect(res.body).toMatchObject({
            success: true,
            data: '10 MB',
        })
    })

    it('GET /api/stats/storage-used → 500 when service returns null', async () => {
        getHttpMocks().files.getStorageUsed.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .get('/api/stats/storage-used')
            .set('Authorization', 'Bearer admin')
            .expect(500)

        expect(res.body.success).toBe(false)
    })

    it('GET /api/stats/files/count → 200 and allows zero files', async () => {
        getHttpMocks().files.getFileCount.mockResolvedValue(0)
        const res = await request(createHttpTestApp())
            .get('/api/stats/files/count')
            .set('Authorization', 'Bearer admin')
            .expect(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toBe(0)
    })

    it('GET /api/stats/files/count → 500 when count is null', async () => {
        getHttpMocks().files.getFileCount.mockResolvedValue(
            null as unknown as number,
        )
        const res = await request(createHttpTestApp())
            .get('/api/stats/files/count')
            .set('Authorization', 'Bearer admin')
            .expect(500)
        expect(res.body.success).toBe(false)
    })

    it('GET /api/stats/files → forwards query to listAllFiles', async () => {
        await request(createHttpTestApp())
            .get('/api/stats/files')
            .query({
                includeDeleted: 'true',
                lastCursor: 'cursor-1',
                take: '25',
            })
            .set('Authorization', 'Bearer admin')
            .expect(200)

        expect(getHttpMocks().files.listAllFiles).toHaveBeenCalledWith(
            true,
            'cursor-1',
            '25',
        )
    })

    it('GET /api/stats/files → treats includeDeleted=1 as true', async () => {
        await request(createHttpTestApp())
            .get('/api/stats/files')
            .query({ includeDeleted: '1' })
            .set('Authorization', 'Bearer admin')
            .expect(200)

        expect(getHttpMocks().files.listAllFiles).toHaveBeenCalledWith(
            true,
            undefined,
            undefined,
        )
    })

    it('GET /api/stats/files → 500 when listAllFiles returns null', async () => {
        getHttpMocks().files.listAllFiles.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .get('/api/stats/files')
            .set('Authorization', 'Bearer admin')
            .expect(500)
        expect(res.body.success).toBe(false)
    })
})
