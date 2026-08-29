/** Authentication, assembled.
 *
 *  One function builds the whole module from the pieces so that `app.ts` gains
 *  a single call rather than a wiring diagram, and so a test can build the same
 *  service against the same configuration without going through HTTP.
 */
import type { FastifyInstance } from 'fastify'
import type { Database } from '../db/client'
import type { Env } from '../env'
import { loadAuthConfig, type AuthConfig } from './config'
import { memoryTransport, transportFor, type MemoryTransport, type OtpTransport } from './otp'
import { buildProviders, type Providers } from './providers'
import { registerAuthRoutes } from './routes'
import { createAuthService, LoginThrottle, type AuthService } from './service'
import { createTokenSigner, type TokenSigner } from './tokens'

export { isPublicAuthPath } from './routes'
export { withAuthPlane, sessionPrincipal } from './context'
export { loadAuthConfig } from './config'
export type { AuthConfig } from './config'
export type { AuthService } from './service'
export { AuthFailure, LockedOut } from './service'
export { hashPassword, verifyPassword, checkPasswordPolicy, needsRehash, MIN_PASSWORD_LENGTH } from './password'
export { memoryTransport } from './otp'
export type { MemoryTransport, OtpTransport } from './otp'
export { providerStatus } from './providers'

export interface AuthModule {
  service: AuthService
  config: AuthConfig
  signer: TokenSigner
  transport: OtpTransport
  providers: Providers
}

export interface BuildAuthOptions {
  db: Database
  env: Env
  /** Overrides the environment's transport. The test suite passes a memory
   *  transport so a suite can complete a code flow; nothing else should. */
  transport?: OtpTransport
  log?: (line: string) => void
}

export function buildAuth(options: BuildAuthOptions): AuthModule {
  const config = loadAuthConfig()
  const signer = createTokenSigner({
    secret: options.env.JWT_SECRET ?? '',
    issuer: options.env.JWT_ISSUER,
    audience: options.env.JWT_AUDIENCE,
    accessTokenTtlSeconds: config.accessTokenTtlSeconds,
    refreshTokenTtlSeconds: config.refreshTokenTtlSeconds,
  })
  const transport =
    options.transport ?? transportFor(config, options.log ?? ((line) => process.stderr.write(`${line}\n`)))
  const providers = buildProviders()
  const service = createAuthService({
    db: options.db,
    config,
    signer,
    transport,
    throttle: new LoginThrottle(config),
  })
  return { service, config, signer, transport, providers }
}

export function registerAuth(app: FastifyInstance, module: AuthModule): void {
  registerAuthRoutes(app, {
    service: module.service,
    config: module.config,
    providers: module.providers,
  })
}

/** Convenience for a suite that wants the whole module with a capturable
 *  transport. */
export function buildAuthForTests(options: BuildAuthOptions): AuthModule & { codes: MemoryTransport } {
  const codes = memoryTransport()
  const module = buildAuth({ ...options, transport: codes })
  return { ...module, codes }
}
