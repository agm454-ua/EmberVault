import mediaApi from '@/api/media/media.api'
import useMe from '@/features/auth/hooks/useMe'
import { useQuery } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'

type UseListFolderResourcesOptions = {
	includeDeleted?: boolean
}

export const useListFolderResources = (folderId: string, options?: UseListFolderResourcesOptions) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id
	const hasRequiredParams = Boolean(userId && folderId)
	const includeDeleted = options?.includeDeleted

	return useQuery({
		queryKey: ['listFolderResources', userId, folderId, includeDeleted],
		queryFn: () => mediaApi.listFolderResources(userId!, folderId, includeDeleted),
		enabled: hasRequiredParams,
		placeholderData: keepPreviousData,
	})
}

export default useListFolderResources
