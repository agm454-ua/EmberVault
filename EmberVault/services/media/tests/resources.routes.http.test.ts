import { getHttpMocks, resetHttpServiceMocks } from './httpMocks.js'
import { createHttpTestApp } from './helpers/httpApp.js'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

const U1 = '/api/users/user-1'
const R1 = `${U1}/resources/r1`

describe('HTTP resources routes', () => {
    beforeEach(() => {
        resetHttpServiceMocks()
    })

    it('GET resource → 401 without Authorization', async () => {
        await request(createHttpTestApp()).get(R1).expect(401)
    })

    it('GET resource → 401 with invalid token', async () => {
        await request(createHttpTestApp())
            .get(R1)
            .set('Authorization', 'Bearer invalid')
            .expect(401)
    })

    it('GET resource → 403 when user lacks permission and is not owner/admin', async () => {
        getHttpMocks().isOwnerOfResource.mockResolvedValue(false)
        getHttpMocks().canUserPerformResourceAction.mockResolvedValue(false)
        const res = await request(createHttpTestApp())
            .get(R1)
            .set('Authorization', 'Bearer user-1')
            .expect(403)
        expect(res.body.success).toBe(false)
    })

    it('GET resource → 200 when admin bypasses permission checks', async () => {
        getHttpMocks().isOwnerOfResource.mockResolvedValue(false)
        getHttpMocks().canUserPerformResourceAction.mockResolvedValue(false)
        const res = await request(createHttpTestApp())
            .get(R1)
            .set('Authorization', 'Bearer admin')
            .expect(200)
        expect(res.body.success).toBe(true)
    })

    it('GET resource → 500 when admin role lookup fails', async () => {
        getHttpMocks().getAdminRole.mockResolvedValue(null as unknown as string)
        const res = await request(createHttpTestApp())
            .get(R1)
            .set('Authorization', 'Bearer user-1')
            .expect(500)
        expect(res.body.success).toBe(false)
    })

    it('GET resource → 500 when user role lookup fails', async () => {
        getHttpMocks().getUserRole.mockResolvedValue(
            null as unknown as 'ADMIN' | 'USER',
        )
        const res = await request(createHttpTestApp())
            .get(R1)
            .set('Authorization', 'Bearer user-1')
            .expect(500)
        expect(res.body.success).toBe(false)
    })

    it('GET resource → 404 when resource missing', async () => {
        getHttpMocks().resources.getResourceById.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .get(R1)
            .set('Authorization', 'Bearer user-1')
            .expect(404)
        expect(res.body.success).toBe(false)
    })

    it('GET resource → 200', async () => {
        const res = await request(createHttpTestApp())
            .get(R1)
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.data).toMatchObject({ id: 'r1' })
    })

    it('PUT resource → 400 when type invalid', async () => {
        const res = await request(createHttpTestApp())
            .put(R1)
            .set('Authorization', 'Bearer user-1')
            .send({ type: 'INVALID' })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('PUT resource → 400 when name has wrong type', async () => {
        const res = await request(createHttpTestApp())
            .put(R1)
            .set('Authorization', 'Bearer user-1')
            .send({ type: 'FILE', name: 123 })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('PUT resource → 400 when isPrivate has wrong type', async () => {
        const res = await request(createHttpTestApp())
            .put(R1)
            .set('Authorization', 'Bearer user-1')
            .send({ type: 'FILE', isPrivate: 'nope' })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('PUT resource → 400 when parentFolder has wrong type', async () => {
        const res = await request(createHttpTestApp())
            .put(R1)
            .set('Authorization', 'Bearer user-1')
            .send({ type: 'FILE', parentFolder: 1 })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('PUT resource → 404 when update fails', async () => {
        getHttpMocks().resources.updateResource.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .put(R1)
            .set('Authorization', 'Bearer user-1')
            .send({ type: 'FILE', name: 'x' })
            .expect(404)
        expect(res.body.success).toBe(false)
    })

    it('PUT resource → 200 on success', async () => {
        const res = await request(createHttpTestApp())
            .put(R1)
            .set('Authorization', 'Bearer user-1')
            .send({ type: 'FILE', name: 'renamed' })
            .expect(200)
        expect(res.body.data).toMatchObject({ name: 'updated' })
    })

    it('DELETE resource → 401 when caller is not owner nor admin', async () => {
        getHttpMocks().isOwnerOfResource.mockResolvedValue(false)
        await request(createHttpTestApp())
            .delete(R1)
            .set('Authorization', 'Bearer user-2')
            .expect(401)
    })

    it('DELETE resource → 200 when owner', async () => {
        await request(createHttpTestApp())
            .delete(R1)
            .set('Authorization', 'Bearer user-1')
            .expect(200)
    })

    it('DELETE resource → 404 when delete fails', async () => {
        getHttpMocks().resources.deleteResource.mockResolvedValue(false)
        const res = await request(createHttpTestApp())
            .delete(R1)
            .set('Authorization', 'Bearer user-1')
            .expect(404)
        expect(res.body.success).toBe(false)
    })

    it('GET search → 400 without name query', async () => {
        const res = await request(createHttpTestApp())
            .get(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .expect(400)
        expect(res.body.error).toContain('userId and query')
    })

    it('GET search → 404 when no matches', async () => {
        getHttpMocks().resources.searchByName.mockResolvedValue([])
        const res = await request(createHttpTestApp())
            .get(`${U1}/resources`)
            .query({ name: 'nope' })
            .set('Authorization', 'Bearer user-1')
            .expect(404)
        expect(res.body.success).toBe(false)
    })

    it('GET search → 500 when service returns null', async () => {
        getHttpMocks().resources.searchByName.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .get(`${U1}/resources`)
            .query({ name: 'any' })
            .set('Authorization', 'Bearer user-1')
            .expect(500)
        expect(res.body.success).toBe(false)
    })

    it('GET search → 200 when matches exist', async () => {
        const res = await request(createHttpTestApp())
            .get(`${U1}/resources`)
            .query({ name: 'doc' })
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('POST create → 400 when name missing', async () => {
        const res = await request(createHttpTestApp())
            .post(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .send({ type: 'FILE', mimeType: 'image/png' })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST create → 400 when type invalid', async () => {
        const res = await request(createHttpTestApp())
            .post(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .send({ name: 'x', type: 'DOCUMENT' })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST create → 400 when FILE without mimeType', async () => {
        const res = await request(createHttpTestApp())
            .post(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .send({ name: 'x', type: 'FILE' })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST create → 400 when parentFolder has wrong type', async () => {
        const res = await request(createHttpTestApp())
            .post(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .send({ name: 'f', type: 'FOLDER', parentFolder: 99 })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST create → 400 when isPrivate is not boolean', async () => {
        const res = await request(createHttpTestApp())
            .post(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .send({
                name: 'f',
                type: 'FOLDER',
                isPrivate: 'yes' as unknown as boolean,
            })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST create FOLDER → 400 when service fails', async () => {
        getHttpMocks().folders.createFolder.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .post(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .send({ name: 'Docs', type: 'FOLDER' })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST create FOLDER → 200', async () => {
        const res = await request(createHttpTestApp())
            .post(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .send({ name: 'Docs', type: 'FOLDER' })
            .expect(200)
        expect(res.body.data).toMatchObject({ id: 'new-folder' })
    })

    it('POST create FILE → 400 when service fails', async () => {
        getHttpMocks().files.createFile.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .post(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .send({ name: 'pic', type: 'FILE', mimeType: 'image/png' })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST create FILE → 200 includes uploadUrl', async () => {
        const res = await request(createHttpTestApp())
            .post(`${U1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .send({ name: 'pic', type: 'FILE', mimeType: 'image/png' })
            .expect(200)
        expect(res.body.data).toMatchObject({
            id: 'new-file',
            uploadUrl: 'https://upload.example/presigned',
        })
    })

    it('POST upload-complete → 401 when not owner (another user)', async () => {
        getHttpMocks().isOwnerOfResource.mockResolvedValue(false)
        await request(createHttpTestApp())
            .post(`${R1}/upload-complete`)
            .set('Authorization', 'Bearer user-2')
            .expect(401)
    })

    it('POST upload-complete → 400 when completeUpload fails', async () => {
        getHttpMocks().files.completeUpload.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .post(`${R1}/upload-complete`)
            .set('Authorization', 'Bearer user-1')
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST upload-complete → 200', async () => {
        const res = await request(createHttpTestApp())
            .post(`${R1}/upload-complete`)
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.data).toMatchObject({ ok: true })
    })

    it('POST copy → 400 when resource not found', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .post(`${R1}/copy`)
            .set('Authorization', 'Bearer user-1')
            .send({})
            .expect(400)
        expect(res.body.error).toContain('not found')
    })

    it('POST copy file → 400 when copy fails', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(true)
        getHttpMocks().files.copyFile.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .post(`${R1}/copy`)
            .set('Authorization', 'Bearer user-1')
            .send({ targetFolderId: 'f2' })
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST copy folder → 400 when copy fails', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(false)
        getHttpMocks().folders.copyFolder.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .post(`${R1}/copy`)
            .set('Authorization', 'Bearer user-1')
            .send({})
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('POST copy file → 200', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(true)
        const res = await request(createHttpTestApp())
            .post(`${R1}/copy`)
            .set('Authorization', 'Bearer user-1')
            .send({ targetFolderId: 'dest', prefix: 'Copy of ' })
            .expect(200)
        expect(res.body.data).toMatchObject({ id: 'copy-f' })
    })

    it('GET thumbnail → 200', async () => {
        const res = await request(createHttpTestApp())
            .get(`${R1}/thumbnail`)
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.data).toBe('https://thumb.example/x')
    })

    it('GET download file → 400 when presign fails', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(true)
        getHttpMocks().files.getFileDownloadUrl.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .get(`${R1}/download`)
            .set('Authorization', 'Bearer user-1')
            .expect(400)
        expect(res.body.success).toBe(false)
    })

    it('GET download → 400 when resource unknown', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .get(`${R1}/download`)
            .set('Authorization', 'Bearer user-1')
            .expect(400)
        expect(res.body.error).toContain('not found')
    })

    it('GET download folder → 200 zip body', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(false)
        const res = await request(createHttpTestApp())
            .get(`${R1}/download`)
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.headers['content-type']).toMatch(/zip/)
    })

    it('GET folder children → 404 when resource missing', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(null)
        const res = await request(createHttpTestApp())
            .get(`${R1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .expect(404)
        expect(res.body.success).toBe(false)
    })

    it('GET folder children → 400 when resource is a file', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(true)
        const res = await request(createHttpTestApp())
            .get(`${R1}/resources`)
            .set('Authorization', 'Bearer user-1')
            .expect(400)
        expect(res.body.error).toContain('file')
    })

    it('GET folder children → 200 and passes includeDeleted', async () => {
        getHttpMocks().resources.isResourceAFile.mockResolvedValue(false)
        const res = await request(createHttpTestApp())
            .get(`${R1}/resources`)
            .query({ includeDeleted: 'true' })
            .set('Authorization', 'Bearer user-1')
            .expect(200)
        expect(res.body.success).toBe(true)
        expect(
            getHttpMocks().resources.listResourcesInFolder,
        ).toHaveBeenCalledWith('r1', true)
    })
})
