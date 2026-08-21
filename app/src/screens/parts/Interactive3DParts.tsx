import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface PartModel {
  name: string
  category: string
  partNumber: string
  compatibility: string
  views: number
  status: 'Available' | 'Upcoming' | 'Premium'
}

const PART_MODELS: PartModel[] = [
  { name: 'Brake Caliper Assembly', category: 'Braking System', partNumber: '47750-06140', compatibility: 'Toyota Camry 2020-2025', views: 1240, status: 'Available' },
  { name: 'Alternator Unit', category: 'Electrical', partNumber: '27060-0V040', compatibility: 'Toyota Corolla 2019-2024', views: 890, status: 'Available' },
  { name: 'Turbocharger Assembly', category: 'Engine', partNumber: '28231-2B760', compatibility: 'Hyundai Tucson 2022-2026', views: 2100, status: 'Premium' },
  { name: 'Steering Rack', category: 'Steering System', partNumber: '57700-A7000', compatibility: 'Kia Forte 2020-2025', views: 560, status: 'Available' },
  { name: 'Transmission Valve Body', category: 'Transmission', partNumber: '46210-3B600', compatibility: 'Hyundai Sonata 2021-2025', views: 320, status: 'Upcoming' },
  { name: 'Suspension Strut', category: 'Suspension', partNumber: '51621-TBA-A03', compatibility: 'Honda Civic 2022-2026', views: 780, status: 'Available' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Available: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'Upcoming': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Premium: { bg: 'rgba(245,158,11,.15)', fg: 'rgb(245,158,11)' },
}

export function Interactive3DParts() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Boxes" title={t('3D Parts Viewer')} subtitle={t('Interactive models')} />
        <MobileCard>
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="flex rounded-2xl p-4" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
              <Icon name="Boxes" size={32} />
            </span>
            <p className="text-sm font-semibold text-heading">{t('3D Viewer')}</p>
            <p className="text-center text-xs text-muted">{t('Select a part below to view its interactive 3D model')}</p>
          </div>
        </MobileCard>
        {PART_MODELS.map((part, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              title={part.name}
              trailing={<Badge background={STATUS_STYLES[part.status].bg} color={STATUS_STYLES[part.status].fg}>{t(part.status)}</Badge>}
            />
            <MobileCardRow label={t('Category')} value={t(part.category)} />
            <MobileCardRow label={t('Part No.')} value={part.partNumber} />
            <MobileCardRow label={t('Fits')} value={part.compatibility} />
            <MobileCardRow label={t('Views')} value={part.views.toLocaleString()} />
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
            <Icon name="Boxes" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Interactive 3D Parts')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Explore parts with interactive 3D models')}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Card className="flex flex-1 flex-col items-center justify-center rounded-2xl p-12 shadow-sm">
          <span className="flex rounded-2xl p-5" style={{ background: 'rgba(10,94,215,.06)', color: 'var(--salis-blue)' }} aria-hidden>
            <Icon name="Boxes" size={48} />
          </span>
          <p className="mt-4 text-lg font-bold text-heading">{t('3D Part Viewer')}</p>
          <p className="mt-1 text-sm text-muted">{t('Select a part from the catalog to load its 3D model')}</p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-secondary px-4 py-2 text-sm text-muted">
            <Icon name="Info" size={14} />
            <span>{t('Rotate, zoom, and inspect parts in real-time')}</span>
          </div>
        </Card>

        <Card className="w-80 flex-shrink-0 rounded-2xl p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-heading">{t('Parts Catalog')}</p>
          <div className="flex flex-col gap-2">
            {PART_MODELS.map((part, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-secondary">
                <span className="flex flex-shrink-0 rounded-lg p-1.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                  <Icon name="Package" size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-heading">{part.name}</p>
                  <p className="truncate text-xs text-muted">{part.category}</p>
                </div>
                <Badge background={STATUS_STYLES[part.status].bg} color={STATUS_STYLES[part.status].fg}>{t(part.status)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
