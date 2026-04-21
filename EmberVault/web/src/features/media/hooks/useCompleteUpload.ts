import mediaApi from '@/api/media/media.api'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'

export const useCompleteUpload = (resourceId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useMutation({
		mutationKey: ['completeUpload', userId, resourceId],
		mutationFn: () => mediaApi.completeUpload(userId!, resourceId),
	})
}

export default useCompleteUpload
