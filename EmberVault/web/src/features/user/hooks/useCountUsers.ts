import { userApi } from '@/api/user/user.api'
import { useQuery } from '@tanstack/react-query'

export const useCountUsers = () => {
	return useQuery({
		queryKey: ['countUsers'],
		queryFn: userApi.countUsers,
	})
}

export default useCountUsers
