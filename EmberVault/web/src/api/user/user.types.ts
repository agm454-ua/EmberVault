
export type TRole = {
	id?: string
	name: string
	description?: string
}

export type TUser = {
	id: string
	username: string
	email: string
	birthdate?: string
	root_folder: string | undefined
	system_role: TRole | undefined
	profile_picture_url?: string | null
	status?: 'active' | 'suspended' | 'deleted' | string
	storage_limit_gb?: number | null
	storage_used_gb?: number | null
}

export type TCreateUserDTO = {
	username: string
	email: string
	password: string
	birthDate: string
}

export type TUpdateUserDTO = {
	email?: string
	username?: string
	birthDate?: string
	status?: 'active' | 'suspended' | 'deleted'
}

export type CountUsersResponse = {
	current_users: number
}

export type UsersAddedLastWeekResponse = {
	added_last_week: number
}
