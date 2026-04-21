import authApi from '@/api/auth/auth.api'
import { useQuery } from '@tanstack/react-query'

export const useGetUserSystemRole = (userId: string) => {
	return useQuery({
		queryKey: ['getUserSystemRole', userId],
		queryFn: () => authApi.getUserSystemRole(userId),
	})
}

export default useGetUserSystemRole
