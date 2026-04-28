import mediaApi from '@/api/media/media.api'
import useMe from '@/features/auth/hooks/useMe'
import { useQuery } from '@tanstack/react-query'

export const useSearchResources = (query: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useQuery({
		queryKey: ['searchResources', userId, query],
		queryFn: () => mediaApi.searchResources(userId!, query),
		enabled: !!userId,
	})
}

export default useSearchResources
