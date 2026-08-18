import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

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

function fmtSar(v: number): string {
  return `SAR ${v.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function AccountsPayable() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const rows = useRows(t)
  const [filter, setFilter] = useState('all')

  const total = rows.reduce((s, r) => s + r.amount, 0)
  const overdue = rows.filter((r) => r.daysOverdue > 0)
  const current = rows.filter((r) => r.daysOverdue === 0)
  const filtered = filter === 'overdue' ? overdue : filter === 'current' ? current : rows

  const kpis = [
    { label: t('Total Payable'), value: fmtSar(total), icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Current'), value: fmtSar(current.reduce((s, r) => s + r.amount, 0)), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Overdue'), value: fmtSar(overdue.reduce((s, r) => s + r.amount, 0)), icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Suppliers'), value: String(new Set(rows.map((r) => r.supplier)).size), icon: 'Users', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ArrowUpRight" title={t('Accounts Payable')} subtitle={t('Accounting')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
              <p className="mt-1.5 text-[11px] text-muted">{k.label}</p>
              <p dir="ltr" className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
        {filtered.map((r) => (
          <MobileCard key={r.invoice}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: r.daysOverdue > 0 ? 'rgba(249,115,22,.1)' : 'rgba(10,94,215,.1)', color: r.daysOverdue > 0 ? 'var(--salis-orange)' : 'var(--salis-blue)' }} aria-hidden>
                    <Icon name="FileText" size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.supplier}</p>
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
            <Icon name="ArrowUpRight" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Accounts Payable')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Accounting')}</p>
        </div>
      </div>

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

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-heading">{t('Outstanding Bills')}</h3>
          <div className="flex gap-2">
            {['all', 'current', 'overdue'].map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ' +
                  (filter === f ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue' : 'border-border text-muted')}>
                {t(f === 'all' ? 'All' : f === 'current' ? 'Current' : 'Overdue')}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
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
                  <td className="py-3 pe-4 font-medium text-heading">{r.supplier}</td>
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
