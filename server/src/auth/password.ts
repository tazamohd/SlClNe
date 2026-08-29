/** Password hashing — argon2id, with the parameters in the environment.
 *
 *  argon2id rather than bcrypt or PBKDF2: it is the OWASP first choice and it
 *  resists GPU and side-channel attack in the same primitive. The parameters
 *  default to the OWASP figures (m = 19 MiB, t = 2, p = 1) and are read from
 *  the environment so a deployment can raise them without a code change.
 *
 *  Two properties this module is responsible for beyond "it hashes":
 *
 *  - **A user with no password hash still costs a verification.** Skipping the
 *    hash for an unknown email turns login into a user-enumeration oracle
 *    measurable with a stopwatch, so `verifyPassword` burns the same work
 *    against a dummy hash and returns false.
 *  - **Hashes are upgradable.** `needsRehash` reports a hash that was made with
 *    weaker parameters than the ones now configured, so the cost can be raised
 *    and existing users migrate on their next successful sign-in.
 */
import { hash, verify, type Algorithm } from '@node-rs/argon2'
import type { AuthConfig } from './config'

/** `Algorithm.Argon2id`.
 *
 *  The binding declares `Algorithm` as an ambient `const enum`, which
 *  `isolatedModules` cannot read at runtime — every file is transpiled alone,
 *  so there is no whole-program view to inline the member from. The value is
 *  pinned here with the name it stands for rather than left as a bare `2`. */
const ARGON2ID = 2 as Algorithm

export interface PasswordPolicyFailure {
  message: string
  field: string
}

/** Deliberately modest and explained: length is what actually helps, and a
 *  composition rule that forces `P@ssw0rd!` buys nothing. */
export const MIN_PASSWORD_LENGTH = 12
const MAX_PASSWORD_LENGTH = 200

export function checkPasswordPolicy(password: string): PasswordPolicyFailure | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      message: `A password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      field: 'password',
    }
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { message: 'That password is too long.', field: 'password' }
  }
  if (password.trim().length === 0) {
    return { message: 'A password cannot be only whitespace.', field: 'password' }
  }
  return null
}

function options(config: AuthConfig) {
  return {
    algorithm: ARGON2ID,
    memoryCost: config.ARGON2_MEMORY_KIB,
    timeCost: config.ARGON2_TIME_COST,
    parallelism: config.ARGON2_PARALLELISM,
  }
}

export async function hashPassword(password: string, config: AuthConfig): Promise<string> {
  return hash(password, options(config))
}

/** Cached so the enumeration-defence path costs the same as a real check
 *  without re-deriving a throwaway hash on every miss. */
let dummyHash: Promise<string> | null = null

function dummy(config: AuthConfig): Promise<string> {
  dummyHash ??= hash('argon2id-timing-equaliser', options(config))
  return dummyHash
}

/** Verifies `password` against `storedHash`.
 *
 *  `storedHash` is `null` for a user who has never had a password set — the
 *  seeded demo identities are exactly that, because a seeded password hash in a
 *  repository is a credential in a repository. That case still pays for a
 *  verification before answering false. */
export async function verifyPassword(
  password: string,
  storedHash: string | null,
  config: AuthConfig,
): Promise<boolean> {
  if (!storedHash) {
    await verify(await dummy(config), password).catch(() => false)
    return false
  }
  try {
    return await verify(storedHash, password)
  } catch {
    /* A malformed or truncated hash is a corrupt record, not a valid password.
     * It fails closed and the caller reports invalid credentials. */
    return false
  }
}

/** True when `storedHash` was produced with weaker parameters than the ones now
 *  configured, so it should be re-hashed after a successful sign-in. */
export function needsRehash(storedHash: string, config: AuthConfig): boolean {
  const match = /^\$argon2id\$v=\d+\$m=(\d+),t=(\d+),p=(\d+)\$/.exec(storedHash)
  if (!match) return true
  const [, memory, time, parallelism] = match
  return (
    Number(memory) < config.ARGON2_MEMORY_KIB ||
    Number(time) < config.ARGON2_TIME_COST ||
    Number(parallelism) < config.ARGON2_PARALLELISM
  )
}
