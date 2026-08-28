import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface SalesStep {
  step: number
  title: string
  description: string
  icon: string
  duration: string
  tips: number
}

const SALES_STEPS: SalesStep[] = [
  { step: 1, title: 'Customer Greeting', description: 'Welcome the customer and understand their needs', icon: 'Users', duration: '5 min', tips: 4 },
  { step: 2, title: 'Vehicle Assessment', description: 'Inspect the vehicle and identify service requirements', icon: 'Car', duration: '15 min', tips: 6 },
  { step: 3, title: 'Service Recommendation', description: 'Present service options and upsell opportunities', icon: 'ClipboardList', duration: '10 min', tips: 8 },
  { step: 4, title: 'Estimate Preparation', description: 'Create detailed cost estimate with parts and labor', icon: 'Calculator', duration: '10 min', tips: 5 },
  { step: 5, title: 'Customer Approval', description: 'Review estimate with customer and obtain authorization', icon: 'CheckCircle', duration: '5 min', tips: 3 },
  { step: 6, title: 'Follow-up', description: 'Post-service satisfaction check and future booking', icon: 'PhoneCall', duration: '5 min', tips: 4 },
]

interface SalesMetric {
  label: string
  value: string
  icon: string
  trend: string
}

const SALES_METRICS: SalesMetric[] = [
  { label: 'Conversion Rate', value: '68%', icon: 'TrendingUp', trend: '+5% vs last month' },
  { label: 'Avg. Ticket Value', value: 'SAR 1,240', icon: 'Receipt', trend: '+SAR 180' },
  { label: 'Upsell Rate', value: '42%', icon: 'Target', trend: '+8% this quarter' },
  { label: 'Customer Return Rate', value: '76%', icon: 'RefreshCw', trend: 'Steady' },
]

export function SalesGuide() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="BookOpen" title={t('Sales Guide')} subtitle={t('Sales methodology')} />
        <div className="grid grid-cols-2 gap-3">
          {SALES_METRICS.map((metric) => (
            <MobileCard key={metric.label}>
              <MobileCardHeader
                leading={
                  <span className="flex rounded-lg p-1.5" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
                    <Icon name={metric.icon} size={14} />
                  </span>
                }
              />
              <p className="text-xs text-muted">{t(metric.label)}</p>
              <p className="text-lg font-bold text-heading">{metric.value}</p>
            </MobileCard>
          ))}
        </div>
        <p className="mt-2 text-xs font-bold text-heading">{t('Sales Process')}</p>
        {SALES_STEPS.map((step) => (
          <MobileCard key={step.step}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-salis-gradient text-xs font-bold text-white">
                    {step.step}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(step.title)}</p>
                    <p className="text-xs text-muted">{t(step.description)}</p>
                  </div>
                </div>
              }
            />
            <MobileCardRow label={t('Duration')} value={step.duration} />
            <MobileCardRow label={t('Tips')} value={`${step.tips} ${t('tips')}`} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="BookOpen" title={t('Sales Guide')} subtitle={t('Service advisor sales methodology and best practices')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {SALES_METRICS.map((metric) => (
          <Card key={metric.label} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex rounded-xl p-2.5" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
                <Icon name={metric.icon} size={20} />
              </span>
              <div>
                <p className="text-xs text-muted">{t(metric.label)}</p>
                <p className="text-xl font-bold text-heading">{metric.value}</p>
                <p className="text-[11px] text-muted">{t(metric.trend)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-heading">{t('Sales Process Steps')}</p>
        <div className="flex flex-col gap-4">
          {SALES_STEPS.map((step) => (
            <div key={step.step} className="flex items-start gap-4 rounded-xl bg-surface-secondary p-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-sm font-bold text-white">
                {step.step}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
                    <Icon name={step.icon} size={14} />
                  </span>
                  <p className="text-sm font-bold text-heading">{t(step.title)}</p>
                </div>
                <p className="mt-1 text-sm text-body">{t(step.description)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <Badge background="var(--tint-blue)" color="var(--salis-blue)">{step.duration}</Badge>
                  <Badge background="rgba(107,114,128,.08)" color="var(--text-muted)">{step.tips} {t('tips')}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
