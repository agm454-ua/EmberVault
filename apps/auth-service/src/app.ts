import express from 'express'
import type { Application, Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import routes from '@routes/index.routes.js'
import { sendErrorResponse, sendNotFoundResponse } from '@agm454-ua/auth-utils'
import logger from '@utils/logger.js'
import { ENV } from '@config/env.js'
import helmet from 'helmet'

// Initialize Express app
const app: Application = express()

// Middlewares
app.use(
    cors({
        origin: ENV.FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    }),
)
app.use(
    helmet({
        // So it does not affect calls from React frontend
        contentSecurityPolicy: false,
    }),
)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// OpenAPI documentation served with swagger
const openapiPath = path.resolve('./docs/openapi.yml')
const file = fs.readFileSync(openapiPath, 'utf8')
const openapiDocument = yaml.load(file) as object
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument))

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'API is running',
    })
})

// Mount all API routes with /api prefix
app.use('/api', routes)

// 404 handler
app.use((req: Request, res: Response) => {
    sendNotFoundResponse(res, `Route ${req.originalUrl} not found`)
})

// Global error handler
app.use((err: Error, req: Request, res: Response) => {
    sendErrorResponse(res)
    logger.error(err)
})

export default app
