/** Posting to the general ledger — the one place a business event becomes an
 *  accounting entry.
 *
 *  Before this module nothing in `server/src/routes` ever wrote to
 *  `journal_entries` or `chart_of_accounts`. The trial balance and the VAT
 *  return read rows that existed only because the seed put them there, so both
 *  reported on seed data rather than on trading activity, and a comment in
 *  `routes/finance-reports.ts` described the per-entry balance as "enforced by
 *  `checkJournalBalanced`" — which was true of no code path, because the rule
 *  takes lines and the schema had none.
 *
 *  Every posting goes through `postJournalEntry`. That is the point: one
 *  function means one place where the balance rule runs, one place where
 *  account balances move, and one place to read when a figure on a report
 *  looks wrong.
 */
import { and, eq, inArray, isNull, sql } from 'drizzle-orm'
import { ulid } from 'ulid'
import { checkJournalBalanced } from '@salis/contract/rules'
import { chartOfAccounts, journalEntries, journalLines } from '../db/schema'
import type { Principal, Tx } from '../db/tenant'
import { ruleViolated } from '../http/errors'

/** The accounts the posting rules are written against, by the code the seeded
 *  chart of accounts uses. Codes rather than names: a name is presentation and
 *  may be translated, a code is the identifier a bookkeeper works in. */
export const ACCOUNT = {
  cash: '1000',
  accountsReceivable: '1100',
  inventory: '1200',
  accountsPayable: '2000',
  vatPayable: '2100',
  revenue: '4000',
  operatingExpenses: '6000',
} as const

/** Which side increases an account, by its class.
 *
 *  `chart_of_accounts.balance_halalas` holds a positive natural balance — the
 *  trial balance sums assets and expenses as debits and liabilities, equity and
 *  revenue as credits — so a posting moves a balance by the signed amount on
 *  its own natural side. Getting this backwards would not fail loudly; it would
 *  quietly produce a trial balance that still balances and is wrong, which is
 *  why it is stated once here rather than inline at each call site. */
const DEBIT_POSITIVE = new Set(['Assets', 'Expense'])

export interface PostingLine {
  accountCode: string
  debitHalalas?: number
  creditHalalas?: number
  narration?: string | null
}

export interface PostingInput {
  entryDate: string
  /** The business document this entry came from, e.g. `INV-2026-0142`. */
  ref: string | null
  narration: string
  /** What produced it (`invoice`, `payment`, `goods_receipt`) and that
   *  document's id, so a posting is traceable back to its event. */
  source: string
  sourceId: string
  lines: readonly PostingLine[]
}

/** Posts one balanced journal entry and moves the account balances with it.
 *
 *  Returns the entry id. Throws `rule_violated` when the lines do not balance
 *  or name an account this organization does not have — both are programming
 *  errors rather than user errors, and both are worth failing the whole
 *  transaction for: a half-posted ledger is worse than an unposted one.
 */
export async function postJournalEntry(
  tx: Tx,
  principal: Principal,
  input: PostingInput,
): Promise<string> {
  const lines = input.lines
    .map((line) => ({
      ...line,
      debitHalalas: line.debitHalalas ?? 0,
      creditHalalas: line.creditHalalas ?? 0,
    }))
    /* A zero line is legitimate upstream — an invoice with no VAT, a fully
     * discounted line — and meaningless in the ledger. Dropping it here keeps
     * the callers free of `if (tax > 0)` noise, and keeps `checkJournalBalanced`
     * looking at the lines that actually exist. */
    .filter((line) => line.debitHalalas !== 0 || line.creditHalalas !== 0)

  /* The rule that had no caller. It requires at least two lines and equal
   * totals; both are exactly what a posting must satisfy. */
  const failure = checkJournalBalanced(lines)
  if (failure) throw ruleViolated(failure.message)

  const codes = [...new Set(lines.map((line) => line.accountCode))]
  const accounts = await tx
    .select({
      id: chartOfAccounts.id,
      code: chartOfAccounts.code,
      type: chartOfAccounts.type,
      balanceHalalas: chartOfAccounts.balanceHalalas,
    })
    .from(chartOfAccounts)
    .where(and(inArray(chartOfAccounts.code, codes), isNull(chartOfAccounts.deletedAt)))
    .for('update')
  const byCode = new Map(accounts.map((account) => [account.code, account]))

  const missing = codes.filter((code) => !byCode.has(code))
  if (missing.length) {
    throw ruleViolated(
      `The chart of accounts has no account ${missing.join(', ')}. The ledger cannot be posted to until it does.`,
    )
  }

  const totalDebit = lines.reduce((sum, line) => sum + line.debitHalalas, 0)
  const totalCredit = lines.reduce((sum, line) => sum + line.creditHalalas, 0)

  const entryId = ulid()
  await tx.insert(journalEntries).values({
    id: entryId,
    orgId: principal.orgId,
    branchId: principal.branchId,
    code: await nextJournalCode(tx),
    entryDate: input.entryDate,
    ref: input.ref,
    narration: input.narration,
    debitHalalas: totalDebit,
    creditHalalas: totalCredit,
    status: 'posted',
    source: input.source,
    sourceId: input.sourceId,
    createdBy: principal.userId,
    updatedBy: principal.userId,
  })

  await tx.insert(journalLines).values(
    lines.map((line, index) => {
      const account = byCode.get(line.accountCode)
      if (!account) throw ruleViolated(`Unknown account ${line.accountCode}.`)
      return {
        id: ulid(),
        orgId: principal.orgId,
        branchId: principal.branchId,
        journalEntryId: entryId,
        accountId: account.id,
        accountCode: account.code,
        debitHalalas: line.debitHalalas,
        creditHalalas: line.creditHalalas,
        narration: line.narration ?? null,
        sort: index,
        createdBy: principal.userId,
        updatedBy: principal.userId,
      }
    }),
  )

  /* Balances move per account, not per line: two lines against one account in
   * the same entry net off, which is what a bookkeeper would expect. */
  const deltaByCode = new Map<string, number>()
  for (const line of lines) {
    const account = byCode.get(line.accountCode)
    if (!account) continue
    const natural = DEBIT_POSITIVE.has(account.type)
      ? line.debitHalalas - line.creditHalalas
      : line.creditHalalas - line.debitHalalas
    deltaByCode.set(line.accountCode, (deltaByCode.get(line.accountCode) ?? 0) + natural)
  }

  for (const [code, delta] of deltaByCode) {
    if (delta === 0) continue
    const account = byCode.get(code)
    if (!account) continue
    await tx
      .update(chartOfAccounts)
      .set({
        balanceHalalas: sql`${chartOfAccounts.balanceHalalas} + ${delta}`,
        updatedBy: principal.userId,
      })
      .where(eq(chartOfAccounts.id, account.id))
  }

  return entryId
}

/** Whether this document has already been posted.
 *
 *  Issuing is guarded against replay by its own status check and payments by
 *  the idempotency key, so this is a belt-and-braces read rather than the
 *  primary defence — but a double posting is silent and permanent, and a
 *  cheap select is a fair price for making it impossible. */
export async function alreadyPosted(
  tx: Tx,
  source: string,
  sourceId: string,
): Promise<boolean> {
  const [row] = await tx
    .select({ id: journalEntries.id })
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.source, source),
        eq(journalEntries.sourceId, sourceId),
        isNull(journalEntries.deletedAt),
      ),
    )
    .limit(1)
  return !!row
}

async function nextJournalCode(tx: Tx): Promise<string> {
  const [row] = await tx.select({ value: sql<number>`count(*)::int` }).from(journalEntries)
  const year = new Date().getUTCFullYear()
  return `JE-${year}-${String((row?.value ?? 0) + 1).padStart(4, '0')}`
}
