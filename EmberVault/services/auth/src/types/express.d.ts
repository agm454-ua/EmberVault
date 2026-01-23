// this file allows the passing of the jwt payload from validateRequest middleware to controllers

import type { TokenPayload } from '@agm454-ua/auth-utils'

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload
            userId?: string
        }
    }
}

export {}
