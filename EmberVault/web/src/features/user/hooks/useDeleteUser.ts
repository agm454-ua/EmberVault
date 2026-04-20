import { userApi } from '@/api/user/user.api'
import { useMutation } from '@tanstack/react-query'

export const useDeleteUser = (userId: string) => {
	return useMutation({
		mutationKey: ['deleteUser', userId],
		mutationFn: () => userApi.deleteUser(userId),
	})
}

export default useDeleteUser
