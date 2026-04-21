import { authApi } from '@/api/auth/auth.api'
import { useAuthStore } from '../stores/authStore'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/api/queryClient'
import { useNavigate } from 'react-router-dom'
import { routes } from '@/core/config/constants'

export const useLogout = () => {
	const setAccessToken = useAuthStore((s) => s.setAccessToken)
	const navigate = useNavigate()

	return useMutation({
		mutationKey: ['logout'],
		mutationFn: authApi.logout,
		onSuccess: () => {
			setAccessToken(null)
			queryClient.setQueryData(['me'], null)
			navigate(routes.login)
		},
	})
}

export default useLogout
