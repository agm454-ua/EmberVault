import { userApi } from '@/api/user/user.api'
import { useQuery } from '@tanstack/react-query'

export const useGetUser = (userId: string) => {
	return useQuery({
		queryKey: ['getUser', userId],
		queryFn: () => userApi.getUser(userId),
		enabled: !!userId,
	})
}

export default useGetUser
