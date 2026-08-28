import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
  Pending: { bg: 'rgba(249,115,22,.12)', fg: 'var(--salis-orange)' },
  Overdue: { bg: 'rgba(234,88,12,.1)', fg: '#EA580C' },
  'In Review': { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
}

type ItemRow = (typeof ITEMS)[number]

export function ComplianceManagement() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState<string>('All')

  const filtered = filter === 'All' ? ITEMS : ITEMS.filter((i) => i.status === filter)

  const kpis = [
    { label: t('Total Items'), value: String(ITEMS.length), icon: 'ShieldCheck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Compliant'), value: String(ITEMS.filter((i) => i.status === 'Compliant').length), icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Pending'), value: String(ITEMS.filter((i) => i.status === 'Pending').length), icon: 'Clock', bg: 'rgba(249,115,22,.12)', fg: 'var(--salis-orange)' },
    { label: t('Overdue'), value: String(ITEMS.filter((i) => i.status === 'Overdue').length), icon: 'AlertTriangle', bg: 'rgba(234,88,12,.1)', fg: '#EA580C' },
  ]

  const columns: Column<ItemRow>[] = [
    { header: 'Title', cell: (item) => item.title },
    { header: 'Category', cell: (item) => t(item.category) },
    { header: 'Due Date', cell: (item) => item.dueDate },
    { header: 'Assignee', cell: (item) => item.assignee },
    { header: 'Status', cell: (item) => <Badge background={STATUS_PALETTE[item.status].bg} color={STATUS_PALETTE[item.status].fg}>{t(item.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <PageHeader icon="ShieldCheck" title={t('Compliance Management')} subtitle={t('Regulatory tracking')} />
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
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Compliance management items"
        columns={columns}
        rows={[...filtered]}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(row) => (
          <>
            <MobileCardHeader title={row.title} trailing={<Badge background={STATUS_PALETTE[row.status].bg} color={STATUS_PALETTE[row.status].fg}>{t(row.status)}</Badge>} />
            <MobileCardRow label={t('Category')}>{t(row.category)}</MobileCardRow>
            <MobileCardRow label={t('Due Date')}>{row.dueDate}</MobileCardRow>
            <MobileCardRow label={t('Assignee')}>{row.assignee}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
