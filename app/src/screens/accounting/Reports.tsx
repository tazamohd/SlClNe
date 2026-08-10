import { useMemo } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

/** The reporting screens.
 *
 *  Figures derive from the ledger tables where the data exists, so a report and
 *  the ledger it summarises cannot disagree. The design hardcoded both sides
 *  independently, which is how a P&L ends up not matching its own journal. */

/** Brand-safe chart palette — the five `--chart-*` tokens, no green or red. */
const CHART_COLORS = ['#0A5ED7', '#0BB3FF', '#38BDF8', '#64748B', '#F97316']

/** Horizontal bar chart. Simple enough to draw inline; avoids pulling a chart
 *  library in for what the design draws as plain bars. */
function BarList({
  rows,
  total,
}: {
  rows: readonly { label: string; value: number }[]
  total?: number
}) {
  const { t } = usePreferences()
  const max = total ?? Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={row.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-body">{t(row.label)}</span>
            <Money sar={row.value} className="font-semibold text-heading" />
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-inset">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (row.value / max) * 100)}%`,
                background: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Donut built from a conic gradient, as the design's Job Status chart is. */
function Donut({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: readonly { label: string; value: number }[]
  centerValue: string
  centerLabel: string
}) {
  const { t } = usePreferences()
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  let cursor = 0
  const stops = segments
    .map((segment, index) => {
      const start = (cursor / total) * 100
      cursor += segment.value
      const end = (cursor / total) * 100
      return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${end}%`
    })
    .join(',')

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="relative h-[180px] w-[180px] flex-shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-card">
          <span className="font-display text-2xl font-black text-heading">{centerValue}</span>
          <span className="text-[11px] text-muted">{t(centerLabel)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((segment, index) => (
          <div key={segment.label} className="flex items-center gap-2 text-[13px]">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="min-w-[120px] text-body">{t(segment.label)}</span>
            <Money sar={segment.value} className="text-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ExportButtons() {
  const { t } = usePreferences()
  return (
    <>
      <Button variant="subtle" size="md">
        <Icon name="FileDown" size={15} />
        {t('Export')}
      </Button>
      <Button variant="subtle" size="md">
        <Icon name="Printer" size={15} />
        {t('Print')}
      </Button>
    </>
  )
}

/** Aggregates the ledger once, for every report that needs it. */
function useLedgerTotals() {
  const { data: accounts = [] } = useCollection('chartOfAccounts')
  const { data: expenses = [] } = useCollection('expenses')
  const { data: invoices = [] } = useCollection('invoices')

  return useMemo(() => {
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
}

// ── Financial reports ───────────────────────────────────────────────────────
export function FinancialReports() {
  const { t } = usePreferences()
  const totals = useLedgerTotals()

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
          <p className="flex items-center gap-2 rounded border border-salis-orange/30 bg-[rgba(249,115,22,.06)] px-3 py-2 text-[13px] text-body">
            <Icon name="AlertTriangle" size={15} className="flex-shrink-0 text-salis-orange" />
            {t('Assets do not equal liabilities plus equity in the seeded ledger.')}
          </p>
        ) : null}
      </Section>
    </>
  )
}

// ── Financial statements ────────────────────────────────────────────────────
export function FinancialStatements() {
  const { t } = usePreferences()
  const totals = useLedgerTotals()

  const rows: readonly { label: string; value: number; strong?: boolean }[] = [
    { label: 'Revenue', value: totals.revenue },
    { label: 'Expense', value: totals.expenseAccounts },
    { label: 'Net Profit', value: totals.profit, strong: true },
    { label: 'Assets', value: totals.assets },
    { label: 'Liabilities', value: totals.liabilities },
    { label: 'Equity', value: totals.equity, strong: true },
  ]

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
  const totals = useLedgerTotals()
  const { data: jobs = [] } = useCollection('jobs')
  const { data: customers = [] } = useCollection('customers')

  // Defence in depth. Today this never fires: every role in the Branch P&L
  // hidden list (advisor, technician, qc, parts, frontdesk, callcenter,
  // procurement, supplier, customer) is already denied `execreports` view by
  // the module gate, so they are redirected to Unauthorized before reaching
  // this screen. Kept so that widening execreports in PERMS can't silently
  // expose P&L figures — the field rule would then start applying here.
  const hidePnl = fieldHidden('Branch P&L')

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
  const totals = useLedgerTotals()
  const { data: jobs = [] } = useCollection('jobs')

  const bySvc = useMemo(() => {
    const map = new Map<string, number>()
    for (const job of jobs) map.set(job.svc.replace(/_/g, ' '), (map.get(job.svc.replace(/_/g, ' ')) ?? 0) + 1)
    return [...map.entries()].map(([label, value]) => ({ label, value }))
  }, [jobs])

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
