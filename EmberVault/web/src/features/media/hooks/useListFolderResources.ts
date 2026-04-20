import mediaApi from '@/api/media/media.api'
import useMe from '@/features/auth/hooks/useMe'
import { useQuery } from '@tanstack/react-query'

export const useListFolderResources = (folderId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id
	const hasRequiredParams = Boolean(userId && folderId)

	return useQuery({
		queryKey: ['listFolderResources', userId, folderId],
		queryFn: () => mediaApi.listFolderResources(userId!, folderId),
		enabled: hasRequiredParams,
	})
}

export default useListFolderResources
