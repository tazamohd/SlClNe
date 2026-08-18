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

/** General Ledger screen — spec-only build.
 *
 *  Lists all ledger accounts with their debit, credit and balance figures,
 *  filterable by date range and account type. All amounts are mock data;
 *  a live build would source these from the server's chart-of-accounts
 *  and journal-entry aggregates. */

const ACCOUNT_TYPES = ['All', 'Assets', 'Liabilities', 'Equity', 'Revenue', 'Expense'] as const

interface LedgerAccount {
  code: string
  name: string
  type: string
  debit: number
  credit: number
  balance: number
}

const MOCK_ACCOUNTS: readonly LedgerAccount[] = [
  { code: '1001', name: 'Cash in Hand', type: 'Assets', debit: 245000, credit: 120000, balance: 125000 },
  { code: '1002', name: 'Bank – Al Rajhi', type: 'Assets', debit: 1850000, credit: 980000, balance: 870000 },
  { code: '1003', name: 'Accounts Receivable', type: 'Assets', debit: 520000, credit: 340000, balance: 180000 },
  { code: '1004', name: 'Inventory – Parts', type: 'Assets', debit: 380000, credit: 195000, balance: 185000 },
  { code: '2001', name: 'Accounts Payable', type: 'Liabilities', debit: 150000, credit: 410000, balance: -260000 },
  { code: '2002', name: 'VAT Payable', type: 'Liabilities', debit: 45000, credit: 128000, balance: -83000 },
  { code: '2003', name: 'Accrued Expenses', type: 'Liabilities', debit: 20000, credit: 95000, balance: -75000 },
  { code: '3001', name: 'Owner Equity', type: 'Equity', debit: 0, credit: 500000, balance: -500000 },
  { code: '3002', name: 'Retained Earnings', type: 'Equity', debit: 0, credit: 320000, balance: -320000 },
  { code: '4001', name: 'Service Revenue', type: 'Revenue', debit: 0, credit: 1450000, balance: -1450000 },
  { code: '4002', name: 'Parts Sales', type: 'Revenue', debit: 0, credit: 680000, balance: -680000 },
  { code: '5001', name: 'Salaries & Wages', type: 'Expense', debit: 620000, credit: 0, balance: 620000 },
  { code: '5002', name: 'Rent Expense', type: 'Expense', debit: 180000, credit: 0, balance: 180000 },
  { code: '5003', name: 'Utilities', type: 'Expense', debit: 45000, credit: 0, balance: 45000 },
  { code: '5004', name: 'Parts Cost of Goods', type: 'Expense', debit: 480000, credit: 0, balance: 480000 },
]

const TYPE_PALETTE: Record<string, readonly [string, string]> = {
  Assets: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Liabilities: ['rgba(249,115,22,.1)', '#F97316'],
  Equity: ['rgba(11,31,59,.1)', '#0B1F3B'],
  Revenue: ['rgba(11,179,255,.1)', '#0BB3FF'],
  Expense: ['rgba(100,116,139,.1)', '#64748B'],
}

export function GeneralLedger() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_ACCOUNTS.filter((a) => typeFilter === 'All' || a.type === typeFilter).filter(
      (a) =>
        !needle ||
        a.code.toLowerCase().includes(needle) ||
        a.name.toLowerCase().includes(needle)
    )
  }, [typeFilter, query])

  const totals = useMemo(() => {
    let debit = 0
    let credit = 0
    for (const a of MOCK_ACCOUNTS) {
      debit += a.debit
      credit += a.credit
    }
    return { debit, credit, balance: debit - credit, count: MOCK_ACCOUNTS.length }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Accounts', value: totals.count, caption: 'In the ledger', highlight: true },
    { label: 'Total Debit', value: formatSar(totals.debit), caption: 'All accounts' },
    { label: 'Total Credit', value: formatSar(totals.credit), caption: 'All accounts' },
    { label: 'Net Balance', value: formatSar(totals.balance), caption: 'Debit minus credit', tone: 'info' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="BookOpen"
          title={t('General Ledger')}
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
          {filtered.map((a) => {
            const [bg, fg] = TYPE_PALETTE[a.type] ?? TYPE_PALETTE.Expense
            return (
              <MobileCard key={a.code}>
                <MobileCardHeader
                  title={a.code}
                  code
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(a.type)}
                    </Badge>
                  }
                />
                <MobileCardRow>{t(a.name)}</MobileCardRow>
                <MobileCardRow label={t('Debit')}>
                  <Money sar={a.debit} className="text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Credit')}>
                  <Money sar={a.credit} className="text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Balance')}>
                  <Money sar={a.balance} className="font-semibold text-heading" />
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
        icon="BookOpen"
        title={t('General Ledger')}
        subtitle={t('Account listing with balances and date filters')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Ledger Accounts')}
        subtitle={t('All accounts with debit, credit and balance')}
        toolbar={
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Code or name')}
                aria-label={t('Search accounts')}
                className="h-10 rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Account Type')}</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label={t('Filter by account type')}
                className="h-10 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? t('All Types') : t(type)}
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
                <th className="py-2.5 text-start font-medium">{t('Account Code')}</th>
                <th className="py-2.5 text-start font-medium">{t('Account Name')}</th>
                <th className="py-2.5 text-start font-medium">{t('Type')}</th>
                <th className="py-2.5 text-end font-medium">{t('Debit')}</th>
                <th className="py-2.5 text-end font-medium">{t('Credit')}</th>
                <th className="py-2.5 text-end font-medium">{t('Balance')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const [bg, fg] = TYPE_PALETTE[a.type] ?? TYPE_PALETTE.Expense
                return (
                  <tr key={a.code} className="border-b border-border/50">
                    <td className="py-2.5">
                      <span className="font-mono text-[13px]" dir="ltr">{a.code}</span>
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{t(a.name)}</td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(a.type)}</Badge>
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={a.debit} />
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={a.credit} />
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={a.balance} className="font-semibold" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">{t('No accounts match the filter')}</p>
        )}
      </Section>
    </div>
  )
}
