import queryClient from '@/api/queryClient'
import { userApi } from '@/api/user/user.api'
import { useMutation } from '@tanstack/react-query'

export const useCreateUser = () => {
	return useMutation({
		mutationKey: ['createUser'],
		mutationFn: userApi.createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['listUsers'] })
		},
	})
}

export default useCreateUser
