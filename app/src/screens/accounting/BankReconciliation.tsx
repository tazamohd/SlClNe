import { useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/DataTable'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** A bank-statement line waiting to be matched against the ledger.
 *
 *  No collection in `repository.ts` is bank-feed-shaped — `chartOfAccounts`,
 *  `journalEntries`, `expenses` and `receipts` are the accounting collections
 *  it exposes, none of which models an imported statement line or a match
 *  state. These are the future `bankStatementLines` read, typed the way that
 *  collection will come back once an import endpoint exists; `list()` would
 *  return exactly this shape. */
interface StatementLine {
  id: string
  desc: string
  date: string
  /** Signed: negative = bank withdrawal/debit, positive = deposit/credit. */
  amountSar: number
}

const UNMATCHED_LINES: StatementLine[] = [
  { id: 'u1', desc: 'ATM Withdrawal', date: 'Jul 20, 2026', amountSar: -2000 },
  { id: 'u2', desc: 'Bank Fee', date: 'Jul 18, 2026', amountSar: -150 },
  { id: 'u3', desc: 'Unknown Deposit', date: 'Jul 15, 2026', amountSar: 5400 },
  { id: 'u4', desc: 'Card Transaction', date: 'Jul 12, 2026', amountSar: -6500 },
]

const MATCHED_LINES: StatementLine[] = [
  { id: 'm1', desc: 'Customer Payment — Ahmed Al-Rashid', date: 'Jul 21, 2026', amountSar: 1840 },
  { id: 'm2', desc: 'Supplier Payment — AutoParts KSA', date: 'Jul 19, 2026', amountSar: 12800 },
  { id: 'm3', desc: 'Salary Transfer — July Payroll', date: 'Jul 18, 2026', amountSar: 45000 },
]

/** The bank statement's closing balance, as the import would report it —
 *  again a stand-in for the not-yet-existing `bankStatementLines` read. */
const BANK_STATEMENT_BALANCE = 842500

/** Bank feed reconciliation: match unclassified statement lines against the
 *  ledger until the bank and book balances agree.
 *
 *  Book balance and the difference are computed from the unmatched lines
 *  rather than hardcoded — moving a line to "Matched" changes both figures
 *  immediately, the same way JournalEntries derives its debit/credit totals
 *  and ChartOfAccounts derives account balances from the rows underneath
 *  them. The design's own numbers already tie out this way: its four
 *  unmatched lines net to -3,250, exactly the 842,500 → 839,250 gap it shows,
 *  so deriving instead of hardcoding doesn't change what's on screen. */
export function BankReconciliation() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()

  const [unmatched, setUnmatched] = useState<StatementLine[]>(UNMATCHED_LINES)
  const [matched, setMatched] = useState<StatementLine[]>(MATCHED_LINES)
  const canMatch = can('accounting', 'e')

  const netUnmatched = useMemo(
    () => unmatched.reduce((sum, line) => sum + line.amountSar, 0),
    [unmatched]
  )
  const bookBalance = BANK_STATEMENT_BALANCE + netUnmatched
  const difference = Math.abs(BANK_STATEMENT_BALANCE - bookBalance)
  const reconciled = difference < 0.005

  function match(line: StatementLine) {
    setUnmatched((prev) => prev.filter((item) => item.id !== line.id))
    setMatched((prev) => [{ ...line, amountSar: Math.abs(line.amountSar) }, ...prev])
    toast.show({ title: t('Matched'), description: t(line.desc) })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-lg"
              aria-hidden
            />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="ArrowLeftRight" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-3xl font-black text-heading">
              {t('Bank Reconciliation')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Accounting')}</p>
          </div>
        </div>
        {can('accounting', 'c') ? (
          <Button size="md">
            <Icon name="Upload" size={15} />
            {t('Import Statement')}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Icon name="Building" size={16} />}
          label={t('Bank Balance')}
          value={formatSar(BANK_STATEMENT_BALANCE)}
          tone="blue"
        />
        <StatCard
          icon={<Icon name="BookOpen" size={16} />}
          label={t('Book Balance')}
          value={formatSar(bookBalance)}
          tone="bright"
        />
        <StatCard
          icon={
            reconciled ? (
              <CheckCircle size={16} strokeWidth={2} />
            ) : (
              <AlertTriangle size={16} strokeWidth={2} />
            )
          }
          label={t('Difference')}
          value={formatSar(difference)}
          tone={reconciled ? 'blue' : 'orange'}
          emphasize
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-heading">{t('Unmatched')}</h3>
            <span className="rounded-full bg-[rgba(249,115,22,.1)] px-2.5 py-0.5 text-xs font-semibold text-salis-orange">
              {unmatched.length} {t('items')}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {unmatched.length === 0 ? (
              <EmptyState
                icon="CheckCheck"
                title={t('All caught up')}
                description={t('Every statement line has been matched.')}
              />
            ) : (
              unmatched.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center gap-3 rounded-[10px] border border-border bg-inset p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-heading">
                      {t(line.desc)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted" dir="ltr">
                      {line.date}
                    </p>
                  </div>
                  <span
                    dir="ltr"
                    className="flex-shrink-0 font-mono text-[13px] font-semibold text-salis-orange"
                  >
                    {line.amountSar < 0 ? '-' : '+'}
                    {formatSar(Math.abs(line.amountSar))}
                  </span>
                  {canMatch ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 flex-shrink-0 bg-[rgba(10,94,215,.08)] px-2.5 text-[11px]"
                      onClick={() => match(line)}
                    >
                      {t('Match')}
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-heading">{t('Matched')}</h3>
            <span className="rounded-full bg-[rgba(10,94,215,.1)] px-2.5 py-0.5 text-xs font-semibold text-salis-blue">
              {matched.length} {t('items')}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {matched.length === 0 ? (
              <EmptyState
                icon="Inbox"
                title={t('No matches yet')}
                description={t('Matched statement lines will appear here.')}
              />
            ) : (
              matched.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center gap-3 rounded-[10px] border border-border bg-inset p-3"
                >
                  <CheckCircle
                    size={16}
                    strokeWidth={2}
                    className="flex-shrink-0 text-salis-blue"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-heading">
                      {t(line.desc)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted" dir="ltr">
                      {line.date}
                    </p>
                  </div>
                  <Money
                    sar={line.amountSar}
                    className="flex-shrink-0 text-[13px] font-semibold text-heading"
                  />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone,
  emphasize,
}: {
  icon: ReactNode
  label: string
  value: string
  /** Blue = matched/cleared, bright = informational, orange = discrepancy —
   *  never green/red/yellow/purple/pink/teal (README §7). */
  tone: 'blue' | 'bright' | 'orange'
  /** The difference card also colours its value, and borders itself when
   *  there's a discrepancy to flag — the other two stay neutral. */
  emphasize?: boolean
}) {
  const chipTone: Record<typeof tone, string> = {
    blue: 'bg-[rgba(10,94,215,.1)] text-salis-blue',
    bright: 'bg-[rgba(11,179,255,.1)] text-salis-bright',
    orange: 'bg-[rgba(249,115,22,.1)] text-salis-orange',
  }
  return (
    <Card
      className={cn(
        'p-4',
        emphasize && tone === 'orange' && 'border-[rgba(249,115,22,.3)]'
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('flex rounded-lg p-1.5', chipTone[tone])}>{icon}</span>
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>
      <h4
        dir="ltr"
        className={cn(
          'mt-2 font-display text-2xl font-black',
          emphasize && tone === 'orange' ? 'text-salis-orange' : 'text-heading'
        )}
      >
        {value}
      </h4>
    </Card>
  )
}
