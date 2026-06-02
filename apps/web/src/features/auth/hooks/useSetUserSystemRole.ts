import { authApi } from '@/api/auth/auth.api'
import queryClient from '@/api/queryClient';
import type { TUser } from '@/api/user/user.types';
import { useMutation } from '@tanstack/react-query'

export const useSetUserSystemRole = (userId: string, role: string) => {
	return useMutation({
		mutationKey: ['setUserSystemRole'],
		mutationFn: () => authApi.setUserSystemRole(userId, role),

		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ['listUsers'] })

			const previousUsers = queryClient.getQueriesData<TUser[]>({ queryKey: ['listUsers'] })

			queryClient.setQueriesData<TUser[]>(
				{ queryKey: ['listUsers'] },
				(oldData) =>
					oldData?.map((u) =>
						u.id === userId
							? { ...u, system_role: { ...u.system_role, name: role } }
							: u
					)
			)

			return { previousUsers }
		},
	})
}

export default useSetUserSystemRole
