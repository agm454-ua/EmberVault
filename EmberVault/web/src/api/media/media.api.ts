import { client } from '@api/client'
import { handleResponse, type ApiResponse } from '@/api/responses'
import type { TResourceResponse, TUpdateResourceRequest, TCreateResourceRequest, TCopyResourceRequest, TCreateResourceResponse } from './media.types'

export const mediaApi = {
	uploadAvatar: (file: File, userId: string) => {
		const formData = new FormData()
		formData.append('avatar', file)
		return client
			.post(`/media/api/users/${userId}/avatar/upload`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
			.then((res) => res.data)
	},

	deleteAvatar: (userId: string) => {
		return client
			.delete(`/media/api/users/${userId}/avatar`)
			.then((res) => res.data)
	},

	// Stats
	getStorageUsed: () => handleResponse(client.get<ApiResponse<string>>('/media/api/stats/storage-used')),
	getFileCount: () => handleResponse(client.get<ApiResponse<number>>('/media/api/stats/files/count')),
	listFiles: (includeDeleted?: boolean, lastCursor?: string, take?: number) => {
		const params = new URLSearchParams()
		if (includeDeleted !== undefined) params.append('includeDeleted', includeDeleted ? 'true' : 'false')
		if (lastCursor) params.append('lastCursor', lastCursor)
		if (take) params.append('take', take.toString())

		return handleResponse(client.get(`/media/api/stats/files?${params.toString()}`))
	},

	// Resources
	getResource: (userId: string, resourceId: string) => handleResponse(client.get<ApiResponse<TResourceResponse>>(`/media/api/users/${userId}/resources/${resourceId}`)),
	updateResource: (userId: string, resourceId: string, data: TUpdateResourceRequest) => handleResponse(client.put(`/media/api/users/${userId}/resources/${resourceId}`, { ...data })),
	deleteResource: (userId: string, resourceId: string) => handleResponse(client.delete(`/media/api/users/${userId}/resources/${resourceId}`)),

	createResource: (userId: string, data: TCreateResourceRequest) => handleResponse(client.post<ApiResponse<TCreateResourceResponse>>(`/media/api/users/${userId}/resources`, { ...data })),
	completeUpload: (userId: string, resourceId: string) => handleResponse(client.post<ApiResponse<TResourceResponse>>(`/media/api/users/${userId}/resources/${resourceId}/upload-complete`)),
	downloadResource: async (userId: string, resourceId: string) => {
		const res = await client.get(`/media/api/users/${userId}/resources/${resourceId}/download`, { responseType: 'blob' })
		const contentType = String(res.headers['content-type'] ?? '')

		// Backward compatibility: some deployments still return JSON with a presigned URL.
		if (contentType.includes('application/json')) {
			try {
				const text = await res.data.text()
				const payload = JSON.parse(text) as { data?: unknown }
				if (typeof payload.data === 'string') {
					return payload.data
				}
			} catch {
				// If parsing fails, fall through and treat it as a blob download.
			}
		}

		return res.data as Blob
	},

	searchResources: (userId: string, query: string) => handleResponse(client.get<ApiResponse<TResourceResponse[]>>(`/media/api/users/${userId}/resources?name=${encodeURIComponent(query)}`)),
	copyResource: (userId: string, resourceId: string, data: TCopyResourceRequest) => handleResponse(client.post(`/media/api/users/${userId}/resources/${resourceId}/copy`, { ...data })),
	getThumbnail: (userId: string, resourceId: string) => handleResponse(client.get<ApiResponse<string | null>>(`/media/api/users/${userId}/resources/${resourceId}/thumbnail`)),
	listFolderResources: (userId: string, folderId: string, includeDeleted?: boolean) => {
		const params = new URLSearchParams()
		if (includeDeleted !== undefined) {
			params.append('includeDeleted', includeDeleted ? 'true' : 'false')
		}

		const query = params.toString()
		return handleResponse(
			client.get<ApiResponse<TResourceResponse[]>>(
				`/media/api/users/${userId}/resources/${folderId}/resources${query ? `?${query}` : ''}`,
			),
		)
	},

	// Trash
	getTrash: (userId: string, lastCursor?: string, take?: number) => {
		const params = new URLSearchParams()
		if (lastCursor) params.append('lastCursor', lastCursor)
		if (take) params.append('take', take.toString())

		return handleResponse(client.get<ApiResponse<TResourceResponse[]>>(`/media/api/users/${userId}/trash?${params.toString()}`))
	},
	restoreFromTrash: (userId: string, resourceId: string) => handleResponse(client.post(`/media/api/users/${userId}/resources/${resourceId}/restore`)),
	deleteFromTrash: (userId: string, resourceId: string) => handleResponse(client.delete(`/media/api/users/${userId}/trash/${resourceId}`)),
	restoreAllFromTrash: (userId: string) => handleResponse(client.post(`/media/api/users/${userId}/trash/restore-all`)),
	deleteAllFromTrash: (userId: string) => handleResponse(client.delete(`/media/api/users/${userId}/trash`)),
}

export default mediaApi
