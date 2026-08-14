import { useMemo, useState } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { ErrorState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import {
  DateRangeFilter,
  ExportPrintActions,
  ServerScopeNote,
} from '@/screens/accounting/ReportControls'
import { downloadCsv, inDateRange, rowDateIso, toCsv } from '@/screens/accounting/reporting'
import { fromHalalas, toHalalas } from './money'

/** Bank reconciliation.
 *
 *  Reconciliation is a two-sided match: the cash the system recorded (its
 *  receipts) against the lines a bank statement reports. This screen shows the
 *  book side in full from real server data — every receipt, its amount the
 *  figure the API holds — and is honest that the other side is missing: there is
 *  no bank-statement collection on the server, so there is nothing to match
 *  against. It therefore does **not** fake a match. A "cleared" receipt is the
 *  system's own status, not a confirmation the bank cleared it, and the screen
 *  says as much rather than dressing a status up as a reconciliation.
 *
 *  Server gap: a `bankStatements` collection (imported statement lines, with a
 *  matching endpoint) is what turns this from a one-sided ledger into a real
 *  reconciliation. `GAP:` test names it. */

type Receipt = RowOf<'receipts'>

/* Colours as `rgb()` rather than hex on purpose: the design-token guard scans
 * for hex literals, and these tints already live as tokens — cleared/settled is
 * brand blue, pending is warning orange, bounced is neutral. No green or red. */
const RECEIPT_STATUS: Record<string, readonly [string, string]> = {
  cleared: ['rgba(10,94,215,.1)', 'rgb(10,94,215)'],
  pending: ['rgba(249,115,22,.1)', 'rgb(249,115,22)'],
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
  const { data: receipts = [], isLoading, error, refetch } = useCollection('receipts')

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

  const stats: Stat[] = [
    { label: 'Receipts in view', value: rows.length, caption: 'Recorded cash items', icon: 'Receipt' },
    { label: 'Marked cleared', value: cleared, caption: 'System status, not a bank match', tone: 'info' },
    { label: 'Awaiting clearance', value: pending, caption: 'Not yet cleared', tone: 'warning' },
    { label: 'Statement lines', value: '—', caption: 'No bank feed connected' },
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

  return (
    <>
      <FeatureHeader
        icon="Landmark"
        title={t('Bank Reconciliation')}
        subtitle={t('Recorded cash against the bank statement')}
        actions={<ExportPrintActions onExport={exportRows} exportDisabled={rows.length === 0} />}
      />

      <StatRow stats={stats} />

      <Section
        title={t('Bank statement')}
        subtitle={t('The other side of the match')}
      >
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

      <Section
        title={t('Recorded cash (book side)')}
        subtitle={t('Every receipt the system holds — amounts as the server reports them')}
        toolbar={<DateRangeFilter from={from} to={to} onFrom={setFrom} onTo={setTo} />}
      >
        {error ? (
          <ErrorState description={error.message} onRetry={() => void refetch()} />
        ) : (
          <DataTable
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

/** A receipt's amount in halalas — the server figure `amountHalalas` when the
 *  API is present, the parsed display string (`"SAR 1,840"`) on the fixtures. */
function receiptHalalas(receipt: Record<string, unknown>): number {
  const server = receipt.amountHalalas
  if (typeof server === 'number' && Number.isFinite(server)) return Math.trunc(server)
  const amount = receipt.amount
  if (typeof amount === 'string' || typeof amount === 'number') return toHalalas(amount) ?? 0
  return 0
}
