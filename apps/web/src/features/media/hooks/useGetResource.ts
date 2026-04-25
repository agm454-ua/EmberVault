import mediaApi from '@/api/media/media.api'
import useMe from '@/features/auth/hooks/useMe'
import { useQuery } from '@tanstack/react-query'

export const useGetResource = (resourceId: string) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useQuery({
		queryKey: ['getResource', userId, resourceId],
		queryFn: () => mediaApi.getResource(userId!, resourceId),
		enabled: !!userId,
	})
}

export default useGetResource
