import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { BarList, CHART_COLORS } from '@/components/ui/Charts'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import {
  useCollection,
  useCreate,
  useDelete,
  usePagedCollection,
  type RowOf,
} from '@/data/useCollection'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { isLive, type CollectionKey } from '@/data/repository'
import { InvoiceStatusBadge } from '@/screens/finance/Invoices'
import { fromHalalas, invoiceMoney } from '@/screens/finance/money'
import {
  AggregateGapNotice,
  DateRangeFilter,
  ExportPrintActions,
  ServerScopeNote,
  ServerTotalsNote,
} from './ReportControls'
import { AGGREGATE_GAP, downloadCsv, inDateRange, rowDateIso, toCsv } from './reporting'
import { useInvoicesSummary, useTrialBalance } from './useFinanceReports'

/** The reporting suite: a hub, an analytics overview, a revenue report, and a
 *  report builder. They share one discipline, stated once here.
 *
 *  A report renders figures the server computed and never sums a money column
 *  itself. Where a screen counts things, it counts records; where it charts
 *  money, each bar or slice is one record's own server figure; where a period
 *  total is the natural thing to show, it shows `AggregateGapNotice` naming the
 *  endpoint that would compute it, because a browser adding up a paginated read
 *  is adding up one page. This is §A10: the server computes, the client displays.
 */

/* ══════════════════════════════════════════════ Reports — the hub ═════════ */

interface ReportLink {
  name: string
  description: string
  route: string
  icon: string
  module: string
  /** The collection whose server-side record count this card shows, if any. */
  countKey?: CollectionKey
  /** Named when the surface is honest about a missing server capability. */
  gapped?: boolean
}

const REPORT_LINKS: readonly ReportLink[] = [
  {
    name: 'Sales Reports',
    description: 'Revenue, VAT and receivable by invoice',
    route: '/sales-reports',
    icon: 'TrendingUp',
    module: 'invoices',
    countKey: 'invoices',
  },
  {
    name: 'Analytics Overview',
    description: 'Cross-module distributions and largest movers',
    route: '/reports-analytics',
    icon: 'PieChart',
    module: 'execreports',
  },
  {
    name: 'Tax Management',
    description: 'Output VAT at the ZATCA rate',
    route: '/tax-management',
    icon: 'Percent',
    module: 'accounting',
  },
  {
    name: 'Bank Reconciliation',
    description: 'Recorded cash against the bank statement',
    route: '/bank-reconciliation',
    icon: 'Landmark',
    module: 'accounting',
    countKey: 'receipts',
    gapped: true,
  },
  {
    name: 'Custom Reports',
    description: 'Build a report over any ledger source',
    route: '/custom-reports',
    icon: 'Table',
    module: 'accounting',
  },
  {
    name: 'Financial Reports',
    description: 'Balance sheet, P&L and trial balance',
    route: '/financial-reports',
    icon: 'FileText',
    module: 'accounting',
    countKey: 'journalEntries',
  },
]

function ReportCard({ link }: { link: ReportLink }) {
  const { t } = usePreferences()
  const paged = usePagedCollection(link.countKey ?? 'invoices', undefined)
  const total = link.countKey ? paged.data?.page.total : undefined

  return (
    <Link
      to={link.route}
      className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 no-underline transition-colors duration-150 hover:border-salis-blue hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
    >
      <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.1)] p-2.5 text-salis-blue">
        <Icon name={link.icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-bold text-heading">
          {t(link.name)}
          {link.gapped && !isLive ? (
            <span className="rounded bg-[rgba(249,115,22,.12)] px-1.5 py-0.5 text-[10px] font-semibold text-salis-orange">
              {t('Partial data')}
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 text-[12px] text-muted">{t(link.description)}</p>
        {link.countKey ? (
          <p className="mt-1.5 text-[11px] text-muted">
            {total == null ? (
              t('Counting…')
            ) : (
              <>
                <span className="font-mono text-body" dir="ltr">
                  {total}
                </span>{' '}
                {t('records on the server')}
              </>
            )}
          </p>
        ) : null}
      </div>
      <Icon name="ArrowRight" size={15} className="mt-1 flex-shrink-0 text-muted" />
    </Link>
  )
}

export function Reports() {
  const { t } = usePreferences()
  const { can } = useSession()
  const visible = REPORT_LINKS.filter((link) => can(link.module, 'v'))

  return (
    <>
      <FeatureHeader
        icon="BarChart3"
        title={t('Reports')}
        subtitle={t('Standard operational and financial reports')}
      />
      <Section
        title={t('Available reports')}
        subtitle={t('Each opens a report over live server data')}
      >
        {visible.length === 0 ? (
          <EmptyState
            icon="Lock"
            title={t('No reports available to your role')}
            description={t('Your role does not have view access to any reporting module.')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((link) => (
              <ReportCard key={link.route} link={link} />
            ))}
          </div>
        )}
        <ServerScopeNote />
      </Section>
    </>
  )
}

/* ═══════════════════════════════════════════ SalesReports — revenue ═══════ */

type Invoice = RowOf<'invoices'>

const SALES_STATUSES = ['all', 'draft', 'unpaid', 'partial', 'paid', 'overdue', 'cancelled'] as const

export function SalesReports() {
  const { t } = usePreferences()
  const { data: invoices = [], isLoading, error, refetch } = useCollection('invoices')

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof SALES_STATUSES)[number]>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return invoices
      .filter((invoice) => (status === 'all' ? true : invoice.status === status))
      .filter((invoice) =>
        needle ? [invoice.id, invoice.cust].some((v) => String(v).toLowerCase().includes(needle)) : true,
      )
      .filter((invoice) => inDateRange(rowDateIso(invoice as Record<string, unknown>, 'issuedAt'), from, to))
  }, [invoices, query, status, from, to])

  /* Each bar is one invoice's server-computed total — never a sum. */
  const largest = useMemo(
    () =>
      [...rows]
        .map((invoice) => ({ label: String(invoice.id), value: fromHalalas(invoiceMoney(invoice).totalHalalas) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    [rows],
  )

  const exportRows = () => {
    const csv = toCsv(
      ['Invoice', 'Customer', 'Due', 'Status', 'Total (SAR)', 'Paid (SAR)', 'Balance (SAR)'],
      rows.map((invoice) => {
        const money = invoiceMoney(invoice)
        return [
          invoice.id,
          invoice.cust,
          invoice.due,
          invoice.status,
          fromHalalas(money.totalHalalas).toFixed(2),
          money.fromServer ? fromHalalas(money.paidHalalas).toFixed(2) : '',
          money.fromServer ? fromHalalas(money.balanceHalalas).toFixed(2) : '',
        ]
      }),
    )
    downloadCsv('sales-report.csv', csv)
  }

  const columns: Column<Invoice>[] = [
    { header: 'Invoice', cell: (i) => i.id, code: true },
    { header: 'Customer', cell: (i) => i.cust },
    { header: 'Due', cell: (i) => i.due },
    { header: 'Status', cell: (i) => <InvoiceStatusBadge status={i.status} /> },
    {
      header: 'Total',
      cell: (i) => <Money sar={fromHalalas(invoiceMoney(i).totalHalalas)} className="font-semibold" />,
    },
    { header: 'Paid', cell: (i) => <MoneyCell invoice={i} field="paidHalalas" /> },
    { header: 'Balance', cell: (i) => <MoneyCell invoice={i} field="balanceHalalas" tone /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="TrendingUp"
        title={t('Sales Reports')}
        subtitle={t('Revenue, VAT and receivable by invoice')}
        actions={<ExportPrintActions onExport={exportRows} exportDisabled={rows.length === 0} />}
      />

      {isLive ? (
        <SalesSummaryPanel from={from} to={to} status={status === 'all' ? undefined : status} />
      ) : (
        <AggregateGapNotice endpoint={AGGREGATE_GAP.sales} />
      )}

      <Section
        title={t('Invoices')}
        subtitle={t('Every figure is the amount the server computed for that invoice')}
        toolbar={
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('Invoice or customer')}
                aria-label={t('Search invoices')}
                className="h-10 rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Status')}</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as (typeof SALES_STATUSES)[number])}
                aria-label={t('Filter by status')}
                className="h-10 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
              >
                {SALES_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value === 'all' ? t('All statuses') : t(value[0].toUpperCase() + value.slice(1))}
                  </option>
                ))}
              </select>
            </label>
            <DateRangeFilter from={from} to={to} onFrom={setFrom} onTo={setTo} />
          </div>
        }
      >
        {error ? (
          <ErrorState description={error.message} onRetry={() => void refetch()} />
        ) : (
          <DataTable
            caption="Invoices in this sales report"
            columns={columns}
            rows={rows}
            rowKey={(i) => String(i.id)}
            loading={isLoading}
            mobileCard={(i) => (
              <>
                <MobileCardHeader title={String(i.id)} code trailing={<InvoiceStatusBadge status={i.status} />} />
                <MobileCardRow>{i.cust}</MobileCardRow>
                <MobileCardRow label={t('Total')}>
                  <Money sar={fromHalalas(invoiceMoney(i).totalHalalas)} className="font-semibold text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Balance')}>
                  <MoneyCell invoice={i} field="balanceHalalas" tone />
                </MobileCardRow>
              </>
            )}
            empty={
              <EmptyState
                icon="TrendingUp"
                title={t('No invoices in range')}
                description={t('No invoices match these filters.')}
              />
            }
          />
        )}
        <ServerScopeNote />
      </Section>

      {largest.length > 0 ? (
        <Section title={t('Largest invoices')} subtitle={t('By the server’s total for each — not a period sum')}>
          <BarList rows={largest} />
        </Section>
      ) : null}
    </>
  )
}

/** The period totals, live only. On a build with an API this replaces the gap
 *  notice with the figures `GET /invoices/summary` computed for the selected
 *  range — invoiced, paid, outstanding and output VAT, each an integer-halala
 *  sum the server produced. The client renders them; it never adds up the rows.
 *  `financeReports` is null on the fixtures, so this never mounts there. */
function SalesSummaryPanel({
  from,
  to,
  status,
}: {
  from: string
  to: string
  status?: string
}) {
  const { t } = usePreferences()
  const query = useInvoicesSummary({ from: from || undefined, to: to || undefined, status })

  if (query.isLoading) {
    return (
      <Section title={t('Period totals')}>
        <Loading label={t('Summing the period…')} />
      </Section>
    )
  }
  if (query.error || !query.data) {
    return (
      <Section title={t('Period totals')}>
        <ErrorState description={query.error?.message} onRetry={() => void query.refetch()} />
      </Section>
    )
  }

  const s = query.data
  const stats: Stat[] = [
    {
      label: 'Invoiced',
      value: formatSar(fromHalalas(s.invoicedHalalas)),
      caption: `${s.count} ${t('invoices in range')}`,
      highlight: true,
    },
    { label: 'Paid', value: formatSar(fromHalalas(s.paidHalalas)), caption: 'Received', tone: 'info' },
    {
      label: 'Outstanding',
      value: formatSar(fromHalalas(s.outstandingHalalas)),
      caption: 'Still receivable',
      tone: 'warning',
    },
    { label: 'Output VAT', value: formatSar(fromHalalas(s.vatHalalas)), caption: 'On the period' },
  ]

  return (
    <>
      <ServerTotalsNote endpoint="GET /invoices/summary" />
      <StatRow stats={stats} />
      {s.byStatus.length ? (
        <Section title={t('Invoiced by status')} subtitle={t('The server’s total for each state')}>
          <BarList
            rows={s.byStatus.map((row) => ({
              label: `${row.status} (${row.count})`,
              value: fromHalalas(row.invoicedHalalas),
            }))}
          />
        </Section>
      ) : null}
    </>
  )
}

function MoneyCell({
  invoice,
  field,
  tone,
}: {
  invoice: Invoice
  field: 'paidHalalas' | 'balanceHalalas'
  tone?: boolean
}) {
  const money = invoiceMoney(invoice)
  if (!money.fromServer) return <span className="text-muted">—</span>
  const halalas = money[field]
  return (
    <Money
      sar={fromHalalas(halalas)}
      className={tone ? (halalas > 0 ? 'font-semibold text-salis-orange' : 'font-semibold text-salis-blue') : ''}
    />
  )
}

/* ═════════════════════════════════════ ReportsAnalytics — overview ════════ */

export function ReportsAnalytics() {
  const { t } = usePreferences()
  const invoices = useCollection('invoices')
  const expenses = useCollection('expenses')
  const accounts = useCollection('chartOfAccounts')

  const invoiceRows = invoices.data ?? []
  const expenseRows = expenses.data ?? []
  const accountRows = accounts.data ?? []

  const byStatus = useMemo(() => countBy(invoiceRows, (i) => i.status), [invoiceRows])
  const byCategory = useMemo(() => countBy(expenseRows, (e) => e.category || 'Uncategorized'), [expenseRows])
  const byType = useMemo(() => countBy(accountRows, (a) => a.type), [accountRows])

  /* Money chart: each bar one invoice's own server total, not a sum. */
  const largest = useMemo(
    () =>
      [...invoiceRows]
        .map((invoice) => ({ label: String(invoice.id), value: fromHalalas(invoiceMoney(invoice).totalHalalas) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    [invoiceRows],
  )

  const loading = invoices.isLoading || expenses.isLoading || accounts.isLoading
  const stats: Stat[] = [
    { label: 'Invoices', value: loading ? '—' : invoiceRows.length, caption: 'In view', icon: 'FileText' },
    { label: 'Expenses', value: loading ? '—' : expenseRows.length, caption: 'Claims in view', icon: 'Receipt', tone: 'warning' },
    { label: 'Accounts', value: loading ? '—' : accountRows.length, caption: 'In the ledger', icon: 'BookOpen', tone: 'info' },
    { label: 'Account types', value: loading ? '—' : byType.length, caption: 'Distinct', icon: 'Layers' },
  ]

  return (
    <>
      <FeatureHeader
        icon="PieChart"
        title={t('Analytics Overview')}
        subtitle={t('Cross-module distributions over live data')}
        actions={<ExportPrintActions />}
      />

      <StatRow stats={stats} />

      {isLive ? (
        <TrialBalancePanel />
      ) : (
        <AggregateGapNotice endpoint={AGGREGATE_GAP.ledger} />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title={t('Invoices by status')} subtitle={t('Count of invoices in each state')}>
          {byStatus.length ? (
            <CountBars rows={byStatus} />
          ) : (
            <EmptyState icon="FileText" title={t('No invoices')} />
          )}
        </Section>

        <Section title={t('Expenses by category')} subtitle={t('Count of expense claims')}>
          {byCategory.length ? (
            <CountBars rows={byCategory} />
          ) : (
            <EmptyState icon="Receipt" title={t('No expenses')} />
          )}
        </Section>

        <Section title={t('Accounts by type')} subtitle={t('Count of ledger accounts')}>
          {byType.length ? <CountBars rows={byType} /> : <EmptyState icon="BookOpen" title={t('No accounts')} />}
        </Section>

        <Section title={t('Largest invoices')} subtitle={t('By the server’s total for each')}>
          {largest.length ? (
            <BarList rows={largest} />
          ) : (
            <EmptyState icon="TrendingUp" title={t('No invoices')} />
          )}
        </Section>
      </div>
      <ServerScopeNote />
    </>
  )
}

/** The trial balance and balance sheet, live only. Replaces the ledger gap
 *  notice with what `GET /accounting/reports/trial-balance` computed: the P&L
 *  roll-up, the debit/credit totals, and the balance-sheet identity block —
 *  which carries F-008's real imbalance (assets ≠ liabilities + equity,
 *  `balanced:false`). The imbalance is rendered honestly, not tied off: a books
 *  that do not balance are shown as not balancing. `financeReports` is null on
 *  the fixtures, so this never mounts there. */
function TrialBalancePanel() {
  const { t } = usePreferences()
  const query = useTrialBalance()

  if (query.isLoading) {
    return (
      <Section title={t('Trial balance')}>
        <Loading label={t('Loading the ledger roll-up…')} />
      </Section>
    )
  }
  if (query.error || !query.data) {
    return (
      <Section title={t('Trial balance')}>
        <ErrorState description={query.error?.message} onRetry={() => void query.refetch()} />
      </Section>
    )
  }

  const tb = query.data
  const bs = tb.balanceSheet
  const pnlStats: Stat[] = [
    { label: 'Revenue', value: formatSar(fromHalalas(tb.profitAndLoss.revenueHalalas)), caption: 'Posted', highlight: true },
    { label: 'Expense', value: formatSar(fromHalalas(tb.profitAndLoss.expenseHalalas)), caption: 'Posted', tone: 'warning' },
    { label: 'Net', value: formatSar(fromHalalas(tb.profitAndLoss.netHalalas)), caption: 'Revenue less expense', tone: 'info' },
    { label: 'Journal', value: `${tb.journal.postedCount}`, caption: `${tb.journal.draftCount} ${t('draft')}` },
  ]

  return (
    <>
      <ServerTotalsNote endpoint="GET /accounting/reports/trial-balance" />
      <StatRow stats={pnlStats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title={t('Trial balance')} subtitle={t('Posted debits against posted credits')}>
          <div className="flex flex-col">
            <LedgerRow label={t('Total debits')} halalas={tb.totals.debitHalalas} />
            <LedgerRow label={t('Total credits')} halalas={tb.totals.creditHalalas} />
            <LedgerRow
              label={t('Difference')}
              halalas={tb.totals.differenceHalalas}
              tone={tb.balanced ? undefined : 'warning'}
              strong
            />
          </div>
          {tb.balanced ? null : (
            <ImbalanceNotice text={t('The posted ledger does not balance: debits do not equal credits.')} />
          )}
        </Section>

        <Section title={t('Balance sheet')} subtitle={t('Assets against liabilities and equity')}>
          <div className="flex flex-col">
            <LedgerRow label={t('Assets')} halalas={bs.assetsHalalas} />
            <LedgerRow label={t('Liabilities + equity')} halalas={bs.liabilitiesPlusEquityHalalas} />
            <LedgerRow
              label={t('Difference')}
              halalas={bs.differenceHalalas}
              tone={bs.balanced ? undefined : 'warning'}
              strong
            />
          </div>
          {bs.balanced ? null : (
            <ImbalanceNotice
              text={t('Assets do not equal liabilities plus equity in the seeded ledger.')}
            />
          )}
        </Section>
      </div>
    </>
  )
}

/** One label/amount row of a ledger roll-up. The amount is the server's integer
 *  halalas, shown as money; nothing here is summed. */
function LedgerRow({
  label,
  halalas,
  tone,
  strong,
}: {
  label: string
  halalas: number
  tone?: 'warning'
  strong?: boolean
}) {
  return (
    <div
      className={
        'flex items-center justify-between border-0 border-b border-solid border-border py-3 last:border-b-0 ' +
        (strong ? 'text-base font-bold text-heading' : 'text-[13px] text-body')
      }
    >
      <span>{label}</span>
      <Money
        sar={fromHalalas(halalas)}
        className={tone === 'warning' ? 'font-semibold text-salis-orange' : strong ? 'font-bold' : ''}
      />
    </div>
  )
}

/** The honest imbalance banner — orange (a condition needing attention), never
 *  red. F-008 is surfaced, not tied off. */
function ImbalanceNotice({ text }: { text: string }) {
  return (
    <p className="mt-2 flex items-center gap-2 rounded border border-salis-orange/30 bg-[rgba(249,115,22,.06)] px-3 py-2 text-[13px] text-body">
      <Icon name="AlertTriangle" size={15} className="flex-shrink-0 text-salis-orange" />
      {text}
    </p>
  )
}

/** Bars for a count distribution. Distinct from `BarList`, which renders its
 *  value as a SAR amount — a count is a tally of records, so it is shown as a
 *  plain LTR integer, never money. */
function CountBars({ rows }: { rows: readonly { label: string; value: number }[] }) {
  const { t } = usePreferences()
  const max = Math.max(...rows.map((row) => row.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
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
                width: `${(row.value / max) * 100}%`,
                background: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Count rows by a key. A count of records, never a sum of money. */
function countBy<T>(rows: readonly T[], key: (row: T) => string): { label: string; value: number }[] {
  const map = new Map<string, number>()
  for (const row of rows) {
    const label = key(row).replace(/_/g, ' ')
    map.set(label, (map.get(label) ?? 0) + 1)
  }
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

/* ═══════════════════════════════════════ CustomReports — builder ═════════ */

interface SourceField {
  key: string
  label: string
  code?: boolean
}

interface ReportSource {
  key: CollectionKey
  label: string
  icon: string
  dateKey?: string
  fields: readonly SourceField[]
}

/** Builder sources present the fields the server already formatted — the money
 *  values are display strings the API produced, so the builder displays and
 *  exports server figures without doing any arithmetic of its own. */
const SOURCES: readonly ReportSource[] = [
  {
    key: 'invoices',
    label: 'Invoices',
    icon: 'FileText',
    dateKey: 'issuedAt',
    fields: [
      { key: 'id', label: 'Invoice', code: true },
      { key: 'cust', label: 'Customer' },
      { key: 'due', label: 'Due' },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Total' },
    ],
  },
  {
    key: 'expenses',
    label: 'Expenses',
    icon: 'Receipt',
    fields: [
      { key: 'id', label: 'Expense', code: true },
      { key: 'date', label: 'Date' },
      { key: 'category', label: 'Category' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
    ],
  },
  {
    key: 'journalEntries',
    label: 'Journal entries',
    icon: 'BookOpen',
    fields: [
      { key: 'id', label: 'Entry', code: true },
      { key: 'date', label: 'Date' },
      { key: 'ref', label: 'Reference', code: true },
      { key: 'narration', label: 'Narration' },
      { key: 'debit', label: 'Debit' },
      { key: 'credit', label: 'Credit' },
      { key: 'status', label: 'Status' },
    ],
  },
  {
    key: 'receipts',
    label: 'Receipts',
    icon: 'Wallet',
    dateKey: 'receiptDate',
    fields: [
      { key: 'id', label: 'Receipt', code: true },
      { key: 'date', label: 'Date' },
      { key: 'customer', label: 'Customer' },
      { key: 'invoice', label: 'Invoice', code: true },
      { key: 'method', label: 'Method' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
    ],
  },
  {
    key: 'chartOfAccounts',
    label: 'Chart of accounts',
    icon: 'Landmark',
    fields: [
      { key: 'code', label: 'Code', code: true },
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'balance', label: 'Balance' },
    ],
  },
]

export function CustomReports() {
  const { t } = usePreferences()
  const [sourceKey, setSourceKey] = useState<CollectionKey>('invoices')
  const source = SOURCES.find((s) => s.key === sourceKey) ?? SOURCES[0]

  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(source.fields.map((field) => [field.key, true])),
  )
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: rows = [], isLoading, error, refetch } = useCollection(sourceKey)

  const chooseSource = (next: CollectionKey) => {
    setSourceKey(next)
    const nextSource = SOURCES.find((s) => s.key === next) ?? SOURCES[0]
    setSelected(Object.fromEntries(nextSource.fields.map((field) => [field.key, true])))
    setQuery('')
  }

  const activeFields = source.fields.filter((field) => selected[field.key])

  /** The builder's current definition, as a JSON object the server persists and
   *  hands back — no money, just the source, the chosen columns and the range. */
  const definition = useMemo(
    () => ({
      source: sourceKey,
      columns: activeFields.map((field) => field.key),
      query: query || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [sourceKey, activeFields, query, from, to],
  )

  /** Applies a saved definition back onto the builder. */
  const loadDefinition = (row: RowOf<'savedReports'>) => {
    const def = (row.definition ?? {}) as {
      source?: string
      columns?: string[]
      query?: string
      from?: string
      to?: string
    }
    const nextKey = (def.source as CollectionKey) ?? sourceKey
    const nextSource = SOURCES.find((s) => s.key === nextKey) ?? SOURCES[0]
    setSourceKey(nextSource.key)
    const cols = new Set(def.columns ?? nextSource.fields.map((f) => f.key))
    setSelected(Object.fromEntries(nextSource.fields.map((field) => [field.key, cols.has(field.key)])))
    setQuery(def.query ?? '')
    setFrom(def.from ?? '')
    setTo(def.to ?? '')
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (rows as unknown as Record<string, unknown>[])
      .filter((row) =>
        needle ? source.fields.some((f) => String(row[f.key] ?? '').toLowerCase().includes(needle)) : true,
      )
      .filter((row) => inDateRange(rowDateIso(row, source.dateKey), from, to))
  }, [rows, query, from, to, source])

  const exportRows = () => {
    const csv = toCsv(
      activeFields.map((field) => field.label),
      filtered.map((row) => activeFields.map((field) => row[field.key] ?? '')),
    )
    downloadCsv(`custom-${source.key}.csv`, csv)
  }

  const columns: Column<Record<string, unknown>>[] = activeFields.map((field) => ({
    header: field.label,
    code: field.code,
    cell: (row) => renderCell(row[field.key], field.code),
  }))

  return (
    <>
      <FeatureHeader
        icon="Table"
        title={t('Custom Reports')}
        subtitle={t('Build a report over any ledger source')}
        actions={
          <ExportPrintActions onExport={exportRows} exportDisabled={filtered.length === 0 || activeFields.length === 0} />
        }
      />

      <Section title={t('Report definition')} subtitle={t('Pick a source, the columns, and a range')}>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted">{t('Data source')}</span>
            <select
              value={sourceKey}
              onChange={(event) => chooseSource(event.target.value as CollectionKey)}
              aria-label={t('Data source')}
              className="h-10 min-w-[200px] cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
            >
              {SOURCES.map((option) => (
                <option key={option.key} value={option.key}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('Any column')}
              aria-label={t('Search rows')}
              className="h-10 rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
            />
          </label>
          <DateRangeFilter from={from} to={to} onFrom={setFrom} onTo={setTo} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium text-muted">{t('Columns')}</span>
          <div className="flex flex-wrap gap-2">
            {source.fields.map((field) => {
              const on = selected[field.key]
              return (
                <button
                  key={field.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                  className={
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ' +
                    (on
                      ? 'border-salis-blue bg-[rgba(10,94,215,.1)] text-salis-blue'
                      : 'border-border bg-card text-muted hover:text-heading')
                  }
                >
                  <Icon name={on ? 'Check' : 'Plus'} size={13} />
                  {t(field.label)}
                </button>
              )
            })}
          </div>
          {activeFields.length === 0 ? (
            <p className="text-[11px] text-salis-orange">{t('Choose at least one column to preview.')}</p>
          ) : null}
        </div>
      </Section>

      <Section
        title={t('Preview')}
        subtitle={t('Live rows from the server, filtered — export what you see')}
      >
        {error ? (
          <ErrorState description={error.message} onRetry={() => void refetch()} />
        ) : activeFields.length === 0 ? (
          <EmptyState icon="Columns3" title={t('No columns selected')} />
        ) : (
          <DataTable
            caption="Custom report results"
            columns={columns}
            rows={filtered}
            rowKey={(row, index) => String(row._id ?? row.id ?? row.code ?? index)}
            loading={isLoading}
            mobileCard={(row) => (
              <>
                <MobileCardHeader
                  title={String(row[activeFields[0].key] ?? '—')}
                  code={activeFields[0].code}
                />
                {activeFields.slice(1).map((field) => (
                  <MobileCardRow key={field.key} label={t(field.label)}>
                    {renderCell(row[field.key], field.code)}
                  </MobileCardRow>
                ))}
              </>
            )}
            empty={
              <EmptyState
                icon="Table"
                title={t('No rows match')}
                description={t('Adjust the search or the date range.')}
              />
            }
          />
        )}
        {!isLive ? (
          <p className="flex items-start gap-1.5 text-[11px] text-muted">
            <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
            {t(
              'Saving a report definition to reuse later needs a savedReports collection on the server, which does not exist yet — build and export a report per session for now.',
            )}
          </p>
        ) : null}
        <ServerScopeNote />
      </Section>

      {isLive ? <SavedReportsPanel definition={definition} onLoad={loadDefinition} /> : null}
    </>
  )
}

/** Persisted report definitions, live only. On a build with an API the builder
 *  can save its current definition to the `savedReports` collection, list what
 *  was saved, load one back onto the builder, and delete it — the persistence
 *  F-028 added. The definition is a plain JSON object (source, columns, range);
 *  no money is stored or computed. `savedReports` is an empty read-only fixture
 *  on a no-API build and its writes are refused, so this never mounts there. */
function SavedReportsPanel({
  definition,
  onLoad,
}: {
  definition: Record<string, unknown>
  onLoad: (row: RowOf<'savedReports'>) => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const { data: saved = [], isLoading } = useCollection('savedReports')
  const create = useCreate('savedReports')
  const remove = useDelete('savedReports')
  const [name, setName] = useState('')

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    create.mutate(
      { input: { name: trimmed, source: String(definition.source ?? ''), definition } as Partial<RowOf<'savedReports'>> },
      {
        onSuccess: () => {
          setName('')
          toast.show({ title: t('Report saved'), description: t('The definition is stored for reuse.') })
        },
        onError: (error) =>
          toast.show({
            title: t('Could not save'),
            description: error.message || t('The report definition was not saved.'),
            error: true,
          }),
      },
    )
  }

  return (
    <Section title={t('Saved reports')} subtitle={t('Persist this definition and reuse it later')}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Report name')}</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('e.g. Overdue invoices')}
            aria-label={t('Report name')}
            className="h-10 min-w-[220px] rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
          />
        </label>
        <Button variant="primary" size="md" onClick={save} disabled={!name.trim() || create.isPending}>
          <Icon name="Save" size={15} />
          {create.isPending ? t('Saving…') : t('Save definition')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-[13px] text-muted">{t('Loading saved reports…')}</p>
      ) : saved.length === 0 ? (
        <EmptyState icon="Table" title={t('No saved reports yet')} description={t('Save the current definition to reuse it.')} />
      ) : (
        <div className="flex flex-col gap-2">
          {saved.map((row) => {
            const id = String((row as { _id?: string })._id ?? row.name)
            return (
              <div
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-heading">{row.name}</p>
                  <p className="text-[11px] text-muted">
                    <span dir="ltr" className="font-mono">
                      {row.source || '—'}
                    </span>
                    {row.owner ? ` · ${row.owner}` : ''}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Button variant="subtle" size="sm" onClick={() => onLoad(row)}>
                    <Icon name="FileText" size={14} />
                    {t('Load')}
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled={remove.isPending}
                    onClick={() =>
                      remove.mutate(
                        { id },
                        {
                          onError: (error) =>
                            toast.show({
                              title: t('Could not delete'),
                              description: error.message || t('The report was not deleted.'),
                              error: true,
                            }),
                        },
                      )
                    }
                  >
                    <Icon name="Trash2" size={14} />
                    {t('Delete')}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <ServerScopeNote />
    </Section>
  )
}

/** A builder cell. A money value the server already formatted (`"SAR 1,840"`)
 *  is pinned LTR and monospaced like every amount in the app; a Latin
 *  identifier the same; everything else is plain text. */
function renderCell(value: unknown, code?: boolean) {
  const text = value == null || value === '' ? '—' : String(value)
  if (/^SAR\s/.test(text)) {
    return (
      <span dir="ltr" className="font-mono">
        {text}
      </span>
    )
  }
  if (code) {
    return (
      <span dir="ltr" className="font-mono text-muted">
        {text}
      </span>
    )
  }
  return text
}
