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
    S3_ENDPOINT: requireEnv('S3_ENDPOINT'),
    S3_ACCESS_KEY: requireEnv('S3_ACCESS_KEY'),
    S3_SECRET_KEY: requireEnv('S3_SECRET_KEY'),
    S3_BUCKET: requireEnv('S3_BUCKET'),
    PORT: Number(process.env.PORT) || 3300,
}
