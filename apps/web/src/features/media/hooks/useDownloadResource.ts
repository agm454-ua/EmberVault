import mediaApi from '@/api/media/media.api'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'

export const useDownloadResource = (resourceId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useMutation({
		mutationKey: ['downloadResource', userId, resourceId],
		mutationFn: () => mediaApi.downloadResource(userId!, resourceId),
	})
}

export default useDownloadResource
