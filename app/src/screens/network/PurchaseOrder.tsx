import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { Timeline, type TimelineStep } from '@/components/ui/Timeline'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { NETWORK_STATUS } from '@/data/network'

const VAT_RATE = 0.15
const PO_NUMBER = 'PO-2026-0087'

/** A PO line as authored in PurchaseOrder.dc.html. `sku` and `name` line up
 *  with `useCollection('parts')` for four of the five rows, so current stock
 *  and reorder level come from there when available; the fallbacks below cover
 *  Power Steering Fluid, which the design ordered but the parts fixture
 *  doesn't carry. Order quantity and unit cost are PO-specific and have no
 *  live source, so they stay local — exactly the design's demo order. */
interface POLine {
  sku: string
  name: string
  qty: number
  unit: number
  fallbackStock: number
  fallbackReorder: number
}

const PO_LINES: readonly POLine[] = [
  { sku: 'BP-FR-220', name: 'Brake Pads (Front)', qty: 50, unit: 28, fallbackStock: 18, fallbackReorder: 25 },
  { sku: 'SP-SET-04', name: 'Spark Plug Set', qty: 40, unit: 32, fallbackStock: 12, fallbackReorder: 20 },
  { sku: 'AF-UN-002', name: 'Air Filter (Universal)', qty: 30, unit: 18, fallbackStock: 96, fallbackReorder: 30 },
  { sku: 'OF-TY-118', name: 'Oil Filter (Toyota)', qty: 60, unit: 12, fallbackStock: 142, fallbackReorder: 40 },
  { sku: 'PS-FL-009', name: 'Power Steering Fluid', qty: 30, unit: 890 / 30, fallbackStock: 8, fallbackReorder: 15 },
]

interface PORow extends POLine {
  stock: number
  reorder: number
}

const TRAIL_APPROVED: readonly TimelineStep[] = [
  { icon: 'FilePlus', label: 'Draft created', time: 'Jul 22, 2026 · 09:14', done: true },
  { icon: 'Send', label: 'Submitted for approval', time: 'Jul 22, 2026 · 09:20', done: true },
  { icon: 'CheckCheck', label: 'Approved by Fahad Al-Qahtani', time: 'Jul 22, 2026 · 11:05', done: true },
  { icon: 'Truck', label: 'Sent to supplier', done: false },
]

const TRAIL_PENDING: readonly TimelineStep[] = [
  { icon: 'FilePlus', label: 'Draft created', time: 'Jul 22, 2026 · 09:14', done: true },
  { icon: 'Send', label: 'Submitted for approval', time: 'Jul 22, 2026 · 09:20', done: true },
  { icon: 'CheckCheck', label: 'Approved', done: false },
  { icon: 'Truck', label: 'Sent to supplier', done: false },
]

const TRAIL_REJECTED: readonly TimelineStep[] = [
  { icon: 'FilePlus', label: 'Draft created', time: 'Jul 22, 2026 · 09:14', done: true },
  { icon: 'Send', label: 'Submitted for approval', time: 'Jul 22, 2026 · 09:20', done: true },
  { icon: 'ShieldOff', label: 'Rejected', time: 'Just now', done: true },
]

/** Purchase order detail: header/status, supplier block, line items, ZATCA-
 *  style totals and the approval trail behind the order.
 *
 *  Ported from PurchaseOrder.dc.html, which was a *create* form with hardcoded
 *  totals ("SAR 4,830" typed straight into the markup) and no status or
 *  approval history at all. The feature map calls this route "Purchase order
 *  detail", so it renders the same demo order read-only instead: every total
 *  is derived from the line items, and approving/rejecting is bounded by the
 *  signed-in role's approval ceiling, same as ProcurementRequisitions. */
export function PurchaseOrder() {
  const { t, rtl } = usePreferences()
  const { canApprove, roleMeta } = useSession()
  const toast = useToast()
  const { data: parts = [], isLoading } = useCollection('parts')

  const [decision, setDecision] = useState<'pending' | 'approved' | 'rejected'>('pending')

  if (isLoading) return <p className="text-sm text-muted">{t('Loading...')}</p>

  const partsBySku = new Map(parts.map((part) => [part.sku, part]))
  const rows: readonly PORow[] = PO_LINES.map((line) => {
    const live = partsBySku.get(line.sku)
    return {
      ...line,
      stock: live?.stock ?? line.fallbackStock,
      reorder: live?.reorder ?? line.fallbackReorder,
    }
  })

  const subtotal = rows.reduce((sum, row) => sum + row.qty * row.unit, 0)
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat
  const lowStockCount = rows.filter((row) => row.stock < row.reorder).length

  const allowed = canApprove(total)
  const trail = decision === 'approved' ? TRAIL_APPROVED : decision === 'rejected' ? TRAIL_REJECTED : TRAIL_PENDING
  const [statusBg, statusFg] = NETWORK_STATUS[decision] ?? NETWORK_STATUS.pending
  const statusLabel =
    decision === 'approved'
      ? t('Approved')
      : decision === 'rejected'
        ? t('Rejected')
        : t('Awaiting Approval')

  function approve() {
    if (!allowed) {
      toast.show({
        title: t('Above your approval limit'),
        description: `${t('Limit')}: SAR ${roleMeta.limit?.toLocaleString('en-US') ?? '—'}`,
        error: true,
      })
      return
    }
    setDecision('approved')
    toast.show({ title: t('Purchase order approved'), description: PO_NUMBER })
  }

  function reject() {
    setDecision('rejected')
    toast.show({ title: t('Purchase order rejected'), description: PO_NUMBER, error: true })
  }

  const columns: Column<PORow>[] = [
    { header: 'Part Name', cell: (row) => row.name },
    { header: 'SKU', cell: (row) => row.sku, code: true },
    {
      header: 'Current Stock',
      cell: (row) =>
        row.stock < row.reorder ? (
          <Badge background="rgba(249,115,22,.12)" color="#F97316">
            {row.stock}
          </Badge>
        ) : (
          <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
            {row.stock}
          </Badge>
        ),
    },
    {
      header: 'Order Qty',
      cell: (row) => (
        <span className="font-mono text-[13px] font-semibold text-salis-blue" dir="ltr">
          {row.qty}
        </span>
      ),
    },
    { header: 'Unit Cost', cell: (row) => <Money sar={row.unit} className="text-body" /> },
    { header: 'Total', cell: (row) => <Money sar={row.qty * row.unit} className="font-semibold text-heading" /> },
  ]

  return (
    <div className="flex max-w-[1100px] flex-col gap-6">
      <div>
        <Link
          to="/procurement-portal"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Procurement Portal')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex flex-shrink-0 rounded-xl bg-salis-gradient p-3 text-white shadow-[0_12px_20px_-6px_rgba(10,94,215,.35)]">
            <Icon name="ShoppingCart" size={26} />
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading" dir="ltr">
              {PO_NUMBER}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t('United Auto Parts Co.')} · {t('Ordered')} 22 {t('July')} 2026
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge background={statusBg} color={statusFg} strong>
            {statusLabel}
          </Badge>
          <Button variant="subtle" size="md">
            <Icon name="Printer" size={15} />
            {t('Print')}
          </Button>
          {decision === 'pending' ? (
            <>
              <Button variant="outline" size="md" onClick={reject}>
                <XCircle size={15} strokeWidth={2} aria-hidden />
                {t('Reject')}
              </Button>
              <Button size="md" onClick={approve}>
                <Icon name={allowed ? 'CheckCheck' : 'ArrowUpRight'} size={15} />
                {allowed ? t('Approve') : t('Escalate')}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {lowStockCount > 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-[rgba(249,115,22,.2)] bg-[rgba(249,115,22,.08)] px-3.5 py-2">
          <AlertTriangle size={14} strokeWidth={2} color="#F97316" aria-hidden />
          <span className="font-action text-xs font-semibold text-salis-orange">
            {lowStockCount} {t('items below reorder level')}
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetaCard label={t('Supplier')} value={t('United Auto Parts Co.')} sub={t('Fahad Al-Qahtani')} />
        <MetaCard label={t('Contact')} value="+966 55 214 8890" sub={t('Purchasing desk')} valueCode />
        <MetaCard label={t('Order date')} value={`22 ${t('July')} 2026`} sub={t('Raised by Procurement')} />
        <MetaCard label={t('Expected delivery')} value={`29 ${t('July')} 2026`} sub={t('7 day lead time')} />
      </div>

      <Card>
        <div className="flex items-center gap-2 border-b border-border px-[18px] py-[13px]">
          <Icon name="Package" size={16} className="text-salis-blue" />
          <p className="font-display text-[14.5px] font-bold text-heading">{t('Order Items')}</p>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.sku}
          mobileCard={(row) => (
            <>
              <MobileCardHeader
                title={row.name}
                trailing={<Money sar={row.qty * row.unit} className="font-semibold text-heading" />}
              />
              <MobileCardRow label={t('SKU')}>
                <span dir="ltr">{row.sku}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Current Stock')}>
                {row.stock < row.reorder ? (
                  <Badge background="rgba(249,115,22,.12)" color="#F97316">
                    {row.stock}
                  </Badge>
                ) : (
                  <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
                    {row.stock}
                  </Badge>
                )}
              </MobileCardRow>
              <MobileCardRow label={t('Order Qty')}>{row.qty}</MobileCardRow>
              <MobileCardRow label={t('Unit Cost')}>
                <Money sar={row.unit} className="text-heading" />
              </MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Package" title={t('No line items on this order')} />}
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="border-b border-border px-[18px] py-[13px]">
            <p className="font-display text-sm font-bold text-heading">{t('Approval trail')}</p>
          </div>
          <div className="px-[18px] py-4">
            <Timeline steps={trail} />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-2.5 p-5">
            <TotalRow label={t('Subtotal')} sar={subtotal} />
            <TotalRow label={`${t('VAT')} (15%)`} sar={vat} />
            <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold text-heading">
              <span>{t('Total')}</span>
              <Money sar={total} className="font-bold" />
            </div>
          </Card>

          <Card className="flex items-start gap-3 p-4">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[rgba(10,94,215,.1)] text-salis-blue">
              <Icon name="Building2" size={16} />
            </span>
            <p className="text-[11px] leading-[1.5] text-body">
              {t('Approval limit for your role')}: SAR {roleMeta.limit?.toLocaleString('en-US') ?? t('Unlimited')}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TotalRow({ label, sar }: { label: string; sar: number }) {
  return (
    <div className="flex justify-between text-[13px] text-body">
      <span>{label}</span>
      <Money sar={sar} className="font-semibold" />
    </div>
  )
}

function MetaCard({
  label,
  value,
  sub,
  valueCode,
}: {
  label: string
  value: string
  sub: string
  valueCode?: boolean
}) {
  return (
    <Card className="p-4">
      <p className="font-action text-[11px] font-medium text-muted">{label}</p>
      <p
        dir={valueCode ? 'ltr' : undefined}
        className={'mt-1 text-sm font-semibold text-heading' + (valueCode ? ' font-mono' : '')}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{sub}</p>
    </Card>
  )
}
