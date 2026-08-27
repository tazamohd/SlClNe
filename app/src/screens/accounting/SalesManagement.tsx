import { useMemo, useState } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'

interface Sale {
  invoiceNumber: string
  customer: string
  date: string
  items: number
  amount: number
  status: string
  paymentMethod: string
}

const MOCK_SALES: readonly Sale[] = [
  { invoiceNumber: 'INV-2026-0142', customer: 'Al-Faisal Motors', date: '2026-08-18', items: 3, amount: 12500_00, status: 'Paid', paymentMethod: 'Bank' },
  { invoiceNumber: 'INV-2026-0141', customer: 'Saudi Fleet Services', date: '2026-08-17', items: 7, amount: 28400_00, status: 'Paid', paymentMethod: 'Bank' },
  { invoiceNumber: 'INV-2026-0140', customer: 'Mohammed Al-Shehri', date: '2026-08-16', items: 1, amount: 3200_00, status: 'Pending', paymentMethod: 'Cash' },
  { invoiceNumber: 'INV-2026-0139', customer: 'Riyadh Transport Co', date: '2026-08-15', items: 12, amount: 45000_00, status: 'Paid', paymentMethod: 'Bank' },
  { invoiceNumber: 'INV-2026-0138', customer: 'Quick Delivery LLC', date: '2026-08-14', items: 2, amount: 8900_00, status: 'Overdue', paymentMethod: 'Card' },
  { invoiceNumber: 'INV-2026-0137', customer: 'Ahmed Al-Dosari', date: '2026-08-13', items: 1, amount: 1800_00, status: 'Paid', paymentMethod: 'Cash' },
  { invoiceNumber: 'INV-2026-0136', customer: 'National Auto Parts', date: '2026-08-12', items: 5, amount: 15600_00, status: 'Pending', paymentMethod: 'Bank' },
  { invoiceNumber: 'INV-2026-0135', customer: 'Gulf Logistics', date: '2026-08-10', items: 4, amount: 22000_00, status: 'Cancelled', paymentMethod: 'Bank' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Paid: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Pending: ['rgba(249,115,22,.1)', '#F97316'],
  Overdue: ['rgba(11,31,59,.1)', '#0B1F3B'],
  Cancelled: ['rgba(100,116,139,.1)', '#64748B'],
}

export function SalesManagement() {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_SALES
      .filter((s) => statusFilter === 'All' || s.status === statusFilter)
      .filter(
        (s) =>
          !needle ||
          s.invoiceNumber.toLowerCase().includes(needle) ||
          s.customer.toLowerCase().includes(needle)
      )
  }, [query, statusFilter])

  const totals = useMemo(() => {
    let total = 0
    let paid = 0
    let pending = 0
    let count = 0
    for (const s of MOCK_SALES) {
      if (s.status !== 'Cancelled') {
        total += s.amount
        count++
      }
      if (s.status === 'Paid') paid += s.amount
      if (s.status === 'Pending') pending += s.amount
    }
    const avg = count > 0 ? Math.round(total / count) : 0
    return { total, paid, pending, avg }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Sales', value: formatSar(totals.total), caption: 'Excl. cancelled', highlight: true },
    { label: 'Paid', value: formatSar(totals.paid), caption: 'Collected', tone: 'info' },
    { label: 'Pending', value: formatSar(totals.pending), caption: 'Awaiting payment', tone: 'warning' },
    { label: 'Avg Order Value', value: formatSar(totals.avg), caption: 'Per invoice' },
  ]

  const statuses = ['All', 'Paid', 'Pending', 'Overdue', 'Cancelled'] as const

  const columns: Column<Sale>[] = [
    { header: 'Invoice', cell: (s) => s.invoiceNumber, code: true },
    { header: 'Customer', cell: (s) => s.customer },
    { header: 'Date', cell: (s) => <span dir="ltr" className="text-muted">{s.date}</span> },
    { header: 'Items', cell: (s) => s.items, className: 'text-end' },
    { header: 'Amount', cell: (s) => <Money sar={s.amount} className="font-semibold" />, className: 'text-end' },
    { header: 'Payment', cell: (s) => t(s.paymentMethod) },
    { header: 'Status', cell: (s) => {
      const [bg, fg] = STATUS_PALETTE[s.status] ?? STATUS_PALETTE.Pending
      return <Badge background={bg} color={fg}>{t(s.status)}</Badge>
    } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Sales Management')}
        subtitle={t('Sales invoices and payment tracking')}
      />
      <StatRow stats={stats} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Invoice or customer')}
            aria-label={t('Search sales')}
            inputSize="sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Status')}</span>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label={t('Filter by status')}
            size="md"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? t('All Statuses') : t(s)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <DataTable
        caption="Sales invoices"
        columns={columns}
        rows={filtered}
        rowKey={(s) => s.invoiceNumber}
        mobileCard={(s) => {
          const [bg, fg] = STATUS_PALETTE[s.status] ?? STATUS_PALETTE.Pending
          return (
            <>
              <MobileCardHeader title={s.invoiceNumber} code trailing={<Badge background={bg} color={fg}>{t(s.status)}</Badge>} />
              <MobileCardRow label={t('Customer')}>{s.customer}</MobileCardRow>
              <MobileCardRow label={t('Amount')}><Money sar={s.amount} className="font-semibold text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="ShoppingCart" title={t('No sales match the filter')} />}
      />
    </div>
  )
}
