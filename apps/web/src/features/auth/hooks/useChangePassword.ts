import authApi from '@/api/auth/auth.api'
import { queryClient } from '@/api/queryClient'
import { useMutation } from '@tanstack/react-query'

export const useChangePassword = () => {
	return useMutation({
		mutationKey: ['changePassword'],
		mutationFn: authApi.changePassword,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['me'] })
		},
	})
}

export default useChangePassword
