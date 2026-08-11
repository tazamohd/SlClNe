/** One-time codes: issuing, throttling and verification.
 *
 *  Three things this module refuses to do:
 *
 *  - **Store a code.** `otp_challenges.code_hash` holds a SHA-256 of the code,
 *    never the code. A plaintext OTP column is a credential at rest with a
 *    ten-minute exploitation window and an unbounded retention period.
 *  - **Pretend a code was sent.** There is no SMS or email provider configured
 *    in any environment this has run in. The default transport therefore
 *    *fails*, visibly, with a 503 naming what is missing. A development
 *    transport writes the code to the server log and says on every send that it
 *    is a development transport. Nothing returns a cheerful 200 for a message
 *    that was never sent.
 *  - **Allow unlimited guesses.** A six-digit code is 10^6, which is minutes of
 *    guessing without a limit. Attempts are counted on the row and the
 *    challenge dies at the cap.
 *
 *  The 60-second resend throttle is `handoff/README.md` §6b and
 *  `API_ENDPOINTS.md` `POST /public/customers/resend-otp`.
 */
import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { ulid } from 'ulid'
import { otpChallenges } from '../db/schema'
import type { Tx } from '../db/tenant'
import type { AuthConfig } from './config'

export const OTP_LENGTH = 6

/** `email` and `sms` are delivery channels; `reset` is a password-recovery
 *  challenge whose destination is a user id rather than an address. */
export type OtpChannel = 'email' | 'sms' | 'reset'

export interface OtpTransport {
  readonly name: string
  readonly configured: boolean
  /** Delivers, or throws `TransportUnavailable`. Never returns quietly having
   *  done nothing. */
  send(message: { channel: OtpChannel; destination: string; code: string }): Promise<void>
}

export class TransportUnavailable extends Error {
  readonly detail: string
  constructor(detail: string) {
    super('One-time codes cannot be delivered: this deployment has no messaging provider.')
    this.name = 'TransportUnavailable'
    this.detail = detail
  }
}

/** The default. Refuses rather than pretending. */
export const unconfiguredTransport: OtpTransport = {
  name: 'unconfigured',
  configured: false,
  async send() {
    throw new TransportUnavailable(
      'Set OTP_TRANSPORT and the provider credentials for the channel you intend to use. ' +
        'Until then no code can be delivered and this endpoint will keep refusing.',
    )
  },
}

/** Development only: the code goes to the server log, and the log line says so. */
export function logTransport(log: (line: string) => void): OtpTransport {
  return {
    name: 'log',
    configured: true,
    async send({ channel, destination, code }) {
      log(
        `[development OTP transport] no messaging provider is configured; ` +
          `code ${code} for ${channel}:${destination} was written to this log and sent nowhere else`,
      )
    },
  }
}

/** Test transport: keeps the last code per destination so a suite can complete
 *  the flow without reading a log. */
export interface MemoryTransport extends OtpTransport {
  codeFor(destination: string): string | undefined
  clear(): void
}

export function memoryTransport(): MemoryTransport {
  const sent = new Map<string, string>()
  return {
    name: 'memory',
    configured: true,
    async send({ destination, code }) {
      sent.set(destination, code)
    },
    codeFor: (destination) => sent.get(destination),
    clear: () => sent.clear(),
  }
}

export function transportFor(config: AuthConfig, log: (line: string) => void): OtpTransport {
  switch (config.OTP_TRANSPORT) {
    case 'log':
      return logTransport(log)
    case 'memory':
      return memoryTransport()
    default:
      return unconfiguredTransport
  }
}

export function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

function codesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

/** Cryptographic randomness, not `Math.random`. A predictable OTP is not a
 *  second factor. */
export function generateCode(): string {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0')
}

export class ResendTooSoon extends Error {
  readonly retryAfterSeconds: number
  constructor(retryAfterSeconds: number) {
    super(`Another code can be requested in ${retryAfterSeconds}s.`)
    this.name = 'ResendTooSoon'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

/** Seconds still to wait before `destination` may be sent another code, or 0. */
export async function resendCooldown(
  tx: Tx,
  destination: string,
  config: AuthConfig,
  now = new Date(),
): Promise<number> {
  const [latest] = await tx
    .select({ createdAt: otpChallenges.createdAt })
    .from(otpChallenges)
    .where(eq(otpChallenges.destination, destination))
    .orderBy(desc(otpChallenges.createdAt))
    .limit(1)
  if (!latest) return 0
  const elapsed = Math.floor((now.getTime() - latest.createdAt.getTime()) / 1000)
  const remaining = config.OTP_RESEND_SECONDS - elapsed
  return remaining > 0 ? remaining : 0
}

export interface IssuedChallenge {
  id: string
  code: string
  expiresAt: Date
}

/** Creates a challenge and returns the plaintext code **once**, for the
 *  transport to deliver. It is never returned to an HTTP client. */
export async function issueChallenge(
  tx: Tx,
  input: { channel: OtpChannel; destination: string },
  config: AuthConfig,
  now = new Date(),
): Promise<IssuedChallenge> {
  const cooldown = await resendCooldown(tx, input.destination, config, now)
  if (cooldown > 0) throw new ResendTooSoon(cooldown)

  const ttlMinutes =
    input.channel === 'reset' ? config.PASSWORD_RESET_TTL_MINUTES : config.OTP_TTL_MINUTES
  const code = generateCode()
  const id = ulid()
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60_000)

  await tx.insert(otpChallenges).values({
    id,
    channel: input.channel,
    destination: input.destination,
    codeHash: hashCode(code),
    expiresAt,
  })

  return { id, code, expiresAt }
}

export type OtpVerdict =
  | { kind: 'verified'; challengeId: string; destination: string }
  | { kind: 'no_challenge' }
  | { kind: 'expired' }
  | { kind: 'exhausted' }
  | { kind: 'wrong_code'; attemptsLeft: number }

/** Verifies `code` against the newest live challenge for `destination`.
 *
 *  Consumes the challenge on success — a code that works twice is a code an
 *  attacker can use after watching it work once. */
export async function verifyChallenge(
  tx: Tx,
  input: { destination: string; code: string; channel?: OtpChannel },
  config: AuthConfig,
  now = new Date(),
): Promise<OtpVerdict> {
  const [challenge] = await tx
    .select()
    .from(otpChallenges)
    .where(
      and(
        eq(otpChallenges.destination, input.destination),
        isNull(otpChallenges.verifiedAt),
        input.channel ? eq(otpChallenges.channel, input.channel) : undefined,
      ),
    )
    .orderBy(desc(otpChallenges.createdAt))
    .limit(1)
    .for('update')

  if (!challenge) return { kind: 'no_challenge' }
  if (challenge.expiresAt.getTime() <= now.getTime()) return { kind: 'expired' }
  if (challenge.attempts >= config.OTP_MAX_ATTEMPTS) return { kind: 'exhausted' }

  if (!codesMatch(challenge.codeHash, hashCode(input.code))) {
    const attempts = challenge.attempts + 1
    await tx
      .update(otpChallenges)
      .set({ attempts })
      .where(eq(otpChallenges.id, challenge.id))
    return { kind: 'wrong_code', attemptsLeft: Math.max(0, config.OTP_MAX_ATTEMPTS - attempts) }
  }

  await tx
    .update(otpChallenges)
    .set({ verifiedAt: now, attempts: challenge.attempts + 1 })
    .where(eq(otpChallenges.id, challenge.id))
  return { kind: 'verified', challengeId: challenge.id, destination: challenge.destination }
}

/** A recovery token is `<challengeId>.<code>`: the id names the row so the user
 *  can be found without the email being resubmitted, and the code is the secret.
 *  Only its digest is stored. */
export function recoveryToken(challenge: IssuedChallenge): string {
  return `${challenge.id}.${challenge.code}`
}

export function splitRecoveryToken(token: string): { id: string; code: string } | null {
  const index = token.indexOf('.')
  if (index <= 0 || index === token.length - 1) return null
  return { id: token.slice(0, index), code: token.slice(index + 1) }
}

/** Verifies a recovery token by id, which is how reset differs from OTP: the
 *  destination is not resubmitted by the caller, it is read off the row. */
export async function verifyRecoveryToken(
  tx: Tx,
  token: string,
  config: AuthConfig,
  now = new Date(),
): Promise<OtpVerdict> {
  const parts = splitRecoveryToken(token)
  if (!parts) return { kind: 'no_challenge' }

  const [challenge] = await tx
    .select()
    .from(otpChallenges)
    .where(and(eq(otpChallenges.id, parts.id), eq(otpChallenges.channel, 'reset')))
    .limit(1)
    .for('update')

  if (!challenge || challenge.verifiedAt) return { kind: 'no_challenge' }
  if (challenge.expiresAt.getTime() <= now.getTime()) return { kind: 'expired' }
  if (challenge.attempts >= config.OTP_MAX_ATTEMPTS) return { kind: 'exhausted' }

  if (!codesMatch(challenge.codeHash, hashCode(parts.code))) {
    const attempts = challenge.attempts + 1
    await tx.update(otpChallenges).set({ attempts }).where(eq(otpChallenges.id, challenge.id))
    return { kind: 'wrong_code', attemptsLeft: Math.max(0, config.OTP_MAX_ATTEMPTS - attempts) }
  }

  await tx
    .update(otpChallenges)
    .set({ verifiedAt: now, attempts: challenge.attempts + 1 })
    .where(eq(otpChallenges.id, challenge.id))
  return { kind: 'verified', challengeId: challenge.id, destination: challenge.destination }
}

/** Live challenges for a destination, used by the tests and by the throttle. */
export async function liveChallengeCount(
  tx: Tx,
  destination: string,
  now = new Date(),
): Promise<number> {
  const rows = await tx
    .select({ id: otpChallenges.id })
    .from(otpChallenges)
    .where(
      and(
        eq(otpChallenges.destination, destination),
        isNull(otpChallenges.verifiedAt),
        gt(otpChallenges.expiresAt, now),
      ),
    )
  return rows.length
}
