import authApi from '@/api/auth/auth.api'
import { useMutation } from '@tanstack/react-query'

export const useForgotPassword = () => {
	return useMutation({
		mutationKey: ['forgotPassword'],
		mutationFn: (email: string) => authApi.forgotPassword({ email }),
	})
}

export default useForgotPassword
