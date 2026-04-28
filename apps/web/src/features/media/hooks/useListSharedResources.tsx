import mediaApi from '@/api/media/media.api'
import useMe from '@/features/auth/hooks/useMe'
import { useQuery } from '@tanstack/react-query'

export const useListSharedResources = () => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id
	const hasRequiredParams = Boolean(userId)

	return useQuery({
		queryKey: ['listSharedResources', userId],
		queryFn: () => mediaApi.listSharedResources(userId!),
		enabled: hasRequiredParams,
	})
}

export default useListSharedResources
