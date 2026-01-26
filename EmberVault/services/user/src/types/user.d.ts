import type { TSystemRoleID } from "./roles.js"

export type TUserID = string

export interface TUser {
    id: TUserID
    username: string
    email: string
    profilePictureURL: string
    systemRole: TSystemRoleID
}

export interface TCreateUserRequest {
    id: TUserID
    username: string
    email: string
    profilePictureURL?: string
    password: string
    birthDate: string
}