import { authApi } from '@/api/auth/auth.api'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { queryClient } from '@/api/queryClient'

export const useRegister = () => {
	const setAccessToken = useAuthStore((s) => s.setAccessToken)
	return useMutation({
		mutationKey: ['register'],
		mutationFn: authApi.register,
		onSuccess: (data) => {
			setAccessToken(data.token)
			queryClient.setQueryData(['me'], data.user)
		},
	})
}

export default useRegister
