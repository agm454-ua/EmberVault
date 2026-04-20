import mediaApi from '@/api/media/media.api'
import type { TCopyResourceRequest } from '@/api/media/media.types'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'

export const useCopyResource = (resourceId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useMutation({
		mutationKey: ['copyResource', userId, resourceId],
		mutationFn: (data: TCopyResourceRequest) => mediaApi.copyResource(userId!, resourceId, data),
	})
}

export default useCopyResource
