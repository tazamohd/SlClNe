import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

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

function fmtSar(v: number): string {
  return `SAR ${v.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function AccountsReceivable() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const rows = useRows(t)
  const [filter, setFilter] = useState('all')

  const total = rows.reduce((s, r) => s + r.amount, 0)
  const overdue = rows.filter((r) => r.daysOverdue > 0)
  const current = rows.filter((r) => r.daysOverdue === 0)

  const kpis = [
    { label: t('Total Outstanding'), value: fmtSar(total), icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Current'), value: fmtSar(current.reduce((s, r) => s + r.amount, 0)), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Overdue'), value: fmtSar(overdue.reduce((s, r) => s + r.amount, 0)), icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Days Overdue'), value: String(Math.round(overdue.reduce((s, r) => s + r.daysOverdue, 0) / (overdue.length || 1))), icon: 'Clock', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  const filtered = filter === 'overdue' ? overdue : filter === 'current' ? current : rows

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ArrowDownRight" title={t('Accounts Receivable')} subtitle={t('Accounting')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden>
                <Icon name={k.icon} size={14} />
              </span>
              <p className="mt-1.5 text-[11px] text-muted">{k.label}</p>
              <p dir="ltr" className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
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
        {filtered.map((r) => (
          <MobileCard key={r.invoice}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: r.daysOverdue > 0 ? 'rgba(249,115,22,.1)' : 'rgba(10,94,215,.1)', color: r.daysOverdue > 0 ? 'var(--salis-orange)' : 'var(--salis-blue)' }} aria-hidden>
                    <Icon name="FileText" size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.customer}</p>
                    <p className="text-xs text-muted">{r.invoice}</p>
                  </div>
                </div>
              }
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span dir="ltr" className="font-mono text-sm font-bold text-heading">{fmtSar(r.amount)}</span>
              <Badge background={r.daysOverdue > 0 ? 'rgba(249,115,22,.1)' : 'rgba(10,94,215,.1)'}
                color={r.daysOverdue > 0 ? 'var(--salis-orange)' : 'var(--salis-blue)'}>{r.status}</Badge>
            </div>
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="ArrowDownRight" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Accounts Receivable')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Accounting')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden>
                <Icon name={k.icon} size={16} />
              </span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 dir="ltr" className="mt-2 font-mono text-xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Customer')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Invoice')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Amount')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Due Date')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Days Overdue')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.invoice} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{r.customer}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{r.invoice}</td>
                  <td className="py-3 pe-4 text-end font-mono font-medium text-heading" dir="ltr">{fmtSar(r.amount)}</td>
                  <td className="py-3 pe-4 text-muted" dir="ltr">{r.dueDate}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{r.daysOverdue || '—'}</td>
                  <td className="py-3">
                    <Badge background={r.daysOverdue > 0 ? 'rgba(249,115,22,.1)' : 'rgba(10,94,215,.1)'}
                      color={r.daysOverdue > 0 ? 'var(--salis-orange)' : 'var(--salis-blue)'}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
