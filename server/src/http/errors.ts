/** The failure taxonomy, in one place.
 *
 *  Two rules that matter more than the rest:
 *
 *  - A cross-tenant read is a **404**, never a 403. A 403 confirms the record
 *    exists, which is the disclosure the isolation was protecting against.
 *  - An unexpected error never reaches the client as a stack trace or a driver
 *    message. It is logged with a request id, and the client gets that id.
 */
import { HTTP_STATUS_FOR_CODE, type ErrorCode } from '@salis/contract'

export class ApiError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly field?: string
  /** Extra context for the log line only — never serialised to the client. */
  readonly detail?: Record<string, unknown>

  constructor(
    code: ErrorCode,
    message: string,
    options: { field?: string; detail?: Record<string, unknown> } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = HTTP_STATUS_FOR_CODE[code]
    this.field = options.field
    this.detail = options.detail
  }

  toBody(requestId?: string) {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.field ? { field: this.field } : {}),
        ...(requestId ? { requestId } : {}),
      },
    }
  }
}

export const badRequest = (message: string, field?: string) =>
  new ApiError('bad_request', message, { field })

export const unauthenticated = (message = 'Authentication is required.') =>
  new ApiError('unauthenticated', message)

export const forbidden = (message = 'You do not have permission to do that.') =>
  new ApiError('forbidden', message)

/** Used for a genuinely absent record **and** for one that exists in another
 *  tenant. The two cases are indistinguishable to the caller on purpose. */
export const notFound = (what = 'Record') => new ApiError('not_found', `${what} not found.`)

export const conflict = (message: string) => new ApiError('conflict', message)

export const versionConflict = (message = 'This record changed since you loaded it.') =>
  new ApiError('version_conflict', message)

export const ruleViolated = (message: string, field?: string) =>
  new ApiError('rule_violated', message, { field })

export const approvalRequired = (message: string) => new ApiError('approval_required', message)

export const validationFailed = (message: string, field?: string) =>
  new ApiError('validation_failed', message, { field })
