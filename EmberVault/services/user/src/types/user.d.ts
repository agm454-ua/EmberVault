import type { TSystemRole } from './roles.js'
import type { Decimal } from '@prisma/client/runtime/client'

export type TUserID = string

export interface TUser {
    id: TUserID
    username: string
    email: string
    profile_picture_url?: string | null
    system_role: TSystemRole
    status?: string | null
    storageLimitGB?: number | null
    storageUsedGB?: Decimal | null
}

export interface TCreateUserRequest {
    username: string
    email: string
    profile_picture_url?: string
    password: string
    birthDate: string
}

export interface TUpdateUserRequest {
    username?: string
    email?: string
    birthDate?: string
    status?: string
    storageLimitGB?: number
}
