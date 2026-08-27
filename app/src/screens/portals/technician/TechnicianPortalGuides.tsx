import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

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
  Advanced: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
}

export function TechnicianPortalGuides() {
  const { t } = usePreferences()

  const columns: Column<RepairGuide>[] = [
    { header: t('Guide'), cell: (g) => g.title },
    { header: t('System'), cell: (g) => g.system },
    { header: t('Difficulty'), cell: (g) => <Badge background={DIFFICULTY_STYLES[g.difficulty].bg} color={DIFFICULTY_STYLES[g.difficulty].fg}>{t(g.difficulty)}</Badge> },
    { header: t('Makes'), cell: (g) => g.makes },
    { header: t('Steps'), cell: (g) => g.steps },
    { header: t('Est. Time'), cell: (g) => g.estimatedTime },
    { header: t('Updated'), cell: (g) => g.lastUpdated },
  ]

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

      <DataTable
        caption="Repair guides"
        columns={columns}
        rows={GUIDES}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(g) => (
          <>
            <MobileCardHeader title={g.title} trailing={<Badge background={DIFFICULTY_STYLES[g.difficulty].bg} color={DIFFICULTY_STYLES[g.difficulty].fg}>{t(g.difficulty)}</Badge>} />
            <MobileCardRow label={t('System')}>{g.system}</MobileCardRow>
            <MobileCardRow label={t('Makes')}>{g.makes}</MobileCardRow>
            <MobileCardRow label={t('Est. Time')}>{g.estimatedTime}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
