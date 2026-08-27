import { useMemo, useState } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'

interface Warranty {
  itemName: string
  warrantyId: string
  startDate: string
  endDate: string
  provider: string
  coverage: string
  status: string
}

const MOCK_WARRANTIES: readonly Warranty[] = [
  { itemName: 'Hydraulic Lift #1', warrantyId: 'WRN-001', startDate: '2024-08-01', endDate: '2027-07-31', provider: 'LiftMaster Co', coverage: 'Full', status: 'Active' },
  { itemName: 'Diagnostic Scanner Pro', warrantyId: 'WRN-002', startDate: '2025-04-18', endDate: '2027-04-17', provider: 'AutoDiag Inc', coverage: 'Limited', status: 'Active' },
  { itemName: 'AC Compressor Unit', warrantyId: 'WRN-003', startDate: '2023-06-01', endDate: '2026-05-31', provider: 'CoolTech SA', coverage: 'Full', status: 'Expired' },
  { itemName: 'Paint Booth System', warrantyId: 'WRN-004', startDate: '2025-01-15', endDate: '2028-01-14', provider: 'SprayTech Ltd', coverage: 'Extended', status: 'Active' },
  { itemName: 'Wheel Alignment Machine', warrantyId: 'WRN-005', startDate: '2024-03-10', endDate: '2026-09-09', provider: 'AlignPro', coverage: 'Limited', status: 'Active' },
  { itemName: 'Battery Charger Pro', warrantyId: 'WRN-006', startDate: '2023-11-20', endDate: '2025-11-19', provider: 'PowerMax SA', coverage: 'Full', status: 'Claimed' },
  { itemName: 'Tire Changer', warrantyId: 'WRN-007', startDate: '2025-07-01', endDate: '2027-06-30', provider: 'TireTech Inc', coverage: 'Full', status: 'Active' },
  { itemName: 'Old Welder Unit', warrantyId: 'WRN-008', startDate: '2021-02-15', endDate: '2024-02-14', provider: 'WeldMaster', coverage: 'Limited', status: 'Expired' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Expired: ['rgba(100,116,139,.1)', '#64748B'],
  Claimed: ['rgba(249,115,22,.1)', '#F97316'],
}

const COVERAGE_PALETTE: Record<string, readonly [string, string]> = {
  Full: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Limited: ['rgba(11,31,59,.1)', '#0B1F3B'],
  Extended: ['rgba(11,179,255,.1)', '#0BB3FF'],
}

export function WarrantyManagement() {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_WARRANTIES.filter(
      (w) =>
        !needle ||
        w.warrantyId.toLowerCase().includes(needle) ||
        w.itemName.toLowerCase().includes(needle) ||
        w.provider.toLowerCase().includes(needle)
    )
  }, [query])

  const totals = useMemo(() => {
    let active = 0
    let expiringSoon = 0
    let claims = 0
    const now = new Date('2026-08-18')
    const threeMonths = new Date('2026-11-18')
    for (const w of MOCK_WARRANTIES) {
      if (w.status === 'Active') {
        active++
        const end = new Date(w.endDate)
        if (end <= threeMonths && end >= now) expiringSoon++
      }
      if (w.status === 'Claimed') claims++
    }
    return { total: MOCK_WARRANTIES.length, active, expiringSoon, claims }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Warranties', value: totals.total, caption: 'All records', highlight: true },
    { label: 'Active', value: totals.active, caption: 'Currently valid', tone: 'info' },
    { label: 'Expiring Soon', value: totals.expiringSoon, caption: 'Within 3 months', tone: 'warning' },
    { label: 'Claims', value: totals.claims, caption: 'Warranty claims filed' },
  ]

  const columns: Column<Warranty>[] = [
    { header: 'Warranty ID', cell: (w) => w.warrantyId, code: true },
    { header: 'Item', cell: (w) => w.itemName },
    { header: 'Provider', cell: (w) => w.provider },
    { header: 'Start Date', cell: (w) => <span dir="ltr" className="text-muted">{w.startDate}</span> },
    { header: 'End Date', cell: (w) => <span dir="ltr" className="text-muted">{w.endDate}</span> },
    { header: 'Coverage', cell: (w) => {
      const [bg, fg] = COVERAGE_PALETTE[w.coverage] ?? COVERAGE_PALETTE.Limited
      return <Badge background={bg} color={fg}>{t(w.coverage)}</Badge>
    } },
    { header: 'Status', cell: (w) => {
      const [bg, fg] = STATUS_PALETTE[w.status] ?? STATUS_PALETTE.Active
      return <Badge background={bg} color={fg}>{t(w.status)}</Badge>
    } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Shield"
        title={t('Warranty Management')}
        subtitle={t('Track warranty coverage and expiration dates')}
      />
      <StatRow stats={stats} />

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('ID, item or provider')}
          aria-label={t('Search warranties')}
          inputSize="sm"
        />
      </label>

      <DataTable
        caption="Warranties"
        columns={columns}
        rows={filtered}
        rowKey={(w) => w.warrantyId}
        mobileCard={(w) => {
          const [bg, fg] = STATUS_PALETTE[w.status] ?? STATUS_PALETTE.Active
          const [covBg, covFg] = COVERAGE_PALETTE[w.coverage] ?? COVERAGE_PALETTE.Limited
          return (
            <>
              <MobileCardHeader title={w.warrantyId} code trailing={<Badge background={bg} color={fg}>{t(w.status)}</Badge>} />
              <MobileCardRow>{w.itemName}</MobileCardRow>
              <MobileCardRow label={t('Coverage')}><Badge background={covBg} color={covFg}>{t(w.coverage)}</Badge></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="Shield" title={t('No warranties match the filter')} />}
      />
    </div>
  )
}
