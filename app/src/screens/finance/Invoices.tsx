import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { useCommand, type Command } from '@/components/shell/commands'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { ExportCenter, type ExportColumn } from '@/components/ui/ExportCenter'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { KpiCard, TONES } from '@/components/ui/KpiCard'
import { Money, formatSar } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useDebounce } from '@/lib/useDebounce'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { OverflowItem } from '@/screens/registry/registryShared'
import { InvoiceRowActions } from './InvoiceActions'
import { RecordPaymentModal, type PayableInvoice } from './RecordPaymentModal'
import { fromHalalas, invoiceMoney } from './money'

type Invoice = RowOf<'invoices'>

/** Invoice status palette. Paid is brand blue, overdue is the warning orange,
 *  unpaid is neutral slate — no green or red anywhere (README §7).
 *
 *  `draft` and `partial` arrive from the API, which carries the full lifecycle
 *  the design's three statuses only sampled. */
export const INVOICE_STATUS: Record<string, readonly [string, string]> = {
  draft: ['var(--tint-neutral)', 'var(--text-muted)'],
  paid: ['var(--tint-blue)', 'var(--salis-blue)'],
  partial: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  unpaid: ['var(--tint-neutral)', 'var(--text-muted)'],
  overdue: ['var(--tint-orange)', 'var(--salis-orange)'],
  cancelled: ['var(--tint-neutral)', 'var(--text-muted)'],
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const { t } = usePreferences()
  const [background, color] = INVOICE_STATUS[status] ?? INVOICE_STATUS.unpaid
  return (
    <Badge background={background} color={color}>
      {t(status[0].toUpperCase() + status.slice(1))}
    </Badge>
  )
}

/** The invoice as this screen hands it to the shared actions. */
function payable(invoice: Invoice): PayableInvoice {
  return invoice as unknown as PayableInvoice
}

/** "Jul 28, 2026" → epoch ms, or `null` when the string is not a date. */
function dueEpoch(invoice: Invoice): number | null {
  const parsed = Date.parse(invoice.due)
  return Number.isNaN(parsed) ? null : parsed
}

/** Overdue is a status the API sets, but a fixture row only carries a due
 *  date — so a past due date on an unpaid invoice counts too. */
function isOverdue(invoice: Invoice, now: number): boolean {
  if (invoice.status === 'overdue') return true
  if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'draft') return false
  const due = dueEpoch(invoice)
  return due !== null && due < now
}

const INVOICE_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'id', label: 'Invoice #' },
  { key: 'cust', label: 'Customer' },
  { key: 'due', label: 'Due Date' },
  { key: 'amount', label: 'Amount' },
  { key: 'balance', label: 'Balance' },
  { key: 'status', label: 'Status' },
]

const STATUS_FILTERS = ['all', 'overdue', 'unpaid', 'partial', 'paid', 'draft', 'cancelled'] as const

/** Invoice register.
 *
 *  Every amount on this screen is the server's: `totalHalalas`, `paidHalalas`
 *  and `balanceHalalas` are computed by the API from the invoice's own lines
 *  and its payments, and rendered here without arithmetic. A build with no API
 *  configured falls back to the fixture's display string, which carries a total
 *  and nothing else — so the balance column is honestly blank rather than
 *  guessed, and the three figures at the top say when they are derived.
 *
 *  The figures are sums over the rows on screen, in integer halalas. They are
 *  for orientation — "how much is out there" — not a ledger total, which is
 *  the server's to compute. */
export function Invoices() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const toast = useToast()
  const invoicesQuery = useCollection('invoices')
  const invoices = invoicesQuery.data ?? []
  const [query, setQuery] = useState('')
  const needle = useDebounce(query.trim().toLowerCase(), 250)
  const [paying, setPaying] = useState<PayableInvoice | null>(null)
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const [showExport, setShowExport] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Read once per mount: a figure that flickers as the clock ticks is noise.
  const [now] = useState(() => Date.now())

  const figures = useMemo(() => {
    let outstanding = 0
    let paid = 0
    let overdue = 0
    let derived = false
    for (const invoice of invoices) {
      const money = invoiceMoney(invoice)
      if (!money.fromServer) derived = true
      if (isOverdue(invoice, now)) overdue += 1
      if (invoice.status === 'cancelled') {
        paid += money.paidHalalas
        continue
      }
      if (money.fromServer) {
        outstanding += money.balanceHalalas
        paid += money.paidHalalas
      } else if (invoice.status === 'paid') {
        paid += money.totalHalalas
      } else if (invoice.status !== 'draft') {
        outstanding += money.totalHalalas
      }
    }
    return { outstanding, paid, overdue, derived }
  }, [invoices, now])

  const filtered = useMemo(() => {
    let result = invoices
    if (needle) {
      result = result.filter((invoice) =>
        [invoice.id, invoice.cust].some((field) => field.toLowerCase().includes(needle))
      )
    }
    if (status === 'overdue') result = result.filter((invoice) => isOverdue(invoice, now))
    else if (status !== 'all') result = result.filter((invoice) => invoice.status === status)
    return result
  }, [invoices, needle, status, now])

  const mayCreate = can('invoices', 'c')
  const commands = useMemo<Command[]>(
    () =>
      mayCreate
        ? [
            {
              id: 'invoices:new',
              label: 'New Invoice',
              icon: 'FilePlus',
              group: 'create',
              keywords: ['invoice', 'bill', 'raise', 'new'],
              shortcut: 'N',
              run: (ctx) => ctx.navigate('/invoice-create'),
            },
          ]
        : [],
    [mayCreate]
  )
  useCommand(commands)

  const columns: Column<Invoice>[] = [
    { header: 'Invoice #', cell: (invoice) => invoice.id, code: true, sortValue: (invoice) => invoice.id },
    { header: 'Customer', cell: (invoice) => invoice.cust, sortValue: (invoice) => invoice.cust },
    {
      header: 'Due Date',
      cell: (invoice) => (
        <span className={isOverdue(invoice, now) ? 'font-semibold text-salis-orange' : undefined}>
          {invoice.due}
        </span>
      ),
      sortValue: (invoice) => dueEpoch(invoice) ?? invoice.due,
    },
    {
      header: 'Amount',
      cell: (invoice) => (
        <Money sar={fromHalalas(invoiceMoney(invoice).totalHalalas)} className="font-semibold" />
      ),
      numeric: true,
      sortValue: (invoice) => invoiceMoney(invoice).totalHalalas,
    },
    {
      header: 'Balance',
      cell: (invoice) => <BalanceCell invoice={invoice} />,
      numeric: true,
      sortValue: (invoice) => {
        const money = invoiceMoney(invoice)
        return money.fromServer ? money.balanceHalalas : null
      },
    },
    {
      header: 'Status',
      cell: (invoice) => <InvoiceStatusBadge status={invoice.status} />,
      sortValue: (invoice) => invoice.status,
    },
    {
      header: 'Actions',
      cell: (invoice) => (
        <InvoiceRowActions invoice={payable(invoice)} onRecordPayment={setPaying} />
      ),
    },
  ]

  const kpis = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiCard
        label={t('Outstanding SAR')}
        value={formatSar(fromHalalas(figures.outstanding), { bare: true })}
        mono
        icon="Wallet"
        caption={figures.derived ? t('From invoice totals — balances need the API.') : t('Server balances, summed here')}
        {...(figures.outstanding > 0 ? TONES.orange : TONES.blue)}
      />
      <KpiCard
        label={t('Overdue')}
        value={String(figures.overdue)}
        mono
        icon="AlertTriangle"
        caption={figures.overdue === 1 ? t('invoice past its due date') : t('invoices past their due date')}
        {...(figures.overdue > 0 ? TONES.orange : TONES.neutral)}
      />
      <KpiCard
        label={t('Paid SAR')}
        value={formatSar(fromHalalas(figures.paid), { bare: true })}
        mono
        icon="CheckCircle"
        caption={figures.derived ? t('Paid invoices only — part payments need the API.') : t('Received against these invoices')}
        {...TONES.blue}
      />
    </div>
  )

  const chips = (
    <ChipGroup label={t('Status')}>
      {STATUS_FILTERS.map((option) => {
        const count =
          option === 'all'
            ? invoices.length
            : option === 'overdue'
              ? figures.overdue
              : invoices.filter((invoice) => invoice.status === option).length
        if (option !== 'all' && option !== 'overdue' && count === 0) return null
        return (
          <Chip
            key={option}
            label={`${t(option === 'all' ? 'All' : option[0].toUpperCase() + option.slice(1))} ${count}`}
            selected={status === option}
            onToggle={() => setStatus(option)}
            className={option === 'overdue' && status !== 'overdue' && count > 0 ? 'text-salis-orange' : undefined}
          />
        )
      })}
    </ChipGroup>
  )

  const remind = (ids: ReadonlySet<string>) => {
    toast.show({
      title: t('Reminders are not sent yet'),
      description: `${ids.size} ${t('selected. The notification service is not connected, so nothing was sent.')}`,
      tone: 'info',
    })
  }

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t('Finance')}
        title={t('Invoices')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search invoices...') }}
        actions={
          mayCreate ? (
            <Button size="md" icon="Plus" onClick={() => navigate('/invoice-create')}>
              {t('New Invoice')}
            </Button>
          ) : null
        }
        overflow={<OverflowItem icon="Download" label="Export" onClick={() => setShowExport((v) => !v)} />}
        query={invoicesQuery}
        skeleton="table"
        toolbar={
          <div className="flex flex-col gap-4">
            {kpis}
            {chips}
          </div>
        }
        notice={
          showExport ? (
            <ExportCenter
              title="Export Invoices"
              description="Export invoice records to a file"
              columns={INVOICE_EXPORT_COLUMNS}
              totalRows={filtered.length}
              onExport={async () => { /* server-side export */ }}
            />
          ) : null
        }
      >
        <DataTable
          caption="Invoices"
          columns={columns}
          rows={filtered}
          rowKey={(invoice) => invoice.id}
          defaultSort={{ key: 'Due Date', dir: 'asc' }}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          bulkActions={(ids) => (
            <Button variant="outline" size="sm" icon="Bell" onClick={() => remind(ids)}>
              {t('Send reminder')}
            </Button>
          )}
          onRowClick={(invoice) => navigate(`/invoice-detail?id=${encodeURIComponent(invoice.id)}`)}
          mobileCard={(invoice) => (
            <>
              <MobileCardHeader
                title={invoice.id}
                code
                trailing={<InvoiceStatusBadge status={invoice.status} />}
              />
              <MobileCardRow>{invoice.cust}</MobileCardRow>
              <MobileCardRow label={t('Due Date')}>{invoice.due}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money
                  sar={fromHalalas(invoiceMoney(invoice).totalHalalas)}
                  className="font-semibold text-heading"
                />
              </MobileCardRow>
              <MobileCardRow label={t('Balance')}>
                <BalanceCell invoice={invoice} />
              </MobileCardRow>
              {/* Outside `MobileCardRow`: that row truncates its content, which
                  is right for a value and wrong for a row of buttons. */}
              <div className="border-t border-border pt-2.5">
                <InvoiceRowActions invoice={payable(invoice)} onRecordPayment={setPaying} labelled />
              </div>
            </>
          )}
          empty={
            <EmptyState
              icon={needle || status !== 'all' ? 'SearchX' : 'Receipt'}
              title={needle || status !== 'all' ? t('No matching invoices') : t('No invoices yet')}
              description={
                needle || status !== 'all'
                  ? t('Try a different customer or invoice number.')
                  : t('Invoices are raised when a job card is delivered.')
              }
            />
          }
        />
      </ScreenFrame>

      {paying ? (
        <RecordPaymentModal invoice={paying} open onClose={() => setPaying(null)} />
      ) : null}
    </>
  )
}

/** Outstanding money is orange — it is the number that needs chasing. A
 *  settled invoice shows a blue zero rather than an empty cell, because a blank
 *  reads as "unknown" and a settled invoice is a known nothing. */
function BalanceCell({ invoice }: { invoice: Invoice }) {
  const { t } = usePreferences()
  const money = invoiceMoney(invoice)
  if (!money.fromServer) {
    return (
      <span className="text-[11px] text-muted" title={t('Needs the API')}>
        —
      </span>
    )
  }
  return (
    <Money
      sar={fromHalalas(money.balanceHalalas)}
      className={
        money.balanceHalalas > 0 ? 'font-semibold text-salis-orange' : 'font-semibold text-salis-blue'
      }
    />
  )
}
