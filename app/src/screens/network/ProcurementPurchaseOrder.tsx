import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
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
import { Modal, useModal } from '@/components/ui/Modal'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { ErrorState, Loading, ReadOnlyNotice } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { useCollection, type RowOf } from '@/data/useCollection'
import { approvalLimit, canApprove as roleCanApprove, sodViolation } from '@/data/rbac'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import {
  asProcurementFormError,
  procurementApi,
  procurementIdempotencyKey,
  procurementUnavailableReason,
  type ProcurementApi,
  type PurchaseOrderLineInput,
  type PurchaseOrderRecord,
} from './Procurement'

type Part = RowOf<'parts'>

/* ═══════════════════════════════════════════════ the order, as arithmetic */

/** One line of the order being built. Money is integer halalas throughout;
 *  SAR appears only at the formatting boundary. */
export interface DraftLine {
  sku: string | null
  description: string
  /** On-hand at the time the line was added — the design's "Current" column. */
  stock: number | null
  reorder: number | null
  qty: number
  unitPriceHalalas: number
}

/** VAT at the KSA standard rate the design shows. The server recomputes —
 *  a client total is display, never a value the API accepts back. */
export const VAT_RATE = 0.15

export function poTotals(lines: readonly { qty: number; unitPriceHalalas: number }[]): {
  subtotalHalalas: number
  vatHalalas: number
  totalHalalas: number
} {
  const subtotalHalalas = lines.reduce((sum, line) => sum + line.qty * line.unitPriceHalalas, 0)
  const vatHalalas = Math.round(subtotalHalalas * VAT_RATE)
  return { subtotalHalalas, vatHalalas, totalHalalas: subtotalHalalas + vatHalalas }
}

/** The receiving invariant: received quantity never exceeds ordered quantity
 *  silently. `over` is not a refusal — it is the explicit route to approval,
 *  and the caller decides whether an approver is present to take it. */
export type ReceiveOutcome =
  | { kind: 'invalid'; message: string }
  | { kind: 'ok' }
  | { kind: 'over'; overBy: number }

export function checkReceive(args: {
  ordered: number
  received: number
  qty: number
}): ReceiveOutcome {
  if (!Number.isInteger(args.qty) || args.qty <= 0) {
    return { kind: 'invalid', message: 'Receive a positive whole number of units.' }
  }
  const after = args.received + args.qty
  if (after > args.ordered) {
    return { kind: 'over', overBy: after - args.ordered }
  }
  return { kind: 'ok' }
}

/* ─────────────────────────────────────────────────────── reading a part row */

interface PartExtras {
  _id?: string
  priceHalalas?: number
  costHalalas?: number | null
}

const extras = (part: Part): PartExtras => part as Part & PartExtras

/** The purchase cost to prefill: the recorded cost where the role may see it,
 *  the sell price otherwise — clearly editable either way. */
function defaultUnitCostHalalas(part: Part, costHidden: boolean): number {
  const cost = extras(part).costHalalas
  if (!costHidden && typeof cost === 'number') return cost
  const price = extras(part).priceHalalas
  if (typeof price === 'number') return price
  return Math.round(parseSar(part.price) * 100)
}

function isLowStock(part: Part): boolean {
  return part.stock <= part.reorder
}

/* ══════════════════════════════════════════════════════ add / edit a line */

const lineSchema = z.object({
  partSku: z.string().trim(),
  description: z.string().trim().min(1, 'Name the item being ordered.').max(300),
  qty: z
    .string()
    .trim()
    .min(1, 'Enter the order quantity.')
    .regex(/^\d+$/, 'Quantity must be a whole number of units.')
    .refine((value) => Number(value) >= 1, 'Order at least one unit.'),
  unitCost: z
    .string()
    .trim()
    .min(1, 'Enter the unit cost.')
    .refine((value) => parseSar(value) > 0, 'The unit cost must be above zero.'),
})

function LineModal({
  parts,
  initial,
  costHidden,
  onClose,
  onSave,
}: {
  parts: readonly Part[]
  initial?: DraftLine
  costHidden: boolean
  onClose: () => void
  onSave: (line: DraftLine) => void
}) {
  const { t } = usePreferences()

  const options = useMemo(
    () =>
      parts.map((part) => ({
        value: part.sku,
        label: `${part.name} — ${part.sku}`,
      })),
    [parts]
  )

  const form = useZodForm({
    schema: lineSchema,
    initial: initial
      ? {
          partSku: initial.sku ?? '',
          description: initial.description,
          qty: String(initial.qty),
          unitCost: (initial.unitPriceHalalas / 100).toFixed(2),
        }
      : { partSku: '', description: '', qty: '', unitCost: '' },
    onSubmit(values) {
      const part = parts.find((p) => p.sku === values.partSku) ?? null
      onSave({
        sku: part?.sku ?? (values.partSku || null),
        description: values.description,
        stock: part ? part.stock : initial?.stock ?? null,
        reorder: part ? part.reorder : initial?.reorder ?? null,
        qty: Number(values.qty),
        unitPriceHalalas: Math.round(parseSar(values.unitCost) * 100),
      })
    },
  })

  // Picking a part fills the description and the cost so the common case is
  // two keystrokes; both stay editable for non-catalogue items.
  const pick = (sku: string) => {
    form.setValue('partSku', sku)
    const part = parts.find((p) => p.sku === sku)
    if (part) {
      form.setValue('description', part.name)
      form.setValue('unitCost', (defaultUnitCostHalalas(part, costHidden) / 100).toFixed(2))
    }
  }

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)
  const close = useCallback(() => {
    void confirmDiscard().then((ok) => {
      if (ok) onClose()
    })
  }, [confirmDiscard, onClose])

  const picked = parts.find((p) => p.sku === form.values.partSku)

  return (
    <Modal
      open
      onClose={close}
      variant="crud"
      icon={initial ? 'Pencil' : 'Plus'}
      title={initial ? 'Edit Item' : 'Add Item'}
      description={t('Order lines carry the quantity and the agreed unit cost. VAT is added on the order total.')}
    >
      <Form form={form}>
        <FormErrorSummary />
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${form.id}-partSku`}
            className="font-action text-xs font-medium text-heading"
          >
            {t('Part')}
          </label>
          <select
            id={`${form.id}-partSku`}
            value={typeof form.values.partSku === 'string' ? form.values.partSku : ''}
            onChange={(event) => pick(event.target.value)}
            className="h-12 w-full rounded border border-border bg-inset px-3 font-action text-sm text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
          >
            <option value="">{t('Not from the catalogue')}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {picked ? (
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <Icon name="Package" size={12} className="flex-shrink-0" />
              {t('On hand')}{' '}
              <span dir="ltr" className="font-mono">
                {picked.stock}
              </span>{' '}
              · {t('reorder at')}{' '}
              <span dir="ltr" className="font-mono">
                {picked.reorder}
              </span>
            </span>
          ) : null}
        </div>
        <Field name="description" label="Description" required placeholder="Brake Pads (Front)" />
        <Field name="qty" label="Order Qty" required placeholder="0" hint="Whole units only." />
        <Field name="unitCost" label="Unit Cost" kind="currency" required />
        <FormActions note>
          <Button variant="subtle" size="lg" onClick={close} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label={initial ? 'Save Item' : 'Add Item'} />
        </FormActions>
      </Form>
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════ receiving against a PO */

const receiveSchema = z.object({
  qty: z
    .string()
    .trim()
    .min(1, 'Enter the quantity received.')
    .regex(/^\d+$/, 'Quantity must be a whole number of units.'),
})

/** Books received stock against one order line.
 *
 *  The invariant is surfaced here: receiving beyond the ordered quantity is
 *  never accepted silently — it is refused outright for a role without approve
 *  authority on procurement, and routed through an explicit confirmation for a
 *  role with it. The server owns the final check the day the endpoint exists. */
export function ReceiveLineModal({
  order,
  lineIndex,
  api,
  onClose,
  onReceived,
}: {
  order: PurchaseOrderRecord
  lineIndex: number
  api: ProcurementApi
  onClose: () => void
  onReceived: () => void
}) {
  const { t } = usePreferences()
  const { role } = useSession()
  const { confirm } = useModal()
  const toast = useToast()

  const line = order.lines[lineIndex]
  const remaining = line ? Math.max(0, line.qty - line.receivedQty) : 0
  const mayApproveOver = roleCanApprove(role, undefined, 'procurement')

  const form = useZodForm({
    schema: receiveSchema,
    initial: { qty: '' },
    async onSubmit(values) {
      if (!line) return
      const qty = Number(values.qty)
      const outcome = checkReceive({ ordered: line.qty, received: line.receivedQty, qty })
      if (outcome.kind === 'invalid') {
        throw new ServerValidationError({ qty: outcome.message })
      }

      let overApproved = false
      if (outcome.kind === 'over') {
        if (!mayApproveOver) {
          throw new ServerValidationError({
            qty: `Receiving ${qty} exceeds the ordered quantity by ${outcome.overBy}. Over-receipt needs approval by a role with approve authority on procurement.`,
          })
        }
        const ok = await confirm({
          title: 'Over-receipt needs approval',
          description: `This delivery exceeds the ordered quantity by ${outcome.overBy} units. Approving records the excess explicitly against the order.`,
          icon: 'AlertTriangle',
          confirmLabel: 'Approve Over-Receipt',
          destructive: true,
        })
        if (!ok) {
          throw new ServerValidationError({}, 'Over-receipt was not approved — nothing was received.')
        }
        overApproved = true
      }

      try {
        await api.receiveLine(order.id, lineIndex, qty, overApproved, procurementIdempotencyKey())
      } catch (error) {
        throw asProcurementFormError(error)
      }
      toast.show({
        title: t('Receipt recorded'),
        description: `${line.description} — ${qty} ${t('units')}`,
      })
      onReceived()
    },
  })

  if (!line) return null

  return (
    <Modal
      open
      onClose={onClose}
      variant="lifecycle"
      icon="PackageCheck"
      title="Receive Against Order"
      description={t('Quantities received are booked against the ordered quantity, never past it without approval.')}
      meta={
        <span dir="ltr" className="font-mono">
          {order.code}
        </span>
      }
    >
      <Form form={form}>
        <FormErrorSummary />
        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded border border-border bg-inset px-3.5 py-2.5">
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">{t('Item')}</span>
            <span className="text-sm font-semibold text-heading">{line.description}</span>
          </span>
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">{t('Ordered')}</span>
            <span dir="ltr" className="font-mono text-sm font-semibold text-heading">
              {line.qty}
            </span>
          </span>
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">{t('Received')}</span>
            <span dir="ltr" className="font-mono text-sm font-semibold text-heading">
              {line.receivedQty}
            </span>
          </span>
          <span className="flex flex-col">
            <span className="text-[11px] text-muted">{t('Remaining')}</span>
            <span dir="ltr" className="font-mono text-sm font-semibold text-salis-blue">
              {remaining}
            </span>
          </span>
        </div>
        <Field
          name="qty"
          label="Quantity Received"
          required
          placeholder="0"
          hint="Receiving more than the remaining quantity is over-receipt and needs approval."
        />
        <FormActions>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label="Receive" />
        </FormActions>
      </Form>
    </Modal>
  )
}

/* ═══════════════════════════════════════════ orders awaiting approval/receipt */

const PO_STATUS_BADGE: Record<PurchaseOrderRecord['status'], readonly [string, string]> = {
  draft: ['rgba(100,116,139,.1)', 'var(--text-muted)'],
  placed: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  approved: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
}

/** Placed orders: approve within the ceiling, then receive line by line.
 *
 *  The segregation-of-duties check here is the real record-level one — the
 *  order carries who raised it, so the raiser is refused approval of their own
 *  order by identity, not by role proxy (F-004: the table pairs activities on
 *  a record, which a role check cannot express). */
function OrdersPanel({
  api,
  actor,
}: {
  api: ProcurementApi
  actor: string
}) {
  const { t } = usePreferences()
  const { role } = useSession()
  const { confirm } = useModal()
  const toast = useToast()
  const client = useQueryClient()
  const [receiving, setReceiving] = useState<{ orderId: string; lineIndex: number } | null>(null)

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['procurement-purchase-orders'],
    queryFn: () => api.listPurchaseOrders(),
  })

  const refresh = useCallback(
    () => void client.invalidateQueries({ queryKey: ['procurement-purchase-orders'] }),
    [client]
  )

  async function approve(order: PurchaseOrderRecord) {
    const rule = sodViolation('Approve purchase order', actor, [
      { activity: 'Raise purchase order', actor: order.raisedBy },
    ])
    if (rule) {
      toast.show({
        title: t('Segregation of duties'),
        description: `${t(rule.a)} / ${t(rule.b)} — ${t('the person who raised an order cannot also approve it.')}`,
        error: true,
      })
      return
    }
    const totalSar = order.totalHalalas / 100
    if (!roleCanApprove(role, totalSar, 'procurement')) {
      const limit = approvalLimit(role)
      toast.show({
        title: t('Above your approval limit'),
        description: `${formatSar(totalSar)} — ${t('Limit')}: ${
          limit === null ? '∞' : formatSar(limit)
        }`,
        error: true,
      })
      return
    }
    const ok = await confirm({
      title: 'Approve this purchase order?',
      description: 'Approval commits the order total against the budget and releases it to the supplier.',
      icon: 'CheckCircle2',
      confirmLabel: 'Approve',
    })
    if (!ok) return
    try {
      await api.approvePurchaseOrder(order.id, procurementIdempotencyKey())
      toast.show({ title: t('Purchase order approved'), description: order.code })
      refresh()
    } catch (error) {
      toast.show({
        title: t('Error'),
        description: error instanceof Error ? error.message : t('The request failed.'),
        error: true,
      })
    }
  }

  if (isLoading) return <Loading />
  if (isError) return <ErrorState title={t("Couldn't load purchase orders")} onRetry={() => void refetch()} />
  if (!orders.length) {
    return (
      <EmptyState
        icon="ShoppingCart"
        title={t('No purchase orders yet')}
        description={t('Orders you place appear here for approval and receiving.')}
      />
    )
  }

  const receivingOrder = receiving ? orders.find((o) => o.id === receiving.orderId) ?? null : null

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const [bg, fg] = PO_STATUS_BADGE[order.status]
        return (
          <div key={order.id} className="flex flex-col gap-2.5 rounded-lg border border-border bg-inset p-3.5">
            <div className="flex flex-wrap items-center gap-3">
              <span dir="ltr" className="font-mono text-[13px] font-semibold text-salis-blue">
                {order.code}
              </span>
              <span className="text-[13px] text-heading">{order.supplierName}</span>
              <Badge background={bg} color={fg}>
                {t(order.status[0].toUpperCase() + order.status.slice(1))}
              </Badge>
              <span className="flex-1" />
              <Money sar={order.totalHalalas / 100} className="font-semibold text-heading" />
              {order.status === 'placed' ? (
                <Button size="sm" onClick={() => void approve(order)}>
                  <Icon name="CheckCircle2" size={14} />
                  {t('Approve')}
                </Button>
              ) : null}
            </div>
            {order.status === 'approved' ? (
              <ul className="flex flex-col gap-1.5">
                {order.lines.map((line, index) => (
                  <li
                    key={`${order.id}-${index}`}
                    className="flex flex-wrap items-center gap-3 rounded border border-border bg-card px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 text-[13px] text-body">{line.description}</span>
                    <span dir="ltr" className="font-mono text-[12px] text-muted">
                      {line.receivedQty} / {line.qty}
                    </span>
                    {line.receivedQty >= line.qty ? (
                      <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">
                        {t('Fully received')}
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReceiving({ orderId: order.id, lineIndex: index })}
                      >
                        <Icon name="PackageCheck" size={14} />
                        {t('Receive')}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )
      })}

      {receiving && receivingOrder ? (
        <ReceiveLineModal
          order={receivingOrder}
          lineIndex={receiving.lineIndex}
          api={api}
          onClose={() => setReceiving(null)}
          onReceived={() => {
            setReceiving(null)
            refresh()
          }}
        />
      ) : null}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════ the screen */

const orderSchema = z.object({
  supplierName: z.string().trim().min(1, 'Name the supplier.').max(200),
  contactPerson: z.string().trim().max(200),
  expectedDate: z.string().trim().min(1, 'Set the expected delivery date.'),
})

/** Create Purchase Order — `project/PurchaseOrder.dc.html`, mobile per its
 *  `.Mobile` variant.
 *
 *  Reads are live: the low-stock rail and the item picker come from the parts
 *  collection. Writes go through the procurement seam, which today has no
 *  transport because the server has no purchase-order endpoints — the actions
 *  say so instead of pretending (§60), and `tests/procurement-gaps.test.ts`
 *  pins the exact missing routes.
 *
 *  The design shows a fixed number (PO-2026-0087). Numbers are assigned by the
 *  server on save; showing an invented one would claim a record that does not
 *  exist, so the header says how the number arrives instead.
 *
 *  `api` is injected only by tests. */
export function PurchaseOrder({ api: injected }: { api?: ProcurementApi | null } = {}) {
  const { t } = usePreferences()
  const { role, user, can, fieldHidden } = useSession()
  const toast = useToast()
  const client = useQueryClient()

  const api = injected === undefined ? procurementApi() : injected
  const unavailable = api ? null : procurementUnavailableReason()
  const actor = user?.id ?? `demo:${role}`

  const { data: parts = [], isLoading, isError, refetch } = useCollection('parts')
  const lowStock = useMemo(() => parts.filter(isLowStock), [parts])
  const costHidden = fieldHidden('Part cost / margin')

  const mayCreate = can('procurement', 'c')

  const [lines, setLines] = useState<readonly DraftLine[]>([])
  const [editingLine, setEditingLine] = useState<number | 'new' | null>(null)
  const intent = useRef<'draft' | 'placed'>('placed')

  const totals = poTotals(lines)
  const totalSar = totals.totalHalalas / 100
  const ceiling = approvalLimit(role)
  const withinCeiling = roleCanApprove(role, totalSar, 'procurement')

  const today = new Date().toISOString().slice(0, 10)

  const form = useZodForm({
    schema: orderSchema,
    initial: { supplierName: '', contactPerson: '', expectedDate: '' },
    async onSubmit(values) {
      if (!api) return
      if (!lines.length) {
        throw new ServerValidationError({}, 'Add at least one item before saving the order.')
      }
      const input = {
        supplierName: values.supplierName,
        ...(values.contactPerson ? { contactPerson: values.contactPerson } : {}),
        expectedDate: values.expectedDate,
        status: intent.current,
        lines: lines.map<PurchaseOrderLineInput>((line) => ({
          sku: line.sku,
          description: line.description,
          qty: line.qty,
          unitPriceHalalas: line.unitPriceHalalas,
        })),
      }
      let saved: PurchaseOrderRecord
      try {
        saved = await api.placePurchaseOrder(input, procurementIdempotencyKey())
      } catch (error) {
        throw asProcurementFormError(error)
      }
      toast.show({
        title: t(intent.current === 'draft' ? 'Draft saved' : 'Order placed'),
        description: `${saved.code} · ${formatSar(saved.totalHalalas / 100)}`,
      })
      setLines([])
      form.reset({ supplierName: '', contactPerson: '', expectedDate: '' })
      void client.invalidateQueries({ queryKey: ['procurement-purchase-orders'] })
    },
  })

  const submitAs = (status: 'draft' | 'placed') => {
    intent.current = status
    form.submit()
  }

  const addFromAlert = (part: Part) => {
    const already = lines.findIndex((line) => line.sku === part.sku)
    if (already >= 0) {
      setEditingLine(already)
      return
    }
    setLines((current) => [
      ...current,
      {
        sku: part.sku,
        description: part.name,
        stock: part.stock,
        reorder: part.reorder,
        qty: Math.max(part.reorder - part.stock, 1),
        unitPriceHalalas: defaultUnitCostHalalas(part, costHidden),
      },
    ])
  }

  const removeLine = (index: number) =>
    setLines((current) => current.filter((_, at) => at !== index))

  const columns: Column<DraftLine & { index: number }>[] = [
    { header: 'Part Name', cell: (line) => <span className="text-[13px] font-medium text-body">{line.description}</span> },
    { header: 'SKU', cell: (line) => line.sku ?? '—', code: true },
    {
      header: 'Current',
      cell: (line) =>
        line.stock === null ? (
          <span className="text-muted">—</span>
        ) : (
          <Badge
            background={
              line.reorder !== null && line.stock <= line.reorder
                ? 'rgba(249,115,22,.12)'
                : 'rgba(10,94,215,.1)'
            }
            color={
              line.reorder !== null && line.stock <= line.reorder
                ? 'var(--salis-orange)'
                : 'var(--salis-blue)'
            }
          >
            <span dir="ltr" className="font-mono">
              {line.stock}
            </span>
          </Badge>
        ),
      className: 'text-center',
    },
    {
      header: 'Order Qty',
      cell: (line) => (
        <span dir="ltr" className="font-mono text-[13px] font-semibold text-salis-blue">
          {line.qty}
        </span>
      ),
      className: 'text-center',
    },
    {
      header: 'Unit Cost',
      cell: (line) => <Money sar={line.unitPriceHalalas / 100} />,
      className: 'text-end',
    },
    {
      header: 'Total',
      cell: (line) => (
        <Money sar={(line.qty * line.unitPriceHalalas) / 100} className="font-semibold" />
      ),
      className: 'text-end',
    },
    {
      header: 'Actions',
      cell: (line) => (
        <span className="flex justify-end gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setEditingLine(line.index)}>
            <Icon name="Pencil" size={13} />
            {t('Edit')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => removeLine(line.index)}>
            <Icon name="X" size={13} />
            {t('Remove')}
          </Button>
        </span>
      ),
      className: 'text-end',
    },
  ]

  const indexedLines = lines.map((line, index) => ({ ...line, index }))

  return (
    <>
      <div>
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted transition-colors duration-150 hover:text-salis-blue"
        >
          <Icon name="ChevronLeft" size={14} className="rtl:rotate-180" />
          {t('Back to Inventory')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-shrink-0 rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="ShoppingCart" size={28} />
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading">
              {t('Create Purchase Order')}
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {t('The order number is assigned by the server when the order is saved.')}
            </p>
          </div>
        </div>
        <span className="flex-1" />
        {lowStock.length ? (
          <div className="flex items-center gap-2 rounded-lg border border-salis-orange/20 bg-[rgba(249,115,22,.08)] px-3.5 py-2">
            <Icon name="AlertTriangle" size={14} className="text-salis-orange" />
            <span className="font-action text-xs font-semibold text-salis-orange">
              <span dir="ltr" className="font-mono">
                {lowStock.length}
              </span>{' '}
              {t('items below reorder level')}
            </span>
          </div>
        ) : null}
      </div>

      {!mayCreate ? (
        <ReadOnlyNotice message={t('Your role can view purchase orders but not raise them.')} />
      ) : unavailable ? (
        <ReadOnlyNotice message={t(unavailable)} />
      ) : null}

      {isLoading ? (
        <Loading label="Loading inventory..." />
      ) : isError ? (
        <ErrorState title={t("Couldn't load inventory")} onRetry={() => void refetch()} />
      ) : (
        <>
          {mayCreate ? (
            <Form form={form}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="flex flex-col gap-3.5 rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <Icon name="Building2" size={16} className="text-salis-blue" />
                    <h3 className="text-sm font-bold text-heading">{t('Supplier')}</h3>
                  </div>
                  <FormErrorSummary />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field name="supplierName" label="Supplier Name" required placeholder="United Auto Parts Co." />
                    <Field name="contactPerson" label="Contact Person" placeholder="Fahad Al-Qahtani" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-action text-xs font-medium text-heading">
                        {t('Order Date')}
                      </span>
                      <span
                        dir="ltr"
                        className="flex h-12 items-center rounded border border-border bg-inset px-3 font-mono text-sm text-body"
                      >
                        {today}
                      </span>
                    </div>
                    <Field name="expectedDate" label="Expected Delivery" kind="date" required />
                  </div>
                </Card>

                <Card className="flex flex-col gap-3.5 rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertTriangle" size={16} className="text-salis-orange" />
                    <h3 className="text-sm font-bold text-heading">{t('Stock Alert')}</h3>
                  </div>
                  {lowStock.length ? (
                    <ul className="flex flex-col">
                      {lowStock.map((part) => (
                        <li
                          key={part.sku}
                          className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-body">{part.name}</p>
                            <p dir="ltr" className="mt-0.5 font-mono text-[11px] text-muted">
                              {part.sku}
                            </p>
                          </div>
                          <span className="text-end">
                            <span dir="ltr" className="font-mono text-[13px] font-bold text-salis-orange">
                              {part.stock}
                            </span>
                            <span className="text-[11px] text-muted"> / {part.reorder}</span>
                          </span>
                          <Button variant="outline" size="sm" onClick={() => addFromAlert(part)}>
                            <Icon name="Plus" size={13} />
                            {t('Order')}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      icon="PackageCheck"
                      title={t('Nothing below reorder level')}
                      description={t('Every part is at or above its reorder point.')}
                    />
                  )}
                </Card>
              </div>

              <Card className="overflow-hidden rounded-xl">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Package" size={16} className="text-salis-blue" />
                    <h3 className="text-sm font-bold text-heading">{t('Order Items')}</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditingLine('new')}>
                    <Icon name="Plus" size={13} />
                    {t('Add Item')}
                  </Button>
                </div>
                <DataTable
                  columns={columns}
                  rows={indexedLines}
                  rowKey={(line) => `${line.index}`}
                  className="rounded-none border-0 shadow-none"
                  mobileCard={(line) => (
                    <>
                      <MobileCardHeader
                        title={line.description}
                        trailing={
                          <Money
                            sar={(line.qty * line.unitPriceHalalas) / 100}
                            className="font-bold text-heading"
                          />
                        }
                      />
                      <MobileCardRow label={t('SKU')}>
                        <span dir="ltr" className="font-mono">
                          {line.sku ?? '—'}
                        </span>
                      </MobileCardRow>
                      <MobileCardRow label={t('Qty')}>
                        <span dir="ltr" className="font-mono font-semibold text-salis-blue">
                          {line.qty}
                        </span>
                      </MobileCardRow>
                      <MobileCardRow>
                        <span className="flex gap-1.5 pt-1">
                          <Button variant="outline" size="sm" onClick={() => setEditingLine(line.index)}>
                            {t('Edit')}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeLine(line.index)}>
                            {t('Remove')}
                          </Button>
                        </span>
                      </MobileCardRow>
                    </>
                  )}
                  empty={
                    <EmptyState
                      icon="Package"
                      title={t('No items on this order')}
                      description={t('Add items from the catalogue or order directly from the stock alert list.')}
                    />
                  }
                />
              </Card>

              <div className="flex flex-wrap justify-end gap-6">
                <Card className="flex w-full flex-col gap-2.5 rounded-xl p-5 sm:w-[340px]">
                  <div className="flex justify-between text-sm text-body">
                    <span>{t('Subtotal')}</span>
                    <Money sar={totals.subtotalHalalas / 100} className="font-semibold" />
                  </div>
                  <div className="flex justify-between text-sm text-body">
                    <span>{t('VAT (15%)')}</span>
                    <Money sar={totals.vatHalalas / 100} className="font-semibold" />
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-lg font-extrabold text-heading">
                    <span>{t('Total')}</span>
                    <Money sar={totalSar} />
                  </div>

                  {lines.length && !withinCeiling ? (
                    <p
                      role="note"
                      className="flex items-start gap-2 rounded-lg border border-salis-orange/30 bg-[rgba(249,115,22,.06)] px-3 py-2.5 text-[12px] text-body"
                    >
                      <Icon
                        name="AlertTriangle"
                        size={14}
                        className="mt-0.5 flex-shrink-0 text-salis-orange"
                      />
                      <span>
                        {t('This total is above your approval ceiling')}
                        {' ('}
                        <span dir="ltr" className="font-mono">
                          {ceiling === null ? '∞' : formatSar(ceiling)}
                        </span>
                        {'). '}
                        {t('The order escalates to a role with a higher ceiling; the server re-checks the same limit.')}
                      </span>
                    </p>
                  ) : null}

                  <p className="flex items-start gap-2 text-[11px] text-muted">
                    <Icon name="ShieldCheck" size={13} className="mt-0.5 flex-shrink-0" />
                    {t('Raising and approving are a segregation-of-duties pair — whoever places this order cannot also approve it.')}
                  </p>

                  <div className="mt-1 flex gap-2.5">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      disabled={form.pending || !api}
                      onClick={() => submitAs('draft')}
                    >
                      <Icon name="Save" size={14} />
                      {t('Save Draft')}
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1"
                      disabled={form.pending || !api}
                      onClick={() => submitAs('placed')}
                    >
                      <Icon name="Send" size={14} />
                      {form.pending ? t('Saving...') : t('Place Order')}
                    </Button>
                  </div>
                  {!api ? (
                    <p className="text-[11px] text-muted">
                      {t('Saving is disabled: the server has no purchase-order endpoint yet.')}
                    </p>
                  ) : null}
                </Card>
              </div>
            </Form>
          ) : null}

          <Card className="flex flex-col gap-4 rounded-xl p-5">
            <div className="flex items-center gap-2">
              <Icon name="PackageCheck" size={16} className="text-salis-blue" />
              <h3 className="text-sm font-bold text-heading">{t('Approval & Receiving')}</h3>
            </div>
            {api ? (
              <OrdersPanel api={api} actor={actor} />
            ) : (
              <ReadOnlyNotice
                message={t('Approving and receiving need purchase orders on the server, and it has none: there is no purchase-order collection or receive endpoint. The inventory movement endpoint cannot stand in — it carries no ordered quantity, so it cannot refuse an over-receipt.')}
              />
            )}
          </Card>
        </>
      )}

      {editingLine !== null ? (
        <LineModal
          parts={parts}
          initial={editingLine === 'new' ? undefined : lines[editingLine]}
          costHidden={costHidden}
          onClose={() => setEditingLine(null)}
          onSave={(line) => {
            setLines((current) =>
              editingLine === 'new'
                ? [...current, line]
                : current.map((existing, at) => (at === editingLine ? line : existing))
            )
            setEditingLine(null)
          }}
        />
      ) : null}
    </>
  )
}
