import type { TSystemRoleID } from './roles.js'

export type TUserID = string

export interface TUser {
    id: TUserID
    systemRole: TSystemRoleID
}
