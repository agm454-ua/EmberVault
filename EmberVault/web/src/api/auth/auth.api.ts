import { client } from '@api/client'
import type { ChangePasswordDTO, ForgotPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO, TRole, TUser, TUserWithToken } from './auth.types'
import { handleResponse, type ApiResponse } from '@/api/responses'

export const authApi = {
	// Auth
	me: () => handleResponse(client.get<ApiResponse<TUser>>('/auth/api/me')),
	login: (data: LoginDTO) => handleResponse(client.post<ApiResponse<TUserWithToken>>('/auth/api/login', { ...data })),
	register: (data: RegisterDTO) => handleResponse(client.post<ApiResponse<TUserWithToken>>('/auth/api/register', { ...data })),
	logout: () => handleResponse(client.post('/auth/api/logout')),
	refresh: () => handleResponse(client.post<ApiResponse<TUserWithToken>>('/auth/api/refresh')),

	// Password
	changePassword: (data: ChangePasswordDTO) => handleResponse(client.post('/auth/api/change-password', { ...data })),
	forgotPassword: (data: ForgotPasswordDTO) => handleResponse(client.post('/auth/api/forgot-password', { ...data })),
	resetPassword: (data: ResetPasswordDTO) => handleResponse(client.post('/auth/api/reset-password', { ...data })),

	// System Roles
	getAvailableSystemRoles: () => handleResponse(client.get<ApiResponse<TRole[]>>('/auth/api/users/roles')),
	getUserSystemRole: (userId: string) => handleResponse(client.get<ApiResponse<TRole>>(`/auth/api/users/${userId}/roles`)),
	setUserSystemRole: (userId: string, role: string) => handleResponse(client.post(`/auth/api/users/${userId}/roles/${role}`)),

	// Resource Roles
	getAvailableResourceRoles: () => handleResponse(client.get<ApiResponse<TRole[]>>('/auth/api/resource/roles')),
	listUsersWithResourceRole: (resourceId: string) => handleResponse(client.get<ApiResponse<{ userId: string; role: TRole }[]>>(`/auth/api/resource/${resourceId}/roles`)),
	getUserResourceRole: (resourceId: string, userId: string) => handleResponse(client.get<ApiResponse<TRole>>(`/auth/api/resource/${resourceId}/roles/${userId}`)),
	setUserResourceRole: (resourceId: string, userId: string, role: string) => handleResponse(client.post(`/auth/api/resource/${resourceId}/roles/${userId}/${role}`)),
	removeUserResourceRole: (resourceId: string, userId: string) => handleResponse(client.delete(`/auth/api/resource/${resourceId}/roles/${userId}`)),
}

export default authApi
