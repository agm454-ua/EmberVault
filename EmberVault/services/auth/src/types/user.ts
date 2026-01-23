import type { Token } from '@agm454-ua/auth-utils'

export type TUserID = string

export interface TUser {
    id: TUserID
    username?: string
    email?: string
    userRole?: string
}

export interface TUserWithToken {
    user: TUser
    token: Token
}

export interface TUserData {
    id: TUserID
    email: string
    username: string
    system_role: string
    password: string
}
