import mediaApi from '@/api/media/media.api'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'

export const useGetThumbnail = (resourceId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useMutation({
		mutationKey: ['getThumbnail', userId, resourceId],
		mutationFn: () => mediaApi.getThumbnail(userId!, resourceId),
	})
}

export default useGetThumbnail
