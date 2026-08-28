import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface DashboardWidget {
  name: string
  description: string
  icon: string
  size: 'Small' | 'Medium' | 'Large'
  enabled: boolean
  category: 'KPI' | 'Chart' | 'List' | 'Status'
  position: number
}

const WIDGETS: DashboardWidget[] = [
  { name: 'Revenue Overview', description: 'Daily and monthly revenue summary', icon: 'Wallet', size: 'Large', enabled: true, category: 'Chart', position: 1 },
  { name: 'Active Jobs', description: 'Current jobs in progress', icon: 'Wrench', size: 'Small', enabled: true, category: 'KPI', position: 2 },
  { name: 'Appointments Today', description: 'Upcoming service appointments', icon: 'Calendar', size: 'Medium', enabled: true, category: 'List', position: 3 },
  { name: 'Technician Utilization', description: 'Staff workload and efficiency', icon: 'Users', size: 'Medium', enabled: true, category: 'Chart', position: 4 },
  { name: 'Parts Low Stock', description: 'Inventory items below threshold', icon: 'Package', size: 'Small', enabled: true, category: 'Status', position: 5 },
  { name: 'Customer Satisfaction', description: 'Average rating from surveys', icon: 'Star', size: 'Small', enabled: false, category: 'KPI', position: 6 },
  { name: 'Invoice Aging', description: 'Outstanding invoice breakdown', icon: 'Receipt', size: 'Large', enabled: false, category: 'Chart', position: 7 },
  { name: 'Service Reminders', description: 'Pending follow-up reminders', icon: 'Bell', size: 'Medium', enabled: true, category: 'List', position: 8 },
  { name: 'System Status', description: 'Server and integration health', icon: 'Activity', size: 'Small', enabled: true, category: 'Status', position: 9 },
]

const SIZE_STYLES: Record<string, { bg: string; fg: string }> = {
  Small: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
  Medium: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Large: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

export function DashboardWidgets() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const enabledCount = WIDGETS.filter((w) => w.enabled).length

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="LayoutGrid" title={t('Widgets')} subtitle={t('Dashboard configuration')} />
        <div className="flex items-center gap-2">
          <Badge background="var(--tint-blue)" color="var(--salis-blue)">{enabledCount} {t('active')}</Badge>
          <Badge background="var(--tint-neutral)" color="var(--text-muted)">{WIDGETS.length - enabledCount} {t('hidden')}</Badge>
        </div>
        {WIDGETS.map((widget, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
                    <Icon name={widget.icon} size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(widget.name)}</p>
                    <p className="text-xs text-muted">{t(widget.description)}</p>
                  </div>
                </div>
              }
              trailing={
                <Badge
                  background={widget.enabled ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                  color={widget.enabled ? 'var(--salis-blue)' : 'var(--text-muted)'}
                >
                  {widget.enabled ? t('Enabled') : t('Disabled')}
                </Badge>
              }
            />
            <MobileCardRow label={t('Size')} value={t(widget.size)} />
            <MobileCardRow label={t('Category')} value={t(widget.category)} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="LayoutGrid" title={t('Dashboard Widgets')} subtitle={t('Configure and arrange dashboard components')} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {WIDGETS.map((widget, i) => (
          <Card key={i} className={`rounded-2xl p-5 shadow-sm ${!widget.enabled ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <span className="flex rounded-xl p-2.5" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
                <Icon name={widget.icon} size={20} />
              </span>
              <div className="flex items-center gap-2">
                <Badge background={SIZE_STYLES[widget.size].bg} color={SIZE_STYLES[widget.size].fg}>{t(widget.size)}</Badge>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-heading">{t(widget.name)}</p>
            <p className="mt-1 text-xs text-muted">{t(widget.description)}</p>
            <div className="mt-3 flex items-center justify-between">
              <Badge background="rgba(107,114,128,.08)" color="var(--text-muted)">{t(widget.category)}</Badge>
              <Badge
                background={widget.enabled ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                color={widget.enabled ? 'var(--salis-blue)' : 'var(--text-muted)'}
              >
                {widget.enabled ? t('Enabled') : t('Disabled')}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
