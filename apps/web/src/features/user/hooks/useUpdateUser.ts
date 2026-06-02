import queryClient from '@/api/queryClient';
import { userApi } from '@/api/user/user.api'
import type { TUpdateUserDTO, TUser } from '@/api/user/user.types'
import { useMutation } from '@tanstack/react-query'

export const useUpdateUser = (userId: string) => {
	return useMutation({
		mutationKey: ['updateUser', userId],
		mutationFn: (data: TUpdateUserDTO) => userApi.updateUser(userId, data),
		onMutate: async (data) => {
			await queryClient.cancelQueries({ queryKey: ['listUsers'] })

			const previousUsers = queryClient.getQueriesData<TUser[]>({ queryKey: ['listUsers'] })

			queryClient.setQueriesData<TUser[]>(
				{ queryKey: ['listUsers'] },
				(oldData) => oldData?.map((u) => u.id === userId ? { ...u, ...data } : u)
			)

			return { previousUsers }
		}
	})
}

export default useUpdateUser
