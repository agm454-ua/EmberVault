export interface TChangePasswordRequest {
    oldPassword: string
    newPassword: string
    confirmNewPassword: string
}

export interface TResetPasswordRequest {
    code: string
    newPassword: string
}
