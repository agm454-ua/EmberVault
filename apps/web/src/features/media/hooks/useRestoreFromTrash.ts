import mediaApi from '@/api/media/media.api'
import { queryClient } from '@/api/queryClient'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'

export const useRestoreFromTrash = (resourceId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useMutation({
		mutationKey: ['restoreFromTrash', userId, resourceId],
		mutationFn: () => mediaApi.restoreFromTrash(userId!, resourceId),
		onSuccess: async () => {
			if (!userId) {
				return
			}

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['getTrash', userId] }),
				queryClient.invalidateQueries({ queryKey: ['listFolderResources', userId] }),
				queryClient.invalidateQueries({ queryKey: ['listFiles'] }),
			])
		},
	})
}

export default useRestoreFromTrash
