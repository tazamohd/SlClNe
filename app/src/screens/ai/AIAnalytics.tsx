import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { PageHeader } from '@/components/ui/PageHeader'

interface KPI {
  icon: string
  label: string
  value: string
  trend: string
  iconBg: string
  iconFg: string
}

interface Topic {
  label: string
  count: string
  pct: number
  color: string
}

function useKPIs(t: (s: string) => string): KPI[] {
  return useMemo(() => [
    { icon: 'MessageSquare', label: t('Total Queries'), value: '4,821', trend: '+24%', iconBg: 'var(--tint-blue)', iconFg: 'var(--salis-blue)' },
    { icon: 'Clock', label: t('Avg Response Time'), value: '1.2s', trend: '-15%', iconBg: 'var(--tint-bright)', iconFg: 'var(--salis-blue-bright)' },
    { icon: 'ThumbsUp', label: t('Satisfaction Rate'), value: '96.4%', trend: '+2.1%', iconBg: 'var(--tint-navy)', iconFg: 'var(--text-heading)' },
    { icon: 'Cpu', label: t('Tokens Used'), value: '2.4M', trend: '+18%', iconBg: 'var(--tint-orange)', iconFg: 'var(--salis-orange)' },
  ], [t])
}

function useTopics(t: (s: string) => string): Topic[] {
  return useMemo(() => [
    { label: t('Revenue & Finance'), count: '1,245', pct: 100, color: 'var(--salis-blue)' },
    { label: t('Job Cards & Workshop'), count: '986', pct: 79, color: 'var(--salis-blue-bright)' },
    { label: t('Inventory'), count: '724', pct: 58, color: 'var(--salis-orange)' },
    { label: t('Customer Queries'), count: '612', pct: 49, color: 'var(--text-heading)' },
    { label: t('Scheduling'), count: '458', pct: 37, color: 'var(--text-muted)' },
  ], [t])
}

export function AIAnalytics() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const kpis = useKPIs(t)
  const topics = useTopics(t)

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Activity"
          title={t('AI Analytics')}
          subtitle={t('AI Platform')}
        />

        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg p-1.5" style={{ background: k.iconBg, color: k.iconFg }}>
                      <Icon name={k.icon} size={14} />
                    </span>
                    <span className="text-[11px] font-medium text-muted">{k.label}</span>
                  </div>
                }
              />
              <MobileCardRow label={k.value} />
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-salis-blue">
                <Icon name="ArrowUpRight" size={12} />
                {k.trend}
              </span>
            </MobileCard>
          ))}
        </div>

        <Card className="rounded-2xl p-4">
          <h2 className="mb-4 text-base font-bold text-heading">{t('Top Topics')}</h2>
          <div className="flex flex-col gap-3">
            {topics.map((tp) => (
              <div key={tp.label}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="text-body">{tp.label}</span>
                  <span className="font-mono text-muted">{tp.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-salis-blue/[.08]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${tp.pct}%`, background: tp.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Activity" title={t('AI Analytics')} subtitle={t('AI Platform')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.iconBg, color: k.iconFg }}>
                <Icon name={k.icon} size={16} />
              </span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-black text-heading">{k.value}</p>
            <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-salis-blue">
              <Icon name="ArrowUpRight" size={12} />
              {k.trend}
            </span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-6">
        <Card className="rounded-2xl p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-heading">{t('Usage Over Time')}</h2>
          <svg viewBox="0 0 600 180" className="block h-auto w-full" aria-hidden="true">
            <defs>
              <linearGradient id="aiG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--salis-blue)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--salis-blue)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M20,140 C77,130 134,110 191,90 C248,70 305,60 362,50 C419,40 476,35 533,25 L533,160 L20,160 Z" fill="url(#aiG)" />
            <path d="M20,140 C77,130 134,110 191,90 C248,70 305,60 362,50 C419,40 476,35 533,25" fill="none" stroke="var(--salis-blue)" strokeWidth="2.5" strokeLinecap="round" />
            <text x="20" y="176" fontSize="11" fill="currentColor" className="text-muted" fontFamily="Inter,sans-serif">Jan</text>
            <text x="191" y="176" fontSize="11" fill="currentColor" className="text-muted" fontFamily="Inter,sans-serif">Mar</text>
            <text x="362" y="176" fontSize="11" fill="currentColor" className="text-muted" fontFamily="Inter,sans-serif">May</text>
            <text x="533" y="176" fontSize="11" fill="currentColor" className="text-muted" fontFamily="Inter,sans-serif">Jul</text>
          </svg>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-heading">{t('Top Topics')}</h2>
          <div className="flex flex-col gap-3">
            {topics.map((tp) => (
              <div key={tp.label}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="text-body">{tp.label}</span>
                  <span className="font-mono text-muted">{tp.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-salis-blue/[.08]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${tp.pct}%`, background: tp.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
