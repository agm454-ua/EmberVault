import { authApi } from '@/api/auth/auth.api'
import { useAuthStore } from '../stores/authStore'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/api/queryClient'

export const useRefresh = () => {
	const setAccessToken = useAuthStore((s) => s.setAccessToken)
	return useMutation({
		mutationKey: ['refresh'],
		mutationFn: authApi.refresh,
		onSuccess: (data) => {
			setAccessToken(data.token)
			queryClient.setQueryData(['me'], data.user)
		},
	})
}

export default useRefresh
