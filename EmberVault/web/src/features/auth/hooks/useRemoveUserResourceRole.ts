import { authApi } from '@/api/auth/auth.api'
import { useMutation } from '@tanstack/react-query'

export const useRemoveUserResourceRole = (resourceId: string, userId: string) => {
	return useMutation({
		mutationKey: ['removeUserResourceRole'],
		mutationFn: () => authApi.removeUserResourceRole(resourceId, userId),
	})
}

export default useRemoveUserResourceRole
