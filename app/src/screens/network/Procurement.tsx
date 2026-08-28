import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { FeatureHeader, Section, StatRow, TabBar } from '@/components/shell/FeatureScreen'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Field as AuthField } from '@/components/shell/AuthCard'
import { DataTable, EmptyState, TableFooter, type Column } from '@/components/ui/DataTable'
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
import { Modal, useModal } from '@/components/ui/Modal'
import { ErrorState, ReadOnlyNotice } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import {
  procurement as procurementActions,
  repository,
  RepositoryError,
  type RequisitionRow,
  type PurchaseOrderRow,
  type SupplierRow,
  type RequisitionLineRow,
  type PurchaseOrderLineRow,
} from '@/data/repository'
import { approvalLimit, canApprove as roleCanApprove, sodCounterpart } from '@/data/rbac'
import { NETWORK_STATUS, PRIORITY_TONE, type Requisition } from '@/data/network'

// ── Send request ────────────────────────────────────────────────────────────
const PRIORITIES = ['urgent', 'normal', 'low'] as const

/** Raise a quotation request to the network.
 *
 *  The design's version had no validation — you could send an empty request to
 *  every supplier on the network. Part name and quantity are required here. */
export function PartsNetworkSendRequest() {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()

  const [part, setPart] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [qty, setQty] = useState('1')
  const [priority, setPriority] = useState<string>('normal')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const missingPart = !part.trim()
  const badQty = !(Number(qty) > 0)

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (missingPart || badQty) {
      toast.show({
        title: t('Error'),
        description: t('Enter a part name and a quantity above zero.'),
        error: true,
      })
      return
    }
    toast.show({
      title: t('Request sent'),
      description: t('Suppliers in your network will respond with quotes.'),
    })
    setTimeout(() => navigate('/parts-network/requests'), 700)
  }

  return (
    <>
      <FeatureHeader
        icon="Send"
        title={t('Send Request')}
        subtitle={t('Ask the network for a price on a part')}
      />

      <form onSubmit={submit} noValidate className="contents">
        <Section title={t('Part Details')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AuthField label={t('Part Name')} htmlFor="part">
              <Input
                id="part"
                inputSize="md"
                value={part}
                onChange={(e) => setPart(e.target.value)}
                placeholder={t('Front Brake Pads Set')}
                invalid={submitted && missingPart}
              />
            </AuthField>
            <AuthField label={t('Part Number')} htmlFor="part-number">
              <Input
                id="part-number"
                inputSize="md"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="04465-33450"
                dir="ltr"
              />
            </AuthField>
            <AuthField label={t('Vehicle')} htmlFor="vehicle">
              <Input
                id="vehicle"
                inputSize="md"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder={t('Toyota Camry 2022')}
              />
            </AuthField>
            <AuthField label={t('Quantity')} htmlFor="qty">
              <Input
                id="qty"
                inputSize="md"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                invalid={submitted && badQty}
                dir="ltr"
              />
            </AuthField>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-action text-xs font-medium text-heading">{t('Priority')}</span>
            <ChipGroup label={t('Priority')}>
              {PRIORITIES.map((option) => (
                <Chip
                  key={option}
                  label={t(option[0].toUpperCase() + option.slice(1))}
                  selected={priority === option}
                  onToggle={() => setPriority(option)}
                />
              ))}
            </ChipGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="font-action text-xs font-medium text-heading">
              {t('Notes')}
            </label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('Condition, brand preference, delivery window...')}
              className="text-[13px]"
            />
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <Button variant="outline" size="lg" onClick={() => navigate('/parts-network')}>
            {t('Cancel')}
          </Button>
          <Button type="submit" size="lg">
            <Icon name="Send" size={16} />
            {t('Send Request')}
          </Button>
        </div>
      </form>
    </>
  )
}

// ── Quotations ──────────────────────────────────────────────────────────────
interface Quote {
  supplier: string
  city: string
  unit: number
  qty: number
  lead: string
  rating: number
}

/** Quotes received against a request. Transcribed from
 *  PartsNetwork.Quotations.dc.html. */
const QUOTES: readonly Quote[] = [
  { supplier: 'Al-Faisal Auto Parts', city: 'Riyadh', unit: 250, qty: 4, lead: '2 days', rating: 4.8 },
  { supplier: 'Parts Hub KSA', city: 'Dammam', unit: 265, qty: 4, lead: '1 day', rating: 4.4 },
  { supplier: 'Saudi Parts Company', city: 'Jeddah', unit: 240, qty: 4, lead: '4 days', rating: 4.5 },
]

const SORTS = [
  { id: 'price', label: 'Price', icon: 'ArrowUpDown' },
  { id: 'rating', label: 'Rating', icon: 'Star' },
  { id: 'lead', label: 'Lead Time', icon: 'Clock' },
] as const

export function PartsNetworkQuotations() {
  const { t } = usePreferences()
  const toast = useToast()
  const [sort, setSort] = useState<string>('price')

  // Sorting is real: the design's buttons only restyled themselves. Comparing
  // quotes is the entire point of the screen.
  const sorted = useMemo(() => {
    const rows = [...QUOTES]
    if (sort === 'price') rows.sort((a, b) => a.unit - b.unit)
    if (sort === 'rating') rows.sort((a, b) => b.rating - a.rating)
    if (sort === 'lead') rows.sort((a, b) => parseInt(a.lead, 10) - parseInt(b.lead, 10))
    return rows
  }, [sort])

  const best = Math.min(...QUOTES.map((q) => q.unit))

  const columns: Column<Quote>[] = [
    {
      header: 'Supplier',
      cell: (q) => (
        <span className="flex items-center gap-2">
          {q.supplier}
          {q.unit === best ? (
            <Badge background="var(--tint-blue)" color="var(--salis-blue)">
              {t('Best price')}
            </Badge>
          ) : null}
        </span>
      ),
    },
    { header: 'City', cell: (q) => t(q.city) },
    { header: 'Unit Price', cell: (q) => <Money sar={q.unit} /> },
    { header: 'Total', cell: (q) => <Money sar={q.unit * q.qty} className="font-semibold" /> },
    { header: 'Lead Time', cell: (q) => t(q.lead) },
    {
      header: 'Rating',
      cell: (q) => (
        <span className="inline-flex items-center gap-1">
          <Icon name="Star" size={13} className="text-salis-orange" />
          <span className="font-mono text-[13px]" dir="ltr">
            {q.rating}
          </span>
        </span>
      ),
    },
  ]

  return (
    <>
      <FeatureHeader
        icon="FileText"
        title={t('Quotations')}
        subtitle={t('Compare quotes received for Front Brake Pads Set')}
      />

      <ChipGroup label={t('Sort by')}>
        {SORTS.map((option) => (
          <Chip key={option.id} label={t(option.label)} selected={sort === option.id} onToggle={() => setSort(option.id)} />
        ))}
      </ChipGroup>

      <DataTable
        caption="Supplier quotations"
        columns={columns}
        rows={sorted}
        rowKey={(q) => q.supplier}
        mobileCard={(q) => (
          <>
            <MobileCardHeader
              title={q.supplier}
              trailing={
                q.unit === best ? (
                  <Badge background="var(--tint-blue)" color="var(--salis-blue)">
                    {t('Best price')}
                  </Badge>
                ) : undefined
              }
            />
            <MobileCardRow label={t('Unit Price')}>
              <Money sar={q.unit} className="text-heading" />
            </MobileCardRow>
            <MobileCardRow label={t('Total')}>
              <Money sar={q.unit * q.qty} className="font-semibold text-heading" />
            </MobileCardRow>
            <MobileCardRow label={t('Lead Time')}>{t(q.lead)}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="FileText" title={t('No quotes received yet')} />}
      />

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={() =>
            toast.show({ title: t('Order placed'), description: t('The supplier has been notified.') })
          }
        >
          <Icon name="ShoppingCart" size={16} />
          {t('Accept & Order')}
        </Button>
      </div>
    </>
  )
}

/* ═══════════════════════════════ procurement: the live transport (F-022) */

/** A requisition line the create / edit form sends. Money is integer halalas,
 *  formatted only at the boundary; the estimated total is summed by the server,
 *  never posted from here. */
export interface RequisitionLineDraft {
  partSku: string | null
  description: string
  qty: number
  estUnitPriceHalalas: number
}

export interface NewRequisitionInput {
  requesterName: string
  department?: string
  priority: RequisitionRow['priority']
  neededBy?: string
  notes?: string
  lines: readonly RequisitionLineDraft[]
}

export interface NewSupplierInput {
  name: string
  nameAr?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
}

export interface PurchaseOrderLineDraft {
  partSku: string | null
  description: string
  qty: number
  unitPriceHalalas: number
}

export interface NewPurchaseOrderInput {
  /** The supplier's ULID (`_id`) when picked from the directory. */
  supplierId?: string
  supplierName: string
  /** The requisition's ULID (`_id`) when raised from an approved requisition. */
  requisitionId?: string
  expectedDate?: string
  /** Stamps the order date on raise; approval stays a separate, ceiling-gated
   *  action either way. */
  place: boolean
  lines: readonly PurchaseOrderLineDraft[]
}

/** The screen-facing procurement seam.
 *
 *  It maps the screen's drafts onto the server shapes (F-022) and the server's
 *  rows back — the statuses, the `/lines` sub-routes and the money boundary all
 *  cross here, never in a component. The purchase-order total is the server's
 *  and is read from the row, never summed for the wire.
 *
 *  Live only: `procurementApi()` is null on a fixture build, which routes every
 *  screen to its honest absent-capability state instead of a write that cannot
 *  land — the mock holds no procurement records and a faked approval or receipt
 *  would be the fake-completion the seam refuses. Tests inject it to prove the
 *  lifecycle without a server. */
export interface ProcurementApi {
  listRequisitions(): Promise<readonly RequisitionRow[]>
  createRequisition(input: NewRequisitionInput): Promise<RequisitionRow>
  updateRequisition(id: string, input: NewRequisitionInput): Promise<RequisitionRow>
  submitRequisition(id: string): Promise<RequisitionRow>
  approveRequisition(id: string): Promise<RequisitionRow>
  rejectRequisition(id: string, reason: string): Promise<RequisitionRow>
  requisitionLines(id: string): Promise<readonly RequisitionLineRow[]>
  listSuppliers(): Promise<readonly SupplierRow[]>
  createSupplier(input: NewSupplierInput): Promise<SupplierRow>
  listPurchaseOrders(): Promise<readonly PurchaseOrderRow[]>
  raisePurchaseOrder(input: NewPurchaseOrderInput): Promise<PurchaseOrderRow>
  approvePurchaseOrder(id: string): Promise<PurchaseOrderRow>
  /** `idempotencyKey` is generated per user-attempt so a retry cannot book the
   *  receipt twice; the line is addressed by its `_id`, not its index. */
  receivePurchaseOrder(
    id: string,
    lines: readonly { lineId: string; qty: number }[],
    overReceiptApproved: boolean,
    idempotencyKey: string,
  ): Promise<PurchaseOrderRow>
  purchaseOrderLines(id: string): Promise<readonly PurchaseOrderLineRow[]>
}

/** A fresh idempotency key, 8–128 chars as the contract requires. */
export function procurementIdempotencyKey(): string {
  const globalCrypto = globalThis.crypto as Crypto | undefined
  if (globalCrypto?.randomUUID) return `pr-${globalCrypto.randomUUID()}`
  return `pr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

function liveProcurementApi(actions: NonNullable<typeof procurementActions>): ProcurementApi {
  const toReq = (input: NewRequisitionInput) => ({
    requesterName: input.requesterName,
    ...(input.department ? { department: input.department } : {}),
    ...(input.priority ? { priority: input.priority } : {}),
    ...(input.neededBy ? { neededBy: input.neededBy } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    lines: input.lines.map((line) => ({
      ...(line.partSku ? { partSku: line.partSku } : {}),
      description: line.description,
      qty: line.qty,
      estUnitPriceHalalas: line.estUnitPriceHalalas,
    })),
  })
  return {
    listRequisitions: async () => (await repository.requisitions.list({ pageSize: 200 })).rows,
    createRequisition: (input) =>
      actions.createRequisition(toReq(input), { idempotencyKey: procurementIdempotencyKey() }),
    updateRequisition: (id, input) => actions.updateRequisition(id, toReq(input)),
    submitRequisition: (id) => actions.submitRequisition(id),
    approveRequisition: (id) => actions.approveRequisition(id),
    rejectRequisition: (id, reason) => actions.rejectRequisition(id, reason),
    requisitionLines: async (id) => (await actions.requisitionLines(id)).rows,
    listSuppliers: async () => (await repository.suppliers.list({ pageSize: 200 })).rows,
    createSupplier: (input) =>
      repository.suppliers.create({ status: 'active', ...input } as unknown as Partial<SupplierRow>, {
        idempotencyKey: procurementIdempotencyKey(),
      }),
    listPurchaseOrders: async () => (await repository.purchaseOrders.list({ pageSize: 200 })).rows,
    raisePurchaseOrder: (input) =>
      actions.raisePurchaseOrder(
        {
          ...(input.supplierId ? { supplierId: input.supplierId } : {}),
          supplierName: input.supplierName,
          ...(input.requisitionId ? { requisitionId: input.requisitionId } : {}),
          ...(input.expectedDate ? { expectedDate: input.expectedDate } : {}),
          place: input.place,
          lines: input.lines.map((line) => ({
            ...(line.partSku ? { partSku: line.partSku } : {}),
            description: line.description,
            qty: line.qty,
            unitPriceHalalas: line.unitPriceHalalas,
          })),
        },
        { idempotencyKey: procurementIdempotencyKey() },
      ),
    approvePurchaseOrder: (id) => actions.approvePurchaseOrder(id),
    receivePurchaseOrder: (id, lines, overReceiptApproved, idempotencyKey) =>
      actions.receivePurchaseOrder(
        id,
        { lines: lines.map((line) => ({ lineId: line.lineId, qty: line.qty })), overReceiptApproved },
        { idempotencyKey },
      ),
    purchaseOrderLines: async (id) => (await actions.purchaseOrderLines(id)).rows,
  }
}

/** The live transport, or null on a fixture build. Never invents a record. */
export function procurementApi(): ProcurementApi | null {
  return procurementActions ? liveProcurementApi(procurementActions) : null
}

/** Why procurement writes cannot happen from this build: a fixture build has no
 *  API to carry them, and the mock repository holds no procurement records. */
export function procurementUnavailableReason(): string {
  return 'This build is reading design fixtures, which hold no procurement records and refuse writes rather than pretending. Set the API URL to run requisitions and purchase orders against the server.'
}

/** Turns a rejected write into what the form system shows: a named field keeps
 *  its message on the control; a refusal — the ceiling (`approval_required`),
 *  segregation of duties or a broken rule (`forbidden` / `rule_violated`) —
 *  becomes the form-level line, in the server's own words. */
export function asProcurementFormError(error: unknown): Error {
  if (!(error instanceof RepositoryError)) {
    return error instanceof Error ? error : new Error('The request failed.')
  }
  if (error.field) return new ServerValidationError({ [error.field]: error.message })
  if (
    error.code === 'forbidden' ||
    error.code === 'rule_violated' ||
    error.code === 'approval_required'
  ) {
    return new ServerValidationError({}, error.message)
  }
  return new Error(error.message)
}

/** The complete requisition set from ProcurementPortal.Requisitions.dc.html —
 *  all seven rows. The transcription in `data/network.ts` carries only five,
 *  which left the "PO Raised" and "Rejected" tabs empty against the design;
 *  `data/**` is outside this agent's boundary, so the full set lives here and
 *  the short one is reported. Amounts in SAR to match the `Requisition` type.
 *
 *  This is the read-only design view a fixture build shows: the mock holds no
 *  procurement rows, so a build with no API renders these against the honest
 *  "no writes" notice, and a live build reads the server's own requisitions. */
export const REQUISITION_ROWS: readonly Requisition[] = [
  {
    status: 'pending',
    id: 'REQ-0518',
    priority: 'urgent',
    what: 'Brake Pads (Front) ×40 — stock below reorder',
    from: 'Riyadh Main · Inventory',
    age: '2 hours ago',
    amount: 12400,
  },
  {
    status: 'pending',
    id: 'REQ-0517',
    priority: 'high',
    what: 'Diagnostic scanner — workshop equipment',
    from: 'Jeddah Branch · Workshop',
    age: '5 hours ago',
    amount: 28000,
  },
  {
    status: 'pending',
    id: 'REQ-0515',
    priority: 'medium',
    what: 'Oil Filter (Toyota) ×120 — routine restock',
    from: 'Riyadh North · Inventory',
    age: 'Yesterday',
    amount: 5400,
  },
  {
    status: 'pending',
    id: 'REQ-0512',
    priority: 'low',
    what: 'Office supplies — quarterly order',
    from: 'Head Office · Administration',
    age: '2 days',
    amount: 1850,
  },
  {
    status: 'approved',
    id: 'REQ-0509',
    priority: 'high',
    what: 'Battery 12V ×24',
    from: 'Jeddah Branch · Inventory',
    age: 'Jul 21',
    amount: 9120,
  },
  {
    status: 'converted',
    id: 'REQ-0504',
    priority: 'medium',
    what: 'Spark Plug Set ×80, Coolant 4L ×40',
    from: 'Riyadh Main · Inventory',
    age: 'Jul 18',
    amount: 14360,
  },
  {
    status: 'rejected',
    id: 'REQ-0498',
    priority: 'low',
    what: 'Branded uniforms — 30 sets',
    from: 'Head Office · Administration',
    age: 'Jul 15',
    amount: 7200,
  },
]

/* ─────────────────────────────────────────────── a requisition, one shape */

/** The server statuses `draft/submitted/approved/rejected/ordered`. The design
 *  fixture's `pending`/`converted` map onto `submitted`/`ordered` on ingest, so
 *  the screen speaks one vocabulary whichever source it read. */
type ReqStatus = RequisitionRow['status']

/** The row both sources normalise into. `ref` is the code the action routes
 *  accept (they take the code or the ULID); the rest is display. */
interface ReqView {
  ref: string
  code: string
  status: ReqStatus
  priority: string
  requester: string
  department: string
  when: string
  notes: string
  amountHalalas: number
}

const REQ_TABS: readonly (ReqStatus | 'all')[] = [
  'draft',
  'submitted',
  'approved',
  'ordered',
  'rejected',
  'all',
]

function reqStatusLabel(status: ReqStatus): string {
  if (status === 'submitted') return 'Pending'
  if (status === 'ordered') return 'PO Raised'
  return status[0].toUpperCase() + status.slice(1)
}

/** Status tone, borrowed from the shared network palette so procurement and the
 *  parts network never disagree on what "pending" looks like. */
const REQ_TONE_KEY: Record<ReqStatus, string> = {
  draft: 'reviewing',
  submitted: 'pending',
  approved: 'approved',
  ordered: 'converted',
  rejected: 'rejected',
}

function reqTone(status: ReqStatus): readonly [string, string] {
  return NETWORK_STATUS[REQ_TONE_KEY[status]] ?? NETWORK_STATUS.pending
}

function priorityTone(priority: string): readonly [string, string] {
  return PRIORITY_TONE[priority] ?? PRIORITY_TONE.normal
}

function reqFromRow(row: RequisitionRow): ReqView {
  return {
    ref: row.id,
    code: row.code,
    status: row.status,
    priority: row.priority,
    requester: row.requester,
    department: row.department ?? '',
    when: row.neededBy ? `Needed ${row.neededBy}` : '',
    notes: row.notes ?? '',
    amountHalalas: row.estimatedTotalHalalas,
  }
}

function reqFromDesign(row: Requisition): ReqView {
  const status: ReqStatus =
    row.status === 'pending' ? 'submitted' : row.status === 'converted' ? 'ordered' : row.status
  const [requester, department = ''] = row.from.split(' · ')
  return {
    ref: row.id,
    code: row.id,
    status,
    priority: row.priority,
    requester: requester ?? row.from,
    department,
    when: row.age,
    notes: row.what,
    amountHalalas: Math.round(row.amount * 100),
  }
}

/* ─────────────────────────────────────────────── creating / editing a requisition */

const requisitionHeaderSchema = z.object({
  requesterName: z.string().trim().min(1, 'Name the branch and department raising this.').max(200),
  department: z.string().trim().max(160),
  priority: z.enum(['low', 'normal', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Pick a priority.' }),
  }),
  neededBy: z.string().trim(),
  notes: z.string().trim().max(2000, 'Keep notes under 2000 characters.'),
})

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
] as const

interface LineDraftState {
  partSku: string | null
  description: string
  qty: string
  price: string
}

const emptyLineDraft = (): LineDraftState => ({ partSku: null, description: '', qty: '1', price: '' })

/** Create or edit a requisition — one form, two callers. A requisition is a
 *  **line array** (part / description, qty, estimated unit price), never a
 *  single amount: the server sums the estimated total from the lines, so the
 *  form carries them and shows the running total as a courtesy only. Rendered
 *  only when a transport exists; the caller shows the dependency notice
 *  otherwise, so this form can never pretend a submit landed. */
function RequisitionFormModal({
  api,
  initial,
  initialLines,
  onClose,
  onSaved,
}: {
  api: ProcurementApi
  initial?: ReqView
  initialLines?: readonly RequisitionLineRow[]
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()

  const [lines, setLines] = useState<LineDraftState[]>(() =>
    initialLines && initialLines.length
      ? initialLines.map((line) => ({
          partSku: line.partSku ?? null,
          description: line.description,
          qty: String(line.qty),
          price: (line.estUnitPriceHalalas / 100).toFixed(2),
        }))
      : [emptyLineDraft()]
  )

  const estTotalHalalas = lines.reduce((sum, line) => {
    const qty = Number(line.qty)
    const price = parseSar(line.price)
    if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum
    return sum + Math.max(0, Math.round(price * 100)) * Math.max(0, qty)
  }, 0)

  const form = useZodForm({
    schema: requisitionHeaderSchema,
    initial: initial
      ? {
          requesterName: initial.requester,
          department: initial.department,
          priority: (['low', 'normal', 'high', 'urgent'].includes(initial.priority)
            ? initial.priority
            : 'normal') as RequisitionRow['priority'],
          neededBy: '',
          notes: initial.notes,
        }
      : {
          requesterName: '',
          department: '',
          priority: '' as unknown as RequisitionRow['priority'],
          neededBy: '',
          notes: '',
        },
    async onSubmit(values) {
      const parsed: RequisitionLineDraft[] = []
      for (const line of lines) {
        if (!line.description.trim()) {
          throw new ServerValidationError({}, 'Every line needs a description.')
        }
        if (!/^\d+$/.test(line.qty.trim()) || Number(line.qty) < 1) {
          throw new ServerValidationError({}, 'Every line needs a whole quantity of at least one.')
        }
        if (!(parseSar(line.price) > 0)) {
          throw new ServerValidationError({}, 'Every line needs an estimated unit price above zero.')
        }
        parsed.push({
          partSku: line.partSku,
          description: line.description.trim(),
          qty: Number(line.qty),
          estUnitPriceHalalas: Math.round(parseSar(line.price) * 100),
        })
      }
      if (!parsed.length) {
        throw new ServerValidationError({}, 'Add at least one line to the requisition.')
      }
      const input: NewRequisitionInput = {
        requesterName: values.requesterName,
        ...(values.department ? { department: values.department } : {}),
        priority: values.priority,
        ...(values.neededBy ? { neededBy: values.neededBy } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
        lines: parsed,
      }
      try {
        if (initial) {
          await api.updateRequisition(initial.ref, input)
        } else {
          await api.createRequisition(input)
        }
      } catch (error) {
        throw asProcurementFormError(error)
      }
      toast.show({
        title: t(initial ? 'Requisition updated' : 'Requisition drafted'),
        description: values.requesterName,
      })
      onSaved()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)
  const close = useCallback(() => {
    void confirmDiscard().then((ok) => {
      if (ok) onClose()
    })
  }, [confirmDiscard, onClose])

  const setLine = (index: number, patch: Partial<LineDraftState>) =>
    setLines((current) => current.map((line, at) => (at === index ? { ...line, ...patch } : line)))

  return (
    <Modal
      open
      onClose={close}
      variant="crud"
      icon={initial ? 'Pencil' : 'Plus'}
      title={initial ? 'Edit Requisition' : 'New Requisition'}
      description={t('A requisition asks procurement to buy. It is drafted from its line items, then submitted for approval and, once approved, converted to a purchase order.')}
      meta={
        initial ? (
          <span dir="ltr" className="font-mono">
            {initial.code}
          </span>
        ) : undefined
      }
    >
      <Form form={form}>
        <FormErrorSummary />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            name="requesterName"
            label="Requested by (branch · department)"
            required
            placeholder={t('Riyadh Main · Inventory')}
          />
          <Field name="department" label="Department" placeholder={t('Inventory')} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field name="priority" label="Priority" kind="select" required options={PRIORITY_OPTIONS} />
          <Field name="neededBy" label="Needed By" kind="date" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-action text-xs font-medium text-heading">{t('Line Items')}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLines((current) => [...current, emptyLineDraft()])}
            >
              <Icon name="Plus" size={13} />
              {t('Add Line')}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {lines.map((line, index) => (
              <div
                key={index}
                className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-inset p-2.5"
              >
                <label className="flex min-w-[150px] flex-1 flex-col gap-1">
                  <span className="text-[11px] text-muted">{t('Description')}</span>
                  <Input
                    value={line.description}
                    onChange={(event) => setLine(index, { description: event.target.value })}
                    placeholder={t('Brake Pads (Front)')}
                    inputSize="sm"
                  />
                </label>
                <label className="flex w-[76px] flex-col gap-1">
                  <span className="text-[11px] text-muted">{t('Qty')}</span>
                  <Input
                    value={line.qty}
                    onChange={(event) => setLine(index, { qty: event.target.value })}
                    inputMode="numeric"
                    dir="ltr"
                    inputSize="sm"
                  />
                </label>
                <label className="flex w-[110px] flex-col gap-1">
                  <span className="text-[11px] text-muted">{t('Est. Unit SAR')}</span>
                  <Input
                    value={line.price}
                    onChange={(event) => setLine(index, { price: event.target.value })}
                    inputMode="decimal"
                    dir="ltr"
                    placeholder="0.00"
                    inputSize="sm"
                  />
                </label>
                {lines.length > 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLines((current) => current.filter((_, at) => at !== index))}
                    aria-label={t('Remove line')}
                  >
                    <Icon name="X" size={13} />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-inset px-3 py-2 text-[13px]">
            <span className="text-muted">{t('Estimated total')}</span>
            <Money sar={estTotalHalalas / 100} className="font-semibold text-heading" />
          </div>
          <p className="text-[11px] text-muted">
            {t('The server sums the estimated total from the lines; this figure is a preview.')}
          </p>
        </div>

        <Field name="notes" label="Notes" kind="textarea" rows={2} />
        <FormActions note>
          <Button variant="subtle" size="lg" onClick={close} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label={initial ? 'Save Changes' : 'Create Requisition'} />
        </FormActions>
      </Form>
    </Modal>
  )
}

/* ─────────────────────────────────────────────── collect a rejection reason */

const reasonSchema = z.object({
  reason: z.string().trim().min(1, 'Give a reason — the requesting branch is told why.').max(500),
})

function RejectReasonModal({
  onClose,
  onReject,
}: {
  onClose: () => void
  onReject: (reason: string) => Promise<void>
}) {
  const { t } = usePreferences()
  const form = useZodForm({
    schema: reasonSchema,
    initial: { reason: '' },
    async onSubmit(values) {
      try {
        await onReject(values.reason)
      } catch (error) {
        throw asProcurementFormError(error)
      }
    },
  })

  return (
    <Modal
      open
      onClose={onClose}
      variant="lifecycle"
      icon="AlertTriangle"
      title="Reject Requisition"
      description={t('The requesting branch is notified with this reason. This cannot be undone from here.')}
    >
      <Form form={form}>
        <FormErrorSummary />
        <Field name="reason" label="Reason" kind="textarea" rows={3} required placeholder={t('Duplicate of REQ-0509; ordering under that requisition instead.')} />
        <FormActions>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label="Reject" />
        </FormActions>
      </Form>
    </Modal>
  )
}

/* ─────────────────────────────────────────────── one requisition, its lifecycle */

/** One requisition, with the lifecycle actions the role, the status and the
 *  transport allow. A draft can be edited or submitted; a submitted requisition
 *  can be approved (bounded by the role's SAR ceiling on procurement — authority
 *  and ceiling are separate questions, F-002) or rejected with a reason. */
function RequisitionDetailModal({
  row,
  api,
  unavailable,
  onClose,
  onChanged,
}: {
  row: ReqView
  api: ProcurementApi | null
  unavailable: string | null
  onClose: () => void
  onChanged: () => void
}) {
  const { t } = usePreferences()
  const { role, can } = useSession()
  const { confirm } = useModal()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [busy, setBusy] = useState(false)

  const mayDecide = can('procurement', 'a')
  const withinCeiling = roleCanApprove(role, row.amountHalalas / 100, 'procurement')
  const limit = approvalLimit(role)
  const [prBg, prFg] = priorityTone(row.priority)
  const [stBg, stFg] = reqTone(row.status)

  const { data: lines = [] } = useQuery({
    queryKey: ['requisition-lines', row.ref],
    queryFn: () => api!.requisitionLines(row.ref),
    enabled: !!api,
  })

  async function submit() {
    if (!api) return
    const ok = await confirm({
      title: 'Submit for approval?',
      description: 'The requisition enters the approval queue and can no longer be edited.',
      icon: 'Send',
      confirmLabel: 'Submit',
    })
    if (!ok) return
    setBusy(true)
    try {
      await api.submitRequisition(row.ref)
      toast.show({ title: t('Requisition submitted'), description: row.code })
      onChanged()
      onClose()
    } catch (error) {
      toast.show({
        title: t('Error'),
        description: error instanceof Error ? error.message : t('The request failed.'),
        error: true,
      })
    } finally {
      setBusy(false)
    }
  }

  async function approve() {
    if (!api) return
    const ok = await confirm({
      title: 'Approve this requisition?',
      description: 'Approval releases it for conversion to a purchase order.',
      icon: 'CheckCircle2',
      confirmLabel: 'Approve',
    })
    if (!ok) return
    setBusy(true)
    try {
      await api.approveRequisition(row.ref)
      toast.show({ title: t('Requisition approved'), description: `${row.code} · ${t(row.requester)}` })
      onChanged()
      onClose()
    } catch (error) {
      toast.show({
        title: t('Error'),
        description: error instanceof Error ? error.message : t('The request failed.'),
        error: true,
      })
    } finally {
      setBusy(false)
    }
  }

  if (editing && api) {
    return (
      <RequisitionFormModal
        api={api}
        initial={row}
        initialLines={lines}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false)
          onChanged()
          onClose()
        }}
      />
    )
  }

  if (rejecting && api) {
    return (
      <RejectReasonModal
        onClose={() => setRejecting(false)}
        onReject={async (reason) => {
          await api.rejectRequisition(row.ref, reason)
          toast.show({ title: t('Requisition rejected'), description: row.code })
          setRejecting(false)
          onChanged()
          onClose()
        }}
      />
    )
  }

  const canEdit = row.status === 'draft'
  const canSubmit = row.status === 'draft'
  const canReject = row.status === 'draft' || row.status === 'submitted'
  const canApproveHere = row.status === 'submitted'

  return (
    <Modal
      open
      onClose={onClose}
      variant="data"
      icon="ClipboardList"
      title="Requisition"
      meta={
        <span dir="ltr" className="font-mono">
          {row.code}
        </span>
      }
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={busy}>
            {t('Close')}
          </Button>
          {api ? (
            <>
              {canEdit ? (
                <Button variant="outline" size="lg" onClick={() => setEditing(true)} disabled={busy}>
                  <Icon name="Pencil" size={15} />
                  {t('Edit')}
                </Button>
              ) : null}
              {canReject && mayDecide ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setRejecting(true)}
                  disabled={busy}
                >
                  {t('Reject')}
                </Button>
              ) : null}
              {canSubmit ? (
                <Button size="lg" onClick={() => void submit()} disabled={busy}>
                  <Icon name="Send" size={15} />
                  {t('Submit')}
                </Button>
              ) : null}
              {canApproveHere && mayDecide && withinCeiling ? (
                <Button size="lg" onClick={() => void approve()} disabled={busy}>
                  <Icon name="CheckCircle2" size={15} />
                  {t('Approve')}
                </Button>
              ) : null}
            </>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge background={prBg} color={prFg}>
            {t(row.priority[0].toUpperCase() + row.priority.slice(1))}
          </Badge>
          <Badge background={stBg} color={stFg}>
            {t(reqStatusLabel(row.status))}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded border border-border bg-inset px-3.5 py-2.5 text-[13px]">
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">{t('Requested by')}</span>
            <span className="text-heading">{t(row.requester)}</span>
          </span>
          {row.department ? (
            <span className="flex flex-col">
              <span className="text-[11px] text-muted">{t('Department')}</span>
              <span className="text-heading">{t(row.department)}</span>
            </span>
          ) : null}
          {row.when ? (
            <span className="flex flex-col">
              <span className="text-[11px] text-muted">{t('When')}</span>
              <span className="text-heading">{t(row.when)}</span>
            </span>
          ) : null}
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">{t('Estimated')}</span>
            <Money sar={row.amountHalalas / 100} className="font-semibold text-heading" />
          </span>
        </div>

        {api && lines.length ? (
          <ul className="flex flex-col gap-1.5">
            {lines.map((line) => (
              <li
                key={line._id}
                className="flex flex-wrap items-center gap-3 rounded border border-border bg-card px-3 py-2 text-[13px]"
              >
                <span className="min-w-0 flex-1 text-body">{line.description}</span>
                <span dir="ltr" className="font-mono text-[12px] text-muted">
                  {line.qty} × <Money sar={line.estUnitPriceHalalas / 100} />
                </span>
              </li>
            ))}
          </ul>
        ) : row.notes ? (
          <p className="text-sm text-body">{t(row.notes)}</p>
        ) : null}

        {canApproveHere && api && mayDecide && !withinCeiling ? (
          <p
            role="note"
            className="flex items-start gap-2.5 rounded-lg border border-salis-orange/30 bg-salis-orange/[.06] px-3.5 py-3 text-[13px] text-body"
          >
            <Icon name="AlertTriangle" size={15} className="mt-0.5 flex-shrink-0 text-salis-orange" />
            <span>
              {t('Above your approval limit')}
              {' — '}
              <span dir="ltr" className="font-mono">
                {limit === null ? '∞' : `SAR ${limit.toLocaleString('en-US')}`}
              </span>
              {'. '}
              {t('Escalate to a role with a higher ceiling; the server re-checks the same limit.')}
            </span>
          </p>
        ) : null}

        {!api ? (
          <ReadOnlyNotice message={t(unavailable ?? procurementUnavailableReason())} />
        ) : null}
      </div>
    </Modal>
  )
}

/* ───────────────────────────────────────────────────────── the requisitions list */

/** Requisitions — list, lifecycle and conversion queue.
 *
 *  Reads come from the transport when one exists (`repository.requisitions`) and
 *  from the design fixture otherwise. Writes exist exactly as far as the server
 *  supports them — draft, submit, approve within the ceiling, reject — and the
 *  fixture build says so where the actions would be, so nothing here "approves"
 *  into local state.
 *
 *  `api` is injected only by tests. Production passes nothing and gets the live
 *  transport, or the honest state on a fixture build. */
export function ProcurementRequisitions({ api: injected }: { api?: ProcurementApi | null } = {}) {
  const { t } = usePreferences()
  const { role, can } = useSession()
  const { confirm } = useModal()
  const toast = useToast()
  const client = useQueryClient()

  const api = injected === undefined ? procurementApi() : injected
  const unavailable = api ? null : procurementUnavailableReason()

  const [tab, setTab] = useState<ReqStatus | 'all'>('submitted')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [creating, setCreating] = useState(false)
  const [openRef, setOpenRef] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const liveQuery = useQuery({
    queryKey: ['procurement-requisitions'],
    queryFn: () => api!.listRequisitions(),
    enabled: !!api,
  })

  const requisitions: ReqView[] = useMemo(
    () =>
      api
        ? (liveQuery.data ?? []).map(reqFromRow)
        : REQUISITION_ROWS.map(reqFromDesign),
    [api, liveQuery.data]
  )

  const isLoading = api ? liveQuery.isLoading : false
  const isError = api ? liveQuery.isError : false

  const rows = useMemo(() => {
    const inTab = tab === 'all' ? requisitions : requisitions.filter((r) => r.status === tab)
    if (!search.trim()) return inTab
    const needle = search.trim().toLowerCase()
    return inTab.filter((r) =>
      [r.code, r.requester, r.department, r.notes].some((value) =>
        value.toLowerCase().includes(needle)
      )
    )
  }, [requisitions, tab, search])

  const selectedRows = rows.filter((r) => selected[r.ref])
  const mayCreate = can('procurement', 'c')
  const mayDecide = can('procurement', 'a')
  const openRow = openRef ? requisitions.find((r) => r.ref === openRef) ?? null : null

  const refresh = useCallback(() => {
    void client.invalidateQueries({ queryKey: ['procurement-requisitions'] })
    setSelected({})
  }, [client])

  /** CSV of the rows currently in view — the design's Export does real work. */
  const exportCsv = useCallback(() => {
    const header = 'Reference,Requested By,Department,Priority,When,Estimated SAR,Status'
    const body = rows.map((r) =>
      [
        r.code,
        r.requester,
        r.department,
        r.priority,
        r.when,
        (r.amountHalalas / 100).toFixed(2),
        r.status,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [header, ...body].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'requisitions.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast.show({ title: t('Exported'), description: t('requisitions.csv — rows currently in view.') })
  }, [rows, t, toast])

  async function approveSelected() {
    if (!api || !selectedRows.length) return
    const submittable = selectedRows.filter((r) => r.status === 'submitted')
    if (!submittable.length) {
      toast.show({
        title: t('Nothing to approve'),
        description: t('Only submitted requisitions can be approved.'),
        error: true,
      })
      return
    }
    const over = submittable.find((r) => !roleCanApprove(role, r.amountHalalas / 100, 'procurement'))
    if (over) {
      const limit = approvalLimit(role)
      toast.show({
        title: t('Above your approval limit'),
        description: `${over.code} · ${formatSar(over.amountHalalas / 100)} — ${t('Limit')}: ${
          limit === null ? '∞' : formatSar(limit)
        }`,
        error: true,
      })
      return
    }
    const ok = await confirm({
      title: 'Approve selected requisitions?',
      description: 'Each approval releases the request for conversion to a purchase order.',
      icon: 'CheckCircle2',
      confirmLabel: 'Approve',
    })
    if (!ok) return
    setBusy(true)
    try {
      for (const row of submittable) {
        await api.approveRequisition(row.ref)
      }
      toast.show({ title: t('Approved'), description: `${submittable.length} ${t('requisitions')}` })
      refresh()
    } catch (error) {
      toast.show({
        title: t('Error'),
        description: error instanceof Error ? error.message : t('The request failed.'),
        error: true,
      })
    } finally {
      setBusy(false)
    }
  }

  const columns: Column<ReqView>[] = [
    {
      header: 'Select',
      cell: (r) => (
        <input
          type="checkbox"
          aria-label={`${t('Select')} ${r.code}`}
          checked={!!selected[r.ref]}
          onChange={() => setSelected((s) => ({ ...s, [r.ref]: !s[r.ref] }))}
          onClick={(event) => event.stopPropagation()}
          className="h-[15px] w-[15px] cursor-pointer accent-salis-blue"
        />
      ),
      className: 'w-[44px]',
    },
    {
      header: 'Req #',
      cell: (r) => <span className="font-semibold text-salis-blue">{r.code}</span>,
      code: true,
    },
    {
      header: 'Requested By',
      cell: (r) => (
        <span className="flex flex-col">
          <span className="text-[13px] text-body">{t(r.requester)}</span>
          {r.department ? (
            <span className="mt-0.5 text-[11px] text-muted">{t(r.department)}</span>
          ) : null}
        </span>
      ),
    },
    {
      header: 'Priority',
      cell: (r) => {
        const [bg, fg] = priorityTone(r.priority)
        return (
          <Badge background={bg} color={fg}>
            {t(r.priority[0].toUpperCase() + r.priority.slice(1))}
          </Badge>
        )
      },
    },
    { header: 'When', cell: (r) => <span className="text-[13px] text-muted">{t(r.when)}</span> },
    {
      header: 'Estimated',
      cell: (r) => <Money sar={r.amountHalalas / 100} className="font-semibold" />,
      className: 'text-end',
    },
    {
      header: 'Status',
      cell: (r) => {
        const [bg, fg] = reqTone(r.status)
        return (
          <Badge background={bg} color={fg}>
            {t(reqStatusLabel(r.status))}
          </Badge>
        )
      },
    },
  ]

  return (
    <>
      <FeatureHeader
        icon="ClipboardList"
        title={t('Requisitions')}
        subtitle={t('Requests raised by branches awaiting procurement action')}
        actions={
          <>
            <Button variant="outline" size="md" onClick={exportCsv}>
              <Icon name="Download" size={15} />
              {t('Export')}
            </Button>
            {mayCreate ? (
              <Button size="md" onClick={() => setCreating(true)}>
                <Icon name="Plus" size={15} />
                {t('New Requisition')}
              </Button>
            ) : null}
          </>
        }
      />

      {unavailable ? <ReadOnlyNotice message={t(unavailable)} /> : null}

      <div className="flex flex-wrap items-center gap-2">
        <ChipGroup label={t('Status')}>
          {REQ_TABS.map((option) => {
            const count =
              option === 'all'
                ? requisitions.length
                : requisitions.filter((r) => r.status === option).length
            const label = option === 'all' ? 'All' : reqStatusLabel(option as ReqStatus)
            return (
              <Chip key={option} label={`${t(label)} ${count}`} selected={tab === option} onToggle={() => { setTab(option); setSelected({}) }} />
            )
          })}
        </ChipGroup>
        <span className="flex-1" />
        {selectedRows.length ? (
          <div className="flex items-center gap-2 rounded-lg border border-salis-blue/[.22] bg-salis-blue/[.05] py-1 ps-3 pe-1.5">
            <span className="text-xs font-semibold text-salis-blue">
              <span dir="ltr" className="font-mono">
                {selectedRows.length}
              </span>{' '}
              {t('selected')}
            </span>
            {mayDecide ? (
              <Button size="sm" disabled={!api || busy} onClick={() => void approveSelected()}>
                {t('Approve')}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="max-w-[340px]">
        <label className="block">
          <span className="sr-only">{t('Search requisitions')}</span>
          <Input
            icon={<Icon name="Search" size={14} />}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('Search requisitions...')}
            inputSize="sm"
          />
        </label>
      </div>

      {isError ? (
        <ErrorState title={t("Couldn't load requisitions")} onRetry={() => void liveQuery.refetch()} />
      ) : (
        <DataTable
          caption="Procurement requisitions"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.ref}
          loading={isLoading}
          onRowClick={(r) => setOpenRef(r.ref)}
          mobileCard={(r) => {
            const [bg, fg] = reqTone(r.status)
            return (
              <>
                <MobileCardHeader
                  title={r.code}
                  code
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(reqStatusLabel(r.status))}
                    </Badge>
                  }
                />
                <MobileCardRow>{t(r.requester)}</MobileCardRow>
                {r.department ? (
                  <MobileCardRow label={t('Department')}>{t(r.department)}</MobileCardRow>
                ) : null}
                <MobileCardRow label={t('Estimated')}>
                  <Money sar={r.amountHalalas / 100} className="font-semibold text-heading" />
                </MobileCardRow>
              </>
            )
          }}
          footer={
            rows.length ? (
              <TableFooter
                summary={
                  <>
                    {t('Showing')}{' '}
                    <span dir="ltr" className="font-mono">
                      1–{rows.length}
                    </span>{' '}
                    {t('of')}{' '}
                    <span dir="ltr" className="font-mono">
                      {rows.length}
                    </span>
                  </>
                }
              />
            ) : undefined
          }
          empty={
            <EmptyState
              icon="ClipboardList"
              title={t('Nothing to review')}
              description={t('No requisitions in this state. New requests from branches will appear here.')}
            />
          }
        />
      )}

      {creating ? (
        api ? (
          <RequisitionFormModal
            api={api}
            onClose={() => setCreating(false)}
            onSaved={() => {
              setCreating(false)
              refresh()
            }}
          />
        ) : (
          <Modal
            open
            onClose={() => setCreating(false)}
            variant="status"
            layout="centred"
            icon="CloudOff"
            title="Creating requisitions is not available yet"
            description={t(unavailable ?? procurementUnavailableReason())}
            footer={
              <Button size="lg" onClick={() => setCreating(false)}>
                {t('Close')}
              </Button>
            }
          />
        )
      ) : null}

      {openRow ? (
        <RequisitionDetailModal
          row={openRow}
          api={api}
          unavailable={unavailable}
          onClose={() => setOpenRef(null)}
          onChanged={refresh}
        />
      ) : null}
    </>
  )
}

/* ──────────────────────────────────────────────────────── the portal dashboard */

export function ProcurementPortal() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { can } = useSession()

  const pending = REQUISITION_ROWS.filter((r) => r.status === 'pending')
  const pendingValue = pending.reduce((sum, r) => sum + r.amount, 0)

  // Raising and approving a purchase order are a segregation-of-duties pair.
  // Named from the table so the wording cannot drift from the control.
  const counterpart = sodCounterpart('Raise purchase order')

  return (
    <>
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Procurement Portal')}
        subtitle={t('Requisitions, supplier comparison and purchase orders')}
        actions={
          <>
            {can('procurement', 'c') ? (
              <Button variant="outline" size="md" onClick={() => navigate('/purchase-order')}>
                <Icon name="ShoppingCart" size={16} />
                {t('Raise PO')}
              </Button>
            ) : null}
            <Button size="md" onClick={() => navigate('/procurement-portal/requisitions')}>
              <Icon name="ClipboardList" size={16} />
              {t('Requisitions')}
            </Button>
          </>
        }
      />

      <StatRow
        stats={[
          {
            label: 'Pending Approval',
            value: pending.length,
            caption: 'Requisitions',
            highlight: true,
          },
          {
            label: 'Pending Value',
            value: `SAR ${pendingValue.toLocaleString('en-US')}`,
            caption: 'Awaiting sign-off',
            tone: 'warning',
          },
          { label: 'Open Orders', value: 3, caption: 'With suppliers', tone: 'info' },
          { label: 'Suppliers', value: 156, caption: 'On the network' },
        ]}
      />

      <Section
        title={t('Approval Queue')}
        subtitle={t('Oldest and highest-value requests first')}
      >
        <div className="flex flex-col gap-2.5">
          {pending.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => navigate('/procurement-portal/requisitions')}
              className="flex cursor-pointer flex-wrap items-center gap-3 rounded-lg border border-border bg-inset p-3.5 text-start transition-colors duration-150 hover:border-salis-blue focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              <span className="flex flex-shrink-0 rounded-[10px] bg-salis-blue/[.09] p-2 text-salis-blue">
                <Icon name="Package" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-heading">{t(r.what)}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  <span className="font-mono" dir="ltr">
                    {r.id}
                  </span>{' '}
                  · {t(r.from)} · {t(r.age)}
                </p>
              </div>
              <Money sar={r.amount} className="font-semibold text-heading" />
            </button>
          ))}
        </div>
        {counterpart ? (
          <p className="flex items-start gap-2 text-[11px] text-muted">
            <Icon name="ShieldCheck" size={13} className="mt-0.5 flex-shrink-0" />
            {t('Raising a purchase order and')} {t(counterpart.toLowerCase())}{' '}
            {t('are a segregation-of-duties pair: the same person must not do both on one order.')}
          </p>
        ) : null}
      </Section>
    </>
  )
}

/** Group-buying and fulfilment view across partner garages. */
export function PartsSupplyNetwork() {
  const { t } = usePreferences()
  const tabs = [
    { id: 'partners', label: 'Network Partners', icon: 'Users' },
    { id: 'fulfillment', label: 'Fulfillment Orders', icon: 'Package' },
    { id: 'shipments', label: 'Shipments', icon: 'Truck' },
    { id: 'warehouses', label: 'Warehouses', icon: 'Warehouse' },
  ]
  const [tab, setTab] = useState(tabs[0].id)

  return (
    <>
      <FeatureHeader
        icon="Network"
        title={t('Parts Supply Network')}
        subtitle={t('Partner warehouses, fulfilment and shipment tracking')}
      />

      <TabBar tabs={tabs} value={tab} onChange={setTab} />

      <StatRow
        stats={[
          { label: 'Partners', value: 156, caption: 'Connected', highlight: true },
          { label: 'Open Fulfilments', value: 0, caption: 'In progress', tone: 'info' },
          { label: 'In Transit', value: 0, caption: 'Shipments', tone: 'info' },
          { label: 'Warehouses', value: 0, caption: 'Stocking points' },
        ]}
      />

      {tab === 'partners' && (
        <Section title={t('Network Partners')}>
          <EmptyState
            icon="Users"
            title={t('No network partners')}
            description={t('Partner garages appear here once they join the supply network.')}
          />
        </Section>
      )}
      {tab === 'fulfillment' && (
        <Section title={t('Fulfillment Orders')}>
          <EmptyState
            icon="Package"
            title={t('No fulfillment orders')}
            description={t('Group-buy and fulfillment orders appear here once placed.')}
          />
        </Section>
      )}
      {tab === 'shipments' && (
        <Section title={t('Shipments')}>
          <EmptyState
            icon="Truck"
            title={t('No shipments in transit')}
            description={t('Shipments and delivery tracking appear here once orders are dispatched.')}
          />
        </Section>
      )}
      {tab === 'warehouses' && (
        <Section title={t('Warehouses')}>
          <EmptyState
            icon="Warehouse"
            title={t('No warehouses registered')}
            description={t('Partner warehouse locations and stock levels appear here.')}
          />
        </Section>
      )}
    </>
  )
}
