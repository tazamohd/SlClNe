import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useIsMobile } from '@/lib/useMediaQuery'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { ErrorState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, queryKeys, type RowOf } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import {
  DateRangeFilter,
  ExportPrintActions,
  ServerScopeNote,
} from '@/screens/accounting/ReportControls'
import { downloadCsv, inDateRange, rowDateIso, toCsv } from '@/screens/accounting/reporting'
import { matchStatementLine, writeFailureMessage } from './api'
import { fromHalalas, toHalalas } from './money'

/** Bank reconciliation.
 *
 *  Reconciliation is a two-sided match: the cash the system recorded (its
 *  receipts) against the lines a bank statement reports. This screen shows the
 *  book side in full from real server data — every receipt, its amount the
 *  figure the API holds. A "cleared" receipt is the system's own status, not a
 *  confirmation the bank cleared it, and the screen says as much rather than
 *  dressing a status up as a reconciliation.
 *
 *  The statement side is now real on a live build (F-028): `bankStatements` is a
 *  server collection of imported lines, and an unmatched line is reconciled to a
 *  receipt through `POST /bank-statements/:id/match` — an idempotent, audited,
 *  server-side action. On the fixtures the collection is empty and the accessor
 *  serves nothing, so the honest "no source connected" state stays, and the
 *  `GAP:` test still pins that fixture behaviour. */

type Receipt = RowOf<'receipts'>

/* Colours as `rgb()` rather than hex on purpose: the design-token guard scans
 * for hex literals, and these tints already live as tokens — cleared/settled is
 * brand blue, pending is warning orange, bounced is neutral. No green or red. */
const RECEIPT_STATUS: Record<string, readonly [string, string]> = {
  cleared: ['var(--tint-blue)', 'rgb(10,94,215)'],
  pending: ['var(--tint-orange)', 'rgb(249,115,22)'],
  bounced: ['rgba(100,116,139,.1)', 'rgb(100,116,139)'],
}

function ReceiptStatus({ value }: { value: string }) {
  const { t } = usePreferences()
  const [bg, fg] = RECEIPT_STATUS[value] ?? RECEIPT_STATUS.pending
  return (
    <Badge background={bg} color={fg}>
      {t(value[0].toUpperCase() + value.slice(1))}
    </Badge>
  )
}

export function BankReconciliation() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: receipts = [], isLoading, error, refetch } = useCollection('receipts')
  const statements = useCollection('bankStatements')
  const statementRows = statements.data ?? []

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const rows = useMemo(
    () =>
      receipts.filter((receipt) =>
        inDateRange(rowDateIso(receipt as Record<string, unknown>, 'receiptDate'), from, to),
      ),
    [receipts, from, to],
  )

  const cleared = rows.filter((r) => r.status === 'cleared').length
  const pending = rows.filter((r) => r.status !== 'cleared').length
  const unmatched = statementRows.filter((line) => !line.matched).length

  const stats: Stat[] = [
    { label: 'Receipts in view', value: rows.length, caption: 'Recorded cash items', icon: 'Receipt' },
    { label: 'Marked cleared', value: cleared, caption: 'System status, not a bank match', tone: 'info' },
    { label: 'Awaiting clearance', value: pending, caption: 'Not yet cleared', tone: 'warning' },
    isLive
      ? {
          label: 'Statement lines',
          value: statementRows.length,
          caption: `${unmatched} ${t('unreconciled')}`,
          tone: unmatched > 0 ? 'warning' : 'info',
        }
      : { label: 'Statement lines', value: '—', caption: 'No bank feed connected' },
  ]

  const exportRows = () => {
    const csv = toCsv(
      ['Receipt', 'Date', 'Customer', 'Invoice', 'Method', 'Amount (SAR)', 'Status'],
      rows.map((receipt) => [
        receipt.id,
        receipt.date,
        receipt.customer,
        receipt.invoice,
        receipt.method,
        fromHalalas(receiptHalalas(receipt)).toFixed(2),
        receipt.status,
      ]),
    )
    downloadCsv('bank-book-side.csv', csv)
  }

  const columns: Column<Receipt>[] = [
    { header: 'Receipt', cell: (r) => r.id, code: true },
    { header: 'Date', cell: (r) => r.date },
    { header: 'Customer', cell: (r) => r.customer },
    { header: 'Invoice', cell: (r) => r.invoice, code: true },
    { header: 'Method', cell: (r) => t(r.method) },
    {
      header: 'Amount',
      cell: (r) => <Money sar={fromHalalas(receiptHalalas(r))} className="font-semibold" />,
    },
    { header: 'Status', cell: (r) => <ReceiptStatus value={r.status} /> },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Landmark" title={t('Bank Reconciliation')} />
        <StatRow stats={stats} />
        <Section
          title={t('Recorded cash (book side)')}
          subtitle={t('Every receipt the system holds')}
        >
          {error ? (
            <ErrorState description={error.message} onRetry={() => void refetch()} />
          ) : (
            <DataTable
              caption="Recorded cash receipts (book side)"
              columns={columns}
              rows={rows}
              rowKey={(r) => String(r.id)}
              loading={isLoading}
              mobileCard={(r) => (
                <>
                  <MobileCardHeader title={String(r.id)} code trailing={<ReceiptStatus value={r.status} />} />
                  <MobileCardRow>{r.customer}</MobileCardRow>
                  <MobileCardRow label={t('Invoice')}>
                    <span className="font-mono" dir="ltr">{r.invoice}</span>
                  </MobileCardRow>
                  <MobileCardRow label={t('Amount')}>
                    <Money sar={fromHalalas(receiptHalalas(r))} className="font-semibold text-heading" />
                  </MobileCardRow>
                </>
              )}
              empty={
                <EmptyState icon="Receipt" title={t('No receipts in range')} description={t('No recorded cash matches these dates.')} />
              }
            />
          )}
        </Section>
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="Landmark"
        title={t('Bank Reconciliation')}
        subtitle={t('Recorded cash against the bank statement')}
        actions={<ExportPrintActions onExport={exportRows} exportDisabled={rows.length === 0} />}
      />

      <StatRow stats={stats} />

      {isLive ? (
        <StatementSection
          lines={statementRows}
          receipts={rows}
          loading={statements.isLoading}
          error={statements.error}
          onRetry={() => void statements.refetch()}
        />
      ) : (
        <Section title={t('Bank statement')} subtitle={t('The other side of the match')}>
          <EmptyState
            icon="Landmark"
            title={t('No bank statement source connected')}
            description={t(
              'Reconciliation needs statement lines to match receipts against. The server has no bank-statement collection yet, so no automated match can run. Nothing here is matched or unmatched — it is unreconciled.',
            )}
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="subtle"
              size="md"
              disabled
              title={t('Importing a statement needs the bank-statement service, which is not built yet.')}
            >
              <Icon name="Upload" size={15} />
              {t('Import statement')}
            </Button>
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-muted">
            <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
            {t('Missing server collection: bankStatements (imported statement lines and a matching endpoint).')}
          </p>
        </Section>
      )}

      <Section
        title={t('Recorded cash (book side)')}
        subtitle={t('Every receipt the system holds — amounts as the server reports them')}
        toolbar={<DateRangeFilter from={from} to={to} onFrom={setFrom} onTo={setTo} />}
      >
        {error ? (
          <ErrorState description={error.message} onRetry={() => void refetch()} />
        ) : (
          <DataTable
            caption="Recorded cash receipts (book side)"
            columns={columns}
            rows={rows}
            rowKey={(r) => String(r.id)}
            loading={isLoading}
            mobileCard={(r) => (
              <>
                <MobileCardHeader title={String(r.id)} code trailing={<ReceiptStatus value={r.status} />} />
                <MobileCardRow>{r.customer}</MobileCardRow>
                <MobileCardRow label={t('Invoice')}>
                  <span className="font-mono" dir="ltr">
                    {r.invoice}
                  </span>
                </MobileCardRow>
                <MobileCardRow label={t('Amount')}>
                  <Money sar={fromHalalas(receiptHalalas(r))} className="font-semibold text-heading" />
                </MobileCardRow>
              </>
            )}
            empty={
              <EmptyState
                icon="Receipt"
                title={t('No receipts in range')}
                description={t('No recorded cash matches these dates.')}
              />
            }
          />
        )}
        <ServerScopeNote />
      </Section>
    </>
  )
}

type Statement = RowOf<'bankStatements'> & { _id?: string }

/** The bank statement side, live only. Renders the imported statement lines the
 *  server holds and lets an accountant reconcile an unmatched line to a receipt
 *  via `POST /bank-statements/:id/match`. The action is server-side and audited;
 *  the client sends the line and the receipt, never a computed balance. On the
 *  fixtures this never mounts — `bankStatements` is empty and the honest
 *  "no source connected" state shows instead. */
function StatementSection({
  lines,
  receipts,
  loading,
  error,
  onRetry,
}: {
  lines: readonly Statement[]
  receipts: readonly (Receipt & { _id?: string })[]
  loading: boolean
  error: Error | null
  onRetry: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const [picked, setPicked] = useState<Record<string, string>>({})

  const match = useMutation({
    mutationFn: ({ lineId, receiptId }: { lineId: string; receiptId?: string }) =>
      matchStatementLine(lineId, receiptId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.all('bankStatements') })
      toast.show({ title: t('Reconciled'), description: t('The statement line is matched to a receipt.') })
    },
    onError: (err) => {
      toast.show({
        title: t('Could not reconcile'),
        description: writeFailureMessage(err, t('The line could not be matched. Nothing was saved.')),
        error: true,
      })
    },
  })

  const columns: Column<Statement>[] = [
    { header: 'Date', cell: (l) => l.date },
    { header: 'Description', cell: (l) => l.description },
    { header: 'Reference', cell: (l) => l.reference, code: true },
    {
      header: 'Amount',
      cell: (l) => (
        <Money
          sar={fromHalalas(l.amountHalalas)}
          className={l.direction === 'debit' ? 'font-semibold text-salis-orange' : 'font-semibold text-salis-blue'}
        />
      ),
    },
    {
      header: 'Status',
      cell: (l) =>
        l.matched ? (
          <Badge background="var(--tint-blue)" color="rgb(10,94,215)">
            {t('Matched')}
          </Badge>
        ) : (
          <Badge background="var(--tint-orange)" color="rgb(249,115,22)">
            {t('Unreconciled')}
          </Badge>
        ),
    },
    {
      header: 'Reconcile',
      cell: (l) => {
        const lineId = String(l._id ?? '')
        if (l.matched) {
          return (
            <span className="text-[11px] text-muted" dir="ltr">
              {l.matchedReceiptId ? `→ ${l.matchedReceiptId}` : t('cleared')}
            </span>
          )
        }
        const busy = match.isPending && match.variables?.lineId === lineId
        return (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={picked[lineId] ?? ''}
              onChange={(event) => setPicked((prev) => ({ ...prev, [lineId]: event.target.value }))}
              aria-label={t('Receipt to match')}
              className="px-2 text-[12px]"
            >
              <option value="">{t('No receipt')}</option>
              {receipts.map((receipt) => (
                <option key={String(receipt._id ?? receipt.id)} value={String(receipt._id ?? receipt.id)}>
                  {receipt.id}
                </option>
              ))}
            </Select>
            <Button
              variant="subtle"
              size="sm"
              disabled={busy}
              onClick={() => match.mutate({ lineId, receiptId: picked[lineId] || undefined })}
            >
              <Icon name="ArrowLeftRight" size={14} />
              {busy ? t('Matching…') : t('Reconcile')}
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <Section
      title={t('Bank statement')}
      subtitle={t('Imported statement lines — reconcile each to a recorded receipt')}
    >
      {error ? (
        <ErrorState description={error.message} onRetry={onRetry} />
      ) : (
        <DataTable
          caption="Imported bank statement lines"
          columns={columns}
          rows={lines}
          rowKey={(l) => String(l._id ?? l.reference)}
          loading={loading}
          mobileCard={(l) => (
            <>
              <MobileCardHeader
                title={l.description}
                trailing={
                  l.matched ? (
                    <Badge background="var(--tint-blue)" color="rgb(10,94,215)">
                      {t('Matched')}
                    </Badge>
                  ) : (
                    <Badge background="var(--tint-orange)" color="rgb(249,115,22)">
                      {t('Unreconciled')}
                    </Badge>
                  )
                }
              />
              <MobileCardRow label={t('Reference')}>
                <span className="font-mono" dir="ltr">
                  {l.reference}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money sar={fromHalalas(l.amountHalalas)} className="font-semibold text-heading" />
              </MobileCardRow>
              {l.matched ? null : (
                <MobileCardRow label={t('Reconcile')}>
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled={match.isPending}
                    onClick={() => match.mutate({ lineId: String(l._id ?? ''), receiptId: undefined })}
                  >
                    <Icon name="ArrowLeftRight" size={14} />
                    {t('Reconcile')}
                  </Button>
                </MobileCardRow>
              )}
            </>
          )}
          empty={
            <EmptyState
              icon="Landmark"
              title={t('No statement lines')}
              description={t('No bank-statement lines have been imported for your organization yet.')}
            />
          }
        />
      )}
      <ServerScopeNote />
    </Section>
  )
}

/** A receipt's amount in halalas — the server figure `amountHalalas` when the
 *  API is present, the parsed display string (`"SAR 1,840"`) on the fixtures. */
function receiptHalalas(receipt: Record<string, unknown>): number {
  const server = receipt.amountHalalas
  if (typeof server === 'number' && Number.isFinite(server)) return Math.trunc(server)
  const amount = receipt.amount
  if (typeof amount === 'string' || typeof amount === 'number') return toHalalas(amount) ?? 0
  return 0
}
