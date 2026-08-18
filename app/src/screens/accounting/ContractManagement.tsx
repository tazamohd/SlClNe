import { useMemo, useState } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'

interface Contract {
  contractNumber: string
  title: string
  party: string
  startDate: string
  endDate: string
  value: number
  status: string
  type: string
}

const MOCK_CONTRACTS: readonly Contract[] = [
  { contractNumber: 'CTR-2024-001', title: 'Workshop Lease Agreement', party: 'Saudi Real Estate Co', startDate: '2024-01-01', endDate: '2028-12-31', value: 720000_00, status: 'Active', type: 'Lease' },
  { contractNumber: 'CTR-2024-002', title: 'Parts Supply Agreement', party: 'Al-Futtaim Parts', startDate: '2024-06-01', endDate: '2026-05-31', value: 480000_00, status: 'Expired', type: 'Supply' },
  { contractNumber: 'CTR-2025-003', title: 'IT Support & Maintenance', party: 'TechServe SA', startDate: '2025-03-15', endDate: '2027-03-14', value: 96000_00, status: 'Active', type: 'Service' },
  { contractNumber: 'CTR-2025-004', title: 'Equipment Maintenance', party: 'LiftMaster Co', startDate: '2025-08-01', endDate: '2027-07-31', value: 45000_00, status: 'Active', type: 'Maintenance' },
  { contractNumber: 'CTR-2026-005', title: 'Fleet Insurance Coverage', party: 'Tawuniya Insurance', startDate: '2026-01-01', endDate: '2026-12-31', value: 85000_00, status: 'Active', type: 'Service' },
  { contractNumber: 'CTR-2026-006', title: 'Cleaning Services', party: 'CleanPro LLC', startDate: '2026-09-01', endDate: '2027-08-31', value: 36000_00, status: 'Pending', type: 'Service' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Expired: ['rgba(100,116,139,.1)', '#64748B'],
  Pending: ['rgba(249,115,22,.1)', '#F97316'],
  Terminated: ['rgba(11,31,59,.1)', '#0B1F3B'],
}

const TYPE_PALETTE: Record<string, readonly [string, string]> = {
  Service: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Supply: ['rgba(11,179,255,.1)', '#0BB3FF'],
  Maintenance: ['rgba(11,31,59,.1)', '#0B1F3B'],
  Lease: ['rgba(249,115,22,.1)', '#F97316'],
}

export function ContractManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_CONTRACTS.filter(
      (c) =>
        !needle ||
        c.contractNumber.toLowerCase().includes(needle) ||
        c.title.toLowerCase().includes(needle) ||
        c.party.toLowerCase().includes(needle)
    )
  }, [query])

  const totals = useMemo(() => {
    let totalValue = 0
    let active = 0
    let expiringThisMonth = 0
    const now = new Date('2026-08-01')
    const endOfMonth = new Date('2026-08-31')
    for (const c of MOCK_CONTRACTS) {
      totalValue += c.value
      if (c.status === 'Active') {
        active++
        const end = new Date(c.endDate)
        if (end >= now && end <= endOfMonth) expiringThisMonth++
      }
    }
    return { total: MOCK_CONTRACTS.length, active, expiringThisMonth, totalValue }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Contracts', value: totals.total, caption: 'All records', highlight: true },
    { label: 'Active', value: totals.active, caption: 'Currently in effect', tone: 'info' },
    { label: 'Expiring This Month', value: totals.expiringThisMonth, caption: 'Need renewal', tone: 'warning' },
    { label: 'Total Value', value: formatSar(totals.totalValue), caption: 'All contracts' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="FileSignature"
          title={t('Contract Management')}
          subtitle={t('Accounting')}
        />
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{t(stat.label)}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{stat.value}</p>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {filtered.map((c) => {
            const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE.Active
            const [typeBg, typeFg] = TYPE_PALETTE[c.type] ?? TYPE_PALETTE.Service
            return (
              <MobileCard key={c.contractNumber}>
                <MobileCardHeader
                  title={c.contractNumber}
                  code
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(c.status)}
                    </Badge>
                  }
                />
                <MobileCardRow>{t(c.title)}</MobileCardRow>
                <MobileCardRow label={t('Party')}>{c.party}</MobileCardRow>
                <MobileCardRow label={t('Type')}>
                  <Badge background={typeBg} color={typeFg}>{t(c.type)}</Badge>
                </MobileCardRow>
                <MobileCardRow label={t('Period')}>
                  <span dir="ltr">{c.startDate} — {c.endDate}</span>
                </MobileCardRow>
                <MobileCardRow label={t('Value')}>
                  <Money sar={c.value} className="font-semibold text-heading" />
                </MobileCardRow>
              </MobileCard>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="FileSignature"
        title={t('Contract Management')}
        subtitle={t('Track and manage service and supply contracts')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Contracts')}
        subtitle={t('All contracts with parties and status')}
        toolbar={
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Number, title or party')}
              aria-label={t('Search contracts')}
              className="h-10 rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
            />
          </label>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Contract #')}</th>
                <th className="py-2.5 text-start font-medium">{t('Title')}</th>
                <th className="py-2.5 text-start font-medium">{t('Party')}</th>
                <th className="py-2.5 text-start font-medium">{t('Type')}</th>
                <th className="py-2.5 text-start font-medium">{t('Start')}</th>
                <th className="py-2.5 text-start font-medium">{t('End')}</th>
                <th className="py-2.5 text-end font-medium">{t('Value')}</th>
                <th className="py-2.5 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE.Active
                const [typeBg, typeFg] = TYPE_PALETTE[c.type] ?? TYPE_PALETTE.Service
                return (
                  <tr key={c.contractNumber} className="border-b border-border/50">
                    <td className="py-2.5">
                      <span className="font-mono text-[13px]" dir="ltr">{c.contractNumber}</span>
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{t(c.title)}</td>
                    <td className="py-2.5 text-[13px] text-body">{c.party}</td>
                    <td className="py-2.5">
                      <Badge background={typeBg} color={typeFg}>{t(c.type)}</Badge>
                    </td>
                    <td className="py-2.5 text-[13px] text-muted" dir="ltr">{c.startDate}</td>
                    <td className="py-2.5 text-[13px] text-muted" dir="ltr">{c.endDate}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={c.value} className="font-semibold" />
                    </td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(c.status)}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">{t('No contracts match the filter')}</p>
        )}
      </Section>
    </div>
  )
}
