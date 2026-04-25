import { ENV } from '@config/env.js'
import crypto from 'node:crypto'
import type { TUserID } from '@customTypes/user.js'

export function generateTOTP(userId: TUserID): string {
    // Convert current time into a fixed time window
    const counter = Math.floor(
        Math.floor(Date.now() / 1000) /
            (ENV.RESET_PASSWORD_EXPIRATION_MINUTES * 60),
    )

    // RFC-style counter buffer
    const timeBuffer = Buffer.alloc(8)
    timeBuffer.writeBigUInt64BE(BigInt(counter))

    // HMAC ties the code to the user, purpose, and time window
    const hmac = crypto
        .createHmac('sha256', ENV.RESET_PASSWORD_SECRET)
        .update(userId)
        .update(timeBuffer)
        .digest()

    // Truncate
    const offset = hmac[hmac.length - 1]! & 0x0f

    const binary =
        ((hmac[offset]! & 0x7f) << 24) |
        ((hmac[offset + 1]! & 0xff) << 16) |
        ((hmac[offset + 2]! & 0xff) << 8) |
        (hmac[offset + 3]! & 0xff)

    // Final 6-digit numeric code
    return (binary % 10 ** 6).toString().padStart(6, '0')
}

export function validateTOTP(userId: string, submittedCode: string): boolean {
    const now = Math.floor(Date.now() / 1000)
    const currentCounter = Math.floor(
        now / (ENV.RESET_PASSWORD_EXPIRATION_MINUTES * 60),
    )

    // Check current and previous window to allow minor clock drift
    const countersToCheck = [currentCounter, currentCounter - 1]

    return countersToCheck.some((counter) => {
        const timeBuffer = Buffer.alloc(8)
        timeBuffer.writeBigUInt64BE(BigInt(counter))

        const hmac = crypto
            .createHmac('sha256', ENV.RESET_PASSWORD_SECRET)
            .update(userId)
            .update(timeBuffer)
            .digest()

        const offset = hmac[hmac.length - 1]! & 0x0f

        const binary =
            ((hmac[offset]! & 0x7f) << 24) |
            ((hmac[offset + 1]! & 0xff) << 16) |
            ((hmac[offset + 2]! & 0xff) << 8) |
            (hmac[offset + 3]! & 0xff)

        const expected = (binary % 10 ** 6).toString().padStart(6, '0')

        // Constant-time comparison to avoid timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(expected),
            Buffer.from(submittedCode),
        )
    })
}
