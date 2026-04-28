import jwt from 'jsonwebtoken';

import type { TokenPayload } from './types.js';

export function generateToken(payload: TokenPayload, secret: string, expMin: number = 15): string {
    const now = Math.floor(Date.now() / 1000)
    payload.iat = now
    payload.exp = now + 60 * expMin

    const token = jwt.sign(payload, secret)
    return token
}

export function validateToken(token: string, secret: string): TokenPayload | null {
    try {
        return jwt.verify(token, secret) as TokenPayload;
    } catch { // already checks if the token is expired
        return null;
    }
}