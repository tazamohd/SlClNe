/** Parts Network — the pieces the eight network screens share (BLK-004).
 *
 *  Presentation constants and the three write forms live here so
 *  `screens/network/PartsNetwork.tsx` stays a file of screens. The forms carry
 *  the `useCreate` / `useUpdate` / `useDelete` calls; the screens mount them,
 *  which is the edge `scripts/build-registry.mjs` follows to credit a screen
 *  with the writes it can reach.
 *
 *  The palette has no green or red (README §7), so a status is distinguished by
 *  tint rather than by traffic-light colour: blue for neutral and in-flight,
 *  orange for anything wanting attention, navy for terminal, neutral grey for
 *  closed or withdrawn.
 */
import { z } from 'zod'
import {
  partsNetworkMemberCreate,
  partsNetworkQuotationCreate,
  partsNetworkRequestCreate,
} from '@contract'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { DESTRUCTIVE_BUTTON, Modal, useModal } from '@/components/ui/Modal'
import {
  Field,
  Form,
  FormErrorSummary,
  useUnsavedChangesGuard,
  useZodForm,
} from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { parseSar } from '@/components/ui/Money'
import { RepositoryError, useCreate, useDelete, useUpdate, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, asPatch, rowId, serverFieldError } from '../../registry/writes'

export type Member = RowOf<'partsNetworkMembers'>
export type NetworkRequest = RowOf<'partsNetworkRequests'>
export type Quotation = RowOf<'partsNetworkQuotations'>
export type NetworkOrder = RowOf<'partsNetworkOrders'>

/* ------------------------------------------------------------ presentation */

const TINT = {
  blue: ['var(--tint-blue)', 'var(--salis-blue)'],
  bright: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  orange: ['var(--tint-orange)', 'var(--salis-orange)'],
  navy: ['var(--tint-navy)', 'var(--salis-navy)'],
  neutral: ['var(--tint-neutral)', 'var(--text-muted)'],
} as const satisfies Record<string, readonly [string, string]>

type Tint = keyof typeof TINT

const MEMBER_KIND: Record<string, { label: string; tint: Tint }> = {
  garage: { label: 'Garage', tint: 'blue' },
  dealer: { label: 'Dealer', tint: 'navy' },
  store: { label: 'Store', tint: 'bright' },
  supplier: { label: 'Supplier', tint: 'orange' },
}

const MEMBER_STATUS: Record<string, { label: string; tint: Tint }> = {
  active: { label: 'Active', tint: 'blue' },
  pending: { label: 'Pending', tint: 'orange' },
  suspended: { label: 'Suspended', tint: 'neutral' },
}

const REQUEST_STATUS: Record<string, { label: string; tint: Tint }> = {
  open: { label: 'Open', tint: 'blue' },
  quoted: { label: 'Quoted', tint: 'bright' },
  ordered: { label: 'Ordered', tint: 'navy' },
  closed: { label: 'Closed', tint: 'neutral' },
  cancelled: { label: 'Cancelled', tint: 'neutral' },
}

const URGENCY: Record<string, { label: string; tint: Tint }> = {
  low: { label: 'Low', tint: 'neutral' },
  normal: { label: 'Normal', tint: 'blue' },
  high: { label: 'High', tint: 'orange' },
  urgent: { label: 'Urgent', tint: 'navy' },
}

const QUOTATION_STATUS: Record<string, { label: string; tint: Tint }> = {
  pending: { label: 'Pending', tint: 'orange' },
  accepted: { label: 'Accepted', tint: 'blue' },
  rejected: { label: 'Rejected', tint: 'neutral' },
  withdrawn: { label: 'Withdrawn', tint: 'neutral' },
}

const CONDITION: Record<string, { label: string; tint: Tint }> = {
  new: { label: 'New', tint: 'blue' },
  used: { label: 'Used', tint: 'neutral' },
  oem: { label: 'OEM', tint: 'navy' },
  aftermarket: { label: 'Aftermarket', tint: 'bright' },
}

const ORDER_STATUS: Record<string, { label: string; tint: Tint }> = {
  placed: { label: 'Placed', tint: 'orange' },
  shipped: { label: 'Shipped', tint: 'bright' },
  received: { label: 'Received', tint: 'blue' },
  cancelled: { label: 'Cancelled', tint: 'neutral' },
}

const DICTIONARIES = {
  memberKind: MEMBER_KIND,
  memberStatus: MEMBER_STATUS,
  requestStatus: REQUEST_STATUS,
  urgency: URGENCY,
  quotationStatus: QUOTATION_STATUS,
  condition: CONDITION,
  orderStatus: ORDER_STATUS,
} as const

/** One badge renderer for every enum in this domain, so two screens cannot
 *  disagree about what `oem` or `shipped` looks like. An unknown value falls
 *  back to itself in a neutral tint rather than rendering blank. */
export function NetworkBadge({
  dictionary,
  value,
}: {
  dictionary: keyof typeof DICTIONARIES
  value: string
}) {
  const { t } = usePreferences()
  const entry = DICTIONARIES[dictionary][value]
  const [bg, fg] = TINT[entry?.tint ?? 'neutral']
  return (
    <Badge background={bg} color={fg}>
      {t(entry?.label ?? value)}
    </Badge>
  )
}

/** `46` → `4.6 ★`. Null stays null: an unrated member shows a dash rather
 *  than a fabricated zero. */
export function MemberRating({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-muted">—</span>
  return (
    <span className="inline-flex items-center gap-1 text-body" dir="ltr">
      <Icon name="Star" size={13} className="text-salis-orange" />
      {rating.toFixed(1)}
    </span>
  )
}

/** Member options for a picker, active members first. */
export function memberOptions(members: readonly Member[]) {
  return members
    .filter((m) => m.status !== 'suspended')
    .map((m) => ({ value: rowId(m) ?? m.code, label: m.name }))
}

/* --------------------------------------------------------------- the forms */

const memberForm = z
  .object({
    name: z.string(),
    kind: z.string(),
    city: z.string(),
    contactName: z.string(),
    contactPhone: z.string(),
    contactEmail: z.string(),
    status: z.string(),
    notes: z.string(),
  })
  .transform((values) => {
    const optional = (raw: string) => {
      const trimmed = raw.trim()
      return trimmed ? trimmed : undefined
    }
    return {
      name: values.name.trim(),
      kind: (values.kind || 'garage') as 'garage',
      status: (values.status || 'active') as 'active',
      ...(optional(values.city) ? { city: optional(values.city) } : {}),
      ...(optional(values.contactName) ? { contactName: optional(values.contactName) } : {}),
      ...(optional(values.contactPhone) ? { contactPhone: optional(values.contactPhone) } : {}),
      ...(optional(values.contactEmail) ? { contactEmail: optional(values.contactEmail) } : {}),
      ...(optional(values.notes) ? { notes: optional(values.notes) } : {}),
    }
  })
  .pipe(partsNetworkMemberCreate)

const MEMBER_KIND_OPTIONS = [
  { value: 'garage', label: 'Garage' },
  { value: 'dealer', label: 'Dealer' },
  { value: 'store', label: 'Store' },
  { value: 'supplier', label: 'Supplier' },
] as const

const MEMBER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
] as const

/** Create or edit a member of this workshop's network directory. Note what this
 *  form is *not*: it does not invite another organization onto a platform, it
 *  records who this workshop trades with. `supplierId` is deliberately absent —
 *  linking a member to a `suppliers` row is a procurement decision made where
 *  vendors are maintained, not typed in here. */
export function MemberFormModal({
  open,
  onClose,
  existingRecord,
}: {
  open: boolean
  onClose: () => void
  existingRecord?: Member
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { confirm } = useModal()
  const create = useCreate('partsNetworkMembers')
  const update = useUpdate('partsNetworkMembers')
  const remove = useDelete('partsNetworkMembers')
  const editing = Boolean(existingRecord)

  const form = useZodForm({
    schema: memberForm,
    initial: {
      name: existingRecord?.name ?? '',
      kind: existingRecord?.kind ?? 'garage',
      city: existingRecord?.city ?? '',
      contactName: existingRecord?.contactName ?? '',
      contactPhone: existingRecord?.contactPhone ?? '',
      contactEmail: existingRecord?.contactEmail ?? '',
      status: existingRecord?.status ?? 'active',
      notes: existingRecord?.notes ?? '',
    },
    async onSubmit(values) {
      try {
        if (existingRecord) {
          const id = rowId(existingRecord)
          if (!id) throw new Error(t('This record has no id, so it cannot be saved.'))
          await update.mutateAsync({ id, patch: asPatch<Member>(values) })
        } else {
          await create.mutateAsync({ input: asPatch<Member>(values) })
        }
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({
        title: t(editing ? 'Member updated' : 'Member added'),
        description: values.name,
      })
      onClose()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)

  const close = async () => {
    if (form.pending) return
    if (!(await confirmDiscard())) return
    onClose()
  }

  const handleDelete = async () => {
    const id = rowId(existingRecord)
    if (!id) return
    const agreed = await confirm({
      title: t('Remove Member?'),
      description: existingRecord?.name ?? '',
      icon: 'Trash2',
      confirmLabel: t('Remove'),
      destructive: true,
      variant: 'lifecycle',
    })
    if (!agreed) return
    try {
      await remove.mutateAsync({ id })
    } catch (cause) {
      toast.show({
        title: t('Could not remove member'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
      return
    }
    toast.show({ title: t('Member removed'), description: existingRecord?.name ?? '' })
    onClose()
  }

  const busy = form.pending || remove.isPending

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon={editing ? 'Pencil' : 'Building2'}
      title={t(editing ? 'Edit Network Member' : 'Add Network Member')}
      dismissible={!busy}
      footer={
        <>
          {editing && rowId(existingRecord) ? (
            <Button
              variant="subtle"
              size="lg"
              onClick={() => void handleDelete()}
              disabled={busy}
              className={DESTRUCTIVE_BUTTON}
            >
              <Icon name="Trash2" size={14} />
              {t('Remove')}
            </Button>
          ) : null}
          <div className="flex-1" />
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={busy}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={busy}>
            {form.pending ? t('Saving...') : t(editing ? 'Save Changes' : 'Add Member')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Member Name" required placeholder={t('Al Jazira Auto Parts')} />
        <Field name="kind" label="Type" kind="select" options={MEMBER_KIND_OPTIONS} />
        <Field name="city" label="City" placeholder={t('Riyadh')} />
        <Field name="contactName" label="Contact Name" />
        <Field name="contactPhone" label="Contact Phone" kind="phone" />
        <Field name="contactEmail" label="Contact Email" kind="email" />
        <Field name="status" label="Status" kind="select" options={MEMBER_STATUS_OPTIONS} />
        <Field name="notes" label="Notes" kind="textarea" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={busy}>
          {t(editing ? 'Save Changes' : 'Add Member')}
        </button>
      </Form>
    </Modal>
  )
}

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

/** The request form, shared by the full-page Send Request screen and the
 *  Requests list's own New Request action, so there is one definition of what a
 *  request is rather than two that drift.
 *
 *  `direction` is fixed at `outgoing` here: an incoming request is something a
 *  member sent, recorded by an integration, never something a user types on
 *  their own behalf. Nothing about the status, the quotation count or the
 *  timestamps is offered — all four are the server's. */
const requestForm = z
  .object({
    partName: z.string(),
    partNumber: z.string(),
    partSku: z.string(),
    qty: z.string(),
    urgency: z.string(),
    vehicleInfo: z.string(),
    jobCode: z.string(),
    memberId: z.string(),
    neededBy: z.string(),
    notes: z.string(),
  })
  .transform((values) => {
    const optional = (raw: string) => {
      const trimmed = raw.trim()
      return trimmed ? trimmed : undefined
    }
    const qty = Number(values.qty)
    return {
      direction: 'outgoing' as const,
      partName: values.partName.trim(),
      qty: Number.isFinite(qty) && qty > 0 ? Math.trunc(qty) : 1,
      urgency: (values.urgency || 'normal') as 'normal',
      ...(optional(values.partNumber) ? { partNumber: optional(values.partNumber) } : {}),
      ...(optional(values.partSku) ? { partSku: optional(values.partSku) } : {}),
      ...(optional(values.vehicleInfo) ? { vehicleInfo: optional(values.vehicleInfo) } : {}),
      ...(optional(values.jobCode) ? { jobCode: optional(values.jobCode) } : {}),
      ...(optional(values.memberId) ? { memberId: optional(values.memberId) } : {}),
      ...(optional(values.neededBy) ? { neededBy: optional(values.neededBy) } : {}),
      ...(optional(values.notes) ? { notes: optional(values.notes) } : {}),
    }
  })
  .pipe(partsNetworkRequestCreate)

export type RequestFormValues = z.input<typeof requestForm>

const EMPTY_REQUEST: RequestFormValues = {
  partName: '',
  partNumber: '',
  partSku: '',
  qty: '1',
  urgency: 'normal',
  vehicleInfo: '',
  jobCode: '',
  memberId: '',
  neededBy: '',
  notes: '',
}

/** The create half of the request form. Kept apart from `RequestFields` so the
 *  Send Request page owns its own submission and framing while the definition of
 *  what a request *is* lives in one place. */
export function useRequestForm({ onDone }: { onDone: (partName: string) => void }) {
  const create = useCreate('partsNetworkRequests')
  return {
    form: useZodForm({
      schema: requestForm,
      initial: EMPTY_REQUEST,
      async onSubmit(values) {
        try {
          await create.mutateAsync({ input: asPatch<NetworkRequest>(values) })
        } catch (cause) {
          const attributed = serverFieldError(cause)
          if (attributed) throw attributed
          throw cause instanceof RepositoryError ? new Error(cause.message) : cause
        }
        onDone(values.partName)
      },
    }),
  }
}

export function RequestFields({ members }: { members: readonly Member[] }) {
  const { t } = usePreferences()
  return (
    <>
      <FormErrorSummary />
      <Field name="partName" label="Part Name" required placeholder={t('Brake Pads (Front)')} />
      <Field name="partNumber" label="Part Number" placeholder="BP-FR-220" />
      <Field name="partSku" label="Our SKU" hint={t('If we stock this part, its SKU in our own inventory.')} />
      <Field name="qty" label="Quantity" required />
      <Field name="urgency" label="Urgency" kind="select" options={URGENCY_OPTIONS} />
      <Field name="vehicleInfo" label="Vehicle" placeholder={t('Toyota Camry 2022')} />
      <Field name="jobCode" label="Job Card" placeholder="A3F8B2C1" />
      <Field
        name="memberId"
        label="Send To"
        kind="select"
        options={[{ value: '', label: 'Everyone in the network' }, ...memberOptions(members)]}
        hint={t('Leave as Everyone to broadcast the request to the whole network.')}
      />
      <Field name="neededBy" label="Needed By" kind="date" />
      <Field name="notes" label="Notes" kind="textarea" />
    </>
  )
}

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'oem', label: 'OEM' },
  { value: 'aftermarket', label: 'Aftermarket' },
] as const

/** Quote against an incoming request. The price is entered in SAR and converted
 *  to halalas here, at the boundary — the same `parseSar` every money form in
 *  this product uses, so the browser never hands the server a float. `status`
 *  is absent by design: a quotation is born `pending` and only the accept route
 *  can make it `accepted`. */
const quotationForm = (requestId: string) =>
  z
    .object({
      memberName: z.string(),
      memberId: z.string(),
      unitPrice: z.string(),
      qtyAvailable: z.string(),
      leadTimeDays: z.string(),
      condition: z.string(),
      warrantyMonths: z.string(),
      notes: z.string(),
    })
    .transform((values) => {
      const optionalInt = (raw: string) => {
        const trimmed = raw.trim()
        if (!trimmed) return undefined
        const parsed = Number(trimmed)
        return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : undefined
      }
      const qty = optionalInt(values.qtyAvailable)
      const memberId = values.memberId.trim()
      const notes = values.notes.trim()
      return {
        requestId,
        memberName: values.memberName.trim(),
        /* SAR in the form, integer halalas on the wire — the same
         * `Math.round(parseSar(x) * 100)` every money form in this product
         * uses, so the browser never hands the server a float. */
        unitPriceHalalas: Math.round(parseSar(values.unitPrice) * 100),
        qtyAvailable: qty ?? 0,
        condition: (values.condition || 'new') as 'new',
        ...(memberId ? { memberId } : {}),
        ...(optionalInt(values.leadTimeDays) === undefined
          ? {}
          : { leadTimeDays: optionalInt(values.leadTimeDays) }),
        ...(optionalInt(values.warrantyMonths) === undefined
          ? {}
          : { warrantyMonths: optionalInt(values.warrantyMonths) }),
        ...(notes ? { notes } : {}),
      }
    })
    .pipe(partsNetworkQuotationCreate)

export function QuotationFormModal({
  open,
  onClose,
  request,
  members,
}: {
  open: boolean
  onClose: () => void
  request: NetworkRequest
  members: readonly Member[]
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('partsNetworkQuotations')
  const requestId = rowId(request) ?? ''

  const form = useZodForm({
    schema: quotationForm(requestId),
    initial: {
      /* Quoting on an incoming request means quoting *to* the member who sent
       * it, so their name is the sensible default rather than a blank. */
      memberName: request.memberName ?? '',
      memberId: request.memberId ?? '',
      unitPrice: '',
      qtyAvailable: String(request.qty),
      leadTimeDays: '',
      condition: 'new',
      warrantyMonths: '',
      notes: '',
    },
    async onSubmit(values) {
      try {
        await create.mutateAsync({ input: asPatch<Quotation>(values) })
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw cause instanceof RepositoryError ? new Error(cause.message) : cause
      }
      toast.show({ title: t('Quotation submitted'), description: request.partName })
      onClose()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)

  const close = async () => {
    if (form.pending) return
    if (!(await confirmDiscard())) return
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => void close()}
      variant="crud"
      icon="FileText"
      title={t('Submit Quotation')}
      dismissible={!form.pending}
      footer={
        <>
          <div className="flex-1" />
          <Button variant="subtle" size="lg" onClick={() => void close()} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Saving...') : t('Submit Quotation')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <p className="mb-3 text-[13px] text-muted">
        {request.code} · {request.partName} · {t('Quantity')} {request.qty}
      </p>
      <Form form={form}>
        <FormErrorSummary />
        <Field name="memberName" label="Quoting As" required />
        <Field
          name="memberId"
          label="Network Member"
          kind="select"
          options={[{ value: '', label: 'Not a directory member' }, ...memberOptions(members)]}
        />
        <Field name="unitPrice" label="Unit Price" kind="currency" required />
        <Field name="qtyAvailable" label="Quantity Available" required />
        <Field name="leadTimeDays" label="Lead Time (days)" />
        <Field name="condition" label="Condition" kind="select" options={CONDITION_OPTIONS} />
        <Field name="warrantyMonths" label="Warranty (months)" />
        <Field name="notes" label="Notes" kind="textarea" />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Submit Quotation')}
        </button>
      </Form>
    </Modal>
  )
}
