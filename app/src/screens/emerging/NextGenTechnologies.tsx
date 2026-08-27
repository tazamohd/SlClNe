import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_ROADMAP = [
  { id: 'NG-001', name: 'Autonomous Diagnostics', phase: 'Phase 1', timeline: 'Q4 2026', status: 'In Progress', team: 'AI Lab', budget: 'SAR 450K', completion: 65 },
  { id: 'NG-002', name: 'Voice-Controlled Workshop', phase: 'Phase 1', timeline: 'Q1 2027', status: 'Planned', team: 'R&D', budget: 'SAR 280K', completion: 20 },
  { id: 'NG-003', name: 'Robotic Parts Handling', phase: 'Phase 2', timeline: 'Q2 2027', status: 'Research', team: 'Automation', budget: 'SAR 1.2M', completion: 8 },
  { id: 'NG-004', name: '5G Connected Fleet', phase: 'Phase 1', timeline: 'Q4 2026', status: 'In Progress', team: 'Network', budget: 'SAR 380K', completion: 45 },
  { id: 'NG-005', name: 'Quantum-Safe Security', phase: 'Phase 3', timeline: 'Q4 2027', status: 'Research', team: 'Security', budget: 'SAR 200K', completion: 5 },
  { id: 'NG-006', name: 'Biometric Access Control', phase: 'Phase 2', timeline: 'Q3 2027', status: 'Planned', team: 'Security', budget: 'SAR 320K', completion: 12 },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  'In Progress': ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Planned: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Research: ['rgba(100,116,139,.1)', '#64748B'],
}

type RoadmapRow = (typeof MOCK_ROADMAP)[number]

export function NextGenTechnologies() {
  const { t } = usePreferences()

  const inProgress = MOCK_ROADMAP.filter(r => r.status === 'In Progress').length
  const avgCompletion = Math.round(MOCK_ROADMAP.reduce((a, r) => a + r.completion, 0) / MOCK_ROADMAP.length)

  const kpis = [
    { label: t('Initiatives'), value: String(MOCK_ROADMAP.length), icon: 'Layers', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('In Progress'), value: String(inProgress), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Progress'), value: `${avgCompletion}%`, icon: 'TrendingUp', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Teams'), value: '5', icon: 'Users', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<RoadmapRow>[] = [
    { header: 'Initiative', cell: (r) => t(r.name) },
    { header: 'Phase', cell: (r) => r.phase },
    { header: 'Timeline', cell: (r) => r.timeline },
    { header: 'Status', cell: (r) => { const [bg, fg] = STATUS_COLORS[r.status] ?? STATUS_COLORS.Research; return <Badge background={bg} color={fg}>{t(r.status)}</Badge> } },
    { header: 'Team', cell: (r) => r.team },
    { header: 'Progress', cell: (r) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 rounded-full bg-border">
          <div className="h-full rounded-full" style={{ width: `${r.completion}%`, background: 'var(--salis-blue)' }} />
        </div>
        <span className="text-[12px] text-muted">{r.completion}%</span>
      </div>
    ) },
    { header: 'Budget', cell: (r) => r.budget },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Layers" title={t('Next-Gen Technologies')} subtitle={t('Technology roadmap and innovation pipeline')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <h3 className="text-[15px] font-bold text-heading">{t('Innovation Roadmap')}</h3>
      <DataTable
        caption="Next-gen technology roadmap"
        columns={columns}
        rows={[...MOCK_ROADMAP]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Research
          return (
            <>
              <MobileCardHeader title={t(row.name)} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Phase')}>{row.phase}</MobileCardRow>
              <MobileCardRow label={t('Timeline')}>{row.timeline}</MobileCardRow>
              <MobileCardRow label={t('Progress')}>{row.completion}%</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
