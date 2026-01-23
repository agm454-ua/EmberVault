import 'dotenv/config'

function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`FATAL ERROR: ${name} is not defined.`)
    }
    return value
}

export const ENV = {
    JWT_SECRET: requireEnv('JWT_SECRET'),
    REFRESH_SECRET: requireEnv('REFRESH_SECRET'),
    JWT_EXPIRATION_MINUTES: Number(requireEnv('JWT_EXPIRATION_MINUTES')),
    REFRESH_TOKEN_EXPIRATION_MINUTES: Number(
        requireEnv('REFRESH_TOKEN_EXPIRATION_MINUTES'),
    ),
    RESET_PASSWORD_SECRET: requireEnv('RESET_PASSWORD_SECRET'),
    RESET_PASSWORD_EXPIRATION_MINUTES: Number(
        requireEnv('RESET_PASSWORD_EXPIRATION_MINUTES'),
    ),
    MAIL_DIR: requireEnv('MAIL_DIR'),
    MAIL_PASSWORD: requireEnv('MAIL_PASSWORD'),
    FRONTEND_URL: requireEnv('FRONTEND_URL'),
    PORT: Number(process.env.PORT) || 3100,
}
