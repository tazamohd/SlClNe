import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { formatSar } from '@/components/ui/Money'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface APRow {
  supplier: string
  invoice: string
  amount: number
  dueDate: string
  daysOverdue: number
  status: string
}

function useRows(t: (s: string) => string): APRow[] {
  return useMemo(
    () => [
      { supplier: t('AutoParts Global'), invoice: 'AP-2026-0312', amount: 45000, dueDate: '2026-07-20', daysOverdue: 29, status: t('Overdue') },
      { supplier: t('Gulf Oil Supplies'), invoice: 'AP-2026-0325', amount: 12800, dueDate: '2026-08-01', daysOverdue: 17, status: t('Overdue') },
      { supplier: t('KSA Tools & Equipment'), invoice: 'AP-2026-0340', amount: 28500, dueDate: '2026-08-15', daysOverdue: 3, status: t('Overdue') },
      { supplier: t('Jeddah Paint Co.'), invoice: 'AP-2026-0348', amount: 9200, dueDate: '2026-08-25', daysOverdue: 0, status: t('Current') },
      { supplier: t('National Tires'), invoice: 'AP-2026-0355', amount: 18700, dueDate: '2026-09-05', daysOverdue: 0, status: t('Current') },
    ],
    [t],
  )
}


export function AccountsPayable() {
  const { t } = usePreferences()
  const rows = useRows(t)
  const [filter, setFilter] = useState('all')

  const total = rows.reduce((s, r) => s + r.amount, 0)
  const overdue = rows.filter((r) => r.daysOverdue > 0)
  const current = rows.filter((r) => r.daysOverdue === 0)
  const filtered = filter === 'overdue' ? overdue : filter === 'current' ? current : rows

  const kpis = [
    { label: t('Total Payable'), value: formatSar(total), icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Current'), value: formatSar(current.reduce((s, r) => s + r.amount, 0)), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Overdue'), value: formatSar(overdue.reduce((s, r) => s + r.amount, 0)), icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Suppliers'), value: String(new Set(rows.map((r) => r.supplier)).size), icon: 'Users', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  const columns: Column<APRow>[] = [
    { header: 'Supplier', cell: (r) => <span className="font-medium text-heading">{r.supplier}</span> },
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
      <PageHeader icon="ArrowUpRight" title={t('Accounts Payable')} subtitle={t('Accounting')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 dir="ltr" className="mt-2 font-mono text-xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-heading">{t('Outstanding Bills')}</h3>
        <div className="flex gap-2">
          {['all', 'current', 'overdue'].map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 ' +
                (filter === f ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue' : 'border-border text-muted')}>
              {t(f === 'all' ? 'All' : f === 'current' ? 'Current' : 'Overdue')}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        caption="Outstanding payable bills"
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.invoice}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.supplier}
              trailing={
                <Badge background={r.daysOverdue > 0 ? 'rgba(249,115,22,.1)' : 'rgba(10,94,215,.1)'}
                  color={r.daysOverdue > 0 ? 'var(--salis-orange)' : 'var(--salis-blue)'}>{r.status}</Badge>
              }
            />
            <MobileCardRow label={t('Invoice')}><span dir="ltr">{r.invoice}</span></MobileCardRow>
            <MobileCardRow label={t('Amount')}><span dir="ltr" className="font-semibold">{formatSar(r.amount)}</span></MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="FileText" title={t('No bills found')} />}
      />
    </div>
  )
}
