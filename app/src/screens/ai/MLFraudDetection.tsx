import { useState } from 'react'
import { FeatureHeader, Section, StatRow, TabBar } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

interface FraudAlert {
  id: string
  type: string
  entity: string
  amount: string
  riskScore: number
  status: 'flagged' | 'investigating' | 'cleared' | 'confirmed'
  timestamp: string
  indicators: string[]
  icon: string
}

const ALERTS: FraudAlert[] = [
  {
    id: 'fa-1',
    type: 'Duplicate Invoice',
    entity: 'Invoice #INV-2847',
    amount: 'SAR 4,200',
    riskScore: 92,
    status: 'flagged',
    timestamp: 'Today, 10:45 AM',
    indicators: ['Same amount as INV-2831', 'Same customer within 48h', 'Different job card'],
    icon: 'Copy',
  },
  {
    id: 'fa-2',
    type: 'Unusual Transaction',
    entity: 'PO #PO-1592',
    amount: 'SAR 18,500',
    riskScore: 78,
    status: 'investigating',
    timestamp: 'Today, 8:30 AM',
    indicators: ['Amount 3.2x above average', 'New supplier', 'Approved without manager review'],
    icon: 'TrendingUp',
  },
  {
    id: 'fa-3',
    type: 'Warranty Claim Anomaly',
    entity: 'Claim #WC-0394',
    amount: 'SAR 6,800',
    riskScore: 85,
    status: 'flagged',
    timestamp: 'Yesterday, 4:15 PM',
    indicators: ['Vehicle out of warranty by 2 months', 'Parts not matching VIN', 'Third claim in 30 days'],
    icon: 'Shield',
  },
  {
    id: 'fa-4',
    type: 'Inventory Discrepancy',
    entity: 'Part #BRK-4420',
    amount: 'SAR 2,100',
    riskScore: 65,
    status: 'cleared',
    timestamp: 'Yesterday, 11:00 AM',
    indicators: ['Stock count mismatch', 'No matching sale or write-off'],
    icon: 'Package',
  },
  {
    id: 'fa-5',
    type: 'Ghost Employee',
    entity: 'Payroll — Aug 2024',
    amount: 'SAR 7,500',
    riskScore: 88,
    status: 'confirmed',
    timestamp: '2 days ago',
    indicators: ['No clock-in records', 'No assigned jobs', 'Account created recently'],
    icon: 'UserX',
  },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  flagged: { bg: 'rgba(249,115,22,.1)', fg: '#F97316', label: 'Flagged' },
  investigating: { bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF', label: 'Investigating' },
  cleared: { bg: 'rgba(100,116,139,.1)', fg: '#64748B', label: 'Cleared' },
  confirmed: { bg: 'rgba(11,31,59,.1)', fg: '#0B1F3B', label: 'Confirmed Fraud' },
}

const TABS = [
  { id: 'alerts', label: 'Alerts', icon: 'AlertTriangle' },
  { id: 'patterns', label: 'Patterns', icon: 'Activity' },
] as const

const RISK_LINE =
  'M20,120 C77,115 134,100 191,110 C248,85 305,95 362,70 C419,55 476,60 533,40'
const RISK_MONTHS = [
  { label: 'Mar', x: 20 },
  { label: 'May', x: 191 },
  { label: 'Jul', x: 362 },
  { label: 'Sep', x: 533 },
] as const

export function MLFraudDetection() {
  const { t } = usePreferences()
  const [tab, setTab] = useState('alerts')

  const flagged = ALERTS.filter((a) => a.status === 'flagged').length
  const totalRisk = ALERTS.reduce((sum, a) => sum + a.riskScore, 0)
  const avgRisk = Math.round(totalRisk / ALERTS.length)

  return (
    <>
      <FeatureHeader
        icon="ShieldAlert"
        title={t('ML Fraud Detection')}
        subtitle={t('Anomaly detection in transactions & claims')}
      />

      <StatRow
        stats={[
          { label: 'Active Alerts', value: ALERTS.length, highlight: true, icon: 'AlertTriangle' },
          { label: 'Flagged', value: flagged, tone: 'warning', icon: 'Flag' },
          { label: 'Avg Risk Score', value: `${avgRisk}%`, tone: 'info', icon: 'Activity' },
          { label: 'Amount at Risk', value: 'SAR 39.1K', icon: 'DollarSign' },
        ]}
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'alerts' && (
        <div className="flex flex-col gap-4">
          {ALERTS.map((alert) => {
            const st = STATUS_STYLES[alert.status]
            return (
              <Card key={alert.id} className="flex flex-col gap-3.5 rounded-2xl p-5">
                <div className="flex items-start gap-3.5">
                  <span
                    className="flex flex-shrink-0 rounded-[10px] p-2"
                    style={{ background: st.bg, color: st.fg }}
                  >
                    <Icon name={alert.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-heading">
                        {t(alert.type)}
                      </h3>
                      <Badge background={st.bg} color={st.fg}>
                        {t(st.label)}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {alert.entity} &middot; {alert.timestamp}
                    </p>
                  </div>
                  <div className="hidden text-end sm:block">
                    <p className="font-display text-lg font-bold text-heading">{alert.amount}</p>
                    <p className="text-xs text-muted">
                      {t('Risk')}: {alert.riskScore}%
                    </p>
                  </div>
                </div>

                <div className="rounded-[10px] border border-border bg-inset p-3">
                  <p className="mb-1.5 text-[13px] font-semibold text-salis-blue">
                    {t('Risk Indicators')}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {alert.indicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-body">
                        <Icon name="ChevronRight" size={12} className="mt-0.5 flex-shrink-0 text-muted" />
                        {t(ind)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{t('Risk Score')}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${alert.riskScore}%`,
                        background:
                          alert.riskScore >= 85
                            ? '#F97316'
                            : alert.riskScore >= 70
                              ? '#0BB3FF'
                              : '#64748B',
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-muted">{alert.riskScore}%</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'patterns' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title={t('Risk Trend')}>
            <svg
              viewBox="0 0 600 160"
              className="block h-auto w-full"
              role="img"
              aria-label={t('Risk Trend')}
            >
              <defs>
                <linearGradient id="fraudRiskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${RISK_LINE} L533,140 L20,140 Z`} fill="url(#fraudRiskGrad)" />
              <path
                d={RISK_LINE}
                fill="none"
                stroke="#F97316"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {RISK_MONTHS.map((m) => (
                <text
                  key={m.label}
                  x={m.x}
                  y="156"
                  fontSize="11"
                  fill="#64748B"
                  fontFamily="Inter,sans-serif"
                >
                  {m.label}
                </text>
              ))}
            </svg>
          </Section>

          <Section title={t('Detection Categories')}>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Duplicate Invoices', pct: 100, color: '#0A5ED7' },
                { label: 'Unusual Transactions', pct: 72, color: '#0BB3FF' },
                { label: 'Warranty Anomalies', pct: 58, color: '#F97316' },
                { label: 'Inventory Discrepancies', pct: 40, color: '#0B1F3B' },
                { label: 'Payroll Fraud', pct: 25, color: '#64748B' },
              ].map((cat) => (
                <div key={cat.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-body">{t(cat.label)}</span>
                    <span className="font-mono text-muted">{cat.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-inset">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.pct}%`, background: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </>
  )
}
