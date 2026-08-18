import { useMemo } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'

/** Trial Balance screen — spec-only build.
 *
 *  Shows the trial balance with opening balance, period debit/credit, and
 *  closing balance for each account. The bottom row totals confirm the
 *  ledger balances (debits must equal credits). */

interface TrialBalanceRow {
  code: string
  name: string
  opening: number
  debit: number
  credit: number
  closing: number
}

const MOCK_ROWS: readonly TrialBalanceRow[] = [
  { code: '1001', name: 'Cash in Hand', opening: 100000, debit: 245000, credit: 120000, closing: 225000 },
  { code: '1002', name: 'Bank – Al Rajhi', opening: 750000, debit: 1850000, credit: 980000, closing: 1620000 },
  { code: '1003', name: 'Accounts Receivable', opening: 140000, debit: 520000, credit: 340000, closing: 320000 },
  { code: '1004', name: 'Inventory – Parts', opening: 200000, debit: 380000, credit: 195000, closing: 385000 },
  { code: '2001', name: 'Accounts Payable', opening: 180000, debit: 150000, credit: 410000, closing: 440000 },
  { code: '2002', name: 'VAT Payable', opening: 60000, debit: 45000, credit: 128000, closing: 143000 },
  { code: '3001', name: 'Owner Equity', opening: 500000, debit: 0, credit: 0, closing: 500000 },
  { code: '3002', name: 'Retained Earnings', opening: 250000, debit: 0, credit: 70000, closing: 320000 },
  { code: '4001', name: 'Service Revenue', opening: 0, debit: 0, credit: 1450000, closing: 1450000 },
  { code: '4002', name: 'Parts Sales', opening: 0, debit: 0, credit: 680000, closing: 680000 },
  { code: '5001', name: 'Salaries & Wages', opening: 0, debit: 620000, credit: 0, closing: 620000 },
  { code: '5002', name: 'Rent Expense', opening: 0, debit: 180000, credit: 0, closing: 180000 },
  { code: '5003', name: 'Utilities', opening: 0, debit: 45000, credit: 0, closing: 45000 },
  { code: '5004', name: 'Parts Cost of Goods', opening: 0, debit: 480000, credit: 0, closing: 480000 },
]

export function TrialBalance() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totals = useMemo(() => {
    let debit = 0
    let credit = 0
    for (const row of MOCK_ROWS) {
      debit += row.debit
      credit += row.credit
    }
    return { debit, credit, difference: debit - credit, count: MOCK_ROWS.length }
  }, [])

  const balanced = Math.abs(totals.difference) < 0.005

  const stats: Stat[] = [
    { label: 'Total Debit', value: formatSar(totals.debit), caption: 'Period total', highlight: true },
    { label: 'Total Credit', value: formatSar(totals.credit), caption: 'Period total' },
    {
      label: 'Difference',
      value: formatSar(totals.difference),
      caption: balanced ? 'Balanced' : 'Out of balance',
      tone: balanced ? 'info' : 'warning',
    },
    { label: 'Accounts', value: totals.count, caption: 'In trial balance' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Scale"
          title={t('Trial Balance')}
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
          {MOCK_ROWS.map((row) => (
            <MobileCard key={row.code}>
              <MobileCardHeader title={row.code} code />
              <MobileCardRow>{t(row.name)}</MobileCardRow>
              <MobileCardRow label={t('Opening')}>
                <Money sar={row.opening} className="text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Debit')}>
                <Money sar={row.debit} className="text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Credit')}>
                <Money sar={row.credit} className="text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Closing')}>
                <Money sar={row.closing} className="font-semibold text-heading" />
              </MobileCardRow>
            </MobileCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Scale"
        title={t('Trial Balance')}
        subtitle={t('Debit and credit columns with period totals')}
      />
      <StatRow stats={stats} />

      {!balanced && (
        <div className="flex items-center gap-2 rounded-lg border border-salis-orange/30 bg-[rgba(249,115,22,.06)] px-4 py-3 text-[13px] text-body">
          <Icon name="AlertTriangle" size={16} className="flex-shrink-0 text-salis-orange" />
          {t('The trial balance does not balance — total debits do not equal total credits.')}
        </div>
      )}

      <Section title={t('Trial Balance Report')} subtitle={t('Opening, period activity and closing balances')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Account Code')}</th>
                <th className="py-2.5 text-start font-medium">{t('Account Name')}</th>
                <th className="py-2.5 text-end font-medium">{t('Opening Balance')}</th>
                <th className="py-2.5 text-end font-medium">{t('Debit')}</th>
                <th className="py-2.5 text-end font-medium">{t('Credit')}</th>
                <th className="py-2.5 text-end font-medium">{t('Closing Balance')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map((row) => (
                <tr key={row.code} className="border-b border-border/50">
                  <td className="py-2.5">
                    <span className="font-mono text-[13px]" dir="ltr">{row.code}</span>
                  </td>
                  <td className="py-2.5 text-[13px] text-body">{t(row.name)}</td>
                  <td className="py-2.5 text-end">
                    <Money sar={row.opening} />
                  </td>
                  <td className="py-2.5 text-end">
                    <Money sar={row.debit} />
                  </td>
                  <td className="py-2.5 text-end">
                    <Money sar={row.credit} />
                  </td>
                  <td className="py-2.5 text-end">
                    <Money sar={row.closing} className="font-semibold" />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-bold text-heading">
                <td className="py-3 text-[13px]" colSpan={2}>{t('Totals')}</td>
                <td className="py-3 text-end">
                  <Money sar={MOCK_ROWS.reduce((s, r) => s + r.opening, 0)} className="font-bold" />
                </td>
                <td className="py-3 text-end">
                  <Money sar={totals.debit} className="font-bold" />
                </td>
                <td className="py-3 text-end">
                  <Money sar={totals.credit} className="font-bold" />
                </td>
                <td className="py-3 text-end">
                  <Money sar={MOCK_ROWS.reduce((s, r) => s + r.closing, 0)} className="font-bold" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>
    </div>
  )
}
