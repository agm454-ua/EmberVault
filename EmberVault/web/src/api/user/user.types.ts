
export type TRole = {
	id?: string
	name: string
	description?: string
}

export type TUser = {
	id: string
	email: string
	username: string
	system_role: TRole | undefined
	status?: 'active' | 'suspended' | 'deleted' | string
	birthDate?: string
	birthdate?: string
	createdAt?: string
	updatedAt?: string
	avatarURL?: string | null
	profilePictureUrl?: string | null
	root_folder: string | undefined
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
	avatarURL?: string | null
	status?: 'active' | 'suspended' | 'deleted'
}

export type CountUsersResponse = {
	current_users: number
}

export type UsersAddedLastWeekResponse = {
	added_last_week: number
}
