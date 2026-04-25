import routes from '@routes/index.routes.js'
import express, { type Express } from 'express'

export function createHttpTestApp(): Express {
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use('/api', routes)
    return app
}
