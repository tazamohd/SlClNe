/** The insurance-claim lifecycle, as the workspace consumes it.
 *
 *  The transport already exists: `insuranceClaimsApi` in `data/repository.ts`
 *  makes the four authed POSTs (`submit` / `approve` / `reject` / `pay`) through
 *  the one HTTP path the repository owns, attaching the caller's bearer token
 *  the same way every collection request does. This module does not re-implement
 *  that — re-posting the same body from a second place is how two request
 *  shapes drift apart. It consumes the accessor and adds the two things a screen
 *  needs around it and a transport module has no business holding:
 *
 *  - a single `lifecycle` handle the screen imports, so a test mocks one module
 *    rather than reaching for the nullable singleton; and
 *  - the client-side failure mapping — `claimActionFailureMessage`, `isRefusal`,
 *    `isSodRefusal` — that turns a `RepositoryError` into the sentence the user
 *    reads, keeping the server's own wording wherever it has any.
 *
 *  This mirrors how `screens/workshop/api.ts` and `screens/crm/api.ts` sit
 *  beside their transports: the screen talks to `./api`, never to `fetch`.
 */
import {
  RepositoryError,
  insuranceClaimsApi,
  isLive,
  type InsuranceClaimRow,
  type InsuranceClaimSubmit,
  type InsuranceClaimsApi,
} from '@/data/repository'

/** The accessor the module talks to. A test overrides it to observe the calls
 *  without a live build; production leaves it as the repository singleton. */
let api: InsuranceClaimsApi | null = insuranceClaimsApi

/** Swaps the lifecycle transport, for the tests. See the module note. */
export function setInsuranceClaimsApi(next: InsuranceClaimsApi | null): void {
  api = next
}

/** The fixture build has no lifecycle: a claim transition is a server action
 *  under the ceiling and segregation-of-duties controls, and inventing a
 *  success here is the fake-completion this project gates against. The screen
 *  never reaches these on the fixtures — the buttons are disabled and explain
 *  why — but if one is called, it refuses honestly rather than resolving. */
function require(): InsuranceClaimsApi {
  if (!api || !isLive) {
    throw new RepositoryError(
      'unsupported',
      'The fixture build cannot transition a claim. Set VITE_API_URL to run against the API.',
    )
  }
  return api
}

export const lifecycle = {
  submit(input: InsuranceClaimSubmit, idempotencyKey?: string): Promise<InsuranceClaimRow> {
    return require().submit(input, idempotencyKey ? { idempotencyKey } : undefined)
  },
  /** `approvedAmountHalalas` may be less than was claimed; the server caps it at
   *  the claimed figure and enforces the approver's ceiling regardless. */
  approve(id: string, approvedAmountHalalas?: number): Promise<InsuranceClaimRow> {
    return require().approve(id, approvedAmountHalalas === undefined ? {} : { approvedAmountHalalas })
  },
  reject(id: string, reason: string): Promise<InsuranceClaimRow> {
    return require().reject(id, reason)
  },
  pay(id: string): Promise<InsuranceClaimRow> {
    return require().pay(id)
  },
}

/** What to put in front of the user when a lifecycle action is refused.
 *
 *  The API's own wording wins wherever it has any: it is the only party that
 *  knows which control refused — the permission matrix, the approval ceiling or
 *  the segregation-of-duties check over who submitted the claim — so replacing
 *  "a claim you submitted must be approved by someone else" with a generic
 *  sentence is a downgrade, not a polish. Only the two failures the server has
 *  no sentence for get a client one. */
export function claimActionFailureMessage(error: unknown, fallback: string): string {
  if (error instanceof RepositoryError) {
    if (error.code === 'unauthenticated') return 'Your session has ended. Sign in and try again.'
    if (error.code === 'network') return 'The server could not be reached. Nothing was saved.'
    return error.message || fallback
  }
  return error instanceof Error && error.message ? error.message : fallback
}

/** A refusal the user cannot fix by retrying: their role forbids the action, or
 *  a business rule (the ceiling, segregation of duties) stands in the way. */
export function isRefusal(error: unknown): boolean {
  return (
    error instanceof RepositoryError &&
    (error.code === 'forbidden' ||
      error.code === 'rule_violated' ||
      error.code === 'approval_required')
  )
}

/** Whether the refusal is the segregation-of-duties one — the approver is the
 *  submitter. Used only to title the message; the server is the boundary and
 *  its sentence is what the user reads either way. The check is deliberately
 *  narrow: a `rule_violated` whose message names the approver, so an unrelated
 *  rule does not borrow the SOD title. */
export function isSodRefusal(error: unknown): boolean {
  return (
    error instanceof RepositoryError &&
    error.code === 'rule_violated' &&
    /approv|submit|segregat|different/i.test(error.message)
  )
}

export { RepositoryError }
