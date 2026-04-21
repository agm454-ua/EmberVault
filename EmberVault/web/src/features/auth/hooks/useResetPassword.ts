import authApi from '@/api/auth/auth.api'
import { queryClient } from '@/api/queryClient'
import { useMutation } from '@tanstack/react-query'

export const useResetPassword = () => {
	return useMutation({
		mutationKey: ['resetPassword'],
		mutationFn: authApi.resetPassword,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['me'] })
		},
	})
}

export default useResetPassword
