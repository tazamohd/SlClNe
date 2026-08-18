import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const ITEMS = [
  { title: 'Fire Safety Inspection', category: 'Safety', dueDate: '2026-09-15', status: 'Compliant', assignee: 'Ahmed Al-Rashid' },
  { title: 'Air Quality Monitoring', category: 'Environmental', dueDate: '2026-08-25', status: 'Pending', assignee: 'Sara Khalil' },
  { title: 'ISO 9001 Certification', category: 'Quality', dueDate: '2026-07-30', status: 'Overdue', assignee: 'Omar Nasser' },
  { title: 'Worker Safety Training', category: 'Labor', dueDate: '2026-09-01', status: 'In Review', assignee: 'Fatima Hassan' },
  { title: 'Waste Disposal Permit', category: 'Environmental', dueDate: '2026-10-10', status: 'Compliant', assignee: 'Khalid Mansour' },
  { title: 'Equipment Calibration', category: 'Quality', dueDate: '2026-08-20', status: 'Pending', assignee: 'Youssef Bakr' },
  { title: 'PPE Compliance Check', category: 'Safety', dueDate: '2026-08-18', status: 'Overdue', assignee: 'Layla Farouk' },
  { title: 'Employment Contract Audit', category: 'Labor', dueDate: '2026-09-30', status: 'Compliant', assignee: 'Nadia Othman' },
] as const

const STATUS_PALETTE: Record<string, { bg: string; fg: string }> = {
  Compliant: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.12)', fg: '#B45309' },
  Overdue: { bg: 'rgba(220,38,38,.1)', fg: '#DC2626' },
  'In Review': { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
}

export function ComplianceManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState<string>('All')

  const filtered = filter === 'All' ? ITEMS : ITEMS.filter((i) => i.status === filter)

  const kpis = [
    { label: t('Total Items'), value: String(ITEMS.length), icon: 'ShieldCheck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Compliant'), value: String(ITEMS.filter((i) => i.status === 'Compliant').length), icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Pending'), value: String(ITEMS.filter((i) => i.status === 'Pending').length), icon: 'Clock', bg: 'rgba(245,158,11,.12)', fg: '#B45309' },
    { label: t('Overdue'), value: String(ITEMS.filter((i) => i.status === 'Overdue').length), icon: 'AlertTriangle', bg: 'rgba(220,38,38,.1)', fg: '#DC2626' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ShieldCheck" title={t('Compliance Management')} subtitle={t('Regulatory tracking')} />
        {filtered.map((item, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="ShieldCheck" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{item.title}</p>
                    <p className="text-xs text-muted">{item.category}</p>
                  </div>
                </div>
              }
            />
            <MobileCardRow label={t('Due Date')} value={item.dueDate} />
            <MobileCardRow label={t('Assignee')} value={item.assignee} />
            <MobileCardRow label={t('Status')}>
              <Badge background={STATUS_PALETTE[item.status].bg} color={STATUS_PALETTE[item.status].fg}>{t(item.status)}</Badge>
            </MobileCardRow>
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="ShieldCheck" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Compliance Management')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Regulatory tracking')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['All', 'Compliant', 'Pending', 'Overdue', 'In Review'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-salis-blue text-white'
                  : 'bg-card text-muted hover:text-heading'
              }`}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Title')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Due Date')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Assignee')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{item.title}</td>
                  <td className="py-3 pe-4 text-body">{t(item.category)}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{item.dueDate}</td>
                  <td className="py-3 pe-4 text-body">{item.assignee}</td>
                  <td className="py-3">
                    <Badge background={STATUS_PALETTE[item.status].bg} color={STATUS_PALETTE[item.status].fg}>{t(item.status)}</Badge>
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
