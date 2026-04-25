export type TSystemRoleID = string


export interface TSystemRole {
    id?: TSystemRoleID
    name: string
    description?: string | null
}
