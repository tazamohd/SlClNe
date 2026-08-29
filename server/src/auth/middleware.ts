/** Auth + RBAC middleware. Every data route runs `requireAuth` then a module
 *  gate, so the server re-checks permissions the frontend only hides by. */
import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken, type AccessClaims } from './jwt.js'
import { can, type Action } from './rbac.js'
import { AppError, errors, sendError } from '../http.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessClaims
    }
  }
}

/** Rejects unless a valid Bearer access token is present. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header('authorization') ?? ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return sendError(res, errors.unauthorized('Missing or malformed Authorization header'))
  }
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    sendError(res, errors.unauthorized('Invalid or expired token'))
  }
}

/** Gates a route on `action` (default view) over a permission module. */
export function requireModule(module: string, action: Action = 'v') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role
    if (!role) return sendError(res, errors.unauthorized())
    if (!can(module, action, role)) {
      return sendError(res, errors.forbidden(`Role "${role}" cannot ${action} ${module}`))
    }
    next()
  }
}

/** Wraps an async handler so thrown AppErrors become the error envelope and any
 *  other throw becomes a clean 500 (never leaking internals or secrets). */
export function handler(fn: (req: Request, res: Response) => Promise<void> | void) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof AppError) return sendError(res, err)
      // eslint-disable-next-line no-console
      console.error('Unhandled route error:', err instanceof Error ? err.message : 'unknown')
      sendError(res, new AppError(500, 'internal_error', 'Something went wrong'))
    }
  }
}
