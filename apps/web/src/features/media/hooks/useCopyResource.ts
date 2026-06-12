import mediaApi from '@/api/media/media.api'
import type { TCopyResourceRequest, TResourceResponse } from '@/api/media/media.types'
import { queryClient } from '@/api/queryClient'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'

export const useCopyResource = (resourceId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useMutation({
		mutationKey: ['copyResource', userId, resourceId],
		mutationFn: (data: TCopyResourceRequest): Promise<TResourceResponse> =>
			mediaApi.copyResource(userId!, resourceId, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['listFolderResources', userId, data.parentFolder] })
		},
	})
}

export default useCopyResource
