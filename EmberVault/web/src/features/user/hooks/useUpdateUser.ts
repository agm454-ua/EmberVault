import { userApi } from '@/api/user/user.api'
import type { TUpdateUserDTO } from '@/api/user/user.types'
import { useMutation } from '@tanstack/react-query'

export const useUpdateUser = (userId: string) => {
	return useMutation({
		mutationKey: ['updateUser', userId],
		mutationFn: (data: TUpdateUserDTO) => userApi.updateUser(userId, data),
	})
}

export default useUpdateUser
