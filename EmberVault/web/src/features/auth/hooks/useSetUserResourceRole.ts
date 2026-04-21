import { authApi } from '@/api/auth/auth.api'
import { useMutation } from '@tanstack/react-query'

export const useSetUserResourceRole = (resourceId: string, userId: string, role: string) => {
	return useMutation({
		mutationKey: ['setUserResourceRole'],
		mutationFn: () => authApi.setUserResourceRole(resourceId, userId, role),
	})
}

export default useSetUserResourceRole
