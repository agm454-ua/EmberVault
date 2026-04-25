import mediaApi from '@/api/media/media.api'
import { queryClient } from '@/api/queryClient'
import type { TCreateResourceRequest, TCreateResourceResponse } from '@/api/media/media.types'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

export type TCreateResourceMutationInput = TCreateResourceRequest & {
	file?: File
}

const getUploadUrl = (resource: TCreateResourceResponse): string | null => {
	if (typeof resource.uploadUrl === 'string') {
		return resource.uploadUrl
	}

	if (typeof resource.presignedURL === 'string') {
		return resource.presignedURL
	}

	if (typeof resource.presignedUrl === 'string') {
		return resource.presignedUrl
	}

	return null
}

export const useCreateResource = () => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useMutation({
		mutationKey: ['createResource', userId],
		mutationFn: async (data: TCreateResourceMutationInput) => {
			if (!userId) {
				throw new Error('Missing authenticated user')
			}

			const { file, ...resourceData } = data
			const resourcePayload: TCreateResourceRequest = {
				...resourceData,
				parentFolder: resourceData.parentFolder ?? dataUser?.root_folder ?? null,
				mimeType:
					resourceData.type === 'FILE'
						? (resourceData.mimeType ?? file?.type ?? 'application/octet-stream')
						: undefined,
			}

			const createdResource = await mediaApi.createResource(userId, resourcePayload)

			if (resourcePayload.type !== 'FILE') {
				return createdResource
			}

			if (!file) {
				throw new Error('A file is required when creating a FILE resource')
			}

			const uploadUrl = getUploadUrl(createdResource)
			if (!uploadUrl) {
				throw new Error('Upload URL missing in createResource response')
			}

			await axios.put(uploadUrl, file, {
				headers: {
					'Content-Type': resourcePayload.mimeType ?? file.type ?? 'application/octet-stream',
				},
			})

			return mediaApi.completeUpload(userId, createdResource.id)
		},
		onSuccess: async (resource) => {
			if (!userId || !resource) {
				return
			}

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['listFolderResources', userId] }),
				queryClient.invalidateQueries({ queryKey: ['getResource', userId, resource.id] }),
				queryClient.invalidateQueries({ queryKey: ['listFiles'] }),
				queryClient.invalidateQueries({ queryKey: ['getStorageUsed'] }),
				queryClient.invalidateQueries({ queryKey: ['getFileCount'] }),
			])
		},
	})
}

export default useCreateResource
