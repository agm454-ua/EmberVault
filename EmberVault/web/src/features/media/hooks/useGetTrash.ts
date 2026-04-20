import mediaApi from '@/api/media/media.api'
import useMe from '@/features/auth/hooks/useMe'
import { useQuery } from '@tanstack/react-query'

export const useGetTrash = (lastCursor?: string, take?: number) => {
	const { data: dataUser } = useMe()
	const userId = dataUser?.id

	return useQuery({
		queryKey: ['getTrash', userId, lastCursor, take],
		queryFn: () => mediaApi.getTrash(userId!, lastCursor, take),
		enabled: !!userId,
	})
}

export default useGetTrash
