import { useMemo } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'
import { financeReports } from '@/data/repository'
import { fromHalalas } from '@/screens/finance/money'
import { AGGREGATE_GAP } from './reporting'
import { ReportGap, ServerTotalsNote } from './ReportControls'
import { useTrialBalance } from './useFinanceReports'

/** Income Statement — Revenue and Expense accounts from
 *  `GET /accounting/reports/trial-balance` (F-028). Each line item is one
 *  revenue or expense account's own server-computed balance; Total Revenue,
 *  Total Expenses and Net Income are `profitAndLoss.revenueHalalas` /
 *  `expenseHalalas` / `netHalalas` as the server returned them, not re-summed
 *  from the line items shown — the margin is the one ratio computed here,
 *  over those two already-final server totals.
 *
 *  This used to be fifteen hand-written line items with a docstring admitting
 *  "spec-only build." There is no fixture fallback: a build with no API
 *  names the gap (`ReportGap`) instead. */

interface LineItem {
  code: string
  name: string
  amountHalalas: number
}

function StatementBlock({
  title,
  icon,
  items,
  subtotalLabel,
  subtotalHalalas,
  accentColor,
}: {
  title: string
  icon: string
  items: readonly LineItem[]
  subtotalLabel: string
  subtotalHalalas: number
  accentColor: string
}) {
  const { t } = usePreferences()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex rounded-lg p-2" style={{ background: `${accentColor}18` }}>
          <Icon name={icon} size={18} style={{ color: accentColor }} />
        </span>
        <h2 className="font-display text-base font-bold text-heading">{t(title)}</h2>
      </div>
      <div className="flex flex-col">
        {items.length === 0 ? (
          <p className="py-2.5 text-[13px] text-muted">{t('No accounts of this type')}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.code}
              className="flex items-center justify-between border-b border-border/50 py-2.5 text-[13px] text-body"
            >
              <span>{t(item.name)}</span>
              <Money sar={fromHalalas(item.amountHalalas)} />
            </div>
          ))
        )}
        <div className="flex items-center justify-between py-3 text-sm font-bold text-heading">
          <span>{t(subtotalLabel)}</span>
          <Money sar={fromHalalas(subtotalHalalas)} className="font-bold" />
        </div>
      </div>
    </div>
  )
}

export function IncomeStatement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const trialBalance = useTrialBalance()

  const accounts = trialBalance.data?.accounts ?? []
  const revenue = useMemo(
    () => accounts.filter((a) => a.type === 'Revenue').map((a) => ({ code: a.code, name: a.name, amountHalalas: a.creditHalalas })),
    [accounts],
  )
  const expenses = useMemo(
    () => accounts.filter((a) => a.type === 'Expense').map((a) => ({ code: a.code, name: a.name, amountHalalas: a.debitHalalas })),
    [accounts],
  )

  const pnl = trialBalance.data?.profitAndLoss
  const margin =
    pnl && pnl.revenueHalalas > 0 ? ((pnl.netHalalas / pnl.revenueHalalas) * 100).toFixed(1) : '0.0'

  const stats: Stat[] = [
    { label: 'Total Revenue', value: pnl ? formatSar(fromHalalas(pnl.revenueHalalas)) : '—', caption: 'Current period', highlight: true },
    { label: 'Total Expenses', value: pnl ? formatSar(fromHalalas(pnl.expenseHalalas)) : '—', caption: 'Current period', tone: 'warning' },
    { label: 'Net Income', value: pnl ? formatSar(fromHalalas(pnl.netHalalas)) : '—', caption: 'Revenue less expenses', tone: 'info' },
    { label: 'Profit Margin', value: `${margin}%`, caption: 'Net income / revenue' },
  ]

  if (financeReports === null) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <FeatureHeader icon="TrendingUp" title={t('Income Statement')} subtitle={t('Revenue, expenses and net income')} />
        <ReportGap
          icon="TrendingUp"
          title={t('Income Statement')}
          collection={AGGREGATE_GAP.ledger}
          detail={t(
            'Revenue and expense totals are summed by the server over your whole organization. Connect the API to see them — no figures are estimated here.',
          )}
        />
      </div>
    )
  }

  if (trialBalance.isLoading) {
    return <Loading label={t('Loading the income statement…')} />
  }
  if (trialBalance.isError || !pnl) {
    return <ErrorState description={trialBalance.error?.message} onRetry={() => void trialBalance.refetch()} />
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="TrendingUp" title={t('Income Statement')} subtitle={t('Accounting')} />
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{t(stat.label)}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{stat.value}</p>
            </Card>
          ))}
        </div>
        <ServerTotalsNote endpoint="GET /accounting/reports/trial-balance" />
        {[
          { title: 'Revenue', items: revenue },
          { title: 'Expenses', items: expenses },
        ].map(({ title, items }) => (
          <div key={title} className="flex flex-col gap-2">
            <h2 className="font-display text-sm font-bold text-heading">{t(title)}</h2>
            {items.length === 0 ? (
              <p className="text-[13px] text-muted">{t('No accounts of this type')}</p>
            ) : (
              items.map((item) => (
                <MobileCard key={item.code}>
                  <MobileCardHeader leading={<span className="text-sm font-semibold text-heading">{t(item.name)}</span>} />
                  <MobileCardRow label={t('Amount')}>
                    <Money sar={fromHalalas(item.amountHalalas)} className="font-semibold text-heading" />
                  </MobileCardRow>
                </MobileCard>
              ))
            )}
          </div>
        ))}
        <Card className="rounded-lg p-4">
          <p className="text-[11px] font-medium text-muted">{t('Net Income')}</p>
          <p className="mt-1 font-display text-2xl font-black text-salis-blue" dir="ltr">
            {formatSar(fromHalalas(pnl.netHalalas))}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader icon="TrendingUp" title={t('Income Statement')} subtitle={t('Revenue, expenses and net income')} />
      <StatRow stats={stats} />
      <ServerTotalsNote endpoint="GET /accounting/reports/trial-balance" />

      <Section title={t('Income Statement')} subtitle={t('For the current reporting period')}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <StatementBlock
            title={t('Revenue')}
            icon="ArrowUpRight"
            items={revenue}
            subtotalLabel={t('Total Revenue')}
            subtotalHalalas={pnl.revenueHalalas}
            accentColor="var(--salis-blue)"
          />
          <StatementBlock
            title={t('Expenses')}
            icon="ArrowDownRight"
            items={expenses}
            subtotalLabel={t('Total Expenses')}
            subtotalHalalas={pnl.expenseHalalas}
            accentColor="var(--salis-orange)"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border-2 border-salis-blue/30 bg-salis-blue/[.04] px-5 py-4">
          <div>
            <p className="font-display text-sm font-bold text-heading">{t('Net Income')}</p>
            <p className="mt-0.5 text-xs text-muted">
              {t('Total Revenue')} - {t('Total Expenses')}
            </p>
          </div>
          <div className="text-end">
            <Money sar={fromHalalas(pnl.netHalalas)} className="font-display text-2xl font-black text-salis-blue" />
            <p className="mt-0.5 text-xs text-muted">
              {margin}% {t('margin')}
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}
