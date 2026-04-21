import authApi from '@/api/auth/auth.api'
import { useQuery } from '@tanstack/react-query'

export const useMe = () => {
	return useQuery({
		queryKey: ['me'],
		queryFn: () => authApi.me(),
		retry: false,
	})
}

export default useMe
