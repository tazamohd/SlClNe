import { useMemo, useState } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'

interface Expense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  paymentMethod: string
  status: string
  submittedBy: string
}

const MOCK_EXPENSES: readonly Expense[] = [
  { id: 'EXP-001', date: '2026-08-15', description: 'Monthly Office Rent', category: 'Rent', amount: 35000_00, paymentMethod: 'Bank', status: 'Approved', submittedBy: 'Nora Al-Qahtani' },
  { id: 'EXP-002', date: '2026-08-14', description: 'Electricity Bill – August', category: 'Utilities', amount: 4200_00, paymentMethod: 'Bank', status: 'Approved', submittedBy: 'Ahmed Al-Rashid' },
  { id: 'EXP-003', date: '2026-08-13', description: 'Staff Salaries – August', category: 'Salaries', amount: 85000_00, paymentMethod: 'Bank', status: 'Approved', submittedBy: 'Fahad Al-Otaibi' },
  { id: 'EXP-004', date: '2026-08-12', description: 'Workshop Cleaning Supplies', category: 'Supplies', amount: 1800_00, paymentMethod: 'Cash', status: 'Approved', submittedBy: 'Khalid Al-Harbi' },
  { id: 'EXP-005', date: '2026-08-11', description: 'Client Visit – Riyadh', category: 'Travel', amount: 3500_00, paymentMethod: 'Card', status: 'Pending', submittedBy: 'Salman Al-Dosari' },
  { id: 'EXP-006', date: '2026-08-10', description: 'AC Unit Repair', category: 'Maintenance', amount: 2800_00, paymentMethod: 'Cash', status: 'Approved', submittedBy: 'Ahmed Al-Rashid' },
  { id: 'EXP-007', date: '2026-08-09', description: 'Annual Vehicle Insurance', category: 'Insurance', amount: 12000_00, paymentMethod: 'Bank', status: 'Pending', submittedBy: 'Nora Al-Qahtani' },
  { id: 'EXP-008', date: '2026-08-08', description: 'Team Lunch – Planning Day', category: 'Misc', amount: 950_00, paymentMethod: 'Card', status: 'Rejected', submittedBy: 'Khalid Al-Harbi' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Approved: ['var(--tint-blue)', '#0A5ED7'],
  Pending: ['var(--tint-orange)', '#F97316'],
  Rejected: ['rgba(100,116,139,.1)', '#64748B'],
}

const CATEGORIES = ['All', 'Rent', 'Utilities', 'Salaries', 'Supplies', 'Travel', 'Maintenance', 'Insurance', 'Misc'] as const

export function ExpenseTracking() {
  const { t } = usePreferences()
  const [catFilter, setCatFilter] = useState<string>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_EXPENSES.filter((e) => catFilter === 'All' || e.category === catFilter).filter(
      (e) =>
        !needle ||
        e.id.toLowerCase().includes(needle) ||
        e.description.toLowerCase().includes(needle) ||
        e.submittedBy.toLowerCase().includes(needle)
    )
  }, [catFilter, query])

  const totals = useMemo(() => {
    let total = 0
    let approved = 0
    let pending = 0
    for (const e of MOCK_EXPENSES) {
      total += e.amount
      if (e.status === 'Approved') approved += e.amount
      if (e.status === 'Pending') pending += e.amount
    }
    const avgPerDay = Math.round(total / 30)
    return { total, approved, pending, avgPerDay }
  }, [])

  const stats: Stat[] = [
    { label: 'Total This Month', value: formatSar(totals.total), caption: 'All expenses', highlight: true },
    { label: 'Approved', value: formatSar(totals.approved), caption: 'Processed' },
    { label: 'Pending', value: formatSar(totals.pending), caption: 'Awaiting approval', tone: 'warning' },
    { label: 'Avg Per Day', value: formatSar(totals.avgPerDay), caption: 'Monthly average', tone: 'info' },
  ]

  const columns: Column<Expense>[] = [
    { header: 'ID', cell: (e) => e.id, code: true },
    { header: 'Date', cell: (e) => <span dir="ltr" className="text-muted">{e.date}</span> },
    { header: 'Description', cell: (e) => t(e.description) },
    { header: 'Category', cell: (e) => t(e.category) },
    { header: 'Amount', cell: (e) => <Money sar={e.amount} className="font-semibold" />, className: 'text-end' },
    { header: 'Payment', cell: (e) => t(e.paymentMethod) },
    { header: 'Submitted By', cell: (e) => e.submittedBy },
    { header: 'Status', cell: (e) => {
      const [bg, fg] = STATUS_PALETTE[e.status] ?? STATUS_PALETTE.Pending
      return <Badge background={bg} color={fg}>{t(e.status)}</Badge>
    } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Receipt"
        title={t('Expense Tracking')}
        subtitle={t('Track and approve expense submissions')}
      />
      <StatRow stats={stats} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ID, description or submitter')}
            aria-label={t('Search expenses')}
            inputSize="sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Category')}</span>
          <Select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            aria-label={t('Filter by category')}
            size="md"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? t('All Categories') : t(c)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <DataTable
        caption="Expense submissions"
        columns={columns}
        rows={filtered}
        rowKey={(e) => e.id}
        mobileCard={(e) => {
          const [bg, fg] = STATUS_PALETTE[e.status] ?? STATUS_PALETTE.Pending
          return (
            <>
              <MobileCardHeader title={e.id} code trailing={<Badge background={bg} color={fg}>{t(e.status)}</Badge>} />
              <MobileCardRow>{t(e.description)}</MobileCardRow>
              <MobileCardRow label={t('Amount')}><Money sar={e.amount} className="font-semibold text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="Receipt" title={t('No expenses match the filter')} />}
      />
    </div>
  )
}
