export interface TLoginRequest {
    username?: string
    email?: string
    password: string
}

export interface TRegisterRequest {
    username: string
    email: string
    password: string
    confirmPassword: string
    birthDate: string
}
