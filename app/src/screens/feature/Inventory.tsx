import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import {
  FeatureHeader,
  SearchField,
  Section,
  StatRow,
  TabBar,
  type Stat,
} from '@/components/shell/FeatureScreen'
import { useIsMobile } from '@/lib/useMediaQuery'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'
import {
  Field,
  Form,
  FormActions,
  FormErrorSummary,
  ServerValidationError,
  SubmitButton,
  useUnsavedChangesGuard,
  useZodForm,
} from '@/components/ui/Form'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import {
  EmptyState,
  ErrorState,
  Loading,
  PermissionDenied,
  ReadOnlyNotice,
} from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { API_URL, RepositoryError, getAccessToken, type RepositoryErrorCode } from '@/data/repository'
import { useCollection, useCreate, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

type Part = RowOf<'parts'>

/* ═══════════════════════════════════════════ the stock ledger, as arithmetic */

/** The movement types the API accepts (`packages/contract/src/entities/part.ts`).
 *
 *  `return` is its own type so a customer return is never booked as receiving,
 *  and `adjust_down` records a shortfall without inflating consumption or
 *  damage — both added when the server closed F-017. */
export const MOVEMENT_TYPES = [
  'in',
  'out',
  'transfer',
  'adjust',
  'adjust_down',
  'return',
  'damage',
] as const
export type MovementType = (typeof MOVEMENT_TYPES)[number]

/** The sign a movement type applies to on-hand quantity.
 *
 *  A client-side mirror of `packages/contract/src/rules/inventory.ts`. The
 *  server is the authority — it locks the row, re-checks and writes the ledger.
 *  This exists so the form can refuse an impossible quantity while the user is
 *  still typing, and `tests/inventory-invariant.test.ts` proves the two agree
 *  case by case, so the mirror cannot drift into disagreeing with the endpoint
 *  it is meant to anticipate. */
export function movementDelta(type: MovementType, qty: number): number {
  switch (type) {
    case 'in':
    case 'return':
      return qty
    case 'out':
    case 'damage':
    case 'transfer':
    case 'adjust_down':
      return -qty
    case 'adjust':
      return qty
  }
}

export interface MovementCheckArgs {
  type: MovementType
  qty: number
  onHand: number
  reserved: number
  backorderable: boolean
  /** A consumption that draws down a reservation instead of competing with
   *  it: bounded by the reservation, not by the unreserved balance. */
  fromReservation?: boolean
}

/** No negative stock unless the part is backorderable, and never a consumption
 *  or transfer larger than the unreserved balance — unless the consumption
 *  draws on a reservation, whose quantity is then the bound. Mirror of
 *  `checkMovement`. */
export function checkMovement(args: MovementCheckArgs): { message: string; field: string } | null {
  if (!Number.isInteger(args.qty) || args.qty <= 0) {
    return { message: 'A movement quantity must be a positive whole number.', field: 'qty' }
  }
  if (args.type === 'out' && args.fromReservation && args.qty > args.reserved) {
    return { message: 'Cannot consume more than is reserved.', field: 'qty' }
  }
  const next = args.onHand + movementDelta(args.type, args.qty)
  if (next < 0 && !args.backorderable) {
    return {
      message: 'This movement would take stock negative and the part is not backorderable.',
      field: 'qty',
    }
  }
  if ((args.type === 'out' && !args.fromReservation) || args.type === 'transfer') {
    const available = args.onHand - args.reserved
    if (args.qty > available && !args.backorderable) {
      return { message: 'Only unreserved stock can be consumed or transferred.', field: 'qty' }
    }
  }
  return null
}

/** `Reserved ≤ On Hand`. A client-side mirror of the contract's
 *  `checkReservation`, so the reservation dialog can refuse an over-hold on the
 *  field before the round trip. The server holds the row lock and re-checks. */
export function checkReservation(args: {
  qty: number
  onHand: number
  reserved: number
}): { message: string; field: string } | null {
  if (!Number.isInteger(args.qty) || args.qty <= 0) {
    return { message: 'A reservation quantity must be a positive whole number.', field: 'qty' }
  }
  if (args.reserved + args.qty > args.onHand) {
    return { message: 'Cannot reserve more than is on hand.', field: 'qty' }
  }
  return null
}

/** A release cannot give back more than is held. Mirror of the contract's
 *  `checkReservationRelease`. */
export function checkReservationRelease(args: {
  qty: number
  reserved: number
}): { message: string; field: string } | null {
  if (!Number.isInteger(args.qty) || args.qty <= 0) {
    return { message: 'A release quantity must be a positive whole number.', field: 'qty' }
  }
  if (args.qty > args.reserved) {
    return { message: 'Cannot release more than is reserved.', field: 'qty' }
  }
  return null
}

/** One row of `GET /inventory/:id/movements`. */
export interface MovementRow {
  id: string
  type: string
  qty: number
  /** The signed effect the server recorded. On-hand is reconstructed by summing
   *  these, which is what makes the ledger the authority rather than a log. */
  delta: number
  ref: string | null
  reason: string | null
  toBranchId: string | null
  createdAt: string
  createdBy: string | null
}

/** The §A11 terms, each read off the ledger rather than stated. */
export interface LedgerTotals {
  received: number
  transferIn: number
  consumed: number
  transferOut: number
  adjustments: number
  returned: number
  damaged: number
  /** Rows whose recorded delta disagrees with their own type and quantity.
   *  Reported, never hidden: a ledger that does not add up is the one thing
   *  this screen must not smooth over. */
  inconsistent: MovementRow[]
}

export function ledgerTotals(rows: readonly MovementRow[]): LedgerTotals {
  const totals: LedgerTotals = {
    received: 0,
    transferIn: 0,
    consumed: 0,
    transferOut: 0,
    adjustments: 0,
    returned: 0,
    damaged: 0,
    inconsistent: [],
  }
  for (const row of rows) {
    switch (row.type) {
      case 'in':
        totals.received += row.qty
        break
      case 'return':
        totals.returned += row.qty
        break
      case 'out':
        totals.consumed += row.qty
        break
      case 'damage':
        totals.damaged += row.qty
        break
      case 'adjust':
        totals.adjustments += row.delta
        break
      case 'adjust_down':
        totals.adjustments -= row.qty
        break
      case 'transfer':
        // A transfer is signed: out of this branch, or into it.
        if (row.delta < 0) totals.transferOut += row.qty
        else totals.transferIn += row.qty
        break
      default:
        break
    }
    const expected = MOVEMENT_TYPES.includes(row.type as MovementType)
      ? movementDelta(row.type as MovementType, row.qty)
      : null
    // `adjust` and `transfer` carry their direction in the delta, so only the
    // magnitude can be checked for them.
    const agrees =
      expected === null
        ? false
        : row.type === 'adjust' || row.type === 'transfer'
          ? Math.abs(row.delta) === Math.abs(row.qty)
          : row.delta === expected
    if (!agrees) totals.inconsistent.push(row)
  }
  return totals
}

/** `OnHand = Opening + Received + TransferIn + Returned − Consumed
 *  − TransferOut ± Adjustments − Damaged`, as a function rather than as a
 *  comment. §A11 tracks Returned as its own quantity, which is why `return`
 *  is a movement type and not a receipt. */
export function onHandFrom(opening: number, totals: LedgerTotals): number {
  return (
    opening +
    totals.received +
    totals.transferIn +
    totals.returned -
    totals.consumed -
    totals.transferOut +
    totals.adjustments -
    totals.damaged
  )
}

/** The opening quantity implied by the current on-hand and the whole ledger.
 *  The part row does not carry it — `openingStock` becomes the first on-hand
 *  and is never stored again — so it is derived by running the ledger back. */
export function openingFrom(onHand: number, rows: readonly MovementRow[]): number {
  return rows.reduce((balance, row) => balance - row.delta, onHand)
}

/** On-hand after each row, oldest first, ending at the part's current on-hand. */
export function runningBalances(onHand: number, rows: readonly MovementRow[]): number[] {
  const out: number[] = new Array(rows.length)
  let balance = onHand
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    out[index] = balance
    balance -= rows[index]?.delta ?? 0
  }
  return out
}

/* ═══════════════════════════════════════════════════ talking to the endpoint */

export interface MovementInput {
  type: MovementType
  qty: number
  ref?: string
  reason?: string
  toBranchId?: string
  /** Draw a consumption down against a held reservation (contract `movementCreate`). */
  fromReservation?: boolean
}

/** The body `POST`/`DELETE /inventory/:id/reservation` takes (contract
 *  `reservationBody`). A reservation is a hold on `parts.reserved`, not a ledger
 *  entry — it never appears as a movement type, so it has its own endpoint and
 *  its own input. */
export interface ReservationInput {
  qty: number
  ref?: string
  reason?: string
}

/** The stock-movement and reservation endpoints, as a seam a test can
 *  substitute. */
export interface MovementApi {
  list(partRef: string): Promise<MovementRow[]>
  /** `idempotencyKey` is what makes a retried receipt safe: the server replays
   *  the first result instead of receiving the stock twice. */
  record(partRef: string, input: MovementInput, idempotencyKey: string): Promise<MovementRow[]>
  /** Hold stock against `parts.reserved`. The server takes the row lock and
   *  refuses a hold larger than what is on hand (`checkReservation`). */
  reserve(partRef: string, input: ReservationInput): Promise<void>
  /** Give a held reservation back. The server refuses a release larger than the
   *  hold (`checkReservationRelease`). */
  release(partRef: string, input: ReservationInput): Promise<void>
}

/** Why the ledger cannot be reached, or null when it can.
 *
 *  `VITE_API_URL` unset means the app is reading the design fixtures: there is
 *  no server to ask, no ledger to read, and the fixture repository refuses
 *  writes by design rather than pretending they landed. Saying that plainly is
 *  the honest state — better than a disabled button with no reason, and far
 *  better than a form that appears to save. */
export function movementUnavailableReason(): string | null {
  if (!API_URL) {
    return 'Stock movements need the API. This build is reading design fixtures, which hold no ledger and refuse writes.'
  }
  return null
}

type TokenReader = () => string | null | undefined

let readAccessToken: TokenReader = getAccessToken

/** Supplies the bearer token to the movement endpoints.
 *
 *  `data/repository.ts` owns the one authenticated HTTP path in the app — the
 *  session registers a token provider there and every collection request reads
 *  it. Both movement endpoints are actions on a part rather than collection
 *  CRUD, so neither can borrow that path: `createHttpRepository` can be pointed
 *  at a sub-collection, but `/inventory/:id/movement` is not one.
 *
 *  So the token arrives here instead, read from `getAccessToken` — the same
 *  source the repository attaches to every collection request — so a movement
 *  against a live API now carries the caller's identity instead of a 401. This
 *  setter remains for the tests, which override the reader directly, so the
 *  request shape and the error mapping are proven without a session. */
export function setInventoryAccessTokenProvider(read: TokenReader): void {
  readAccessToken = read
}

interface ApiErrorBody {
  error?: { code?: string; message?: string; field?: string }
}

async function movementFetch<TResult>(path: string, init: RequestInit = {}): Promise<TResult> {
  const token = readAccessToken()
  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  if (init.body) headers.set('content-type', 'application/json')
  if (token) headers.set('authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }

  const text = await response.text()
  const body = text ? (JSON.parse(text) as unknown) : null
  if (!response.ok) {
    const envelope = (body ?? {}) as ApiErrorBody
    throw new RepositoryError(
      (envelope.error?.code as RepositoryErrorCode) ?? 'internal',
      envelope.error?.message ?? `Request failed with status ${response.status}.`,
      { field: envelope.error?.field, status: response.status }
    )
  }
  return body as TResult
}

/** The live transport, or null when `movementUnavailableReason` has something
 *  to say — so a caller cannot accidentally fire a request that cannot work. */
export function httpMovementApi(): MovementApi | null {
  if (movementUnavailableReason()) return null
  return {
    async list(partRef) {
      const body = await movementFetch<{ rows?: MovementRow[] }>(
        `/inventory/${encodeURIComponent(partRef)}/movements`
      )
      return body?.rows ?? []
    },
    async record(partRef, input, idempotencyKey) {
      await movementFetch(`/inventory/${encodeURIComponent(partRef)}/movement`, {
        method: 'POST',
        headers: { 'idempotency-key': idempotencyKey },
        body: JSON.stringify(input),
      })
      return this.list(partRef)
    },
    async reserve(partRef, input) {
      await movementFetch(`/inventory/${encodeURIComponent(partRef)}/reservation`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },
    async release(partRef, input) {
      await movementFetch(`/inventory/${encodeURIComponent(partRef)}/reservation`, {
        method: 'DELETE',
        body: JSON.stringify(input),
      })
    },
  }
}

/* ══════════════════════════════════════════════════════ reading a part's row */

/** The API row carries more than the fixture row does. Read through accessors
 *  so the screen works against both without claiming a number it never got:
 *  `null` means "this dataset does not say", which is not the same as zero. */
interface PartExtras {
  _id?: string
  reserved?: number
  available?: number
  priceHalalas?: number
  costHalalas?: number | null
  backorderable?: boolean
}

const extras = (part: Part): PartExtras => part as Part & PartExtras

/** How the movement endpoints address this part. Both accept the ULID or the
 *  SKU, and the SKU is the only one the fixtures have. */
export function partRef(part: Part): string {
  return extras(part)._id ?? part.sku
}

function reservedOf(part: Part): number | null {
  const value = extras(part).reserved
  return typeof value === 'number' ? value : null
}

function availableOf(part: Part): number | null {
  const value = extras(part).available
  return typeof value === 'number' ? value : part.stock - (reservedOf(part) ?? 0)
}

function priceHalalasOf(part: Part): number {
  const value = extras(part).priceHalalas
  return typeof value === 'number' ? value : Math.round(parseSar(part.price) * 100)
}

function costHalalasOf(part: Part): number | null {
  const value = extras(part).costHalalas
  return typeof value === 'number' ? value : null
}

function backorderableOf(part: Part): boolean {
  return extras(part).backorderable === true
}

/* ═════════════════════════════════════════════════════════════════ the screen */

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'Package' },
  { id: 'alerts', label: 'Alerts', icon: 'AlertTriangle' },
  { id: 'reorder', label: 'Auto-Reorder', icon: 'Settings' },
  { id: 'transfers', label: 'Transfers', icon: 'ArrowLeftRight' },
  { id: 'pricing', label: 'Pricing', icon: 'TrendingUp' },
  { id: 'audit', label: 'Audit', icon: 'History' },
] as const

/** Inventory & parts management.
 *
 *  Six tabs that all rendered the same table were a named piece of technical
 *  debt: the screen said "Transfers" and showed the parts list, so a reader had
 *  no way to tell a tab with nothing behind it from a tab that was lying. Each
 *  one now carries its own content, and the two that have nothing behind them
 *  yet say exactly that and why.
 *
 *  Stock quantity is never written from here. It changes only through
 *  `POST /inventory/:id/movement`, which locks the part row, applies the §A11
 *  invariant and appends to the ledger — so on-hand is a consequence of the
 *  movements, not a field a screen can set.
 *
 *  The reference screenshot tints "In Stock" green. Blue here — green is
 *  forbidden brand-wide (handoff README §7), and blue already carries positive
 *  state everywhere else in this app.
 *
 *  `api` is injected only by tests. Production renders `<Inventory />` and gets
 *  the real transport. */
export function Inventory({ api }: { api?: MovementApi | null } = {}) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { can, fieldHidden, user } = useSession()
  const { data: parts = [], isLoading, isError, refetch } = useCollection('parts')
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')
  // The open dialog is remembered by SKU, not by row. Holding the row would
  // pin the quantity it had when it was opened, and every figure in the dialog
  // — the projection, the running balances, the reconciliation — is derived
  // from the current quantity. After a movement lands, the list is refetched
  // and the dialog has to move with it or it starts contradicting itself.
  const [ledgerSku, setLedgerSku] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // `api === undefined` means "not injected", which is the production path.
  // `api === null` is a test saying "there is no transport", which is a
  // different statement and must not be overwritten by the real one.
  const movements = useMemo(() => (api === undefined ? httpMovementApi() : api), [api])
  const unavailable = movements ? null : movementUnavailableReason()

  const mayEdit = can('inventory', 'e')
  const mayCreate = can('inventory', 'c')
  // Purchase price is hidden from advisors, technicians, QC, front desk and
  // call centre (FIELD_RULES), so the price column drops out entirely for them
  // rather than showing a column of dashes.
  const hidePrice = fieldHidden('Supplier purchase price')
  const hideCost = fieldHidden('Part cost / margin')

  const lowStock = useMemo(
    () =>
      parts
        .filter((part) => part.stock <= part.reorder)
        .slice()
        .sort((a, b) => b.reorder - b.stock - (a.reorder - a.stock)),
    [parts]
  )

  const searched = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return parts
    return parts.filter((part) =>
      [part.name, part.sku].some((field) => field.toLowerCase().includes(needle))
    )
  }, [parts, query])

  // A dataset that carries no reservations says so. Summing it to zero would
  // claim that nothing is committed, which is a different statement from
  // not knowing.
  const knowsReserved = parts.some((part) => reservedOf(part) !== null)

  const stats: Stat[] = [
    { label: 'Total Parts', value: parts.length, caption: 'Active items', highlight: true },
    {
      label: 'Low Stock Alerts',
      value: lowStock.length,
      caption: 'Requires attention',
      tone: 'warning',
    },
    {
      label: 'Reserved Units',
      value: knowsReserved ? parts.reduce((sum, part) => sum + (reservedOf(part) ?? 0), 0) : '—',
      caption: knowsReserved ? 'Committed to open jobs' : 'Not recorded in this dataset',
      tone: 'info',
    },
    hidePrice
      ? {
          label: 'Units On Hand',
          value: parts.reduce((sum, part) => sum + part.stock, 0),
          caption: 'Across every tracked part',
        }
      : {
          label: 'Stock Value',
          value: formatSar(
            parts.reduce((sum, part) => sum + priceHalalasOf(part) * part.stock, 0) / 100,
            { bare: true }
          ),
          caption: 'On hand at sell price',
        },
  ]

  const ledgerPart = parts.find((part) => part.sku === ledgerSku) ?? null
  const openLedger = useCallback((part: Part) => setLedgerSku(part.sku), [])

  const body = isError ? (
    <Section title={t('Inventory Summary')}>
      <ErrorState
        title={t("Couldn't load the parts list")}
        description={t('The request failed. Nothing has been changed — retry, or check the service status if this keeps happening.')}
        onRetry={() => void refetch()}
      />
    </Section>
  ) : tab === 'alerts' ? (
    <AlertsTab
      parts={lowStock}
      loading={isLoading}
      mayEdit={mayEdit}
      onReceive={openLedger}
    />
  ) : tab === 'reorder' ? (
    <AutoReorderTab candidates={lowStock.length} />
  ) : tab === 'transfers' ? (
    <LedgerTab
      parts={parts}
      loading={isLoading}
      api={movements}
      unavailable={unavailable}
      only={['transfer']}
      title={t('Stock Transfers')}
      subtitle={t('Movements between branches, newest last, for the part you select.')}
      emptyTitle={t('No transfers recorded')}
      emptyDescription={t('This part has never been transferred between branches.')}
    />
  ) : tab === 'pricing' ? (
    <PricingTab
      parts={searched}
      loading={isLoading}
      hidePrice={hidePrice}
      hideCost={hideCost}
      query={query}
      onQuery={setQuery}
    />
  ) : tab === 'audit' ? (
    <LedgerTab
      parts={parts}
      loading={isLoading}
      api={movements}
      unavailable={unavailable}
      title={t('Stock Movement Audit')}
      subtitle={t('Every movement recorded against the part you select, with the balance it left behind.')}
      emptyTitle={t('No movements recorded')}
      emptyDescription={t('Nothing has moved this part\'s stock since it was opened.')}
      reconcile
    />
  ) : (
    <OverviewTab
      parts={searched}
      loading={isLoading}
      hidePrice={hidePrice}
      query={query}
      onQuery={setQuery}
      onOpen={openLedger}
    />
  )

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Package" title={t('Inventory & Parts')} />
        <TabBar tabs={TABS} value={tab} onChange={setTab} />
        <StatRow stats={stats} />
        <div role="tabpanel" tabIndex={0}
          aria-label={t(TABS.find((entry) => entry.id === tab)?.label ?? 'Overview')}
          className="flex flex-col gap-4 focus-visible:outline-none">
          {body}
        </div>
        {creating ? <AddPartModal onClose={() => setCreating(false)} /> : null}
        {ledgerPart ? (
          <PartLedgerModal part={ledgerPart} api={movements} unavailable={unavailable}
            mayEdit={mayEdit} onClose={() => setLedgerSku(null)} />
        ) : null}
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="Package"
        title={t('Inventory & Parts Management')}
        subtitle={t('Advanced inventory control with stock alerts, auto-reordering, and multi-location transfers')}
        actions={
          mayCreate ? (
            <Button onClick={() => setCreating(true)}>
              <Icon name="Plus" size={16} />
              {t('Add Part')}
            </Button>
          ) : undefined
        }
      />

      <BranchScope branchId={user?.branchId ?? null} />
      <TabBar tabs={TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      {mayEdit ? null : (
        <ReadOnlyNotice
          message={t('Read-only — your role can view stock but not record movements.')}
        />
      )}

      {/* The tab bar is a `tablist` whose panel is rendered here, so the panel
          says what it is and can be reached with a keyboard rather than being
          an anonymous region that follows a set of buttons. */}
      <div
        role="tabpanel"
        tabIndex={0}
        aria-label={t(TABS.find((entry) => entry.id === tab)?.label ?? 'Overview')}
        className="flex flex-col gap-6 focus-visible:outline-none"
      >
        {body}
      </div>

      {creating ? <AddPartModal onClose={() => setCreating(false)} /> : null}

      {ledgerPart ? (
        <PartLedgerModal
          part={ledgerPart}
          api={movements}
          unavailable={unavailable}
          mayEdit={mayEdit}
          onClose={() => setLedgerSku(null)}
        />
      ) : null}
    </>
  )
}

/** Which stock these numbers are.
 *
 *  The design puts a branch dropdown here. It cannot be one: reads are scoped
 *  by row-level security to the branch in the caller's token, so a client-side
 *  picker could only ever re-label the same rows — and the three branch names
 *  the prototype offered exist nowhere in the system. Nothing lists branches
 *  either: `branches` is a table with no collection and no endpoint. So this
 *  states the scope instead of pretending to change it. */
function BranchScope({ branchId }: { branchId: string | null }) {
  const { t } = usePreferences()
  return (
    <p className="flex flex-wrap items-center gap-2 rounded border border-border bg-inset px-3 py-2 text-[13px] text-body">
      <Icon name="Warehouse" size={15} className="flex-shrink-0 text-muted" />
      {branchId ? (
        <>
          {t('Stock for the branch this session belongs to.')}
          <span dir="ltr" className="font-mono text-xs text-muted">
            {branchId}
          </span>
        </>
      ) : (
        t('Stock for the branch this session belongs to. The server decides which — it is not chosen here.')
      )}
    </p>
  )
}

/* ────────────────────────────────────────────────────────────────── overview */

function OverviewTab({
  parts,
  loading,
  hidePrice,
  query,
  onQuery,
  onOpen,
}: {
  parts: readonly Part[]
  loading: boolean
  hidePrice: boolean
  query: string
  onQuery: (next: string) => void
  onOpen: (part: Part) => void
}) {
  const { t } = usePreferences()

  const columns: Column<Part>[] = [
    { header: 'Part Name', cell: (part) => part.name },
    { header: 'SKU', cell: (part) => part.sku, code: true },
    { header: 'On Hand', cell: (part) => <Qty value={part.stock} />, code: true },
    {
      header: 'Available',
      cell: (part) => <Qty value={availableOf(part)} muted />,
      code: true,
    },
    { header: 'Reorder At', cell: (part) => <Qty value={part.reorder} muted />, code: true },
    ...(hidePrice
      ? []
      : [
          {
            header: 'Price',
            cell: (part: Part) => <Money sar={priceHalalasOf(part) / 100} />,
          },
        ]),
    { header: 'Stock Status', cell: (part) => <StockBadge part={part} /> },
  ]

  return (
    <Section
      title={t('Inventory Summary')}
      subtitle={t('Quick overview of parts inventory')}
      toolbar={
        <SearchField
          value={query}
          onChange={onQuery}
          placeholder={t('Search parts...')}
          className="w-full sm:w-[280px]"
        />
      }
    >
      <DataTable
        caption="Current stock levels by part"
        className="border-0 shadow-none"
        columns={columns}
        rows={parts}
        rowKey={(part) => part.sku}
        loading={loading}
        onRowClick={onOpen}
        mobileCard={(part) => (
          <>
            <MobileCardHeader title={part.name} trailing={<StockBadge part={part} />} />
            <MobileCardRow label={t('SKU')}>
              <span className="font-mono" dir="ltr">
                {part.sku}
              </span>
            </MobileCardRow>
            <MobileCardRow label={t('On Hand')}>
              <span className="font-mono" dir="ltr">
                {part.stock} / {part.reorder}
              </span>
            </MobileCardRow>
            {hidePrice ? null : (
              <MobileCardRow label={t('Price')}>
                <Money
                  sar={priceHalalasOf(part) / 100}
                  className="font-semibold text-heading"
                />
              </MobileCardRow>
            )}
          </>
        )}
        empty={
          <EmptyState
            icon="Package"
            title={t('No parts tracked yet')}
            description={t('Add parts to start tracking stock.')}
          />
        }
      />
    </Section>
  )
}

/* ──────────────────────────────────────────────────────────────────── alerts */

function AlertsTab({
  parts,
  loading,
  mayEdit,
  onReceive,
}: {
  parts: readonly Part[]
  loading: boolean
  mayEdit: boolean
  onReceive: (part: Part) => void
}) {
  const { t } = usePreferences()

  const shortfall = (part: Part) => Math.max(0, part.reorder - part.stock)

  const columns: Column<Part>[] = [
    { header: 'Part Name', cell: (part) => part.name },
    { header: 'SKU', cell: (part) => part.sku, code: true },
    { header: 'On Hand', cell: (part) => <Qty value={part.stock} />, code: true },
    { header: 'Reorder At', cell: (part) => <Qty value={part.reorder} muted />, code: true },
    {
      header: 'Shortfall',
      cell: (part) => (
        <span className="font-mono text-[13px] font-semibold text-salis-orange" dir="ltr">
          {shortfall(part)}
        </span>
      ),
    },
    { header: 'Severity', cell: (part) => <StockBadge part={part} /> },
    ...(mayEdit
      ? [
          {
            header: 'Action',
            cell: (part: Part) => (
              <Button variant="outline" size="sm" onClick={() => onReceive(part)}>
                <Icon name="ArrowDown" size={14} />
                {t('Receive')}
              </Button>
            ),
          },
        ]
      : []),
  ]

  return (
    <Section
      title={t('Low Stock Alerts')}
      subtitle={t('Parts at or below their reorder point, worst shortfall first.')}
    >
      <DataTable
        caption="Low stock alerts"
        className="border-0 shadow-none"
        columns={columns}
        rows={parts}
        rowKey={(part) => part.sku}
        loading={loading}
        mobileCard={(part) => (
          <>
            <MobileCardHeader title={part.name} trailing={<StockBadge part={part} />} />
            <MobileCardRow label={t('SKU')}>
              <span className="font-mono" dir="ltr">
                {part.sku}
              </span>
            </MobileCardRow>
            <MobileCardRow label={t('On Hand')}>
              <span className="font-mono" dir="ltr">
                {part.stock} / {part.reorder}
              </span>
            </MobileCardRow>
            <MobileCardRow label={t('Shortfall')}>
              <span className="font-mono font-semibold text-salis-orange" dir="ltr">
                {shortfall(part)}
              </span>
            </MobileCardRow>
            {mayEdit ? (
              <Button variant="outline" size="sm" onClick={() => onReceive(part)}>
                <Icon name="ArrowDown" size={14} />
                {t('Receive')}
              </Button>
            ) : null}
          </>
        )}
        empty={
          <EmptyState
            icon="ShieldCheck"
            title={t('No low stock alerts')}
            description={t('Every part is above its reorder point.')}
          />
        }
      />
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────── auto-reorder */

/** Nothing stores an auto-reorder rule: no table, no collection, no endpoint.
 *  Saying so beats showing the parts table again under a different heading, and
 *  beats an invented list of rules that nothing would ever act on. */
function AutoReorderTab({ candidates }: { candidates: number }) {
  const { t } = usePreferences()
  return (
    <Section
      title={t('Automatic Reordering')}
      subtitle={t('Rules that raise a purchase order when stock crosses its reorder point.')}
    >
      <EmptyState
        icon="Settings"
        title={t('No auto-reorder rules exist yet')}
        description={t('Reorder rules have no storage behind them — no table, no endpoint — so none can be listed or created here. Until they do, the Alerts tab is the working reorder signal.')}
      />
      <p className="text-center text-[13px] text-muted">
        <span dir="ltr" className="font-mono font-semibold text-salis-orange">
          {candidates}
        </span>{' '}
        {t('parts would trigger a rule today, judged against their reorder points.')}
      </p>
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────────── pricing */

function PricingTab({
  parts,
  loading,
  hidePrice,
  hideCost,
  query,
  onQuery,
}: {
  parts: readonly Part[]
  loading: boolean
  hidePrice: boolean
  hideCost: boolean
  query: string
  onQuery: (next: string) => void
}) {
  const { t } = usePreferences()

  if (hidePrice && hideCost) {
    return (
      <Section title={t('Pricing & Margin')}>
        <PermissionDenied
          description={t('Your role may see stock levels but not part prices, cost or margin.')}
        />
      </Section>
    )
  }

  const knownCost = parts.some((part) => costHalalasOf(part) !== null)

  const columns: Column<Part>[] = [
    { header: 'Part Name', cell: (part) => part.name },
    { header: 'SKU', cell: (part) => part.sku, code: true },
    ...(hidePrice
      ? []
      : [
          {
            header: 'Sell Price',
            cell: (part: Part) => <Money sar={priceHalalasOf(part) / 100} />,
          },
        ]),
    ...(hideCost || !knownCost
      ? []
      : [
          {
            header: 'Cost',
            cell: (part: Part) => {
              const cost = costHalalasOf(part)
              return cost === null ? <Unknown /> : <Money sar={cost / 100} />
            },
          },
          {
            header: 'Margin',
            cell: (part: Part) => {
              const cost = costHalalasOf(part)
              if (cost === null) return <Unknown />
              const margin = priceHalalasOf(part) - cost
              return <Money sar={margin / 100} className="font-semibold text-heading" />
            },
          },
          {
            header: 'Margin %',
            cell: (part: Part) => {
              const cost = costHalalasOf(part)
              const price = priceHalalasOf(part)
              if (cost === null || price === 0) return <Unknown />
              return (
                <span className="font-mono text-[13px]" dir="ltr">
                  {Math.round(((price - cost) / price) * 100)}%
                </span>
              )
            },
          },
        ]),
    {
      header: 'Stock Value',
      cell: (part) => <Money sar={(priceHalalasOf(part) * part.stock) / 100} />,
    },
  ]

  return (
    <Section
      title={t('Pricing & Margin')}
      subtitle={t('Sell price against cost, and what the stock on hand is worth.')}
      toolbar={
        // The same search the Overview tab uses, over the same state — a filter
        // that keeps applying while its box is nowhere on screen is how a table
        // ends up "missing" rows nobody can explain.
        <SearchField
          value={query}
          onChange={onQuery}
          placeholder={t('Search parts...')}
          className="w-full sm:w-[280px]"
        />
      }
    >
      {hideCost ? (
        <ReadOnlyNotice
          message={t('Cost and margin are hidden from your role, so those columns are not shown.')}
        />
      ) : knownCost ? null : (
        <ReadOnlyNotice
          message={t('This dataset carries no cost figures, so margin cannot be worked out. Sell price and stock value are shown.')}
        />
      )}
      <DataTable
        caption="Part pricing and margin"
        className="border-0 shadow-none"
        columns={columns}
        rows={parts}
        rowKey={(part) => part.sku}
        loading={loading}
        mobileCard={(part) => {
          const cost = costHalalasOf(part)
          return (
            <>
              <MobileCardHeader
                title={part.name}
                trailing={
                  hidePrice ? undefined : <Money sar={priceHalalasOf(part) / 100} />
                }
              />
              <MobileCardRow label={t('SKU')}>
                <span className="font-mono" dir="ltr">
                  {part.sku}
                </span>
              </MobileCardRow>
              {hideCost || !knownCost ? null : (
                <MobileCardRow label={t('Cost')}>
                  {cost === null ? <Unknown /> : <Money sar={cost / 100} />}
                </MobileCardRow>
              )}
              <MobileCardRow label={t('Stock Value')}>
                <Money sar={(priceHalalasOf(part) * part.stock) / 100} />
              </MobileCardRow>
            </>
          )
        }}
        empty={
          <EmptyState
            icon="Tag"
            title={t('No parts to price')}
            description={t('Add parts to start tracking stock.')}
          />
        }
      />
    </Section>
  )
}

/* ─────────────────────────────────────────────────────── transfers and audit */

/** The ledger endpoint is per part, so both ledger tabs start by choosing one.
 *  There is no all-parts movement feed to show, and inventing one by fanning
 *  out a request per part would be a different screen with different costs. */
function LedgerTab({
  parts,
  loading,
  api,
  unavailable,
  only,
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  reconcile,
}: {
  parts: readonly Part[]
  loading: boolean
  api: MovementApi | null
  unavailable: string | null
  only?: readonly MovementType[]
  title: string
  subtitle: string
  emptyTitle: string
  emptyDescription: string
  reconcile?: boolean
}) {
  const { t } = usePreferences()
  const [sku, setSku] = useState<string>('')
  const selected = parts.find((part) => part.sku === sku) ?? parts[0] ?? null

  return (
    <Section title={t(title)} subtitle={t(subtitle)}>
      {loading ? (
        <Loading label={t('Loading parts...')} />
      ) : !selected ? (
        <EmptyState
          icon="Package"
          title={t('No parts tracked yet')}
          description={t('Add parts to start tracking stock.')}
        />
      ) : (
        <>
          <label className="flex flex-col gap-1">
            <span className="font-action text-xs font-medium text-heading">{t('Part')}</span>
            <Select
              value={selected.sku}
              onChange={(event) => setSku(event.target.value)}
              aria-label={t('Part')}
              className="h-12 w-full max-w-[420px] bg-inset font-action text-sm"
            >
              {parts.map((part) => (
                <option key={part.sku} value={part.sku}>
                  {`${part.name} — ${part.sku}`}
                </option>
              ))}
            </Select>
          </label>
          <MovementHistory
            part={selected}
            api={api}
            unavailable={unavailable}
            only={only}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            reconcile={reconcile}
          />
        </>
      )}
    </Section>
  )
}

const TYPE_LABEL: Record<string, string> = {
  in: 'Received',
  out: 'Consumed',
  transfer: 'Transferred',
  adjust: 'Adjusted Up',
  adjust_down: 'Adjusted Down',
  return: 'Returned',
  damage: 'Damaged',
}

/** `GET /inventory/:id/movements`, with the balance each row left behind and —
 *  when asked — the §A11 reconciliation the whole ledger has to satisfy. */
function MovementHistory({
  part,
  api,
  unavailable,
  only,
  emptyTitle,
  emptyDescription,
  reconcile,
}: {
  part: Part
  api: MovementApi | null
  unavailable: string | null
  only?: readonly MovementType[]
  emptyTitle: string
  emptyDescription: string
  reconcile?: boolean
}) {
  const { t } = usePreferences()
  const ref = partRef(part)
  const query = useQuery<MovementRow[], Error>({
    queryKey: ['inventory-movements', ref],
    queryFn: () => (api as MovementApi).list(ref),
    enabled: api !== null,
  })

  if (!api) {
    return (
      <EmptyState
        icon="CloudOff"
        title={t('The stock ledger is unavailable')}
        description={t(unavailable ?? 'The stock ledger cannot be reached from this build.')}
      />
    )
  }
  if (query.isLoading) return <Loading label={t('Loading movements...')} />
  if (query.isError) {
    return (
      <ErrorState
        title={t("Couldn't load the movement history")}
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const rows = query.data ?? []
  const balances = runningBalances(part.stock, rows)
  const totals = ledgerTotals(rows)
  const opening = openingFrom(part.stock, rows)
  const shown = only ? rows.filter((row) => only.includes(row.type as MovementType)) : rows
  const shownBalances = new Map(rows.map((row, index) => [row.id, balances[index] ?? 0]))

  const columns: Column<MovementRow>[] = [
    { header: 'When', cell: (row) => <DateCell value={row.createdAt} />, code: true },
    {
      header: 'Movement',
      cell: (row) => (
        <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">
          {t(TYPE_LABEL[row.type] ?? row.type)}
        </Badge>
      ),
    },
    {
      header: 'Quantity',
      cell: (row) => (
        <span
          className={row.delta < 0 ? 'font-mono text-[13px] text-salis-orange' : 'font-mono text-[13px]'}
          dir="ltr"
        >
          {row.delta > 0 ? `+${row.delta}` : row.delta}
        </span>
      ),
    },
    {
      header: 'On Hand After',
      cell: (row) => <Qty value={shownBalances.get(row.id) ?? null} />,
      code: true,
    },
    { header: 'Reference', cell: (row) => row.ref ?? <Unknown />, code: true },
    { header: 'Reason', cell: (row) => row.reason ?? <Unknown /> },
  ]

  return (
    <>
      {reconcile ? (
        <Reconciliation
          opening={opening}
          totals={totals}
          onHand={part.stock}
          movements={rows.length}
        />
      ) : null}
      <DataTable
        caption="Stock movements"
        className="border-0 shadow-none"
        columns={columns}
        rows={shown}
        rowKey={(row) => row.id}
        mobileCard={(row) => (
          <>
            <MobileCardHeader
              title={t(TYPE_LABEL[row.type] ?? row.type)}
              trailing={
                <span
                  className={row.delta < 0 ? 'font-mono text-salis-orange' : 'font-mono'}
                  dir="ltr"
                >
                  {row.delta > 0 ? `+${row.delta}` : row.delta}
                </span>
              }
            />
            <MobileCardRow label={t('When')}>
              <DateCell value={row.createdAt} />
            </MobileCardRow>
            <MobileCardRow label={t('On Hand After')}>
              <Qty value={shownBalances.get(row.id) ?? null} />
            </MobileCardRow>
            {row.reason ? (
              <MobileCardRow label={t('Reason')}>{row.reason}</MobileCardRow>
            ) : null}
          </>
        )}
        empty={<EmptyState icon="History" title={t(emptyTitle)} description={t(emptyDescription)} />}
      />
    </>
  )
}

/** The §A11 equation, spelled out against this part's own ledger.
 *
 *  Shown rather than asserted silently: if the two sides ever disagree the
 *  screen says so, because a quantity the UI keeps consistent while the
 *  database drifts is worse than a visible failure. */
function Reconciliation({
  opening,
  totals,
  onHand,
  movements,
}: {
  opening: number
  totals: LedgerTotals
  onHand: number
  movements: number
}) {
  const { t } = usePreferences()
  const derived = onHandFrom(opening, totals)
  const agrees = derived === onHand && totals.inconsistent.length === 0

  const terms: [string, number][] = [
    ['Opening', opening],
    ['Received', totals.received],
    ['Transfer In', totals.transferIn],
    ['Returned', totals.returned],
    ['Consumed', -totals.consumed],
    ['Transfer Out', -totals.transferOut],
    ['Adjustments', totals.adjustments],
    ['Damaged', -totals.damaged],
  ]

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-inset p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {terms.map(([label, value]) => (
          <span key={label} className="flex flex-col">
            <span className="text-[11px] text-muted">{t(label)}</span>
            <span className="font-mono text-sm font-semibold text-heading" dir="ltr">
              {value > 0 && label !== 'Opening' ? `+${value}` : value}
            </span>
          </span>
        ))}
        <span className="flex-1" />
        <span className="flex flex-col items-end">
          <span className="text-[11px] text-muted">{t('On Hand')}</span>
          <span
            className={
              agrees
                ? 'font-mono text-sm font-semibold text-salis-blue'
                : 'font-mono text-sm font-semibold text-salis-orange'
            }
            dir="ltr"
          >
            {onHand}
          </span>
        </span>
      </div>
      {agrees ? (
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <Icon name="ShieldCheck" size={15} className="flex-shrink-0 text-salis-blue" />
          {t('The ledger reconciles with the recorded quantity across')}{' '}
          <span dir="ltr" className="font-mono">
            {movements}
          </span>{' '}
          {t('movements.')}
        </p>
      ) : (
        <p role="alert" className="flex items-start gap-2 text-[13px] text-salis-orange">
          <Icon name="AlertTriangle" size={15} className="mt-0.5 flex-shrink-0" />
          {t('The ledger does not reconcile with the recorded quantity. The movements add up to')}{' '}
          <span dir="ltr" className="font-mono">
            {derived}
          </span>
          {'. '}
          {totals.inconsistent.length
            ? t('Some rows record an effect that disagrees with their own type and quantity.')
            : t('Report this before trusting either number.')}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════ recording a movement */

interface MovementKind {
  id: string
  type: MovementType
  /** Button and dialog title. */
  label: string
  title: string
  description: string
  icon: string
  /** What the reference field is called for this kind of movement. */
  refLabel: string
  refHint: string
  quantityLabel: string
  reasonRequired?: boolean
  destructive?: boolean
  needsBranch?: boolean
  /** Shown under the quantity field when the endpoint constrains this kind. */
  note?: string
  /** A consequence of recording this movement that the operator has to know
   *  before deciding, not after. Shown in the dialog, not buried in a hint. */
  warning?: string
  /** Whether this kind can draw its quantity down from a held reservation. Only
   *  a consumption may (contract `movementCreate`), and the modal offers the
   *  choice only when there is a reservation to draw on. */
  allowFromReservation?: boolean
}

/** The movement kinds the API can record.
 *
 *  Seven of them, one per `movementType` (`packages/contract/src/entities/part.ts`).
 *  `return` is its own kind so a customer or job return is booked as Returned,
 *  never folded into Received; `adjust_down` is the signed counterpart to
 *  `adjust`, its quantity kept positive with the type carrying the sign (the
 *  server refuses a negative quantity). Both were added when the server closed
 *  F-017; a reservation is not here because it is a hold, not a ledger entry —
 *  it has its own endpoint and its own control on the ledger dialog. */
export const MOVEMENT_KINDS: readonly MovementKind[] = [
  {
    id: 'receive',
    type: 'in',
    label: 'Receive Stock',
    title: 'Receive Stock',
    description: 'Book received stock against this part. On hand rises by the quantity received.',
    icon: 'ArrowDown',
    refLabel: 'Purchase Order / Delivery Note',
    refHint: 'The document this delivery arrived against, so the receipt can be traced.',
    quantityLabel: 'Quantity Received',
  },
  {
    id: 'consume',
    type: 'out',
    label: 'Consume',
    title: 'Consume Stock',
    description: 'Issue stock to a job card. Only unreserved stock can be consumed, unless the consumption draws on a reservation.',
    icon: 'ArrowUp',
    refLabel: 'Job Card',
    refHint: 'The job this stock was issued to.',
    quantityLabel: 'Quantity Consumed',
    allowFromReservation: true,
  },
  {
    id: 'transfer',
    type: 'transfer',
    label: 'Transfer',
    title: 'Transfer Stock',
    description: 'Move stock to another branch. It leaves this branch immediately.',
    icon: 'ArrowLeftRight',
    refLabel: 'Transfer Note',
    refHint: 'The transfer document, so both branches can reconcile against it.',
    quantityLabel: 'Quantity Transferred',
    needsBranch: true,
    reasonRequired: true,
    warning:
      'The API books the outgoing half only: the destination branch is not credited, so until the paired movement exists a transfer lowers the total stock held across branches. Record the receiving side at the destination.',
  },
  {
    id: 'return',
    type: 'return',
    label: 'Return to Stock',
    title: 'Return to Stock',
    description: 'Book a part returned from a job or a customer back onto the shelf. Recorded as Returned, never as receiving, so the receiving total stays honest.',
    icon: 'RotateCcw',
    refLabel: 'Return Authorisation / Credit Note',
    refHint: 'The return this stock came back against, so the credit can be traced.',
    quantityLabel: 'Quantity Returned',
    reasonRequired: true,
  },
  {
    id: 'adjust',
    type: 'adjust',
    label: 'Adjust Up',
    title: 'Adjust Count Up',
    description: 'Correct the recorded quantity upward after a physical count found more than the books show.',
    icon: 'SlidersHorizontal',
    refLabel: 'Count Sheet',
    refHint: 'The stock count this correction came from.',
    quantityLabel: 'Quantity To Add',
    reasonRequired: true,
  },
  {
    id: 'adjust_down',
    type: 'adjust_down',
    label: 'Adjust Down',
    title: 'Adjust Count Down',
    description: 'Correct the recorded quantity downward after a physical count found fewer than the books show.',
    icon: 'Minus',
    refLabel: 'Count Sheet',
    refHint: 'The stock count this correction came from.',
    quantityLabel: 'Quantity To Remove',
    reasonRequired: true,
    note: 'Quantity stays positive — the correction subtracts it. A count cannot take stock below zero.',
  },
  {
    id: 'damage',
    type: 'damage',
    label: 'Record Damage',
    title: 'Record Damaged Stock',
    description: 'Write off stock that can no longer be sold or fitted.',
    icon: 'AlertTriangle',
    refLabel: 'Incident Reference',
    refHint: 'The report this write-off was raised under.',
    quantityLabel: 'Quantity Damaged',
    reasonRequired: true,
    destructive: true,
  },
]

/** Positive whole numbers only. A float in a stock count is not a rounding
 *  problem, it is a quantity nobody can pick off a shelf. */
const quantitySchema = z
  .string()
  .trim()
  .min(1, 'Enter a quantity.')
  .regex(/^\d+$/, 'Quantity must be a whole number of units.')
  .refine((value) => Number(value) >= 1, 'Quantity must be at least one unit.')
  .refine((value) => Number(value) <= 1_000_000, 'That is larger than a single movement can be.')

function movementSchema(kind: MovementKind) {
  return z.object({
    qty: quantitySchema,
    ref: z.string().trim().max(64, 'A reference can be at most 64 characters.'),
    reason: kind.reasonRequired
      ? z.string().trim().min(1, 'Say why this movement was made.').max(500)
      : z.string().trim().max(500, 'A reason can be at most 500 characters.'),
    // The contract takes a branch ULID, and nothing in the client can list
    // branches to choose from — so it is entered, and checked here exactly as
    // `packages/contract/src/primitives.ts` checks it. A friendly branch name
    // would be refused by the server, which is a worse experience than being
    // told the shape up front.
    toBranchId: kind.needsBranch
      ? z
          .string()
          .trim()
          .min(1, 'Enter the destination branch id.')
          .length(26, 'A branch id is 26 characters.')
          .regex(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/, 'That is not a branch id.')
      : z.string().trim(),
  })
}

function MovementModal({
  kind,
  part,
  api,
  onClose,
  onRecorded,
}: {
  kind: MovementKind
  part: Part
  api: MovementApi
  onClose: () => void
  onRecorded: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const ref = partRef(part)
  const reserved = reservedOf(part) ?? 0
  const backorderable = backorderableOf(part)

  // A consumption may draw its quantity from a held reservation, which lifts the
  // unreserved-balance bound and replaces it with the reservation's own — but
  // only when there is a reservation to draw on, so it is offered only then.
  const canDrawReservation = kind.allowFromReservation === true && reserved > 0
  const [fromReservation, setFromReservation] = useState(false)

  const schema = useMemo(() => movementSchema(kind), [kind])

  const form = useZodForm({
    schema,
    initial: { qty: '', ref: '', reason: '', toBranchId: '' },
    async onSubmit(values) {
      const qty = Number(values.qty)
      const drawsReservation = canDrawReservation && fromReservation
      // The same rule the endpoint applies, run early so an impossible movement
      // is refused on the field rather than as a round trip. The server still
      // decides: it holds the row lock and the current quantity.
      const failure = checkMovement({
        type: kind.type,
        qty,
        onHand: part.stock,
        reserved,
        backorderable,
        fromReservation: drawsReservation,
      })
      if (failure) throw new ServerValidationError({ [failure.field]: failure.message })

      try {
        await api.record(
          ref,
          {
            type: kind.type,
            qty,
            ...(values.ref ? { ref: values.ref } : {}),
            ...(values.reason ? { reason: values.reason } : {}),
            ...(values.toBranchId ? { toBranchId: values.toBranchId } : {}),
            ...(drawsReservation ? { fromReservation: true } : {}),
          },
          // One key per submission attempt, so the retry of a request that
          // timed out is replayed rather than received twice.
          idempotencyKey()
        )
      } catch (error) {
        throw asFormError(error)
      }

      await client.invalidateQueries({ queryKey: ['inventory-movements', ref] })
      await client.invalidateQueries({ queryKey: ['parts'] })
      toast.show({
        title: t('Movement recorded'),
        description: `${t(kind.label)} — ${part.name}`,
      })
      onRecorded()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)

  const close = useCallback(() => {
    void confirmDiscard().then((ok) => {
      if (ok) onClose()
    })
  }, [confirmDiscard, onClose])

  const projected = /^\d+$/.test(form.values.qty)
    ? part.stock + movementDelta(kind.type, Number(form.values.qty))
    : null

  return (
    <Modal
      open
      onClose={close}
      variant="lifecycle"
      icon={kind.icon}
      destructive={kind.destructive}
      title={kind.title}
      description={t(kind.description)}
      meta={
        <span dir="ltr" className="font-mono">
          {part.sku}
        </span>
      }
    >
      <Form form={form}>
        <FormErrorSummary />

        {kind.warning ? (
          <p
            role="note"
            className="flex items-start gap-2.5 rounded-lg border border-salis-orange/30 bg-[rgba(249,115,22,.06)] px-3.5 py-3 text-[13px] text-body"
          >
            <Icon name="AlertTriangle" size={15} className="mt-0.5 flex-shrink-0 text-salis-orange" />
            {t(kind.warning)}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded border border-border bg-inset px-3.5 py-2.5">
          <Figure label="On Hand" value={part.stock} />
          <Figure label="Reserved" value={reservedOf(part)} />
          <Figure label="Available" value={availableOf(part)} />
          {projected === null ? null : (
            <Figure label="After This Movement" value={projected} tone="blue" />
          )}
        </div>

        <Field
          name="qty"
          label={kind.quantityLabel}
          required
          placeholder="0"
          hint={kind.note ?? 'Whole units only.'}
        />
        {canDrawReservation ? (
          <label className="flex cursor-pointer items-start gap-2.5 rounded border border-border bg-inset px-3.5 py-2.5 text-[13px] text-body">
            <input
              type="checkbox"
              checked={fromReservation}
              onChange={(event) => setFromReservation(event.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-salis-blue"
            />
            <span>
              {t('Draw this consumption from the held reservation.')}{' '}
              <span dir="ltr" className="font-mono text-muted">
                {reserved}
              </span>{' '}
              {t('units are reserved; a draw is bounded by that, and releases the hold as it goes.')}
            </span>
          </label>
        ) : null}
        {kind.needsBranch ? (
          <Field
            name="toBranchId"
            label="Destination Branch Id"
            required
            placeholder="01JB7KQ2M4N8P0R2T4V6X8Z0AB"
            hint="Entered rather than chosen: no endpoint lists branches yet, and the API records the destination as a branch id."
          />
        ) : null}
        <Field name="ref" label={kind.refLabel} hint={kind.refHint} />
        <Field
          name="reason"
          label="Reason"
          kind="textarea"
          rows={2}
          required={kind.reasonRequired}
          hint="Recorded on the movement and in the audit log."
        />

        <FormActions note={kind.reasonRequired}>
          <Button variant="subtle" size="lg" onClick={close} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label={kind.label} />
        </FormActions>
      </Form>
    </Modal>
  )
}

/** Turns a rejected request into something the form can show.
 *
 *  A field the server names becomes a field error; a permission or rule
 *  refusal becomes the form-level message, in the server's own words — it knows
 *  why (an approval ceiling, a segregation-of-duties pairing) and the client
 *  does not. */
function asFormError(error: unknown): Error {
  if (!(error instanceof RepositoryError)) {
    return error instanceof Error ? error : new Error('The request failed.')
  }
  if (error.field) return new ServerValidationError({ [error.field]: error.message })
  if (error.code === 'forbidden') {
    return new ServerValidationError({}, error.message)
  }
  return new Error(error.message)
}

function idempotencyKey(): string {
  const globalCrypto = globalThis.crypto as Crypto | undefined
  if (globalCrypto?.randomUUID) return globalCrypto.randomUUID()
  return `mv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/* ─────────────────────────────────────────────────────── the part's ledger */

/** One part: what it holds, what may be done to it, and everything that has
 *  moved it. Opened from a row, and the only place a movement starts. */
function PartLedgerModal({
  part,
  api,
  unavailable,
  mayEdit,
  onClose,
}: {
  part: Part
  api: MovementApi | null
  unavailable: string | null
  mayEdit: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const [kind, setKind] = useState<MovementKind | null>(null)
  // The reservation flow is a hold on `parts.reserved`, not a ledger entry, so
  // it opens its own dialog rather than one of the movement kinds.
  const [reservation, setReservation] = useState<ReservationAction | null>(null)
  const reserved = reservedOf(part)

  return (
    <>
      <Modal
        open
        onClose={onClose}
        variant="data"
        icon="Package"
        title={part.name}
        description={t('Stock on hand, and every movement that produced it.')}
        meta={
          <span dir="ltr" className="font-mono">
            {part.sku}
          </span>
        }
        footer={
          <Button variant="subtle" size="lg" onClick={onClose}>
            {t('Close')}
          </Button>
        }
      >
        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded border border-border bg-inset px-3.5 py-2.5">
          <Figure label="On Hand" value={part.stock} />
          <Figure label="Reserved" value={reservedOf(part)} />
          <Figure label="Available" value={availableOf(part)} />
          <Figure label="Reorder At" value={part.reorder} />
        </div>

        {mayEdit ? (
          api ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {MOVEMENT_KINDS.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setKind(option)}
                  >
                    <Icon name={option.icon} size={14} />
                    {t(option.label)}
                  </Button>
                ))}
              </div>
              {/* Reserved and Available, honestly: a reservation holds stock
                  against open work without moving it, so consumption and
                  transfer see less than is on hand until the hold is released
                  or drawn down. */}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setReservation('reserve')}>
                  <Icon name="Lock" size={14} />
                  {t('Reserve Stock')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(reserved ?? 0) <= 0}
                  onClick={() => setReservation('release')}
                >
                  <Icon name="RotateCcw" size={14} />
                  {t('Release Reservation')}
                </Button>
                {(reserved ?? 0) <= 0 ? (
                  <span className="text-[13px] text-muted">
                    {t('No stock is reserved on this part.')}
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <ReadOnlyNotice
              message={t(unavailable ?? 'The stock ledger cannot be reached from this build.')}
            />
          )
        ) : (
          <ReadOnlyNotice
            message={t('Read-only — your role can view stock but not record movements.')}
          />
        )}

        <MovementHistory
          part={part}
          api={api}
          unavailable={unavailable}
          emptyTitle="No movements recorded"
          emptyDescription="Nothing has moved this part's stock since it was opened."
          reconcile
        />
      </Modal>

      {kind && api ? (
        <MovementModal
          kind={kind}
          part={part}
          api={api}
          onClose={() => setKind(null)}
          onRecorded={() => setKind(null)}
        />
      ) : null}

      {reservation && api ? (
        <ReservationModal
          action={reservation}
          part={part}
          api={api}
          onClose={() => setReservation(null)}
          onDone={() => setReservation(null)}
        />
      ) : null}
    </>
  )
}

/* ─────────────────────────────────────────────────────────── reservations */

type ReservationAction = 'reserve' | 'release'

/** Hold stock against open work, or give a hold back.
 *
 *  A reservation is not a movement: it does not touch on-hand or the ledger, it
 *  moves `parts.reserved` so that `Available = OnHand − Reserved` falls without
 *  any stock leaving the shelf. The endpoints are their own
 *  (`POST`/`DELETE /inventory/:id/reservation`), guarded by `checkReservation`
 *  and its release counterpart — a hold may not exceed what is on hand, a
 *  release may not exceed the hold — and the client mirrors both so an
 *  impossible request is refused on the field before the round trip. */
function ReservationModal({
  action,
  part,
  api,
  onClose,
  onDone,
}: {
  action: ReservationAction
  part: Part
  api: MovementApi
  onClose: () => void
  onDone: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const ref = partRef(part)
  const reserved = reservedOf(part) ?? 0
  const available = availableOf(part) ?? part.stock - reserved
  const reserving = action === 'reserve'

  const form = useZodForm({
    schema: z.object({
      qty: quantitySchema,
      ref: z.string().trim().max(64, 'A reference can be at most 64 characters.'),
      reason: z.string().trim().max(500, 'A reason can be at most 500 characters.'),
    }),
    initial: { qty: '', ref: '', reason: '' },
    async onSubmit(values) {
      const qty = Number(values.qty)
      // The contract rules the server enforces, run early against the current
      // figures — the server still holds the row lock and decides.
      const failure = reserving
        ? checkReservation({ qty, onHand: part.stock, reserved })
        : checkReservationRelease({ qty, reserved })
      if (failure) throw new ServerValidationError({ [failure.field]: failure.message })

      const input: ReservationInput = {
        qty,
        ...(values.ref ? { ref: values.ref } : {}),
        ...(values.reason ? { reason: values.reason } : {}),
      }
      try {
        if (reserving) await api.reserve(ref, input)
        else await api.release(ref, input)
      } catch (error) {
        throw asFormError(error)
      }

      // A reservation changes `reserved`/`available` on the part row, not the
      // ledger, so it is the parts list that is re-read.
      await client.invalidateQueries({ queryKey: ['parts'] })
      toast.show({
        title: reserving ? t('Stock reserved') : t('Reservation released'),
        description: `${part.name}`,
      })
      onDone()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)
  const close = useCallback(() => {
    void confirmDiscard().then((ok) => {
      if (ok) onClose()
    })
  }, [confirmDiscard, onClose])

  const projected = /^\d+$/.test(form.values.qty)
    ? reserved + (reserving ? Number(form.values.qty) : -Number(form.values.qty))
    : null

  return (
    <Modal
      open
      onClose={close}
      variant="lifecycle"
      icon={reserving ? 'Lock' : 'RotateCcw'}
      title={reserving ? 'Reserve Stock' : 'Release Reservation'}
      description={t(
        reserving
          ? 'Hold stock for open work. It stays on the shelf but leaves the available balance until it is consumed or released.'
          : 'Give a held reservation back to the available balance without moving any stock.'
      )}
      meta={
        <span dir="ltr" className="font-mono">
          {part.sku}
        </span>
      }
    >
      <Form form={form}>
        <FormErrorSummary />

        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded border border-border bg-inset px-3.5 py-2.5">
          <Figure label="On Hand" value={part.stock} />
          <Figure label="Reserved" value={reservedOf(part)} />
          <Figure label="Available" value={availableOf(part)} />
          {projected === null ? null : (
            <Figure label="Reserved After" value={projected} tone="blue" />
          )}
        </div>

        <Field
          name="qty"
          label={reserving ? 'Quantity To Reserve' : 'Quantity To Release'}
          required
          placeholder="0"
          hint={
            reserving
              ? `Whole units only. At most ${available} can be reserved.`
              : `Whole units only. At most ${reserved} can be released.`
          }
        />
        <Field
          name="ref"
          label={reserving ? 'Job Card / Order' : 'Reference'}
          hint={
            reserving
              ? 'The open work this stock is being held for.'
              : 'The hold being released, so it can be traced.'
          }
        />
        <Field
          name="reason"
          label="Reason"
          kind="textarea"
          rows={2}
          hint="Recorded on the reservation and in the audit log."
        />

        <FormActions>
          <Button variant="subtle" size="lg" onClick={close} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label={reserving ? 'Reserve Stock' : 'Release Reservation'} />
        </FormActions>
      </Form>
    </Modal>
  )
}

/* ────────────────────────────────────────────────────────────── adding a part */

const partSchema = z.object({
  name: z.string().trim().min(1, 'Enter the part name.').max(160),
  sku: z
    .string()
    .trim()
    .min(1, 'Enter the SKU.')
    .max(64, 'A SKU can be at most 64 characters.'),
  price: z
    .string()
    .trim()
    .min(1, 'Enter the sell price.')
    .refine((value) => parseSar(value) >= 0, 'A price cannot be negative.'),
  reorder: z
    .string()
    .trim()
    .min(1, 'Enter the reorder point.')
    .regex(/^\d+$/, 'The reorder point must be a whole number of units.'),
  opening: z
    .string()
    .trim()
    .min(1, 'Enter the opening quantity.')
    .regex(/^\d+$/, 'The opening quantity must be a whole number of units.'),
})

/** Creating a part is the only place an opening quantity is ever set. Every
 *  later change to it is a movement, which is what makes the opening term of
 *  the §A11 equation a constant rather than something a screen can revise. */
function AddPartModal({ onClose }: { onClose: () => void }) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('parts')

  const form = useZodForm({
    schema: partSchema,
    initial: { name: '', sku: '', price: '', reorder: '', opening: '' },
    async onSubmit(values) {
      try {
        await create.mutateAsync({
          input: {
            name: values.name,
            sku: values.sku,
            priceHalalas: Math.round(parseSar(values.price) * 100),
            reorderLevel: Number(values.reorder),
            openingStock: Number(values.opening),
            backorderable: false,
          } as Partial<Part>,
          options: { idempotencyKey: idempotencyKey() },
        })
      } catch (error) {
        throw asFormError(error)
      }
      toast.show({ title: t('Part added'), description: values.name })
      onClose()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)
  const close = useCallback(() => {
    void confirmDiscard().then((ok) => {
      if (ok) onClose()
    })
  }, [confirmDiscard, onClose])

  return (
    <Modal
      open
      onClose={close}
      variant="crud"
      icon="Plus"
      title={t('Add Part')}
      description={t('A new part starts at its opening quantity. Everything after that is a movement.')}
    >
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Part Name" required placeholder={t('Oil Filter (Toyota)')} />
        <Field name="sku" label="SKU" required placeholder={t('OF-TY-118')} />
        <Field name="price" label="Sell Price" kind="currency" required />
        <Field
          name="reorder"
          label="Reorder At"
          required
          hint="The level at which this part shows in Alerts."
        />
        <Field
          name="opening"
          label="Opening Quantity"
          required
          hint="Whole units on the shelf today. It cannot be edited later — correct it with an adjustment."
        />
        <FormActions note>
          <Button variant="subtle" size="lg" onClick={close} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label="Add Part" />
        </FormActions>
      </Form>
    </Modal>
  )
}

/* ──────────────────────────────────────────────────────────────── small parts */

/** Stock level against the part's own reorder point. */
function StockBadge({ part }: { part: Part }) {
  const { t } = usePreferences()
  if (part.stock <= 0) {
    return (
      <Badge background="rgba(249,115,22,.16)" color="var(--salis-orange)">
        {t('Out of Stock')}
      </Badge>
    )
  }
  return part.stock <= part.reorder ? (
    <Badge background="rgba(249,115,22,.1)" color="var(--salis-orange)">
      {t('Low Stock')}
    </Badge>
  ) : (
    <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">
      {t('In Stock')}
    </Badge>
  )
}

/** A quantity. Always LTR and monospaced — Arabic must not reorder its digits —
 *  and `null` renders as "not recorded" rather than as a zero nobody wrote. */
function Qty({ value, muted }: { value: number | null; muted?: boolean }) {
  if (value === null) return <Unknown />
  return (
    <span
      className={muted ? 'font-mono text-[13px] text-muted' : 'font-mono text-[13px]'}
      dir="ltr"
    >
      {value}
    </span>
  )
}

function Figure({
  label,
  value,
  tone,
}: {
  label: string
  value: number | null
  tone?: 'blue'
}) {
  const { t } = usePreferences()
  return (
    <span className="flex flex-col">
      <span className="text-[11px] text-muted">{t(label)}</span>
      <span
        className={
          tone === 'blue'
            ? 'font-mono text-sm font-semibold text-salis-blue'
            : 'font-mono text-sm font-semibold text-heading'
        }
        dir="ltr"
      >
        {value === null ? '—' : value}
      </span>
    </span>
  )
}

/** A value this dataset does not carry. Distinct from zero on purpose. */
function Unknown(): ReactNode {
  const { t } = usePreferences()
  return (
    <span className="text-[13px] text-muted" title={t('Not recorded in this dataset')}>
      —
    </span>
  )
}

function DateCell({ value }: { value: string }) {
  const parsed = new Date(value)
  const text = Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().slice(0, 16).replace('T', ' ')
  return (
    <span className="font-mono text-[13px] text-muted" dir="ltr">
      {text}
    </span>
  )
}
