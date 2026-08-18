import { FeatureHeader, Section } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** AI Analytics: AI usage & cost analytics overview.
 *
 *  Design-only screen (no backing collection in repository.ts) — the KPIs,
 *  usage trend line and topic breakdown are the .dc.html prototype's fixed
 *  demo figures, kept as local consts, same as the other design-only AI
 *  screens in this folder (PromptLibrary, AutomationRules). */

interface Kpi {
  icon: string
  label: string
  value: string
  trend: string
  bg: string
  fg: string
}

const KPIS: readonly Kpi[] = [
  {
    icon: 'MessageSquare',
    label: 'Total Queries',
    value: '4,821',
    trend: '+24%',
    bg: 'rgba(10,94,215,.1)',
    fg: '#0A5ED7',
  },
  {
    icon: 'Clock',
    label: 'Avg Response Time',
    value: '1.2s',
    trend: '-15%',
    bg: 'rgba(11,179,255,.1)',
    fg: '#0BB3FF',
  },
  {
    icon: 'ThumbsUp',
    label: 'Satisfaction Rate',
    value: '96.4%',
    trend: '+2.1%',
    bg: 'rgba(11,31,59,.1)',
    fg: '#0B1F3B',
  },
  {
    icon: 'Cpu',
    label: 'Tokens Used',
    value: '2.4M',
    trend: '+18%',
    bg: 'rgba(249,115,22,.1)',
    fg: '#F97316',
  },
]

interface Topic {
  label: string
  count: string
  pct: number
  color: string
}

const TOPICS: readonly Topic[] = [
  { label: 'Revenue & Finance', count: '1,245', pct: 100, color: '#0A5ED7' },
  { label: 'Job Cards & Workshop', count: '986', pct: 79, color: '#0BB3FF' },
  { label: 'Inventory', count: '724', pct: 58, color: '#F97316' },
  { label: 'Customer Queries', count: '612', pct: 49, color: '#0B1F3B' },
  { label: 'Scheduling', count: '458', pct: 37, color: '#64748B' },
]

// Usage-over-time line — same curve as the .dc.html prototype's inline SVG.
const USAGE_LINE =
  'M20,140 C77,130 134,110 191,90 C248,70 305,60 362,50 C419,40 476,35 533,25'
const USAGE_MONTHS = [
  { label: 'Jan', x: 20 },
  { label: 'Mar', x: 191 },
  { label: 'May', x: 362 },
  { label: 'Jul', x: 533 },
] as const

export function AIAnalytics() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader icon="Activity" title={t('AI Analytics')} subtitle={t('AI Platform')} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label} className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <span
                className="flex flex-shrink-0 rounded-lg p-1.5"
                style={{ background: kpi.bg, color: kpi.fg }}
              >
                <Icon name={kpi.icon} size={16} />
              </span>
              <span className="text-xs font-medium text-muted">{t(kpi.label)}</span>
            </div>
            <h4 className="font-display text-2xl font-black text-heading">{kpi.value}</h4>
            <span
              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-salis-blue"
              dir="ltr"
            >
              <Icon name="ArrowUpRight" size={12} />
              {kpi.trend}
            </span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <Section title={t('Usage Over Time')}>
          <svg
            viewBox="0 0 600 180"
            className="block h-auto w-full"
            role="img"
            aria-label={t('Usage Over Time')}
          >
            <defs>
              <linearGradient id="aiAnalyticsUsageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A5ED7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0A5ED7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${USAGE_LINE} L533,160 L20,160 Z`} fill="url(#aiAnalyticsUsageGrad)" />
            <path d={USAGE_LINE} fill="none" stroke="#0A5ED7" strokeWidth="2.5" strokeLinecap="round" />
            {USAGE_MONTHS.map((month) => (
              <text
                key={month.label}
                x={month.x}
                y="176"
                fontSize="11"
                fill="#64748B"
                fontFamily="Inter,sans-serif"
              >
                {month.label}
              </text>
            ))}
          </svg>
        </Section>

        <Section title={t('Top Topics')}>
          <div className="flex flex-col gap-3">
            {TOPICS.map((topic) => (
              <div key={topic.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-body">{t(topic.label)}</span>
                  <span className="font-mono text-muted" dir="ltr">
                    {topic.count}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-inset">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${topic.pct}%`, background: topic.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  )
}
