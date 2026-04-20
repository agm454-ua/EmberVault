import { authApi } from '@/api/auth/auth.api'
import { useMutation } from '@tanstack/react-query'

export const useSetUserSystemRole = (userId: string, role: string) => {
	return useMutation({
		mutationKey: ['setUserSystemRole'],
		mutationFn: () => authApi.setUserSystemRole(userId, role),
	})
}

export default useSetUserSystemRole
