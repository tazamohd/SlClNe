/** Accounts created by the registration form while there is no API.
 *
 *  Live builds send `POST /auth/register` and the server owns everything below
 *  this line. Mock builds — the deployed Pages demo, `npm run dev`, the test
 *  suite — have no server to own it, and the registration screen used to answer
 *  a valid submission with "Registration is not available yet". That is honest
 *  but it is not a flow: nobody can sign up from scratch and then sign in.
 *
 *  So mock mode keeps a small directory of registered identities in
 *  `localStorage`. Two things it deliberately does **not** do:
 *
 *  - **It does not store passwords.** Not in plaintext, and not under a hash
 *    this bundle would have to invent a key for. A registered mock account
 *    signs in with the same shared demo password as the fourteen built-in
 *    identities, and the screen says so. A password store in `localStorage` is
 *    a credential store with none of the properties a credential store needs.
 *  - **It does not grant a role.** Every registration is the `owner` of the
 *    workshop it just created, exactly as the server's `/auth/register` decides
 *    it. Choosing a role at sign-up would be self-service privilege.
 */
import { ROLES } from './rbac'
import type { Role, RoleId } from './types'
import { readStored, writeStored, clearStored } from '../lib/storage'

/** Where the registered identities live. Not in `STORAGE_KEYS`: that map is the
 *  session's, and these outlive any one session. */
const ACCOUNTS_KEY = 'salis-demo-accounts'

/** The identity the current mock session signed in as, when it is a registered
 *  one rather than a built-in role card. */
export const ACTIVE_ACCOUNT_KEY = 'salis-demo-account'

/** The role a self-registered account holds: the owner of its own workshop. */
export const REGISTERED_ROLE: RoleId = 'owner'

export interface DemoAccount {
  name: string
  email: string
  /** Optional workshop name, shown nowhere yet but recorded as given. */
  organizationName?: string
  role: RoleId
}

function parse(raw: string | null): DemoAccount[] {
  if (!raw) return []
  try {
    const value = JSON.parse(raw) as unknown
    return Array.isArray(value) ? (value as DemoAccount[]) : []
  } catch {
    /* A corrupt directory is an empty one — never a crashed sign-up screen. */
    return []
  }
}

export function listDemoAccounts(): DemoAccount[] {
  return parse(readStored(ACCOUNTS_KEY))
}

/** Is this address already spoken for, by a built-in identity or a registered
 *  one? The built-ins count: registering `owner@salisauto.sa` and then finding
 *  the role card signs you in as somebody else would be a bug with a very
 *  confusing symptom. */
export function demoEmailTaken(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return (
    (ROLES as readonly Role[]).some((role) => role.demo.email === normalized) ||
    listDemoAccounts().some((account) => account.email === normalized)
  )
}

export function findDemoAccount(email: string): DemoAccount | null {
  const normalized = email.trim().toLowerCase()
  return listDemoAccounts().find((account) => account.email === normalized) ?? null
}

export type RegisterOutcome =
  | { ok: true; account: DemoAccount }
  | { ok: false; message: string; field: 'email' }

export function registerDemoAccount(input: {
  name: string
  email: string
  organizationName?: string
}): RegisterOutcome {
  const email = input.email.trim().toLowerCase()
  if (demoEmailTaken(email)) {
    return {
      ok: false,
      field: 'email',
      message: 'That email address already has an account. Sign in instead.',
    }
  }
  const account: DemoAccount = {
    name: input.name.trim(),
    email,
    organizationName: input.organizationName?.trim() || undefined,
    role: REGISTERED_ROLE,
  }
  writeStored(ACCOUNTS_KEY, JSON.stringify([...listDemoAccounts(), account]))
  return { ok: true, account }
}

export function activeDemoAccount(): DemoAccount | null {
  const raw = readStored(ACTIVE_ACCOUNT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DemoAccount
  } catch {
    return null
  }
}

export function setActiveDemoAccount(account: DemoAccount | null): void {
  if (account) writeStored(ACTIVE_ACCOUNT_KEY, JSON.stringify(account))
  else clearStored(ACTIVE_ACCOUNT_KEY)
}

/** Test-suite hook: forget every registered identity. */
export function clearDemoAccounts(): void {
  clearStored(ACCOUNTS_KEY)
  clearStored(ACTIVE_ACCOUNT_KEY)
}
