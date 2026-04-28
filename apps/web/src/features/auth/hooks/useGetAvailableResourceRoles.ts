import authApi from '@/api/auth/auth.api'
import { useQuery } from '@tanstack/react-query'

export const useGetAvailableResourceRoles = () => {
	return useQuery({
		queryKey: ['getAvailableResourceRoles'],
		queryFn: authApi.getAvailableResourceRoles,
	})
}

export default useGetAvailableResourceRoles
