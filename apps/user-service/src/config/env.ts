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
    FRONTEND_URL: requireEnv('FRONTEND_URL'),
    REDIS_URL: requireEnv('REDIS_URL'),
    PORT: Number(process.env.PORT) || 3200,
}
