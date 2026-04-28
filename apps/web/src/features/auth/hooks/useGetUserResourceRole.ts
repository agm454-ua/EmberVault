import authApi from '@/api/auth/auth.api'
import { useQuery } from '@tanstack/react-query'

export const useGetUserResourceRole = (resourceId: string, userId: string) => {
	return useQuery({
		queryKey: ['getUserResourceRole', resourceId, userId],
		queryFn: () => authApi.getUserResourceRole(resourceId, userId),
	})
}

export default useGetUserResourceRole
