export type TSystemRoleID = string

import type { TResourceID } from './resource.js'
import type { TUserID } from './user.ts'

export type TResourceRoleID = string
export type TSystemRoleID = string

export const OWNER_ROLE = 'owner'

export interface TUserResourcePermissions {
    userId: TUserID
    resourceRoleId: TResourceRoleID
    roleName: string
    username: string
    email: string
    resourceName: string
}

export interface TSystemRole {
    id?: TSystemRoleID
    name: string
    description: string | null
}

export interface TUserIsResourceRoleForResource {
    userId: TUserID
    resourceRoleId: TResourceRoleID
    resourceId: TResourceID
}
