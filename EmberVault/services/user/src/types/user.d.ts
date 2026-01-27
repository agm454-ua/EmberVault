import type { TSystemRoleID } from "./roles.js"
import type { Decimal } from '@prisma/client/runtime/client'

export type TUserID = string

export interface TUser {
    id: TUserID
    username: string
    email: string
    avatarURL?: string | null
    systemRole: TSystemRoleID
    status?: string | null
    storageLimitGB?: number | null
    storageUsedGB?: Decimal | null
}

export interface TCreateUserRequest {
    username: string
    email: string
    avatarURL?: string
    password: string
    birthDate: string
}

export interface TUpdateUserRequest {
    username?: string
    email?: string
    avatarURL?: string
    birthDate?: string
    systemRole?: string
    status?: string
    storageLimitGB?: number
}