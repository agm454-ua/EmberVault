import mediaApi from '@/api/media/media.api'
import { queryClient } from '@/api/queryClient'
import useMe from '@/features/auth/hooks/useMe'
import { useMutation } from '@tanstack/react-query'

export const useDeleteFromTrash = (resourceId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useMutation({
		mutationKey: ['deleteFromTrash', userId, resourceId],
		mutationFn: () => mediaApi.deleteFromTrash(userId!, resourceId),
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

export default useDeleteFromTrash
