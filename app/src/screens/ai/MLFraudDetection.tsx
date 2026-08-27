import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_ALERTS = [
  { id: 'FRD-001', type: 'Invoice Anomaly', description: 'Duplicate invoice amount from same vendor', riskScore: 95, amount: 'SAR 24,500', entity: 'Parts Supplier Co.', status: 'Flagged', detectedAt: '2026-08-17 14:22' },
  { id: 'FRD-002', type: 'Claim Pattern', description: 'Suspicious warranty claim frequency', riskScore: 87, amount: 'SAR 18,200', entity: 'Customer #4521', status: 'Under Review', detectedAt: '2026-08-17 11:05' },
  { id: 'FRD-003', type: 'Price Manipulation', description: 'Labor rate exceeds market threshold', riskScore: 78, amount: 'SAR 3,400', entity: 'Technician T-089', status: 'Dismissed', detectedAt: '2026-08-16 16:30' },
  { id: 'FRD-004', type: 'Ghost Inventory', description: 'Parts marked used but no work order', riskScore: 92, amount: 'SAR 7,800', entity: 'Warehouse B', status: 'Flagged', detectedAt: '2026-08-16 09:45' },
  { id: 'FRD-005', type: 'Identity Mismatch', description: 'Customer ID does not match vehicle owner', riskScore: 65, amount: 'SAR 5,100', entity: 'Customer #7832', status: 'Under Review', detectedAt: '2026-08-15 13:20' },
  { id: 'FRD-006', type: 'Payment Anomaly', description: 'Multiple refunds to same account', riskScore: 88, amount: 'SAR 12,600', entity: 'Account #9912', status: 'Flagged', detectedAt: '2026-08-15 10:15' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Flagged: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  'Under Review': ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Dismissed: ['rgba(100,116,139,.1)', '#64748B'],
}

export function MLFraudDetection() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_ALERTS : MOCK_ALERTS.filter(a => a.status === filter)
  const flagged = MOCK_ALERTS.filter(a => a.status === 'Flagged').length
  const avgRisk = Math.round(MOCK_ALERTS.reduce((a, d) => a + d.riskScore, 0) / MOCK_ALERTS.length)

  const kpis = [
    { label: t('Total Alerts'), value: String(MOCK_ALERTS.length), icon: 'ShieldAlert', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Flagged'), value: String(flagged), icon: 'Shield', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Risk Score'), value: `${avgRisk}`, icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Model Accuracy'), value: '97.2%', icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ShieldAlert" title={t('Fraud Detection')} subtitle={t('ML-Based Monitoring')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {filtered.map(a => {
          const [bg, fg] = STATUS_COLORS[a.status] ?? STATUS_COLORS.Dismissed
          return (
            <MobileCard key={a.id}>
              <MobileCardHeader title={t(a.type)} trailing={<Badge background={bg} color={fg}>{t(a.status)}</Badge>} />
              <MobileCardRow label={t('Description')}>{t(a.description)}</MobileCardRow>
              <MobileCardRow label={t('Risk Score')}>{a.riskScore}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>{a.amount}</MobileCardRow>
              <MobileCardRow label={t('Entity')}>{a.entity}</MobileCardRow>
              <MobileCardRow label={t('Detected')}>{a.detectedAt}</MobileCardRow>
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
            <Icon name="ShieldAlert" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('ML Fraud Detection')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Machine learning-based fraud detection dashboard')}</p>
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
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-heading">{t('Fraud Alerts')}</h3>
          <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')}>
            <option value="All">{t('All')}</option>
            <option value="Flagged">{t('Flagged')}</option>
            <option value="Under Review">{t('Under Review')}</option>
            <option value="Dismissed">{t('Dismissed')}</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Description')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Risk')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Amount')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 text-start font-medium">{t('Detected')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const [bg, fg] = STATUS_COLORS[a.status] ?? STATUS_COLORS.Dismissed
                return (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-mono text-[13px] text-heading" dir="ltr">{a.id}</td>
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(a.type)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(a.description)}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{a.riskScore}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{a.amount}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(a.status)}</Badge></td>
                    <td className="py-3 text-[13px] text-muted" dir="ltr">{a.detectedAt}</td>
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
