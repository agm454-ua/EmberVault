import { userApi } from '@/api/user/user.api'
import { useQuery } from '@tanstack/react-query'

export const useSearchUsers = (query: string) => {
	const normalizedQuery = query.trim()

	return useQuery({
		queryKey: ['searchUsers', normalizedQuery],
		queryFn: () => userApi.searchUsers(normalizedQuery),
		enabled: normalizedQuery.length > 1,
	})
}

export default useSearchUsers
