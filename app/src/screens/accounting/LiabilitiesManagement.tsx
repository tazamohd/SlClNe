import { useMemo, useState } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'

interface Liability {
  code: string
  name: string
  type: string
  amount: number
  dueDate: string
  creditor: string
  status: string
}

const MOCK_LIABILITIES: readonly Liability[] = [
  { code: 'LIA-001', name: 'Accounts Payable – Parts', type: 'Current', amount: 185000_00, dueDate: '2026-09-15', creditor: 'Al-Futtaim Parts', status: 'Active' },
  { code: 'LIA-002', name: 'VAT Payable', type: 'Current', amount: 42000_00, dueDate: '2026-08-30', creditor: 'ZATCA', status: 'Active' },
  { code: 'LIA-003', name: 'Bank Loan – Equipment', type: 'Long-term', amount: 350000_00, dueDate: '2029-06-01', creditor: 'Al Rajhi Bank', status: 'Active' },
  { code: 'LIA-004', name: 'Lease Liability – Premises', type: 'Long-term', amount: 720000_00, dueDate: '2031-12-31', creditor: 'Saudi Real Estate Co', status: 'Active' },
  { code: 'LIA-005', name: 'Supplier Invoice – Overdue', type: 'Current', amount: 28500_00, dueDate: '2026-07-01', creditor: 'Quick Parts LLC', status: 'Overdue' },
  { code: 'LIA-006', name: 'Insurance Premium – Settled', type: 'Current', amount: 15000_00, dueDate: '2026-06-15', creditor: 'Tawuniya Insurance', status: 'Paid' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Paid: ['rgba(100,116,139,.1)', '#64748B'],
  Overdue: ['rgba(249,115,22,.1)', '#F97316'],
}

export function LiabilitiesManagement() {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_LIABILITIES.filter(
      (l) =>
        !needle ||
        l.code.toLowerCase().includes(needle) ||
        l.name.toLowerCase().includes(needle) ||
        l.creditor.toLowerCase().includes(needle)
    )
  }, [query])

  const totals = useMemo(() => {
    let total = 0
    let current = 0
    let longTerm = 0
    let overdue = 0
    for (const l of MOCK_LIABILITIES) {
      total += l.amount
      if (l.type === 'Current') current += l.amount
      if (l.type === 'Long-term') longTerm += l.amount
      if (l.status === 'Overdue') overdue++
    }
    return { total, current, longTerm, overdue }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Liabilities', value: formatSar(totals.total), caption: 'All obligations', highlight: true },
    { label: 'Current', value: formatSar(totals.current), caption: 'Due within 12 months' },
    { label: 'Long-term', value: formatSar(totals.longTerm), caption: 'Due after 12 months' },
    { label: 'Overdue', value: totals.overdue, caption: 'Requires attention', tone: 'warning' },
  ]

  const columns: Column<Liability>[] = [
    { header: 'Code', cell: (l) => l.code, code: true },
    { header: 'Name', cell: (l) => t(l.name) },
    { header: 'Type', cell: (l) => t(l.type) },
    { header: 'Amount', cell: (l) => <Money sar={l.amount} className="font-semibold" />, className: 'text-end' },
    { header: 'Due Date', cell: (l) => <span dir="ltr" className="text-muted">{l.dueDate}</span> },
    { header: 'Creditor', cell: (l) => l.creditor },
    { header: 'Status', cell: (l) => {
      const [bg, fg] = STATUS_PALETTE[l.status] ?? STATUS_PALETTE.Active
      return <Badge background={bg} color={fg}>{t(l.status)}</Badge>
    } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Scale"
        title={t('Liabilities Management')}
        subtitle={t('Current and long-term obligations')}
      />
      <StatRow stats={stats} />

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Code, name or creditor')}
          aria-label={t('Search liabilities')}
          inputSize="sm"
        />
      </label>

      <DataTable
        caption="Liabilities"
        columns={columns}
        rows={filtered}
        rowKey={(l) => l.code}
        mobileCard={(l) => {
          const [bg, fg] = STATUS_PALETTE[l.status] ?? STATUS_PALETTE.Active
          return (
            <>
              <MobileCardHeader title={l.code} code trailing={<Badge background={bg} color={fg}>{t(l.status)}</Badge>} />
              <MobileCardRow>{t(l.name)}</MobileCardRow>
              <MobileCardRow label={t('Amount')}><Money sar={l.amount} className="font-semibold text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="Scale" title={t('No liabilities match the filter')} />}
      />
    </div>
  )
}
