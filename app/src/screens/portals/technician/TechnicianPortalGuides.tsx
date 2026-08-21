import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface RepairGuide {
  title: string
  system: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  makes: string
  steps: number
  lastUpdated: string
}

const GUIDES: RepairGuide[] = [
  { title: 'Brake Pad Replacement', system: 'Braking', difficulty: 'Beginner', estimatedTime: '1.5h', makes: 'All', steps: 12, lastUpdated: '2025-07-15' },
  { title: 'Timing Belt Replacement', system: 'Engine', difficulty: 'Advanced', estimatedTime: '4h', makes: 'Toyota, Honda', steps: 28, lastUpdated: '2025-06-01' },
  { title: 'AC System Recharge', system: 'Climate', difficulty: 'Intermediate', estimatedTime: '1h', makes: 'All', steps: 8, lastUpdated: '2025-08-01' },
  { title: 'CVT Fluid Change', system: 'Transmission', difficulty: 'Intermediate', estimatedTime: '2h', makes: 'Nissan', steps: 15, lastUpdated: '2025-05-20' },
  { title: 'Wheel Bearing Replacement', system: 'Suspension', difficulty: 'Advanced', estimatedTime: '3h', makes: 'All', steps: 22, lastUpdated: '2025-04-10' },
  { title: 'Battery Replacement & Coding', system: 'Electrical', difficulty: 'Beginner', estimatedTime: '0.5h', makes: 'All', steps: 6, lastUpdated: '2025-08-10' },
  { title: 'Fuel Injector Cleaning', system: 'Fuel', difficulty: 'Intermediate', estimatedTime: '2h', makes: 'Toyota, Hyundai', steps: 18, lastUpdated: '2025-03-25' },
]

const DIFFICULTY_STYLES: Record<string, { bg: string; fg: string }> = {
  Beginner: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Intermediate: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Advanced: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function TechnicianPortalGuides() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="BookMarked" title={t('Repair Guides')} subtitle={t('Step-by-step procedures')} />
        {GUIDES.map((g, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="BookMarked" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{g.title}</p>
                    <p className="text-xs text-muted">{g.system}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={DIFFICULTY_STYLES[g.difficulty].bg} color={DIFFICULTY_STYLES[g.difficulty].fg}>{t(g.difficulty)}</Badge>}
            />
            <MobileCardRow label={t('Makes')} value={g.makes} />
            <MobileCardRow label={t('Est. Time')} value={g.estimatedTime} />
            <MobileCardRow label={t('Steps')} value={String(g.steps)} />
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
            <Icon name="BookMarked" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Repair Guides')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Step-by-step repair procedures')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Guide')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('System')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Difficulty')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Makes')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Steps')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Est. Time')}</th>
                <th className="pb-3 text-start font-medium">{t('Updated')}</th>
              </tr>
            </thead>
            <tbody>
              {GUIDES.map((g, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{g.title}</td>
                  <td className="py-3 pe-4 text-body">{g.system}</td>
                  <td className="py-3 pe-4">
                    <Badge background={DIFFICULTY_STYLES[g.difficulty].bg} color={DIFFICULTY_STYLES[g.difficulty].fg}>{t(g.difficulty)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-body">{g.makes}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{g.steps}</td>
                  <td className="py-3 pe-4 text-body">{g.estimatedTime}</td>
                  <td className="py-3 text-body">{g.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
