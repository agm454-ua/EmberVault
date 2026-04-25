import { client } from '@api/client'
import type { TUser, TCreateUserDTO, TUpdateUserDTO, CountUsersResponse, UsersAddedLastWeekResponse } from './user.types'
import { handleResponse, type ApiResponse } from '@/api/responses'

export const userApi = {
	// Stats
	countUsers: () => handleResponse(client.get<ApiResponse<CountUsersResponse>>('/user/api/users/count')).then((data) => data.current_users),
	listUsers: (take: string, lastCursor?: string) => {
		const params = new URLSearchParams({ take })
		if (lastCursor) params.set('lastCursor', lastCursor)

		return handleResponse(client.get<ApiResponse<TUser[]>>(`/user/api/users/all?${params.toString()}`))
	},
	usersAddedLastWeek: () => handleResponse(client.get<ApiResponse<UsersAddedLastWeekResponse>>('/user/api/users/added-last-week')).then((data) => data.added_last_week),

	// CRUD
	createUser: (data: TCreateUserDTO) => handleResponse(client.post<ApiResponse<TUser>>('/user/api/users', { ...data })),
	getUser: (userId: string) => handleResponse(client.get<ApiResponse<TUser>>(`/user/api/users/${userId}`)),
	updateUser: (userId: string, data: TUpdateUserDTO) => handleResponse(client.put<ApiResponse<TUser>>(`/user/api/users/${userId}`, { ...data })),
	deleteUser: (userId: string) => handleResponse(client.delete(`/user/api/users/${userId}`)),
	searchUsers: (query: string) => handleResponse(client.get<ApiResponse<TUser[]>>(`/user/api/users/search?query=${encodeURIComponent(query)}`)),
}

export default userApi
