/** The invoice write path.
 *
 *  Reads go through `useCollection` like everywhere else. Writes are gathered
 *  here because the money endpoints are not ordinary collection CRUD: creating
 *  an invoice posts line items the server prices, issuing it is an action on a
 *  document rather than a field update, and taking a payment must be safe to
 *  retry.
 *
 *  **Nothing here computes a financial figure.** The client sends descriptions,
 *  quantities and net unit prices in halalas; the subtotal, the VAT and the
 *  total come back from the server and are displayed. A total this app renders
 *  after a save is the server's number, not one it worked out.
 *
 *  ### Why the transport looks the way it does
 *
 *  `data/repository.ts` owns the one authenticated HTTP path in the app: it
 *  holds the access token in a module the screens deliberately cannot read
 *  from, and attaches it to every request. Two of the endpoints this module
 *  needs are sub-resources of an invoice rather than top-level collections, and
 *  `createHttpRepository` takes a base URL — so pointing it at a single invoice
 *  turns its `payments` collection into `POST /invoices/:id/payments`, which is
 *  exactly the endpoint, with the token and the idempotency key already
 *  handled.
 *
 *  `POST /invoices/:id/issue` has no such shape — it is an action, not a
 *  collection — and it is the one call this module has to make itself. It reads
 *  the token from `getAccessToken`, the same source `repository.ts` attaches to
 *  every collection request, so issuing an invoice against a live API now
 *  carries the caller's identity instead of returning a 401.
 *  `setFinanceAccessTokenProvider` remains for the tests, which override the
 *  reader directly.
 */
import {
  API_URL,
  createHttpRepository,
  getAccessToken,
  isLive,
  repository,
  RepositoryError,
  type Collection,
  type MutationOptions,
} from '@/data/repository'

/* ------------------------------------------------------------------ types */

export type InvoiceLineKind = 'part' | 'labour' | 'fee'

export interface InvoiceLineInput {
  description: string
  descriptionAr?: string
  kind: InvoiceLineKind
  /** Quantity may be fractional — 1.5 hours of labour is a line. */
  qty: number
  /** **Net** unit price in halalas. VAT is never sent by the client. */
  unitPriceHalalas: number
  partSku?: string
}

export interface InvoiceCreateInput {
  customerId?: string
  customerName: string
  jobCardId?: string
  vehicleId?: string
  /** `YYYY-MM-DD`. */
  dueDate: string
  lines: readonly InvoiceLineInput[]
  discountHalalas?: number
  buyerVatNumber?: string
  notes?: string
}

export interface InvoiceUpdateInput {
  customerName?: string
  dueDate?: string
  notes?: string
  status?: 'draft' | 'cancelled'
  lines?: readonly InvoiceLineInput[]
  discountHalalas?: number
}

export type PaymentMethod =
  | 'Mada'
  | 'Cash'
  | 'Visa'
  | 'Mastercard'
  | 'Bank transfer'
  | 'Cheque'
  | 'Credit'

/** The methods offered in the UI, in the order the design lists them. */
export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'Mada',
  'Cash',
  'Visa',
  'Mastercard',
  'Bank transfer',
  'Cheque',
  'Credit',
]

export interface PaymentInput {
  /** What the customer actually handed over, in halalas. Never a total this
   *  page computed from a balance it may be holding stale. */
  amountHalalas: number
  method: PaymentMethod
  reference?: string
  /** `YYYY-MM-DD`. Defaults server-side to today. */
  paidOn?: string
  note?: string
}

/** The invoice as the API presents it. Only the fields this module promises
 *  back to a caller; screens read the rest off the collection row. */
export interface InvoiceResult {
  _id?: string
  id?: string
  status?: string
  subtotalHalalas?: number
  taxHalalas?: number
  discountHalalas?: number
  totalHalalas?: number
  paidHalalas?: number
  balanceHalalas?: number
  issuedAt?: string | null
}

export interface PaymentResult {
  payment: { _id?: string; ref?: string; amountHalalas?: number }
  /** The invoice as it stands after the payment — the server's balance, which
   *  is the only balance worth showing. Null when the API did not return one. */
  invoice: InvoiceResult | null
}

/* ------------------------------------------------------------ idempotency */

/** A key for a write that must not happen twice.
 *
 *  Generated once per *attempt by the user*, not per request, and reused by
 *  every retry of that attempt — that is the whole mechanism. A double-click,
 *  a flaky connection or an impatient reload replays the same key and the
 *  server returns the first result instead of taking the money again. */
export function newIdempotencyKey(prefix: string): string {
  const random =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  // The contract requires 8–128 characters.
  return `${prefix}-${random}`
}

/* ------------------------------------------------------------------- auth */

type TokenReader = () => string | null | undefined

let readAccessToken: TokenReader = getAccessToken

/** Supplies the bearer token to the one call that cannot go through the
 *  repository. See the module note: production wiring is a two-line change in
 *  a file this agent does not own; the tests wire it directly so the request
 *  shape and the error mapping are proven either way. */
export function setFinanceAccessTokenProvider(read: TokenReader): void {
  readAccessToken = read
}

/* --------------------------------------------------------------- helpers */

/** The repository types a collection by the row it *reads*. An invoice create
 *  carries line items, which no invoice row has, so the input cannot be
 *  `Partial<Row>` and the seam has no other shape to offer. One cast, named,
 *  in one place — rather than the same cast scattered across four screens. */
function asRowPatch<T>(input: unknown): Partial<T> {
  return input as Partial<T>
}

function requireLive(action: string): void {
  if (!isLive) {
    throw new RepositoryError(
      'unsupported',
      `The fixture repository cannot ${action}. Set VITE_API_URL to run against the API.`
    )
  }
}

/** The payments of one invoice, as a collection.
 *
 *  `/invoices/:id/payments` really is a sub-collection, so the repository's own
 *  HTTP client models it exactly once it is given the invoice as its base. */
function paymentsOf(invoiceRef: string): Collection<unknown> {
  const base = `${API_URL.replace(/\/$/, '')}/invoices/${encodeURIComponent(invoiceRef)}`
  return createHttpRepository(base).invoicePayments as unknown as Collection<unknown>
}

/* ------------------------------------------------------------------ calls */

/** Creates a draft invoice. The server prices it. */
export async function createInvoice(
  input: InvoiceCreateInput,
  options: MutationOptions = {}
): Promise<InvoiceResult> {
  requireLive('create invoices')
  const created = await repository.invoices.create(
    asRowPatch<Parameters<typeof repository.invoices.create>[0]>(input),
    options
  )
  return created as unknown as InvoiceResult
}

/** Edits a draft. An issued invoice is immutable and the server answers 409. */
export async function updateInvoice(
  ref: string,
  patch: InvoiceUpdateInput,
  options: MutationOptions = {}
): Promise<InvoiceResult> {
  requireLive('edit invoices')
  const updated = await repository.invoices.update(
    ref,
    asRowPatch<Parameters<typeof repository.invoices.update>[1]>(patch),
    options
  )
  return updated as unknown as InvoiceResult
}

/** Cancels an invoice. Expressed as a status patch because that is what the
 *  API accepts; a cancelled invoice can no longer take a normal payment. */
export function cancelInvoice(ref: string, options: MutationOptions = {}): Promise<InvoiceResult> {
  return updateInvoice(ref, { status: 'cancelled' }, options)
}

/** Issues a draft: assigns the ZATCA hash and QR, and opens it for payment.
 *
 *  The server re-checks the issuer's approval ceiling here, so a user who can
 *  raise an invoice but not commit its amount is refused with
 *  `approval_required` — which the screen reports rather than hides. */
export async function issueInvoice(ref: string): Promise<InvoiceResult> {
  requireLive('issue invoices')
  const url = `${API_URL.replace(/\/$/, '')}/invoices/${encodeURIComponent(ref)}/issue`
  const headers = new Headers({ accept: 'application/json', 'content-type': 'application/json' })
  const token = readAccessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      credentials: 'include',
    })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }

  const text = await response.text()
  const body: unknown = text ? JSON.parse(text) : null
  if (!response.ok) throw errorFrom(body, response.status)
  return body as InvoiceResult
}

/** Records a payment against an invoice, and the receipt behind it.
 *
 *  The server holds the rules — `amount ≤ balance`, no payment on a cancelled
 *  or unissued invoice — writes the payment, updates the invoice's paid figure
 *  and status, and raises the receipt in the same transaction. The client
 *  mirrors those rules in the form for the inline message; it does not decide
 *  them.
 *
 *  `idempotencyKey` is required rather than optional: a payment endpoint that
 *  can be called without one has a double-charge waiting in it. */
export async function recordPayment(
  invoiceRef: string,
  input: PaymentInput,
  idempotencyKey: string
): Promise<PaymentResult> {
  requireLive('record payments')
  const result = await paymentsOf(invoiceRef).create(input, { idempotencyKey })
  const envelope = result as { payment?: PaymentResult['payment']; invoice?: InvoiceResult | null }
  return {
    payment: envelope.payment ?? {},
    invoice: envelope.invoice ?? null,
  }
}

/** Raises a receipt for the balance of an invoice.
 *
 *  Distinct from the receipt a payment raises automatically: this is the
 *  "issue a receipt against this invoice" action, which the API records as
 *  pending until the money clears. */
export async function createReceipt(input: {
  invoiceId: string
  method: PaymentMethod
}): Promise<unknown> {
  requireLive('create receipts')
  return repository.receipts.create(
    asRowPatch<Parameters<typeof repository.receipts.create>[0]>(input)
  )
}

/* ---------------------------------------------------------------- errors */

interface ErrorBody {
  error?: { code?: string; message?: string; field?: string; requestId?: string }
}

function errorFrom(body: unknown, status: number): RepositoryError {
  const envelope = (body ?? {}) as ErrorBody
  return new RepositoryError(
    (envelope.error?.code as RepositoryError['code']) ?? 'internal',
    envelope.error?.message ?? `Request failed with status ${status}.`,
    { field: envelope.error?.field, status, requestId: envelope.error?.requestId }
  )
}

/** The message to put in front of the user for a failed money write.
 *
 *  The API's own wording is used wherever it has any: it is the only party that
 *  knows *why* — which rule, which ceiling, which balance. A generic "something
 *  went wrong" over the top of "a payment cannot exceed the outstanding
 *  balance" is a downgrade, not a polish. */
export function writeFailureMessage(error: unknown, fallback: string): string {
  if (error instanceof RepositoryError) {
    if (error.code === 'unauthenticated') return 'Your session has ended. Sign in and try again.'
    if (error.code === 'network') return 'The server could not be reached. Nothing was saved.'
    return error.message || fallback
  }
  return error instanceof Error && error.message ? error.message : fallback
}

/** True when a failure means the record moved under the user's feet, which
 *  needs a reload rather than a retry. */
export function isStale(error: unknown): boolean {
  return (
    error instanceof RepositoryError &&
    (error.code === 'version_conflict' || error.code === 'conflict')
  )
}

export { RepositoryError }
