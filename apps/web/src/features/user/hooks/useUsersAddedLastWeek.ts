import { userApi } from '@/api/user/user.api'
import { useQuery } from '@tanstack/react-query'

export const useUsersAddedLastWeek = () => {
	return useQuery({
		queryKey: ['usersAddedLastWeek'],
		queryFn: userApi.usersAddedLastWeek,
	})
}

export default useUsersAddedLastWeek
