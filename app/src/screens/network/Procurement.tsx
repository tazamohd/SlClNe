import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section, StatRow } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Money, parseSar } from '@/components/ui/Money'
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
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { API_URL, RepositoryError } from '@/data/repository'
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
                placeholder="Toyota Camry 2022"
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
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('Condition, brand preference, delivery window...')}
              className="box-border w-full resize-y rounded border border-border bg-inset px-3 py-2.5 font-ui text-[13px] text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
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
            <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">
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

      <div role="tablist" aria-label={t('Sort by')} className="flex flex-wrap gap-2">
        {SORTS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={sort === option.id}
            onClick={() => setSort(option.id)}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5',
              'font-action text-[13px] font-medium transition-all duration-150',
              sort === option.id
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-muted hover:border-border-strong'
            )}
          >
            <Icon name={option.icon} size={13} />
            {t(option.label)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={sorted}
        rowKey={(q) => q.supplier}
        mobileCard={(q) => (
          <>
            <MobileCardHeader
              title={q.supplier}
              trailing={
                q.unit === best ? (
                  <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">
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

/* ═══════════════════════════════ procurement: what the server supports today */

/** The requisition fields a create or edit sends. Money crosses as integer
 *  halalas, formatted only at the boundary. */
export interface RequisitionInput {
  what: string
  from: string
  priority: Requisition['priority']
  amountHalalas: number
  notes?: string
}

export interface PurchaseOrderLineInput {
  sku: string | null
  description: string
  qty: number
  unitPriceHalalas: number
}

export interface PurchaseOrderInput {
  supplierName: string
  contactPerson?: string
  expectedDate?: string
  status: 'draft' | 'placed'
  /** The requisition this order converts, when raised from one. */
  requisitionId?: string
  lines: readonly PurchaseOrderLineInput[]
}

export interface PurchaseOrderRecord {
  id: string
  code: string
  status: 'draft' | 'placed' | 'approved'
  supplierName: string
  totalHalalas: number
  raisedBy: string
  approvedBy?: string
  lines: readonly (PurchaseOrderLineInput & { receivedQty: number })[]
}

/** Every procurement write, as a seam a test can substitute.
 *
 *  There is deliberately **no HTTP implementation behind this interface yet**,
 *  because there is nothing to point one at: `server/src/registry.ts` registers
 *  no `requisitions` or `purchaseOrders` collection and no route under
 *  `/procurement` exists. The `purchase_orders` and `purchase_order_lines`
 *  tables are in the schema and the RLS list, unexposed. When agent 05 lands
 *  the endpoints, the transport is written here and the `GAP:` tests in
 *  `app/tests/procurement-gaps.test.ts` — which pin the absence — fail loudly
 *  to say so. */
export interface ProcurementApi {
  listRequisitions(): Promise<readonly Requisition[]>
  createRequisition(input: RequisitionInput, idempotencyKey: string): Promise<Requisition>
  updateRequisition(
    id: string,
    patch: Partial<RequisitionInput>,
    idempotencyKey: string
  ): Promise<Requisition>
  decideRequisition(
    id: string,
    decision: 'approve' | 'reject',
    idempotencyKey: string
  ): Promise<Requisition>
  listPurchaseOrders(): Promise<readonly PurchaseOrderRecord[]>
  placePurchaseOrder(input: PurchaseOrderInput, idempotencyKey: string): Promise<PurchaseOrderRecord>
  approvePurchaseOrder(id: string, idempotencyKey: string): Promise<PurchaseOrderRecord>
  receiveLine(
    orderId: string,
    lineIndex: number,
    qty: number,
    overReceiptApproved: boolean,
    idempotencyKey: string
  ): Promise<PurchaseOrderRecord>
}

/** Why procurement writes cannot happen from this build. Never null today —
 *  the honest state is the state. */
export function procurementUnavailableReason(): string {
  if (!API_URL) {
    return 'Requisition and purchase-order writes need the API. This build is reading design fixtures, which hold no procurement records and refuse writes rather than pretending.'
  }
  return 'The API has no procurement endpoints yet: the server registers no requisitions or purchase-orders collection, so nothing can create, approve, convert or receive. The purchase-order tables exist in the database schema, unexposed.'
}

/** The live transport — none exists. See the interface note: returning null
 *  here is what routes every screen to the honest absent-capability state
 *  instead of a request that cannot land. */
export function procurementApi(): ProcurementApi | null {
  return null
}

export function procurementIdempotencyKey(): string {
  const globalCrypto = globalThis.crypto as Crypto | undefined
  if (globalCrypto?.randomUUID) return globalCrypto.randomUUID()
  return `pr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/** Turns a rejected write into what the form system can show: a named field
 *  keeps its message on the control, a refusal becomes the form-level line. */
export function asProcurementFormError(error: unknown): Error {
  if (!(error instanceof RepositoryError)) {
    return error instanceof Error ? error : new Error('The request failed.')
  }
  if (error.field) return new ServerValidationError({ [error.field]: error.message })
  if (error.code === 'forbidden' || error.code === 'rule_violated') {
    return new ServerValidationError({}, error.message)
  }
  return new Error(error.message)
}

/** The complete requisition set from ProcurementPortal.Requisitions.dc.html —
 *  all seven rows. The transcription in `data/network.ts` carries only five,
 *  which left the "PO Raised" and "Rejected" tabs empty against the design;
 *  `data/**` is outside this agent's boundary, so the full set lives here and
 *  the short one is reported. Amounts in SAR to match the `Requisition` type. */
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

const REQ_TABS = ['pending', 'approved', 'converted', 'rejected', 'all'] as const

function statusLabel(status: Requisition['status']): string {
  return status === 'converted' ? 'PO Raised' : status[0].toUpperCase() + status.slice(1)
}

/* ─────────────────────────────────────────────── creating / editing / viewing */

const requisitionSchema = z.object({
  what: z
    .string()
    .trim()
    .min(1, 'Describe what is being requested.')
    .max(300, 'Keep the description under 300 characters.'),
  from: z
    .string()
    .trim()
    .min(1, 'Name the branch and department raising this.')
    .max(120),
  priority: z.enum(['urgent', 'high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Pick a priority.' }),
  }),
  amount: z
    .string()
    .trim()
    .min(1, 'Enter the estimated amount.')
    .refine((value) => parseSar(value) > 0, 'The amount must be above zero.'),
  notes: z.string().trim().max(500, 'Keep notes under 500 characters.'),
})

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const

/** Create or edit a requisition — one form, two callers. Rendered only when a
 *  transport exists; the caller shows the dependency notice otherwise, so this
 *  form can never pretend a submit landed. */
function RequisitionFormModal({
  api,
  initial,
  onClose,
  onSaved,
}: {
  api: ProcurementApi
  initial?: Requisition
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()

  const form = useZodForm({
    schema: requisitionSchema,
    initial: initial
      ? {
          what: initial.what,
          from: initial.from,
          priority: initial.priority,
          amount: String(initial.amount),
          notes: '',
        }
      : { what: '', from: '', priority: '' as unknown as Requisition['priority'], amount: '', notes: '' },
    async onSubmit(values) {
      const input: RequisitionInput = {
        what: values.what,
        from: values.from,
        priority: values.priority,
        amountHalalas: Math.round(parseSar(values.amount) * 100),
        ...(values.notes ? { notes: values.notes } : {}),
      }
      try {
        if (initial) {
          await api.updateRequisition(initial.id, input, procurementIdempotencyKey())
        } else {
          await api.createRequisition(input, procurementIdempotencyKey())
        }
      } catch (error) {
        throw asProcurementFormError(error)
      }
      toast.show({
        title: t(initial ? 'Requisition updated' : 'Requisition submitted'),
        description: values.what,
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

  return (
    <Modal
      open
      onClose={close}
      variant="crud"
      icon={initial ? 'Pencil' : 'Plus'}
      title={initial ? 'Edit Requisition' : 'New Requisition'}
      description={t('A requisition asks procurement to buy. Approval and conversion to a purchase order happen after it is raised.')}
      meta={
        initial ? (
          <span dir="ltr" className="font-mono">
            {initial.id}
          </span>
        ) : undefined
      }
    >
      <Form form={form}>
        <FormErrorSummary />
        <Field
          name="what"
          label="Request"
          required
          placeholder="Brake Pads (Front) ×40 — stock below reorder"
        />
        <Field
          name="from"
          label="From (branch · department)"
          required
          placeholder="Riyadh Main · Inventory"
        />
        <Field name="priority" label="Priority" kind="select" required options={PRIORITY_OPTIONS} />
        <Field
          name="amount"
          label="Estimated Amount"
          kind="currency"
          required
          hint="Approval routes by this amount: above the approver's ceiling it escalates."
        />
        <Field name="notes" label="Notes" kind="textarea" rows={2} />
        <FormActions note>
          <Button variant="subtle" size="lg" onClick={close} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label={initial ? 'Save Changes' : 'Submit Requisition'} />
        </FormActions>
      </Form>
    </Modal>
  )
}

/** One requisition, with the lifecycle actions the role and the transport
 *  allow. Approval is bounded by the role's SAR ceiling on the procurement
 *  module — authority and ceiling are separate questions (F-002). */
function RequisitionDetailModal({
  row,
  api,
  unavailable,
  onClose,
  onChanged,
}: {
  row: Requisition
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
  const [busy, setBusy] = useState(false)

  const mayDecide = can('procurement', 'a')
  const withinCeiling = roleCanApprove(role, row.amount, 'procurement')
  const limit = approvalLimit(role)
  const [prBg, prFg] = PRIORITY_TONE[row.priority] ?? PRIORITY_TONE.medium
  const [stBg, stFg] = NETWORK_STATUS[row.status] ?? NETWORK_STATUS.pending

  async function decide(decision: 'approve' | 'reject') {
    if (!api) return
    const ok = await confirm(
      decision === 'approve'
        ? {
            title: 'Approve this requisition?',
            description: 'Approval releases it for conversion to a purchase order.',
            icon: 'CheckCircle2',
            confirmLabel: 'Approve',
          }
        : {
            title: 'Reject this requisition?',
            description: 'The requesting branch is notified. This cannot be undone from here.',
            icon: 'AlertTriangle',
            confirmLabel: 'Reject',
            destructive: true,
          }
    )
    if (!ok) return
    setBusy(true)
    try {
      await api.decideRequisition(row.id, decision, procurementIdempotencyKey())
      toast.show({
        title: t(decision === 'approve' ? 'Requisition approved' : 'Requisition rejected'),
        description: `${row.id} · ${t(row.what)}`,
      })
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
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false)
          onChanged()
          onClose()
        }}
      />
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="data"
      icon="ClipboardList"
      title="Requisition"
      meta={
        <span dir="ltr" className="font-mono">
          {row.id}
        </span>
      }
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={busy}>
            {t('Close')}
          </Button>
          {row.status === 'pending' && api ? (
            <>
              <Button variant="outline" size="lg" onClick={() => setEditing(true)} disabled={busy}>
                <Icon name="Pencil" size={15} />
                {t('Edit')}
              </Button>
              {mayDecide ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => void decide('reject')}
                  disabled={busy}
                >
                  {t('Reject')}
                </Button>
              ) : null}
              {mayDecide && withinCeiling ? (
                <Button size="lg" onClick={() => void decide('approve')} disabled={busy}>
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
        <p className="text-sm font-semibold text-heading">{t(row.what)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge background={prBg} color={prFg}>
            {t(row.priority[0].toUpperCase() + row.priority.slice(1))}
          </Badge>
          <Badge background={stBg} color={stFg}>
            {t(statusLabel(row.status))}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded border border-border bg-inset px-3.5 py-2.5 text-[13px]">
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">{t('From')}</span>
            <span className="text-heading">{t(row.from)}</span>
          </span>
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">{t('Raised')}</span>
            <span className="text-heading">{t(row.age)}</span>
          </span>
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">{t('Amount')}</span>
            <Money sar={row.amount} className="font-semibold text-heading" />
          </span>
        </div>

        {row.status === 'pending' && api && mayDecide && !withinCeiling ? (
          <p
            role="note"
            className="flex items-start gap-2.5 rounded-lg border border-salis-orange/30 bg-[rgba(249,115,22,.06)] px-3.5 py-3 text-[13px] text-body"
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

        {row.status === 'pending' && !api ? (
          <ReadOnlyNotice message={t(unavailable ?? procurementUnavailableReason())} />
        ) : null}
      </div>
    </Modal>
  )
}

/* ───────────────────────────────────────────────────────── the requisitions list */

/** Requisitions — list, lifecycle and conversion queue.
 *
 *  Reads come from the transport when one exists and from the design fixture
 *  otherwise. Writes exist exactly as far as the server supports them, which
 *  today is not at all — `procurementApi()` documents why, the screen says it
 *  where the actions would be, and nothing here "approves" into local state.
 *
 *  `api` is injected only by tests. Production passes nothing and gets the
 *  honest state. */
export function ProcurementRequisitions({ api: injected }: { api?: ProcurementApi | null } = {}) {
  const { t } = usePreferences()
  const { role, can } = useSession()
  const { confirm } = useModal()
  const toast = useToast()
  const client = useQueryClient()

  const api = injected === undefined ? procurementApi() : injected
  const unavailable = api ? null : procurementUnavailableReason()

  const [tab, setTab] = useState<string>('pending')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const {
    data: requisitions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['procurement-requisitions'],
    queryFn: () => (api ? api.listRequisitions() : Promise.resolve(REQUISITION_ROWS)),
  })

  const rows = useMemo(() => {
    const inTab =
      tab === 'all' ? requisitions : requisitions.filter((r) => r.status === tab)
    if (!search.trim()) return inTab
    const needle = search.trim().toLowerCase()
    return inTab.filter((r) =>
      [r.id, r.what, r.from].some((value) => value.toLowerCase().includes(needle))
    )
  }, [requisitions, tab, search])

  const selectedRows = rows.filter((r) => selected[r.id])
  const mayCreate = can('procurement', 'c')
  const mayDecide = can('procurement', 'a')
  const openRow = openId ? requisitions.find((r) => r.id === openId) ?? null : null

  const refresh = useCallback(() => {
    void client.invalidateQueries({ queryKey: ['procurement-requisitions'] })
    setSelected({})
  }, [client])

  /** CSV of the rows currently in view — the design's Export does real work. */
  const exportCsv = useCallback(() => {
    const header = 'Reference,Request,From,Priority,Raised,Amount SAR,Status'
    const body = rows.map((r) =>
      [r.id, r.what, r.from, r.priority, r.age, String(r.amount), r.status]
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
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

  async function decideSelected(decision: 'approve' | 'reject') {
    if (!api || !selectedRows.length) return
    const pending = selectedRows.filter((r) => r.status === 'pending')
    if (!pending.length) {
      toast.show({
        title: t('Nothing to decide'),
        description: t('Only pending requisitions can be approved or rejected.'),
        error: true,
      })
      return
    }
    if (decision === 'approve') {
      const over = pending.find((r) => !roleCanApprove(role, r.amount, 'procurement'))
      if (over) {
        const limit = approvalLimit(role)
        toast.show({
          title: t('Above your approval limit'),
          description: `${over.id} · SAR ${over.amount.toLocaleString('en-US')} — ${t('Limit')}: ${
            limit === null ? '∞' : `SAR ${limit.toLocaleString('en-US')}`
          }`,
          error: true,
        })
        return
      }
    }
    const ok = await confirm(
      decision === 'approve'
        ? {
            title: 'Approve selected requisitions?',
            description: 'Each approval releases the request for conversion to a purchase order.',
            icon: 'CheckCircle2',
            confirmLabel: 'Approve',
          }
        : {
            title: 'Reject selected requisitions?',
            description: 'The requesting branches are notified. This cannot be undone from here.',
            icon: 'AlertTriangle',
            confirmLabel: 'Reject',
            destructive: true,
          }
    )
    if (!ok) return
    setBusy(true)
    try {
      for (const row of pending) {
        await api.decideRequisition(row.id, decision, procurementIdempotencyKey())
      }
      toast.show({
        title: t(decision === 'approve' ? 'Approved' : 'Rejected'),
        description: `${pending.length} ${t('requisitions')}`,
      })
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

  const columns: Column<Requisition>[] = [
    {
      header: 'Select',
      cell: (r) => (
        <input
          type="checkbox"
          aria-label={`${t('Select')} ${r.id}`}
          checked={!!selected[r.id]}
          onChange={() => setSelected((s) => ({ ...s, [r.id]: !s[r.id] }))}
          onClick={(event) => event.stopPropagation()}
          className="h-[15px] w-[15px] cursor-pointer accent-[var(--salis-blue)]"
        />
      ),
      className: 'w-[44px]',
    },
    {
      header: 'Req #',
      cell: (r) => <span className="font-semibold text-salis-blue">{r.id}</span>,
      code: true,
    },
    {
      header: 'Request',
      cell: (r) => (
        <span className="flex flex-col">
          <span className="text-[13px] text-body">{t(r.what)}</span>
          <span className="mt-0.5 text-[11px] text-muted">{t(r.from)}</span>
        </span>
      ),
    },
    {
      header: 'Priority',
      cell: (r) => {
        const [bg, fg] = PRIORITY_TONE[r.priority] ?? PRIORITY_TONE.medium
        return (
          <Badge background={bg} color={fg}>
            {t(r.priority[0].toUpperCase() + r.priority.slice(1))}
          </Badge>
        )
      },
    },
    { header: 'Raised', cell: (r) => <span className="text-[13px] text-muted">{t(r.age)}</span> },
    {
      header: 'Amount',
      cell: (r) => <Money sar={r.amount} className="font-semibold" />,
      className: 'text-end',
    },
    {
      header: 'Status',
      cell: (r) => {
        const [bg, fg] = NETWORK_STATUS[r.status] ?? NETWORK_STATUS.pending
        return (
          <Badge background={bg} color={fg}>
            {t(statusLabel(r.status))}
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
        <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
          {REQ_TABS.map((option) => {
            const count =
              option === 'all'
                ? requisitions.length
                : requisitions.filter((r) => r.status === option).length
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={tab === option}
                onClick={() => {
                  setTab(option)
                  setSelected({})
                }}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                  'font-action text-[13px] font-medium transition-all duration-150',
                  tab === option
                    ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                    : 'border-border bg-card text-muted hover:border-border-strong'
                )}
              >
                {t(option === 'converted' ? 'PO Raised' : option[0].toUpperCase() + option.slice(1))}
                <span className="font-mono text-[11px] opacity-70" dir="ltr">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
        <span className="flex-1" />
        {selectedRows.length ? (
          <div className="flex items-center gap-2 rounded-lg border border-[rgba(10,94,215,.22)] bg-[rgba(10,94,215,.05)] py-1 ps-3 pe-1.5">
            <span className="text-xs font-semibold text-salis-blue">
              <span dir="ltr" className="font-mono">
                {selectedRows.length}
              </span>{' '}
              {t('selected')}
            </span>
            {mayDecide ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!api || busy}
                  onClick={() => void decideSelected('reject')}
                >
                  {t('Reject')}
                </Button>
                <Button size="sm" disabled={!api || busy} onClick={() => void decideSelected('approve')}>
                  {t('Approve')}
                </Button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="max-w-[340px]">
        <label className="relative flex items-center">
          <span className="sr-only">{t('Search requisitions')}</span>
          <Icon name="Search" size={14} className="pointer-events-none absolute text-muted start-3" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('Search requisitions...')}
            className="h-9 w-full rounded border border-border bg-inset px-3 ps-8 text-[13px] text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
          />
        </label>
      </div>

      {isError ? (
        <ErrorState
          title={t("Couldn't load requisitions")}
          onRetry={() => void refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          loading={isLoading}
          onRowClick={(r) => setOpenId(r.id)}
          mobileCard={(r) => (
            <>
              <MobileCardHeader
                title={r.id}
                code
                trailing={
                  <Badge
                    background={(NETWORK_STATUS[r.status] ?? NETWORK_STATUS.pending)[0]}
                    color={(NETWORK_STATUS[r.status] ?? NETWORK_STATUS.pending)[1]}
                  >
                    {t(statusLabel(r.status))}
                  </Badge>
                }
              />
              <MobileCardRow>{t(r.what)}</MobileCardRow>
              <MobileCardRow label={t('From')}>{t(r.from)}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money sar={r.amount} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
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
          onClose={() => setOpenId(null)}
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
              className="flex cursor-pointer flex-wrap items-center gap-3 rounded-lg border border-border bg-inset p-3.5 text-start transition-colors duration-150 hover:border-salis-blue"
            >
              <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(10,94,215,.09)] p-2 text-salis-blue">
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

      <Card className="flex gap-1 overflow-x-auto rounded-lg p-1.5" role="tablist">
        {tabs.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={tab === option.id}
            onClick={() => setTab(option.id)}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded px-4 py-2.5',
              'font-action text-[13px] font-semibold transition-all duration-150',
              tab === option.id
                ? 'bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]'
                : 'bg-transparent text-muted hover:bg-[rgba(10,94,215,.06)] hover:text-salis-blue'
            )}
          >
            <Icon name={option.icon} size={15} />
            {t(option.label)}
          </button>
        ))}
      </Card>

      <StatRow
        stats={[
          { label: 'Partners', value: 156, caption: 'Connected', highlight: true },
          { label: 'Open Fulfilments', value: 0, caption: 'In progress', tone: 'info' },
          { label: 'In Transit', value: 0, caption: 'Shipments', tone: 'info' },
          { label: 'Warehouses', value: 0, caption: 'Stocking points' },
        ]}
      />

      <Section title={t(tabs.find((x) => x.id === tab)?.label ?? '')}>
        <EmptyState
          icon="Network"
          title={t('Nothing here yet')}
          description={t('This view populates as network activity begins.')}
        />
      </Section>
    </>
  )
}
