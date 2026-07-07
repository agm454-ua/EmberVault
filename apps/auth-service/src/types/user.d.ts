import type { Token } from '@agm-22/auth-utils'

export type TUserID = string

export interface TUser {
    id: TUserID
    email?: string
    username?: string
    birthdate?: string | undefined
    system_role?: TSystemRole
    root_folder: string | null | undefined
    profile_picture_url?: string | null | undefined
    storage_limit_gb?: number | null | undefined
    storage_used_gb?: number | null | undefined
    status?: string | null | undefined
}

export interface TUserWithToken {
    user: TUser
    token: Token
}

// Includes password
export interface TUserData {
    id: TUserID
    email: string
    username: string
    birthdate?: string | undefined
    system_role: TSystemRole
    password: string
    root_folder?: string | null | undefined
    profile_picture_url?: string | null | undefined
    storage_limit_gb?: number | null | undefined
    storage_used_gb?: number | null | undefined
    status?: string | null | undefined
}
