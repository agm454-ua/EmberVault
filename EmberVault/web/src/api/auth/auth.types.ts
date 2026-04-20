import type { TUser } from "../user/user.types"

export type LoginDTO = {
	email?: string
	username?: string
	password: string
}

export type TUserWithToken = {
	token: string
	user: TUser
}

export type RegisterDTO = {
	email: string
	username: string
	password: string
	confirmPassword: string
	birthDate: string
}

export type ChangePasswordDTO = {
	oldPassword: string
	newPassword: string
	confirmNewPassword: string
}

export type ForgotPasswordDTO = {
	email: string
}

export type ResetPasswordDTO = {
	id: string
	code: string
	password: string
}
