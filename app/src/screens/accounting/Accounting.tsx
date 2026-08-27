import { useMemo, useState } from 'react'
import { useIsMobile } from '@/lib/useMediaQuery'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { ErrorState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { RaiseReceiptModal } from '@/screens/finance/RaiseReceiptModal'
import { AccountFormModal } from './AccountFormModal'
import { JournalEntryFormModal } from './JournalEntryFormModal'
import { ExpenseFormModal } from './ExpenseFormModal'
import { DepartmentFormModal } from './DepartmentFormModal'

/** The accounting ledger screens. Each pairs its title with the module name,
 *  as the design does ("Chart of Accounts" above "Accounting").
 *
 *  Every amount runs through `Money`, so the SAR convention (comma thousands,
 *  2 decimals, mono, LTR) is applied uniformly — the mock tables store these as
 *  display strings like "SAR 842,500", which `parseSar` normalises. */

const ACCOUNTING = 'Accounting'

/** Ledger status palette. Posted, approved and cleared are settled states and
 *  take brand blue; pending needs action and takes orange; rejected and
 *  unposted are neutral. No green or red anywhere (README §7). */
const LEDGER_STATUS: Record<string, readonly [string, string]> = {
  posted: ['rgba(10,94,215,.1)', '#0A5ED7'],
  unposted: ['rgba(100,116,139,.1)', '#64748B'],
  approved: ['rgba(10,94,215,.1)', '#0A5ED7'],
  cleared: ['rgba(10,94,215,.1)', '#0A5ED7'],
  pending: ['rgba(249,115,22,.1)', '#F97316'],
  rejected: ['rgba(100,116,139,.1)', '#64748B'],
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
  Assets: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Liabilities: ['rgba(249,115,22,.1)', '#F97316'],
  Equity: ['rgba(11,31,59,.1)', '#0B1F3B'],
  Revenue: ['rgba(11,179,255,.1)', '#0BB3FF'],
  Expense: ['rgba(100,116,139,.1)', '#64748B'],
}

function useFilter<TRow>(rows: readonly TRow[], fields: (row: TRow) => (string | number)[]) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) =>
      fields(row).some((value) => String(value).toLowerCase().includes(needle))
    )
  }, [rows, query, fields])
  return { query, setQuery, filtered }
}

// ── Chart of accounts ───────────────────────────────────────────────────────
type Account = RowOf<'chartOfAccounts'>

export function ChartOfAccounts() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: accounts = [], isLoading, isError, error, refetch } = useCollection('chartOfAccounts')
  const { query, setQuery, filtered } = useFilter(accounts, (a) => [a.code, a.name, a.type])
  const [addingAccount, setAddingAccount] = useState(false)

  if (isError) return <Card className="p-6"><ErrorState description={error?.message} onRetry={() => void refetch()} /></Card>

  const typeBadge = (value: string) => {
    const [bg, fg] = ACCOUNT_TYPE[value] ?? ACCOUNT_TYPE.Expense
    return (
      <Badge background={bg} color={fg}>
        {t(value)}
      </Badge>
    )
  }

  const columns: Column<Account>[] = [
    { header: 'Account Code', cell: (a) => a.code, code: true },
    { header: 'Account Name', cell: (a) => t(a.name) },
    { header: 'Account Type', cell: (a) => typeBadge(a.type) },
    { header: 'Sub-Accounts', cell: (a) => a.children },
    { header: 'Balance', cell: (a) => <Money sar={parseSar(a.balance)} className="font-semibold" /> },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="BookOpen" title={t('Chart of Accounts')} subtitle={t(ACCOUNTING)} />
        <DataTable
          caption="Chart of accounts"
          columns={columns}
          rows={filtered}
          rowKey={(a) => a.code}
          loading={isLoading}
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
          empty={<EmptyState icon="BookOpen" title={t('No accounts yet')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Chart of Accounts')}
        subtitle={t(ACCOUNTING)}
        search={{ value: query, onChange: setQuery, placeholder: t('Search accounts...') }}
        actions={
          can('accounting', 'c') ? (
            <Button size="md" onClick={() => setAddingAccount(true)}>
              <Icon name="Plus" size={16} />
              {t('Add Account')}
            </Button>
          ) : null
        }
      />
      <AccountFormModal open={addingAccount} onClose={() => setAddingAccount(false)} />
      <DataTable
        caption="Chart of accounts"
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.code}
        loading={isLoading}
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
        empty={<EmptyState icon="BookOpen" title={t('No accounts yet')} />}
      />
    </>
  )
}

// ── Journal entries ─────────────────────────────────────────────────────────
type JournalEntry = RowOf<'journalEntries'>

export function JournalEntries() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: entries = [], isLoading, isError, error, refetch } = useCollection('journalEntries')
  const { query, setQuery, filtered } = useFilter(entries, (e) => [e.id, e.ref, e.narration])
  const [creatingEntry, setCreatingEntry] = useState(false)

  if (isError) return <Card className="p-6"><ErrorState description={error?.message} onRetry={() => void refetch()} /></Card>

  // Double entry: debits must equal credits. Showing the totals makes an
  // unbalanced batch obvious instead of leaving it to be found at close.
  const { debit, credit } = useMemo(() => {
    let d = 0
    let c = 0
    for (const entry of entries) {
      d += parseSar(entry.debit)
      c += parseSar(entry.credit)
    }
    return { debit: d, credit: c }
  }, [entries])
  const balanced = Math.abs(debit - credit) < 0.005

  const columns: Column<JournalEntry>[] = [
    { header: 'Entry #', cell: (e) => e.id, code: true },
    { header: 'Date', cell: (e) => e.date },
    { header: 'Reference', cell: (e) => e.ref, code: true },
    { header: 'Narration', cell: (e) => t(e.narration) },
    { header: 'Debit', cell: (e) => <Money sar={parseSar(e.debit)} /> },
    { header: 'Credit', cell: (e) => <Money sar={parseSar(e.credit)} /> },
    { header: 'Status', cell: (e) => <LedgerStatus value={e.status} /> },
  ]

  const balanceNotice = (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
      <span
        className={
          'flex rounded p-2 ' +
          (balanced
            ? 'bg-[rgba(10,94,215,.1)] text-salis-blue'
            : 'bg-[rgba(249,115,22,.12)] text-salis-orange')
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

  if (isMobile) {
    return (
      <>
        <MobilePageHeader
          icon="BookOpen"
          title={t('Journal Entries')}
          actions={
            can('accounting', 'c') ? (
              <Button size="md" onClick={() => setCreatingEntry(true)}>
                <Icon name="Plus" size={16} />
                {t('New Journal Entry')}
              </Button>
            ) : null
          }
        />
        <JournalEntryFormModal open={creatingEntry} onClose={() => setCreatingEntry(false)} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('Search entries...')}
          aria-label={t('Search entries')}
          className="h-10 w-full rounded-lg border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
        />
        {balanceNotice}
        <DataTable
          caption="Journal entries"
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          loading={isLoading}
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
          empty={<EmptyState icon="BookOpen" title={t('No journal entries yet')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Journal Entries')}
        subtitle={t(ACCOUNTING)}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('accounting', 'c') ? (
            <Button size="md" onClick={() => setCreatingEntry(true)}>
              <Icon name="Plus" size={16} />
              {t('New Journal Entry')}
            </Button>
          ) : null
        }
      />
      <JournalEntryFormModal open={creatingEntry} onClose={() => setCreatingEntry(false)} />

      {balanceNotice}

      <DataTable
        caption="Journal entries"
        columns={columns}
        rows={filtered}
        rowKey={(e) => e.id}
        loading={isLoading}
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
        empty={<EmptyState icon="BookOpen" title={t('No journal entries yet')} />}
      />
    </>
  )
}

// ── Expenses ────────────────────────────────────────────────────────────────
type Expense = RowOf<'expenses'>

export function Expenses() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: expenses = [], isLoading, isError, error, refetch } = useCollection('expenses')
  const { query, setQuery, filtered } = useFilter(expenses, (e) => [e.id, e.category, e.vendor])
  const [creatingExpense, setCreatingExpense] = useState(false)

  if (isError) return <Card className="p-6"><ErrorState description={error?.message} onRetry={() => void refetch()} /></Card>

  const columns: Column<Expense>[] = [
    { header: 'Expense #', cell: (e) => e.id, code: true },
    { header: 'Date', cell: (e) => e.date },
    { header: 'Category', cell: (e) => t(e.category) },
    { header: 'Vendor', cell: (e) => e.vendor },
    { header: 'Amount', cell: (e) => <Money sar={parseSar(e.amount)} className="font-semibold" /> },
    { header: 'Status', cell: (e) => <LedgerStatus value={e.status} /> },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Receipt" title={t('Expenses')} subtitle={t(ACCOUNTING)} />
        <DataTable
          caption="Expenses"
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          loading={isLoading}
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
          empty={<EmptyState icon="Receipt" title={t('No expenses recorded')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Expenses')}
        subtitle={t(ACCOUNTING)}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('accounting', 'c') ? (
            <Button size="md" onClick={() => setCreatingExpense(true)}>
              <Icon name="Plus" size={16} />
              {t('New Expense')}
            </Button>
          ) : null
        }
      />
      <ExpenseFormModal open={creatingExpense} onClose={() => setCreatingExpense(false)} />
      <DataTable
        caption="Expenses"
        columns={columns}
        rows={filtered}
        rowKey={(e) => e.id}
        loading={isLoading}
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
        empty={<EmptyState icon="Receipt" title={t('No expenses recorded')} />}
      />
    </>
  )
}

// ── Receipts ────────────────────────────────────────────────────────────────
type Receipt = RowOf<'receipts'>

export function Receipts() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: receipts = [], isLoading, isError, error, refetch } = useCollection('receipts')
  const { query, setQuery, filtered } = useFilter(receipts, (r) => [r.id, r.customer, r.invoice])
  const [raising, setRaising] = useState(false)

  if (isError) return <Card className="p-6"><ErrorState description={error?.message} onRetry={() => void refetch()} /></Card>

  const columns: Column<Receipt>[] = [
    { header: 'Receipt #', cell: (r) => r.id, code: true },
    { header: 'Date', cell: (r) => r.date },
    { header: 'Customer', cell: (r) => r.customer },
    { header: 'Invoice', cell: (r) => r.invoice, code: true },
    { header: 'Payment Method', cell: (r) => t(r.method) },
    { header: 'Amount', cell: (r) => <Money sar={parseSar(r.amount)} className="font-semibold" /> },
    { header: 'Status', cell: (r) => <LedgerStatus value={r.status} /> },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader
          icon="Receipt"
          title={t('Receipts')}
          actions={
            can('payments', 'c') ? (
              <Button size="md" onClick={() => setRaising(true)}>
                <Icon name="Plus" size={16} />
                {t('New Receipt')}
              </Button>
            ) : null
          }
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('Search receipts...')}
          aria-label={t('Search receipts')}
          className="h-10 w-full rounded-lg border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
        />
        <DataTable
          caption="Cash receipts"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          loading={isLoading}
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
          empty={<EmptyState icon="Receipt" title={t('No receipts yet')} />}
        />
        <RaiseReceiptModal open={raising} onClose={() => setRaising(false)} />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Receipts')}
        subtitle={t(ACCOUNTING)}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('payments', 'c') ? (
            <Button size="md" onClick={() => setRaising(true)}>
              <Icon name="Plus" size={16} />
              {t('New Receipt')}
            </Button>
          ) : null
        }
      />
      <DataTable
        caption="Cash receipts"
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        loading={isLoading}
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
        empty={<EmptyState icon="Receipt" title={t('No receipts yet')} />}
      />
      <RaiseReceiptModal open={raising} onClose={() => setRaising(false)} />
    </>
  )
}

// ── Departments ─────────────────────────────────────────────────────────────
type Department = RowOf<'departments'>

export function Departments() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: departments = [], isLoading, isError, error, refetch } = useCollection('departments')
  const { query, setQuery, filtered } = useFilter(departments, (d) => [d.name, d.head, d.branch])
  const [addingDepartment, setAddingDepartment] = useState(false)

  if (isError) return <Card className="p-6"><ErrorState description={error?.message} onRetry={() => void refetch()} /></Card>

  const columns: Column<Department>[] = [
    {
      header: 'Name',
      cell: (d) => (
        <span className="flex items-center gap-2">
          <Icon name={d.icon} size={15} className="text-salis-blue" />
          {t(d.name)}
        </span>
      ),
    },
    { header: 'Department Head', cell: (d) => d.head },
    { header: 'Headcount', cell: (d) => d.headcount },
    { header: 'Cost Center', cell: (d) => d.costCenter, code: true },
    { header: 'Branch', cell: (d) => t(d.branch) },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Building2" title={t('Departments')} subtitle={t('Administration')} />
        <DataTable
          caption="Departments and cost centres"
          columns={columns}
          rows={filtered}
          rowKey={(d) => d.costCenter}
          loading={isLoading}
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
          empty={<EmptyState icon="Building2" title={t('No departments yet')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Departments')}
        subtitle={t('Administration')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('hr', 'c') ? (
            <Button size="md" onClick={() => setAddingDepartment(true)}>
              <Icon name="Plus" size={16} />
              {t('Add Department')}
            </Button>
          ) : null
        }
      />
      <DepartmentFormModal open={addingDepartment} onClose={() => setAddingDepartment(false)} />
      <DataTable
        caption="Departments and cost centres"
        columns={columns}
        rows={filtered}
        rowKey={(d) => d.costCenter}
        loading={isLoading}
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
        empty={<EmptyState icon="Building2" title={t('No departments yet')} />}
      />
    </>
  )
}
