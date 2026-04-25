import mediaApi from '@/api/media/media.api'
import type { TUpdateResourceRequest } from '@/api/media/media.types'
import { queryClient } from '@/api/queryClient'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'

export const useUpdateResource = (resourceId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useMutation({
		mutationKey: ['updateResource', userId, resourceId],
		mutationFn: (data: TUpdateResourceRequest) => mediaApi.updateResource(userId!, resourceId, data),
		onSuccess: async () => {
			if (!userId) {
				return
			}

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['getResource', userId, resourceId] }),
				queryClient.invalidateQueries({ queryKey: ['listFolderResources', userId] }),
				queryClient.invalidateQueries({ queryKey: ['listFiles'] }),
			])
		},
	})
}

export default useUpdateResource
