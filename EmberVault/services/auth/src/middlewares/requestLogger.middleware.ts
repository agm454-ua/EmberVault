import logger from '@utils/logger.js'
import type { Request, Response, NextFunction } from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start
        logger.info({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            userId: req.userId ?? 'anonymous', // Handle missing userId
            ip: req.ip,
        })
    })

    next()
}
