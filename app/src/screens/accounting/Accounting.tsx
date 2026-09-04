import { useMemo, useState, type ReactNode } from 'react'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { useDebounce } from '@/lib/useDebounce'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { RaiseReceiptModal } from '@/screens/finance/RaiseReceiptModal'
import { AccountFormModal } from './AccountFormModal'
import { JournalEntryFormModal } from './JournalEntryFormModal'
import { ExpenseFormModal } from './ExpenseFormModal'
import { DepartmentFormModal } from './DepartmentFormModal'
import { DateRangeFilter } from './ReportControls'
import { inDateRange, rowDateIso } from './reporting'

/** The accounting ledger screens. Each pairs its title with the module name,
 *  as the design does ("Chart of Accounts" above "Accounting"), on the quiet
 *  page header, with the reporting suite's period picker in the actions slot
 *  and the module's view grant checked before anything is drawn.
 *
 *  Every amount runs through `Money`, so the SAR convention (comma thousands,
 *  2 decimals, mono, LTR) is applied uniformly — the mock tables store these as
 *  display strings like "SAR 842,500", which `parseSar` normalises.
 *
 *  The period picker filters on the best date a row carries (`issuedAt`,
 *  `_createdAt`, the design's `date` column); a row with no date is kept, so
 *  a demo fixture is never hidden by a range it cannot be measured against. */

const ACCOUNTING = 'Accounting'

/** Ledger status palette. Posted, approved and cleared are settled states and
 *  take brand blue; pending needs action and takes orange; rejected and
 *  unposted are neutral. No green or red anywhere (README §7). */
const LEDGER_STATUS: Record<string, readonly [string, string]> = {
  posted: ['var(--tint-blue)', 'var(--salis-blue)'],
  unposted: ['var(--tint-neutral)', 'var(--text-muted)'],
  approved: ['var(--tint-blue)', 'var(--salis-blue)'],
  cleared: ['var(--tint-blue)', 'var(--salis-blue)'],
  pending: ['var(--tint-orange)', 'var(--salis-orange)'],
  rejected: ['var(--tint-neutral)', 'var(--text-muted)'],
}

function LedgerStatus({ value }: { value: string }) {
  const { t } = usePreferences()
  const [bg, fg] = LEDGER_STATUS[value] ?? LEDGER_STATUS.pending
  return (
    <Badge background={bg} color={fg}>
      {t(value[0].toUpperCase() + value.slice(1))}
    </Badge>
  )
}

/** Account-type palette for the chart of accounts. */
const ACCOUNT_TYPE: Record<string, readonly [string, string]> = {
  Assets: ['var(--tint-blue)', 'var(--salis-blue)'],
  Liabilities: ['var(--tint-orange)', 'var(--salis-orange)'],
  Equity: ['var(--tint-navy)', 'var(--salis-navy)'],
  Revenue: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  Expense: ['var(--tint-neutral)', 'var(--text-muted)'],
}

function useFilter<TRow>(rows: readonly TRow[], fields: (row: TRow) => (string | number)[]) {
  const [query, setQuery] = useState('')
  const needle = useDebounce(query.trim().toLowerCase(), 250)
  const filtered = useMemo(() => {
    if (!needle) return rows
    return rows.filter((row) =>
      fields(row).some((value) => String(value).toLowerCase().includes(needle))
    )
  }, [rows, needle, fields])
  return { query, setQuery, filtered, searching: Boolean(needle) }
}

/** The period picker and the rows it keeps. `dateKey` names the design's own
 *  date column, which the fixtures carry where the API carries `_createdAt`. */
function usePeriod<TRow extends Record<string, unknown>>(rows: readonly TRow[], dateKey: string) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const inPeriod = useMemo(
    () => (from || to ? rows.filter((row) => inDateRange(rowDateIso(row, dateKey), from, to)) : rows),
    [rows, from, to, dateKey]
  )
  const picker = <DateRangeFilter from={from} to={to} onFrom={setFrom} onTo={setTo} />
  return { inPeriod, picker, filtering: Boolean(from || to) }
}

function NoRows({ filtering, icon, title }: { filtering: boolean; icon: string; title: string }) {
  const { t } = usePreferences()
  return filtering ? (
    <EmptyState icon="SearchX" title={t('No results')} description={t('Nothing matches the current filters.')} />
  ) : (
    <EmptyState icon={icon} title={t(title)} />
  )
}

/** Header actions: the period picker, then the primary button. */
function Actions({ picker, children }: { picker: ReactNode; children?: ReactNode }) {
  return (
    <>
      {picker}
      {children}
    </>
  )
}

// ── Chart of accounts ───────────────────────────────────────────────────────
type Account = RowOf<'chartOfAccounts'>

export function ChartOfAccounts() {
  const { t } = usePreferences()
  const { can } = useSession()
  const accountsQuery = useCollection('chartOfAccounts')
  const accounts = accountsQuery.data ?? []
  const { query, setQuery, filtered, searching } = useFilter(accounts, (a) => [a.code, a.name, a.type])
  const [addingAccount, setAddingAccount] = useState(false)

  const typeBadge = (value: string) => {
    const [bg, fg] = ACCOUNT_TYPE[value] ?? ACCOUNT_TYPE.Expense
    return (
      <Badge background={bg} color={fg}>
        {t(value)}
      </Badge>
    )
  }

  const columns: Column<Account>[] = [
    { header: 'Account Code', cell: (a) => a.code, code: true, sortValue: (a) => a.code },
    { header: 'Account Name', cell: (a) => t(a.name), sortValue: (a) => a.name },
    { header: 'Account Type', cell: (a) => typeBadge(a.type), sortValue: (a) => a.type },
    { header: 'Sub-Accounts', cell: (a) => a.children, numeric: true, sortValue: (a) => Number(a.children) },
    {
      header: 'Balance',
      cell: (a) => <Money sar={parseSar(a.balance)} className="font-semibold" />,
      numeric: true,
      sortValue: (a) => parseSar(a.balance),
    },
  ]

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t(ACCOUNTING)}
        title={t('Chart of Accounts')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search accounts...') }}
        actions={
          can('accounting', 'c') ? (
            <Button size="md" icon="Plus" onClick={() => setAddingAccount(true)}>
              {t('Add Account')}
            </Button>
          ) : null
        }
        denied={!can('accounting', 'v')}
        query={accountsQuery}
        skeleton="table"
      >
        <DataTable
          caption="Chart of accounts"
          columns={columns}
          rows={filtered}
          rowKey={(a) => a.code}
          defaultSort={{ key: 'Account Code', dir: 'asc' }}
          mobileCard={(a) => (
            <>
              <MobileCardHeader title={a.code} code trailing={typeBadge(a.type)} />
              <MobileCardRow>{t(a.name)}</MobileCardRow>
              <MobileCardRow label={t('Balance')}>
                <Money sar={parseSar(a.balance)} className="font-semibold text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Sub-Accounts')}>{a.children}</MobileCardRow>
            </>
          )}
          empty={<NoRows filtering={searching} icon="BookOpen" title="No accounts yet" />}
        />
      </ScreenFrame>
      <AccountFormModal open={addingAccount} onClose={() => setAddingAccount(false)} />
    </>
  )
}

// ── Journal entries ─────────────────────────────────────────────────────────
type JournalEntry = RowOf<'journalEntries'>

export function JournalEntries() {
  const { t } = usePreferences()
  const { can } = useSession()
  const entriesQuery = useCollection('journalEntries')
  const entries = entriesQuery.data ?? []
  const { inPeriod, picker, filtering } = usePeriod(entries, 'date')
  const { query, setQuery, filtered, searching } = useFilter(inPeriod, (e) => [e.id, e.ref, e.narration])
  const [creatingEntry, setCreatingEntry] = useState(false)

  // Double entry: debits must equal credits. Showing the totals makes an
  // unbalanced batch obvious instead of leaving it to be found at close.
  const { debit, credit } = useMemo(() => {
    let d = 0
    let c = 0
    for (const entry of inPeriod) {
      d += parseSar(entry.debit)
      c += parseSar(entry.credit)
    }
    return { debit: d, credit: c }
  }, [inPeriod])
  const balanced = Math.abs(debit - credit) < 0.005

  const columns: Column<JournalEntry>[] = [
    { header: 'Entry #', cell: (e) => e.id, code: true, sortValue: (e) => e.id },
    { header: 'Date', cell: (e) => e.date, sortValue: (e) => rowDateIso(e, 'date') ?? e.date },
    { header: 'Reference', cell: (e) => e.ref, code: true, sortValue: (e) => e.ref },
    { header: 'Narration', cell: (e) => t(e.narration), sortValue: (e) => e.narration },
    { header: 'Debit', cell: (e) => <Money sar={parseSar(e.debit)} />, numeric: true, sortValue: (e) => parseSar(e.debit) },
    { header: 'Credit', cell: (e) => <Money sar={parseSar(e.credit)} />, numeric: true, sortValue: (e) => parseSar(e.credit) },
    { header: 'Status', cell: (e) => <LedgerStatus value={e.status} />, sortValue: (e) => e.status },
  ]

  const balanceNotice = (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
      <span
        className={
          'flex rounded p-2 ' +
          (balanced
            ? 'bg-tint-blue text-salis-blue'
            : 'bg-salis-orange/[.12] text-salis-orange')
        }
      >
        <Icon name={balanced ? 'Scale' : 'AlertTriangle'} size={18} />
      </span>
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-heading">
          {balanced ? t('Ledger is balanced') : t('Ledger is out of balance')}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {t('Total Debit')} <Money sar={debit} className="text-body" /> · {t('Total Credit')}{' '}
          <Money sar={credit} className="text-body" />
        </p>
      </div>
    </div>
  )

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t(ACCOUNTING)}
        title={t('Journal Entries')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search entries...') }}
        actions={
          <Actions picker={picker}>
            {can('accounting', 'c') ? (
              <Button size="md" icon="Plus" onClick={() => setCreatingEntry(true)}>
                {t('New Journal Entry')}
              </Button>
            ) : null}
          </Actions>
        }
        denied={!can('accounting', 'v')}
        query={entriesQuery}
        skeleton="table"
        notice={balanceNotice}
      >
        <DataTable
          caption="Journal entries"
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          defaultSort={{ key: 'Date', dir: 'desc' }}
          mobileCard={(e) => (
            <>
              <MobileCardHeader title={e.id} code trailing={<LedgerStatus value={e.status} />} />
              <MobileCardRow>{t(e.narration)}</MobileCardRow>
              <MobileCardRow label={t('Reference')}>
                <span className="font-mono" dir="ltr">
                  {e.ref}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Debit')}>
                <Money sar={parseSar(e.debit)} className="text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Credit')}>
                <Money sar={parseSar(e.credit)} className="text-heading" />
              </MobileCardRow>
            </>
          )}
          empty={<NoRows filtering={searching || filtering} icon="BookOpen" title="No journal entries yet" />}
        />
      </ScreenFrame>
      <JournalEntryFormModal open={creatingEntry} onClose={() => setCreatingEntry(false)} />
    </>
  )
}

// ── Expenses ────────────────────────────────────────────────────────────────
type Expense = RowOf<'expenses'>

export function Expenses() {
  const { t } = usePreferences()
  const { can } = useSession()
  const expensesQuery = useCollection('expenses')
  const expenses = expensesQuery.data ?? []
  const { inPeriod, picker, filtering } = usePeriod(expenses, 'date')
  const { query, setQuery, filtered, searching } = useFilter(inPeriod, (e) => [e.id, e.category, e.vendor])
  const [creatingExpense, setCreatingExpense] = useState(false)

  const columns: Column<Expense>[] = [
    { header: 'Expense #', cell: (e) => e.id, code: true, sortValue: (e) => e.id },
    { header: 'Date', cell: (e) => e.date, sortValue: (e) => rowDateIso(e, 'date') ?? e.date },
    { header: 'Category', cell: (e) => t(e.category), sortValue: (e) => e.category },
    { header: 'Vendor', cell: (e) => e.vendor, sortValue: (e) => e.vendor },
    {
      header: 'Amount',
      cell: (e) => <Money sar={parseSar(e.amount)} className="font-semibold" />,
      numeric: true,
      sortValue: (e) => parseSar(e.amount),
    },
    { header: 'Status', cell: (e) => <LedgerStatus value={e.status} />, sortValue: (e) => e.status },
  ]

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t(ACCOUNTING)}
        title={t('Expenses')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search expenses...') }}
        actions={
          <Actions picker={picker}>
            {can('accounting', 'c') ? (
              <Button size="md" icon="Plus" onClick={() => setCreatingExpense(true)}>
                {t('New Expense')}
              </Button>
            ) : null}
          </Actions>
        }
        denied={!can('accounting', 'v')}
        query={expensesQuery}
        skeleton="table"
      >
        <DataTable
          caption="Expenses"
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          defaultSort={{ key: 'Date', dir: 'desc' }}
          mobileCard={(e) => (
            <>
              <MobileCardHeader title={e.id} code trailing={<LedgerStatus value={e.status} />} />
              <MobileCardRow>{e.vendor}</MobileCardRow>
              <MobileCardRow label={t('Category')}>{t(e.category)}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money sar={parseSar(e.amount)} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
          empty={<NoRows filtering={searching || filtering} icon="Receipt" title="No expenses recorded" />}
        />
      </ScreenFrame>
      <ExpenseFormModal open={creatingExpense} onClose={() => setCreatingExpense(false)} />
    </>
  )
}

// ── Receipts ────────────────────────────────────────────────────────────────
type Receipt = RowOf<'receipts'>

export function Receipts() {
  const { t } = usePreferences()
  const { can } = useSession()
  const receiptsQuery = useCollection('receipts')
  const receipts = receiptsQuery.data ?? []
  const { inPeriod, picker, filtering } = usePeriod(receipts, 'date')
  const { query, setQuery, filtered, searching } = useFilter(inPeriod, (r) => [r.id, r.customer, r.invoice])
  const [raising, setRaising] = useState(false)

  const columns: Column<Receipt>[] = [
    { header: 'Receipt #', cell: (r) => r.id, code: true, sortValue: (r) => r.id },
    { header: 'Date', cell: (r) => r.date, sortValue: (r) => rowDateIso(r, 'date') ?? r.date },
    { header: 'Customer', cell: (r) => r.customer, sortValue: (r) => r.customer },
    { header: 'Invoice', cell: (r) => r.invoice, code: true, sortValue: (r) => r.invoice },
    { header: 'Payment Method', cell: (r) => t(r.method), sortValue: (r) => r.method },
    {
      header: 'Amount',
      cell: (r) => <Money sar={parseSar(r.amount)} className="font-semibold" />,
      numeric: true,
      sortValue: (r) => parseSar(r.amount),
    },
    { header: 'Status', cell: (r) => <LedgerStatus value={r.status} />, sortValue: (r) => r.status },
  ]

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t(ACCOUNTING)}
        title={t('Receipts')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search receipts...') }}
        actions={
          <Actions picker={picker}>
            {can('payments', 'c') ? (
              <Button size="md" icon="Plus" onClick={() => setRaising(true)}>
                {t('New Receipt')}
              </Button>
            ) : null}
          </Actions>
        }
        denied={!can('accounting', 'v') && !can('payments', 'v')}
        query={receiptsQuery}
        skeleton="table"
      >
        <DataTable
          caption="Cash receipts"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          defaultSort={{ key: 'Date', dir: 'desc' }}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.id} code trailing={<LedgerStatus value={r.status} />} />
              <MobileCardRow>{r.customer}</MobileCardRow>
              <MobileCardRow label={t('Invoice')}>
                <span className="font-mono" dir="ltr">
                  {r.invoice}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money sar={parseSar(r.amount)} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
          empty={<NoRows filtering={searching || filtering} icon="Receipt" title="No receipts yet" />}
        />
      </ScreenFrame>
      <RaiseReceiptModal open={raising} onClose={() => setRaising(false)} />
    </>
  )
}

// ── Departments ─────────────────────────────────────────────────────────────
type Department = RowOf<'departments'>

export function Departments() {
  const { t } = usePreferences()
  const { can } = useSession()
  const departmentsQuery = useCollection('departments')
  const departments = departmentsQuery.data ?? []
  const { query, setQuery, filtered, searching } = useFilter(departments, (d) => [d.name, d.head, d.branch])
  const [addingDepartment, setAddingDepartment] = useState(false)

  const columns: Column<Department>[] = [
    {
      header: 'Name',
      cell: (d) => (
        <span className="flex items-center gap-2">
          <Icon name={d.icon} size={15} className="text-salis-blue" />
          {t(d.name)}
        </span>
      ),
      sortValue: (d) => d.name,
    },
    { header: 'Department Head', cell: (d) => d.head, sortValue: (d) => d.head },
    { header: 'Headcount', cell: (d) => d.headcount, numeric: true, sortValue: (d) => Number(d.headcount) },
    { header: 'Cost Center', cell: (d) => d.costCenter, code: true, sortValue: (d) => d.costCenter },
    { header: 'Branch', cell: (d) => t(d.branch), sortValue: (d) => d.branch },
  ]

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t('Administration')}
        title={t('Departments')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search departments...') }}
        actions={
          can('hr', 'c') ? (
            <Button size="md" icon="Plus" onClick={() => setAddingDepartment(true)}>
              {t('Add Department')}
            </Button>
          ) : null
        }
        denied={!can('hr', 'v') && !can('accounting', 'v')}
        query={departmentsQuery}
        skeleton="table"
      >
        <DataTable
          caption="Departments and cost centres"
          columns={columns}
          rows={filtered}
          rowKey={(d) => d.costCenter}
          mobileCard={(d) => (
            <>
              <MobileCardHeader title={t(d.name)} />
              <MobileCardRow label={t('Department Head')}>{d.head}</MobileCardRow>
              <MobileCardRow label={t('Headcount')}>{d.headcount}</MobileCardRow>
              <MobileCardRow label={t('Cost Center')}>
                <span className="font-mono" dir="ltr">
                  {d.costCenter}
                </span>
              </MobileCardRow>
            </>
          )}
          empty={<NoRows filtering={searching} icon="Building2" title="No departments yet" />}
        />
      </ScreenFrame>
      <DepartmentFormModal open={addingDepartment} onClose={() => setAddingDepartment(false)} />
    </>
  )
}
