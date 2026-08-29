import { useMemo } from 'react'
import { useIsMobile } from '@/lib/useMediaQuery'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { BarList, CHART_COLORS, Donut } from '@/components/ui/Charts'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import { fromHalalas } from '@/screens/finance/money'
import { useTrialBalance } from './useFinanceReports'

/** The reporting screens.
 *
 *  Figures derive from the ledger tables where the data exists, so a report and
 *  the ledger it summarises cannot disagree. The design hardcoded both sides
 *  independently, which is how a P&L ends up not matching its own journal. */

function ExportButtons() {
  const { t } = usePreferences()
  return (
    <>
      <Button variant="subtle" size="md" disabled={!isLive}>
        <Icon name="FileDown" size={15} />
        {t('Export')}
      </Button>
      <Button variant="subtle" size="md" onClick={() => window.print()}>
        <Icon name="Printer" size={15} />
        {t('Print')}
      </Button>
    </>
  )
}

/** Aggregates the ledger once, for every report that needs it. */
function useLedgerTotals() {
  const { data: accounts = [], isLoading: aL, isError: aE, error: aErr, refetch: aR } = useCollection('chartOfAccounts')
  const { data: expenses = [], isLoading: eL } = useCollection('expenses')
  const { data: invoices = [], isLoading: iL } = useCollection('invoices')

  const isLoading = aL || eL || iL
  const isError = aE
  const error = aErr
  const refetch = aR

  const totals = useMemo(() => {
    const byType = (type: string) =>
      accounts.filter((a) => a.type === type).reduce((sum, a) => sum + parseSar(a.balance), 0)

    const assets = byType('Assets')
    const liabilities = byType('Liabilities')
    const equity = byType('Equity')
    const revenue = byType('Revenue')
    const expenseAccounts = byType('Expense')

    const expenseClaims = expenses.reduce((sum, e) => sum + parseSar(e.amount), 0)
    const receivable = invoices
      .filter((i) => i.status !== 'paid')
      .reduce((sum, i) => sum + parseSar(i.amount), 0)

    return {
      accounts,
      expenses,
      assets,
      liabilities,
      equity,
      revenue,
      expenseAccounts,
      expenseClaims,
      receivable,
      profit: revenue - expenseAccounts,
    }
  }, [accounts, expenses, invoices])

  return { ...totals, isLoading, isError, error, refetch }
}

// ── Financial reports ───────────────────────────────────────────────────────
export function FinancialReports() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { isLoading, isError, error, refetch, ...totals } = useLedgerTotals()

  const stats: Stat[] = [
    { label: 'Revenue', value: formatSar(totals.revenue), caption: 'Period to date', highlight: true },
    { label: 'Expenses', value: formatSar(totals.expenseAccounts), caption: 'Period to date', tone: 'warning' },
    { label: 'Net Profit', value: formatSar(totals.profit), caption: 'Revenue less expenses', tone: 'info' },
    { label: 'Receivable', value: formatSar(totals.receivable), caption: 'Outstanding invoices' },
  ]

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const expense of totals.expenses) {
      map.set(expense.category, (map.get(expense.category) ?? 0) + parseSar(expense.amount))
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }, [totals.expenses])

  if (isLoading) return <Loading label={t('Loading reports...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="TrendingUp" title={t('Financial Reports')} />
        <StatRow stats={stats} />
        <Section title={t('Profit & Loss')} subtitle={t('Derived from the chart of accounts')}>
          <BarList
            rows={[
              { label: 'Revenue', value: totals.revenue },
              { label: 'Expense', value: totals.expenseAccounts },
              { label: 'Net Profit', value: Math.max(0, totals.profit) },
            ]}
          />
        </Section>
        <Section title={t('Expenses by Category')} subtitle={t('Approved and pending claims')}>
          {byCategory.length ? (
            <BarList rows={byCategory} />
          ) : (
            <p className="text-[13px] text-muted">{t('No expenses recorded')}</p>
          )}
        </Section>
        <Section title={t('Balance Sheet')} subtitle={t('Assets against liabilities and equity')}>
          <Donut
            segments={[
              { label: 'Assets', value: totals.assets },
              { label: 'Liabilities', value: totals.liabilities },
              { label: 'Equity', value: totals.equity },
            ]}
            centerValue={formatSar(totals.assets).replace('SAR ', '')}
            centerLabel="Assets"
          />
        </Section>
        {isLive ? <ServerLedgerSummary /> : null}
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="TrendingUp"
        title={t('Financial Reports')}
        subtitle={t('Balance sheet, P&L, cash flow and trial balance')}
        actions={<ExportButtons />}
      />
      <StatRow stats={stats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title={t('Profit & Loss')} subtitle={t('Derived from the chart of accounts')}>
          <BarList
            rows={[
              { label: 'Revenue', value: totals.revenue },
              { label: 'Expense', value: totals.expenseAccounts },
              { label: 'Net Profit', value: Math.max(0, totals.profit) },
            ]}
          />
        </Section>

        <Section title={t('Expenses by Category')} subtitle={t('Approved and pending claims')}>
          {byCategory.length ? (
            <BarList rows={byCategory} />
          ) : (
            <p className="text-[13px] text-muted">{t('No expenses recorded')}</p>
          )}
        </Section>
      </div>

      <Section title={t('Balance Sheet')} subtitle={t('Assets against liabilities and equity')}>
        <Donut
          segments={[
            { label: 'Assets', value: totals.assets },
            { label: 'Liabilities', value: totals.liabilities },
            { label: 'Equity', value: totals.equity },
          ]}
          centerValue={formatSar(totals.assets).replace('SAR ', '')}
          centerLabel="Assets"
        />
        {/* Assets must equal liabilities plus equity. Saying so where it fails
            beats letting it pass silently into a statement. */}
        {Math.abs(totals.assets - (totals.liabilities + totals.equity)) > 0.005 ? (
          <p className="flex items-center gap-2 rounded border border-salis-orange/30 bg-salis-orange/[.06] px-3 py-2 text-[13px] text-body">
            <Icon name="AlertTriangle" size={15} className="flex-shrink-0 text-salis-orange" />
            {t('Assets do not equal liabilities plus equity in the seeded ledger.')}
          </p>
        ) : null}
      </Section>

      {isLive ? <ServerLedgerSummary /> : null}
    </>
  )
}

/** The server-computed trial balance and balance sheet, live only (F-028).
 *
 *  The charts above derive from the chart-of-accounts rows the client holds;
 *  this section shows what `GET /accounting/reports/trial-balance` summed in
 *  SQL over the whole tenant scope — the P&L roll-up, the debit/credit totals,
 *  and the balance-sheet identity, which carries F-008's real imbalance
 *  (`balanced:false`). It is rendered honestly, not tied off; the imbalance
 *  banner above stays visible either way. `financeReports` is null on the
 *  fixtures, so this never mounts there. */
function ServerLedgerSummary() {
  const { t } = usePreferences()
  const query = useTrialBalance()

  if (query.isLoading) {
    return (
      <Section title={t('Trial balance (server-computed)')}>
        <Loading label={t('Loading the ledger roll-up…')} />
      </Section>
    )
  }
  if (query.error || !query.data) {
    return (
      <Section title={t('Trial balance (server-computed)')}>
        <ErrorState description={query.error?.message} onRetry={() => void query.refetch()} />
      </Section>
    )
  }

  const tb = query.data
  const bs = tb.balanceSheet
  const rows: readonly { label: string; halalas: number; strong?: boolean; warn?: boolean }[] = [
    { label: t('Total debits'), halalas: tb.totals.debitHalalas },
    { label: t('Total credits'), halalas: tb.totals.creditHalalas },
    { label: t('Assets'), halalas: bs.assetsHalalas },
    { label: t('Liabilities + equity'), halalas: bs.liabilitiesPlusEquityHalalas },
    {
      label: t('Balance-sheet difference'),
      halalas: bs.differenceHalalas,
      strong: true,
      warn: !bs.balanced,
    },
  ]

  return (
    <Section
      title={t('Trial balance (server-computed)')}
      subtitle={t('Summed by the server over your organization, not in the browser')}
    >
      <div className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className={
              'flex items-center justify-between border-0 border-b border-solid border-border py-3 last:border-b-0 ' +
              (row.strong ? 'text-base font-bold text-heading' : 'text-[13px] text-body')
            }
          >
            <span>{row.label}</span>
            <Money
              sar={fromHalalas(row.halalas)}
              className={row.warn ? 'font-semibold text-salis-orange' : row.strong ? 'font-bold' : ''}
            />
          </div>
        ))}
      </div>
      {bs.balanced ? null : (
        <p className="mt-2 flex items-center gap-2 rounded border border-salis-orange/30 bg-salis-orange/[.06] px-3 py-2 text-[13px] text-body">
          <Icon name="AlertTriangle" size={15} className="flex-shrink-0 text-salis-orange" />
          {t('The server confirms assets do not equal liabilities plus equity — the books are not tied off.')}
        </p>
      )}
    </Section>
  )
}

// ── Financial statements ────────────────────────────────────────────────────
export function FinancialStatements() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { isLoading, isError, error, refetch, ...totals } = useLedgerTotals()

  const rows: readonly { label: string; value: number; strong?: boolean }[] = [
    { label: 'Revenue', value: totals.revenue },
    { label: 'Expense', value: totals.expenseAccounts },
    { label: 'Net Profit', value: totals.profit, strong: true },
    { label: 'Assets', value: totals.assets },
    { label: 'Liabilities', value: totals.liabilities },
    { label: 'Equity', value: totals.equity, strong: true },
  ]

  if (isLoading) return <Loading label={t('Loading statements...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="FileText" title={t('Financial Statements')} />
        <Section title={t('Statement Summary')} subtitle={t('Figures derive from the chart of accounts')}>
          <div className="flex flex-col">
            {rows.map((row) => (
              <div
                key={row.label}
                className={
                  'flex items-center justify-between border-b border-border py-3 last:border-b-0 ' +
                  (row.strong ? 'text-base font-bold text-heading' : 'text-[13px] text-body')
                }
              >
                <span>{t(row.label)}</span>
                <Money sar={row.value} className={row.strong ? 'font-bold' : ''} />
              </div>
            ))}
          </div>
        </Section>
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="FileText"
        title={t('Financial Statements')}
        subtitle={t('IFRS statements for the current period')}
        actions={<ExportButtons />}
      />
      <Section title={t('Statement Summary')} subtitle={t('Figures derive from the chart of accounts')}>
        <div className="flex flex-col">
          {rows.map((row) => (
            <div
              key={row.label}
              className={
                'flex items-center justify-between border-b border-border py-3 last:border-b-0 ' +
                (row.strong ? 'text-base font-bold text-heading' : 'text-[13px] text-body')
              }
            >
              <span>{t(row.label)}</span>
              <Money sar={row.value} className={row.strong ? 'font-bold' : ''} />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ── Executive / operational reports ─────────────────────────────────────────
export function ExecutiveReports() {
  const { t } = usePreferences()
  const { fieldHidden } = useSession()
  const isMobile = useIsMobile()
  const { isLoading, isError, error, refetch, ...totals } = useLedgerTotals()
  const { data: jobs = [] } = useCollection('jobs')
  const { data: customers = [] } = useCollection('customers')

  const hidePnl = fieldHidden('Branch P&L')

  if (isLoading) return <Loading label={t('Loading reports...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="BarChart3" title={t('Executive Reports')} />
        <StatRow stats={[
          { label: 'Revenue', value: hidePnl ? '---' : formatSar(totals.revenue), caption: 'Period to date', highlight: true },
          { label: 'Net Profit', value: hidePnl ? '---' : formatSar(totals.profit), caption: 'Revenue less expenses', tone: 'info' },
        ]} />
        {hidePnl ? (
          <Section title={t('Branch P&L')}>
            <p className="flex items-center gap-2 text-[13px] text-muted">
              <Icon name="Lock" size={15} className="text-salis-blue" />
              {t('Branch P&L is not visible to your role.')}
            </p>
          </Section>
        ) : (
          <Section title={t('Revenue vs Expense')} subtitle={t('Across the reporting period')}>
            <BarList rows={[
              { label: 'Revenue', value: totals.revenue },
              { label: 'Expense', value: totals.expenseAccounts },
            ]} />
          </Section>
        )}
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="BarChart3"
        title={t('Executive Reports')}
        subtitle={t('Board and CEO level KPIs')}
        actions={<ExportButtons />}
      />
      <StatRow
        stats={[
          {
            label: 'Revenue',
            value: hidePnl ? '—' : formatSar(totals.revenue),
            caption: 'Period to date',
            highlight: true,
          },
          {
            label: 'Net Profit',
            value: hidePnl ? '—' : formatSar(totals.profit),
            caption: 'Revenue less expenses',
            tone: 'info',
          },
          { label: 'Active Jobs', value: jobs.length, caption: 'In the workshop' },
          { label: 'Customers', value: customers.length, caption: 'On the books' },
        ]}
      />

      {hidePnl ? (
        <Section title={t('Branch P&L')}>
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <Icon name="Lock" size={15} className="text-salis-blue" />
            {t('Branch P&L is not visible to your role.')}
          </p>
        </Section>
      ) : (
        <Section title={t('Revenue vs Expense')} subtitle={t('Across the reporting period')}>
          <BarList
            rows={[
              { label: 'Revenue', value: totals.revenue },
              { label: 'Expense', value: totals.expenseAccounts },
            ]}
          />
        </Section>
      )}
    </>
  )
}

export function OperationalReports() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: jobs = [] } = useCollection('jobs')
  const { data: appointments = [] } = useCollection('appointments')
  const { data: technicians = [] } = useCollection('technicians')

  const byStatus = useMemo(() => {
    const map = new Map<string, number>()
    for (const job of jobs) map.set(job.st, (map.get(job.st) ?? 0) + 1)
    return [...map.entries()].map(([label, value]) => ({
      label: label.replace(/_/g, ' '),
      value,
    }))
  }, [jobs])

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="ClipboardList" title={t('Operational Reports')} />
        <StatRow
          stats={[
            { label: 'Job Cards', value: jobs.length, caption: 'In this period', highlight: true },
            { label: 'Appointments', value: appointments.length, caption: 'Booked', tone: 'info' },
            { label: 'Technicians', value: technicians.length, caption: 'On strength' },
          ]}
        />
        <Section title={t('Jobs by Status')}>
          <div className="flex flex-col gap-3">
            {byStatus.map((row, index) => (
              <div key={row.label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="capitalize text-body">{t(row.label)}</span>
                  <span className="font-mono font-semibold text-heading" dir="ltr">
                    {row.value}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-inset">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(row.value / Math.max(1, jobs.length)) * 100}%`,
                      background: CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
        <Section title={t('Technician Load')}>
          <div className="flex flex-col gap-3">
            {technicians.map((tech, index) => (
              <div key={tech.name} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="text-body">{tech.name}</span>
                  <span className="font-mono font-semibold text-heading" dir="ltr">
                    {tech.jobs}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-inset">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(tech.jobs / Math.max(...technicians.map((x) => x.jobs), 1)) * 100}%`,
                      background: CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="Activity"
        title={t('Operational Reports')}
        subtitle={t('Workshop throughput, bookings and technician load')}
        actions={<ExportButtons />}
      />
      <StatRow
        stats={[
          { label: 'Job Cards', value: jobs.length, caption: 'In this period', highlight: true },
          { label: 'Appointments', value: appointments.length, caption: 'Booked', tone: 'info' },
          { label: 'Technicians', value: technicians.length, caption: 'On strength' },
          {
            label: 'Jobs per Technician',
            value: technicians.length ? (jobs.length / technicians.length).toFixed(1) : '0.0',
            caption: 'Average load',
          },
        ]}
      />

      <Section title={t('Jobs by Status')} subtitle={t('Current distribution')}>
        <div className="flex flex-col gap-3">
          {byStatus.map((row, index) => (
            <div key={row.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="capitalize text-body">{t(row.label)}</span>
                <span className="font-mono font-semibold text-heading" dir="ltr">
                  {row.value}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-inset">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(row.value / Math.max(1, jobs.length)) * 100}%`,
                    background: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('Technician Load')} subtitle={t('Active jobs per technician')}>
        <div className="flex flex-col gap-3">
          {technicians.map((tech, index) => (
            <div key={tech.name} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="text-body">{tech.name}</span>
                <span className="font-mono font-semibold text-heading" dir="ltr">
                  {tech.jobs}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-inset">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(tech.jobs / Math.max(...technicians.map((x) => x.jobs), 1)) * 100}%`,
                    background: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ── BI dashboard ────────────────────────────────────────────────────────────
export function BIDashboard() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { isLoading, isError, error, refetch, ...totals } = useLedgerTotals()
  const { data: jobs = [] } = useCollection('jobs')

  const bySvc = useMemo(() => {
    const map = new Map<string, number>()
    for (const job of jobs) map.set(job.svc.replace(/_/g, ' '), (map.get(job.svc.replace(/_/g, ' ')) ?? 0) + 1)
    return [...map.entries()].map(([label, value]) => ({ label, value }))
  }, [jobs])

  if (isLoading) return <Loading label={t('Loading dashboard...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="PieChart" title={t('BI Dashboard')} />
        <StatRow stats={[
          { label: 'Revenue', value: formatSar(totals.revenue), caption: 'Period to date', highlight: true },
          { label: 'Receivable', value: formatSar(totals.receivable), caption: 'Outstanding', tone: 'warning' },
        ]} />
        <Section title={t('Jobs by Service')}>
          <Donut segments={bySvc} centerValue={String(jobs.length)} centerLabel="jobs" />
        </Section>
        <Section title={t('Ledger Composition')}>
          <BarList rows={[
            { label: 'Assets', value: totals.assets },
            { label: 'Liabilities', value: totals.liabilities },
            { label: 'Equity', value: totals.equity },
            { label: 'Revenue', value: totals.revenue },
            { label: 'Expense', value: totals.expenseAccounts },
          ]} />
        </Section>
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="PieChart"
        title={t('BI Dashboard')}
        subtitle={t('Cross-module analytics')}
        actions={<ExportButtons />}
      />
      <StatRow
        stats={[
          { label: 'Revenue', value: formatSar(totals.revenue), caption: 'Period to date', highlight: true },
          { label: 'Receivable', value: formatSar(totals.receivable), caption: 'Outstanding', tone: 'warning' },
          { label: 'Job Cards', value: jobs.length, caption: 'Active', tone: 'info' },
          { label: 'Accounts', value: totals.accounts.length, caption: 'In the ledger' },
        ]}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title={t('Jobs by Service')}>
          <Donut
            segments={bySvc}
            centerValue={String(jobs.length)}
            centerLabel="jobs"
          />
        </Section>
        <Section title={t('Ledger Composition')}>
          <BarList
            rows={[
              { label: 'Assets', value: totals.assets },
              { label: 'Liabilities', value: totals.liabilities },
              { label: 'Equity', value: totals.equity },
              { label: 'Revenue', value: totals.revenue },
              { label: 'Expense', value: totals.expenseAccounts },
            ]}
          />
        </Section>
      </div>
    </>
  )
}
