import { useMemo, useState } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
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
  const isMobile = useIsMobile()
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

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="ShoppingCart"
          title={t('Sales Management')}
          subtitle={t('Accounting')}
        />
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{t(stat.label)}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{stat.value}</p>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {filtered.map((s) => {
            const [bg, fg] = STATUS_PALETTE[s.status] ?? STATUS_PALETTE.Pending
            return (
              <MobileCard key={s.invoiceNumber}>
                <MobileCardHeader
                  title={s.invoiceNumber}
                  code
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(s.status)}
                    </Badge>
                  }
                />
                <MobileCardRow label={t('Customer')}>{s.customer}</MobileCardRow>
                <MobileCardRow label={t('Date')}>
                  <span dir="ltr">{s.date}</span>
                </MobileCardRow>
                <MobileCardRow label={t('Items')}>{s.items}</MobileCardRow>
                <MobileCardRow label={t('Amount')}>
                  <Money sar={s.amount} className="font-semibold text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Payment')}>{t(s.paymentMethod)}</MobileCardRow>
              </MobileCard>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Sales Management')}
        subtitle={t('Sales invoices and payment tracking')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Sales Invoices')}
        subtitle={t('All invoices with payment status')}
        toolbar={
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Invoice or customer')}
                aria-label={t('Search sales')}
                className="h-10 rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Status')}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label={t('Filter by status')}
                className="h-10 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? t('All Statuses') : t(s)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Invoice')}</th>
                <th className="py-2.5 text-start font-medium">{t('Customer')}</th>
                <th className="py-2.5 text-start font-medium">{t('Date')}</th>
                <th className="py-2.5 text-end font-medium">{t('Items')}</th>
                <th className="py-2.5 text-end font-medium">{t('Amount')}</th>
                <th className="py-2.5 text-start font-medium">{t('Payment')}</th>
                <th className="py-2.5 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const [bg, fg] = STATUS_PALETTE[s.status] ?? STATUS_PALETTE.Pending
                return (
                  <tr key={s.invoiceNumber} className="border-b border-border/50">
                    <td className="py-2.5">
                      <span className="font-mono text-[13px]" dir="ltr">{s.invoiceNumber}</span>
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{s.customer}</td>
                    <td className="py-2.5 text-[13px] text-muted" dir="ltr">{s.date}</td>
                    <td className="py-2.5 text-end text-[13px] text-heading">{s.items}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={s.amount} className="font-semibold" />
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{t(s.paymentMethod)}</td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(s.status)}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">{t('No sales match the filter')}</p>
        )}
      </Section>
    </div>
  )
}
