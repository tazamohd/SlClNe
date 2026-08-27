import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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

type AlertRow = (typeof MOCK_ALERTS)[number]

export function MLFraudDetection() {
  const { t } = usePreferences()
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

  const columns: Column<AlertRow>[] = [
    { header: 'ID', cell: (a) => a.id, code: true },
    { header: 'Type', cell: (a) => t(a.type) },
    { header: 'Description', cell: (a) => t(a.description) },
    { header: 'Risk', cell: (a) => `${a.riskScore}` },
    { header: 'Amount', cell: (a) => a.amount },
    { header: 'Status', cell: (a) => { const [bg, fg] = STATUS_COLORS[a.status] ?? STATUS_COLORS.Dismissed; return <Badge background={bg} color={fg}>{t(a.status)}</Badge> } },
    { header: 'Detected', cell: (a) => a.detectedAt },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ShieldAlert" title={t('ML Fraud Detection')} subtitle={t('Machine learning-based fraud detection dashboard')} />

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

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Fraud Alerts')}</h3>
        <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')}>
          <option value="All">{t('All')}</option>
          <option value="Flagged">{t('Flagged')}</option>
          <option value="Under Review">{t('Under Review')}</option>
          <option value="Dismissed">{t('Dismissed')}</option>
        </Select>
      </div>
      <DataTable
        caption="Fraud detection alerts"
        columns={columns}
        rows={[...filtered]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Dismissed
          return (
            <>
              <MobileCardHeader title={t(row.type)} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Risk Score')}>{row.riskScore}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>{row.amount}</MobileCardRow>
              <MobileCardRow label={t('Entity')}>{row.entity}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
