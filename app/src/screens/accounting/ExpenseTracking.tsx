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
  Approved: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Pending: ['rgba(249,115,22,.1)', '#F97316'],
  Rejected: ['rgba(100,116,139,.1)', '#64748B'],
}

const CATEGORIES = ['All', 'Rent', 'Utilities', 'Salaries', 'Supplies', 'Travel', 'Maintenance', 'Insurance', 'Misc'] as const

export function ExpenseTracking() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
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

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Receipt"
          title={t('Expense Tracking')}
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
          {filtered.map((e) => {
            const [bg, fg] = STATUS_PALETTE[e.status] ?? STATUS_PALETTE.Pending
            return (
              <MobileCard key={e.id}>
                <MobileCardHeader
                  title={e.id}
                  code
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(e.status)}
                    </Badge>
                  }
                />
                <MobileCardRow>{t(e.description)}</MobileCardRow>
                <MobileCardRow label={t('Category')}>{t(e.category)}</MobileCardRow>
                <MobileCardRow label={t('Date')}>
                  <span dir="ltr">{e.date}</span>
                </MobileCardRow>
                <MobileCardRow label={t('Amount')}>
                  <Money sar={e.amount} className="font-semibold text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Payment')}>{t(e.paymentMethod)}</MobileCardRow>
                <MobileCardRow label={t('By')}>{e.submittedBy}</MobileCardRow>
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
        icon="Receipt"
        title={t('Expense Tracking')}
        subtitle={t('Track and approve expense submissions')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Expenses')}
        subtitle={t('All expense submissions with approval status')}
        toolbar={
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('ID, description or submitter')}
                aria-label={t('Search expenses')}
                className="h-10 rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Category')}</span>
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                aria-label={t('Filter by category')}
                className="h-10 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? t('All Categories') : t(c)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('ID')}</th>
                <th className="py-2.5 text-start font-medium">{t('Date')}</th>
                <th className="py-2.5 text-start font-medium">{t('Description')}</th>
                <th className="py-2.5 text-start font-medium">{t('Category')}</th>
                <th className="py-2.5 text-end font-medium">{t('Amount')}</th>
                <th className="py-2.5 text-start font-medium">{t('Payment')}</th>
                <th className="py-2.5 text-start font-medium">{t('Submitted By')}</th>
                <th className="py-2.5 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const [bg, fg] = STATUS_PALETTE[e.status] ?? STATUS_PALETTE.Pending
                return (
                  <tr key={e.id} className="border-b border-border/50">
                    <td className="py-2.5">
                      <span className="font-mono text-[13px]" dir="ltr">{e.id}</span>
                    </td>
                    <td className="py-2.5 text-[13px] text-muted" dir="ltr">{e.date}</td>
                    <td className="py-2.5 text-[13px] text-body">{t(e.description)}</td>
                    <td className="py-2.5 text-[13px] text-body">{t(e.category)}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={e.amount} className="font-semibold" />
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{t(e.paymentMethod)}</td>
                    <td className="py-2.5 text-[13px] text-body">{e.submittedBy}</td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(e.status)}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">{t('No expenses match the filter')}</p>
        )}
      </Section>
    </div>
  )
}
