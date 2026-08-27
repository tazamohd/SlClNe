import { useMemo, useState } from 'react'
import { formatSar } from '@/components/ui/Money'
import { KpiCard } from '@/components/ui/KpiCard'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface ARRow {
  customer: string
  invoice: string
  amount: number
  dueDate: string
  daysOverdue: number
  status: string
}

function useRows(t: (s: string) => string): ARRow[] {
  return useMemo(
    () => [
      { customer: t('Al-Rashid Motors'), invoice: 'INV-2026-0481', amount: 18500, dueDate: '2026-07-15', daysOverdue: 34, status: t('Overdue') },
      { customer: t('Saudi Fleet Co.'), invoice: 'INV-2026-0472', amount: 42000, dueDate: '2026-07-28', daysOverdue: 21, status: t('Overdue') },
      { customer: t('National Transport'), invoice: 'INV-2026-0495', amount: 8750, dueDate: '2026-08-10', daysOverdue: 8, status: t('Overdue') },
      { customer: t('Jeddah Logistics'), invoice: 'INV-2026-0501', amount: 25300, dueDate: '2026-08-25', daysOverdue: 0, status: t('Current') },
      { customer: t('Gulf Auto Services'), invoice: 'INV-2026-0510', amount: 15200, dueDate: '2026-09-01', daysOverdue: 0, status: t('Current') },
      { customer: t('Riyadh Car Care'), invoice: 'INV-2026-0518', amount: 31000, dueDate: '2026-09-15', daysOverdue: 0, status: t('Current') },
    ],
    [t],
  )
}


export function AccountsReceivable() {
  const { t } = usePreferences()
  const rows = useRows(t)
  const [filter, setFilter] = useState('all')

  const total = rows.reduce((s, r) => s + r.amount, 0)
  const overdue = rows.filter((r) => r.daysOverdue > 0)
  const current = rows.filter((r) => r.daysOverdue === 0)

  const kpis = [
    { label: t('Total Outstanding'), value: formatSar(total), icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Current'), value: formatSar(current.reduce((s, r) => s + r.amount, 0)), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Overdue'), value: formatSar(overdue.reduce((s, r) => s + r.amount, 0)), icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Days Overdue'), value: String(Math.round(overdue.reduce((s, r) => s + r.daysOverdue, 0) / (overdue.length || 1))), icon: 'Clock', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  const filtered = filter === 'overdue' ? overdue : filter === 'current' ? current : rows

  const columns: Column<ARRow>[] = [
    { header: 'Customer', cell: (r) => <span className="font-medium text-heading">{r.customer}</span> },
    { header: 'Invoice', cell: (r) => r.invoice, code: true },
    { header: 'Amount', cell: (r) => <span dir="ltr" className="font-mono font-medium text-heading">{formatSar(r.amount)}</span>, className: 'text-end' },
    { header: 'Due Date', cell: (r) => <span dir="ltr" className="text-muted">{r.dueDate}</span> },
    { header: 'Days Overdue', cell: (r) => <span className="font-mono text-heading">{r.daysOverdue || '—'}</span>, className: 'text-end' },
    { header: 'Status', cell: (r) => (
      <Badge background={r.daysOverdue > 0 ? 'rgba(249,115,22,.1)' : 'rgba(10,94,215,.1)'}
        color={r.daysOverdue > 0 ? 'var(--salis-orange)' : 'var(--salis-blue)'}>{r.status}</Badge>
    ) },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ArrowDownRight" title={t('Accounts Receivable')} subtitle={t('Accounting')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} mono />
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-heading">{t('Outstanding Invoices')}</h3>
        <ChipGroup label={t('Status')}>
          {(['all', 'current', 'overdue'] as const).map((f) => (
            <Chip
              key={f}
              label={t(f === 'all' ? 'All' : f === 'current' ? 'Current' : 'Overdue')}
              selected={filter === f}
              onToggle={() => setFilter(f)}
            />
          ))}
        </ChipGroup>
      </div>

      <DataTable
        caption="Outstanding receivable invoices"
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.invoice}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.customer}
              trailing={
                <Badge background={r.daysOverdue > 0 ? 'rgba(249,115,22,.1)' : 'rgba(10,94,215,.1)'}
                  color={r.daysOverdue > 0 ? 'var(--salis-orange)' : 'var(--salis-blue)'}>{r.status}</Badge>
              }
            />
            <MobileCardRow label={t('Invoice')}><span dir="ltr">{r.invoice}</span></MobileCardRow>
            <MobileCardRow label={t('Amount')}><span dir="ltr" className="font-semibold">{formatSar(r.amount)}</span></MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="FileText" title={t('No invoices found')} />}
      />
    </div>
  )
}
