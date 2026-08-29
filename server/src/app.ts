/** Builds the Express app. Kept separate from index.ts so tests mount the same
 *  app against an isolated in-memory DB via supertest. */
import express, { type Express } from 'express'
import cors from 'cors'
import { corsOrigins } from './env.js'
import { authRouter } from './routes/auth.js'
import { collectionsRouter } from './routes/collections.js'
import { writesRouter } from './routes/writes.js'
import { AppError, sendError } from './http.js'
import { securityHeaders, rateLimit } from './security.js'

export function createApp(): Express {
  const app = express()

  app.disable('x-powered-by')
  app.use(securityHeaders)
  app.use(cors({ origin: corsOrigins, credentials: true }))
  app.use(express.json({ limit: '1mb' }))

  app.use('/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 15 }))
  app.use('/auth/refresh', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }))

  // Liveness — unauthenticated.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'salis-auto-server' })
  })

  app.use('/', authRouter())
  app.use('/', collectionsRouter())
  app.use('/', writesRouter())

  // Unknown route → the same error envelope the client parses.
  app.use((req, res) => {
    sendError(res, new AppError(404, 'not_found', `No route for ${req.method} ${req.path.slice(0, 200)}`))
  })

  // JSON body parse failures etc. → envelope, never an HTML stack trace.
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof AppError) return sendError(res, err)
    if (err instanceof SyntaxError && 'body' in err) {
      return sendError(res, new AppError(400, 'bad_request', 'Malformed JSON body'))
    }
    sendError(res, new AppError(500, 'internal_error', 'Something went wrong'))
  })

  return app
}
