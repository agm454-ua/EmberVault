import authApi from '@/api/auth/auth.api'
import { useQuery } from '@tanstack/react-query'

export const useGetAvailableSystemRoles = () => {
	return useQuery({
		queryKey: ['getAvailableSystemRoles'],
		queryFn: authApi.getAvailableSystemRoles,
	})
}

export default useGetAvailableSystemRoles
