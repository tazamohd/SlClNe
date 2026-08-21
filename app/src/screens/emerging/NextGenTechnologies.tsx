import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

export function NextGenTechnologies() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const inProgress = MOCK_ROADMAP.filter(r => r.status === 'In Progress').length
  const avgCompletion = Math.round(MOCK_ROADMAP.reduce((a, r) => a + r.completion, 0) / MOCK_ROADMAP.length)

  const kpis = [
    { label: t('Initiatives'), value: String(MOCK_ROADMAP.length), icon: 'Layers', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('In Progress'), value: String(inProgress), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Progress'), value: `${avgCompletion}%`, icon: 'TrendingUp', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Teams'), value: '5', icon: 'Users', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Layers" title={t('Next-Gen Tech')} subtitle={t('Technology Roadmap')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_ROADMAP.map(r => {
          const [bg, fg] = STATUS_COLORS[r.status] ?? STATUS_COLORS.Research
          return (
            <MobileCard key={r.id}>
              <MobileCardHeader title={t(r.name)} trailing={<Badge background={bg} color={fg}>{t(r.status)}</Badge>} />
              <MobileCardRow label={t('Phase')}>{r.phase}</MobileCardRow>
              <MobileCardRow label={t('Timeline')}>{r.timeline}</MobileCardRow>
              <MobileCardRow label={t('Team')}>{r.team}</MobileCardRow>
              <MobileCardRow label={t('Progress')}>{r.completion}%</MobileCardRow>
              <MobileCardRow label={t('Budget')}>{r.budget}</MobileCardRow>
            </MobileCard>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Layers" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Next-Gen Technologies')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Technology roadmap and innovation pipeline')}</p>
        </div>
      </div>

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

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Innovation Roadmap')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Initiative')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Phase')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Timeline')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Team')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Progress')}</th>
                <th className="pb-3 text-end font-medium">{t('Budget')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROADMAP.map(r => {
                const [bg, fg] = STATUS_COLORS[r.status] ?? STATUS_COLORS.Research
                return (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(r.name)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{r.phase}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{r.timeline}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(r.status)}</Badge></td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{r.team}</td>
                    <td className="py-3 pe-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-border">
                          <div className="h-full rounded-full" style={{ width: `${r.completion}%`, background: 'var(--salis-blue)' }} />
                        </div>
                        <span className="text-[12px] text-muted">{r.completion}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-end font-mono text-[13px] text-heading">{r.budget}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
