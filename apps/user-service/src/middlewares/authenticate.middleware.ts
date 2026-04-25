import { getUserById } from '@services/users.service.js'
import type { Request, Response, NextFunction } from 'express'
import { validateToken } from '@agm454-ua/auth-utils'
import { ENV } from '@config/env.js'
import { sendUnauthorizedResponse } from '@agm454-ua/auth-utils'
import logger from '@utils/logger.js'

const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendUnauthorizedResponse(res, 'No token provided.')
    }
    const token = authHeader.split(' ')[1]
    if (token) {
        try {
            const payload = validateToken(token, ENV.JWT_SECRET)

            if (!payload) {
                return sendUnauthorizedResponse(res, 'Invalid or expired token')
            }

            const userExists = await getUserById(payload.userId)
            if (!userExists) {
                return sendUnauthorizedResponse(res, 'Invalid token bearer')
            }

            req.user = payload
            req.userId = userExists.id
            next()
        } catch (error) {
            logger.error(error)
            next(error)
        }
    }
}

export default authenticate
