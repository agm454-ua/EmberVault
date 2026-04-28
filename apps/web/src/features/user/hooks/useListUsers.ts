import { userApi } from '@/api/user/user.api'
import { useQuery } from '@tanstack/react-query'

export const useListUsers = (take: string, lastCursor?: string) => {
	return useQuery({
		queryKey: ['listUsers', take, lastCursor],
		queryFn: () => userApi.listUsers(take, lastCursor),
	})
}

export default useListUsers
