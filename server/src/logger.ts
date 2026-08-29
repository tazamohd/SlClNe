/** Structured JSON logs with PII redaction.
 *
 *  A log line is a place personal data leaks to, and it leaks there with a long
 *  retention period and a wide audience. Authorization headers, tokens, phone
 *  numbers, national ids and payment references are redacted at the serialiser,
 *  not by remembering not to log them.
 */
import type { FastifyServerOptions } from 'fastify'

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["idempotency-key"]',
  'res.headers["set-cookie"]',
  'req.body.password',
  'req.body.newPassword',
  'req.body.otp',
  'req.body.token',
  'req.body.refreshToken',
  'req.body.phone',
  'req.body.email',
  'req.body.buyerVatNumber',
  '*.password',
  '*.passwordHash',
  '*.refreshToken',
  '*.accessToken',
  '*.codeHash',
]

/** JSON on every environment. A pretty-printer is a developer convenience that
 *  would put a second, unredacted formatting path into the process. */
export function loggerOptions(level: string): FastifyServerOptions['logger'] {
  return {
    level,
    redact: { paths: REDACT_PATHS, censor: '[redacted]' },
    /* The request id is the only handle a user can safely be given for a
     * failure — it correlates their report with this log line and discloses
     * nothing about the system. */
    serializers: {
      req(request: {
        id: string
        method: string
        url: string
        ip: string
        headers: Record<string, unknown>
      }) {
        return {
          id: request.id,
          method: request.method,
          url: request.url.split('?')[0],
          ip: request.ip,
        }
      },
    },
  }
}
