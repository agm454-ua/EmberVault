import { getHttpMocks, resetHttpServiceMocks } from './httpMocks.js'
import { createHttpTestApp } from './helpers/httpApp.js'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

const trashFor = (userId: string) => `/api/users/${userId}/trash`
const restoreAllFor = (userId: string) => `/api/users/${userId}/trash/restore-all`
const trashR1 = '/api/users/user-1/resources/r1/trash'
const restoreR1 = '/api/users/user-1/resources/r1/restore'
const deleteTrashR1 = '/api/users/user-1/trash/r1'

describe('HTTP trash routes', () => {
    beforeEach(() => {
        resetHttpServiceMocks()
    })

    it('GET trash → 401 without token', async () => {
        await request(createHttpTestApp()).get(trashFor('user-1')).expect(401)
    })

    it('GET trash → 401 when user is neither self nor admin', async () => {
        await request(createHttpTestApp())
            .get(trashFor('user-1'))
            .set('Authorization', 'Bearer user-2')
            .expect(401)
    })

    it('GET trash → 500 when admin role missing (admin acting for another user)', async () => {
        getHttpMocks().getAdminRole.mockResolvedValue(null as any)
        const res = await request(createHttpTestApp())
            .get(trashFor('user-1'))
            .set('Authorization', 'Bearer admin')
            .expect(500)
        expect(res.body.success).toBe(false)
    })

    it('GET trash → 200 for same user', async () => {
        const res = await request(createHttpTestApp())
            .get(trashFor('user-1'))
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.success).toBe(true)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('GET trash → 200 for admin listing another user trash', async () => {
        const res = await request(createHttpTestApp())
            .get(trashFor('user-1'))
            .set('Authorization', 'Bearer admin')
            .expect(200)
        expect(res.body.success).toBe(true)
    })

    it('GET trash → 400 when service returns null', async () => {
        getHttpMocks().resources.listResourcesInTrash.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .get(trashFor('user-1'))
            .set('Authorization', 'Bearer user-1')
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST restore-all → 401 for wrong user', async () => {
        await request(createHttpTestApp())
            .post(restoreAllFor('user-1'))
            .set('Authorization', 'Bearer user-2')
            .expect(401)
    })

    it('POST restore-all → 500 when restoreAll fails', async () => {
        getHttpMocks().resources.restoreAll.mockResolvedValue(false)
        const res = await request(createHttpTestApp())
            .post(restoreAllFor('user-1'))
            .set('Authorization', 'Bearer user-1')
            .expect(500)
        expect(res.body.success).toBe(false)
    })

    it('POST restore-all → 200 on success', async () => {
        const res = await request(createHttpTestApp())
            .post(restoreAllFor('user-1'))
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.success).toBe(true)
    })

    it('DELETE trash (delete all) → 401 for wrong user', async () => {
        await request(createHttpTestApp())
            .delete(trashFor('user-1'))
            .set('Authorization', 'Bearer user-2')
            .expect(401)
    })

    it('DELETE trash (delete all) → 500 when deleteAllFromTrash fails', async () => {
        getHttpMocks().resources.deleteAllFromTrash.mockResolvedValue(false)
        const res = await request(createHttpTestApp())
            .delete(trashFor('user-1'))
            .set('Authorization', 'Bearer user-1')
            .expect(500)
        expect(res.body.success).toBe(false)
    })

    it('DELETE trash (delete all) → 200 on success', async () => {
        const res = await request(createHttpTestApp())
            .delete(trashFor('user-1'))
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.success).toBe(true)
    })

    it('POST resource trash → 401 for wrong user', async () => {
        await request(createHttpTestApp())
            .post(trashR1)
            .set('Authorization', 'Bearer user-2')
            .expect(401)
    })

    it('POST resource trash → 400 when service fails', async () => {
        getHttpMocks().resources.sendResourceToTrash.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .post(trashR1)
            .set('Authorization', 'Bearer user-1')
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST resource trash → 200 returns payload', async () => {
        const res = await request(createHttpTestApp())
            .post(trashR1)
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.data).toMatchObject({ id: 't1' })
    })

    it('POST restore → 401 for wrong user', async () => {
        await request(createHttpTestApp())
            .post(restoreR1)
            .set('Authorization', 'Bearer user-2')
            .expect(401)
    })

    it('POST restore → 400 when restore fails', async () => {
        getHttpMocks().resources.restoreResource.mockResolvedValue(false)
        const res = await request(createHttpTestApp())
            .post(restoreR1)
            .set('Authorization', 'Bearer user-1')
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST restore → 200', async () => {
        const res = await request(createHttpTestApp())
            .post(restoreR1)
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.success).toBe(true)
    })

    it('DELETE trash resource → 401 for wrong user', async () => {
        await request(createHttpTestApp())
            .delete(deleteTrashR1)
            .set('Authorization', 'Bearer user-2')
            .expect(401)
    })

    it('DELETE trash resource → 404 when delete fails', async () => {
        getHttpMocks().resources.deleteResourceFromTrash.mockResolvedValue(false)
        const res = await request(createHttpTestApp())
            .delete(deleteTrashR1)
            .set('Authorization', 'Bearer user-1')
            .expect(404)
        expect(res.body.success).toBe(false)
    })

    it('DELETE trash resource → 200 on success', async () => {
        const res = await request(createHttpTestApp())
            .delete(deleteTrashR1)
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.success).toBe(true)
    })
})
