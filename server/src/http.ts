/** Shared HTTP helpers: the error envelope the frontend's ApiClient parses
 *  (`{error:{code,message,field?}}`) and a typed AppError to throw from anywhere. */
import type { Response } from 'express'

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly field?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function sendError(res: Response, err: AppError): void {
  res.status(err.status).json({
    error: { code: err.code, message: err.message, ...(err.field ? { field: err.field } : {}) },
  })
}

export const errors = {
  unauthorized: (msg = 'Authentication required') => new AppError(401, 'unauthorized', msg),
  forbidden: (msg = 'You do not have permission to view this') =>
    new AppError(403, 'forbidden', msg),
  notFound: (msg = 'Not found') => new AppError(404, 'not_found', msg),
  validation: (msg: string, field?: string) => new AppError(422, 'validation_failed', msg, field),
  badRequest: (msg: string) => new AppError(400, 'bad_request', msg),
}
