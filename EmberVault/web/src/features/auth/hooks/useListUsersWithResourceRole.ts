import authApi from '@/api/auth/auth.api'
import { useQuery } from '@tanstack/react-query'

export const useListUsersWithResourceRole = (resourceId: string, userId: string) => {
	return useQuery({
		queryKey: ['listUsersWithResourceRole', resourceId, userId],
		queryFn: () => authApi.listUsersWithResourceRole(resourceId),
	})
}

export default useListUsersWithResourceRole
