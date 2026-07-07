// this file allows the passing of the jwt payload from validateRequest middleware to controllers

import type { TokenPayload } from '@agm-22/auth-utils'

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload
            userId?: string
        }
    }
}

export {}
