import mediaApi from '@/api/media/media.api'
import { queryClient } from '@/api/queryClient'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'

export const useDeleteResource = (userId: string, resourceId: string) => {
	let userIdToUse = userId
	const { data: dataUser } = useMe()
	if (!userId) {
		userIdToUse = dataUser?.id ?? ''
	}

	return useMutation({
		mutationKey: ['deleteResource', userIdToUse, resourceId],
		mutationFn: () => mediaApi.deleteResource(userIdToUse!, resourceId),
		onSuccess: async () => {
			const isUserAvailable = Boolean(userIdToUse)

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['listFiles'] }),
				queryClient.invalidateQueries({ queryKey: ['getStorageUsed'] }),
				queryClient.invalidateQueries({ queryKey: ['getFileCount'] }),
				queryClient.invalidateQueries({ queryKey: ['getTrash'] }),
				...(isUserAvailable
					? [
							queryClient.invalidateQueries({ queryKey: ['getResource', userIdToUse, resourceId] }),
							queryClient.invalidateQueries({ queryKey: ['listFolderResources', userIdToUse] }),
						]
					: []),
			])
		},
	})
}

export default useDeleteResource
