import { useMemo, useState } from 'react'
import { FeatureHeader, Section } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import {
  AggregateGapNotice,
  DateRangeFilter,
  ExportPrintActions,
  ServerScopeNote,
  ServerTotalsNote,
} from '@/screens/accounting/ReportControls'
import { AGGREGATE_GAP, downloadCsv, inDateRange, rowDateIso, toCsv } from '@/screens/accounting/reporting'
import { useTaxReturn } from '@/screens/accounting/useFinanceReports'
import { VAT_RATE_BPS } from './money'
import { fromHalalas, invoiceMoney } from './money'

/** VAT / tax management, at the ZATCA rate.
 *
 *  **The rate is configuration, not a constant baked into a component (§A37).**
 *  It is read from `VAT_RATE_BPS`, the single value `packages/contract`'s pricing
 *  rule uses and the parity test in `finance-money.test.ts` pins the client copy
 *  to. The number shown here is therefore the exact rate the server applied when
 *  it priced each invoice below — one source, so the screen and the ledger cannot
 *  quote different rates. Persisting an org-specific override needs a tax-config
 *  collection the server does not have yet; that gap is stated, not worked around.
 *
 *  **Every VAT figure is the server's.** Each row shows the `taxHalalas` the API
 *  computed for that one invoice. There is deliberately no "total output VAT" —
 *  that is a period aggregate the server owns and does not expose, and a browser
 *  summing the invoices it happens to hold would be filing one page as the return.
 */

type Invoice = RowOf<'invoices'>

const VAT_PERCENT = (VAT_RATE_BPS / 100).toFixed(2)

/** Output VAT is charged on an issued invoice; a draft has not committed a tax
 *  figure to anyone. */
function carriesOutputVat(status: string): boolean {
  return status !== 'draft'
}

export function TaxManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: invoices = [], isLoading, error, refetch } = useCollection('invoices')

  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return invoices
      .filter((invoice) => carriesOutputVat(invoice.status))
      .filter((invoice) =>
        needle ? [invoice.id, invoice.cust].some((v) => String(v).toLowerCase().includes(needle)) : true,
      )
      .filter((invoice) => inDateRange(rowDateIso(invoice as Record<string, unknown>, 'issuedAt'), from, to))
  }, [invoices, query, from, to])

  const exportRows = () => {
    const csv = toCsv(
      ['Invoice', 'Customer', 'Issued', 'Net (SAR)', `VAT ${VAT_PERCENT}% (SAR)`, 'Total (SAR)'],
      rows.map((invoice) => {
        const money = invoiceMoney(invoice)
        const net = money.subtotalHalalas - money.discountHalalas
        return [
          invoice.id,
          invoice.cust,
          (invoice as { issuedAt?: string | null }).issuedAt?.slice(0, 10) ?? invoice.due,
          money.fromServer ? fromHalalas(net).toFixed(2) : '',
          money.fromServer ? fromHalalas(money.taxHalalas).toFixed(2) : '',
          fromHalalas(money.totalHalalas).toFixed(2),
        ]
      }),
    )
    downloadCsv('output-vat.csv', csv)
  }

  const columns: Column<Invoice>[] = [
    { header: 'Invoice', cell: (i) => i.id, code: true },
    { header: 'Customer', cell: (i) => i.cust },
    {
      header: 'Issued',
      cell: (i) => (i as { issuedAt?: string | null }).issuedAt?.slice(0, 10) ?? i.due,
    },
    { header: 'Net', cell: (i) => <NetCell invoice={i} /> },
    { header: `VAT ${VAT_PERCENT}%`, cell: (i) => <VatCell invoice={i} /> },
    {
      header: 'Total',
      cell: (i) => <Money sar={fromHalalas(invoiceMoney(i).totalHalalas)} className="font-semibold" />,
    },
  ]

  return (
    <>
      <FeatureHeader
        icon="Percent"
        title={t('Tax Management')}
        subtitle={t('VAT (ZATCA) configuration and output tax')}
        actions={<ExportPrintActions onExport={exportRows} exportDisabled={rows.length === 0} />}
      />

      <Section
        title={t('VAT configuration')}
        subtitle={t('The rate the server applies to every invoice it prices')}
      >
        <div className={isMobile ? 'flex flex-col gap-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-3'}>
          <Card className="flex flex-col gap-1 rounded-lg p-4">
            <p className="text-[11px] font-medium text-muted">{t('Standard rate (ZATCA)')}</p>
            <p className="font-display text-[28px] font-black leading-none text-salis-blue" dir="ltr">
              {VAT_PERCENT}%
            </p>
            <p className="text-[11px] text-muted">{t('Applied to standard-rated supplies')}</p>
          </Card>
          <Card className="flex flex-col gap-1 rounded-lg p-4">
            <p className="text-[11px] font-medium text-muted">{t('Source')}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-heading">
              <Icon name="Settings2" size={15} className="text-salis-blue" />
              {t('Central configuration')}
            </p>
            <p className="text-[11px] text-muted">
              {t('A rate change is a configuration change (§A37), applied server-side to new invoices.')}
            </p>
          </Card>
          <Card className="flex flex-col gap-1 rounded-lg p-4">
            <p className="text-[11px] font-medium text-muted">{t('Basis')}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-heading">
              <Icon name="Calculator" size={15} className="text-salis-blue" />
              {t('On the discounted net')}
            </p>
            <p className="text-[11px] text-muted">{t('Rounded once, half-up, at the last halala')}</p>
          </Card>
        </div>
        <p className="flex items-start gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
          {t(
            'An organization-specific rate override would be stored per tenant. There is no tax-config collection on the server yet, so the rate is the single central value for every tenant.',
          )}
        </p>
      </Section>

      <Section
        title={t('Output VAT by invoice')}
        subtitle={t('The VAT the server charged on each issued invoice')}
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
            <DateRangeFilter from={from} to={to} onFrom={setFrom} onTo={setTo} />
          </div>
        }
      >
        {isLive ? (
          <TaxReturnPanel from={from} to={to} />
        ) : (
          <AggregateGapNotice endpoint={AGGREGATE_GAP.tax} />
        )}

        {error ? (
          <ErrorState description={error.message} onRetry={() => void refetch()} />
        ) : (
          <DataTable
            caption="Output VAT by invoice"
            columns={columns}
            rows={rows}
            rowKey={(i) => String(i.id)}
            loading={isLoading}
            mobileCard={(i) => {
              const money = invoiceMoney(i)
              return (
                <>
                  <MobileCardHeader title={String(i.id)} code />
                  <MobileCardRow>{i.cust}</MobileCardRow>
                  <MobileCardRow label={`${t('VAT')} ${VAT_PERCENT}%`}>
                    <VatCell invoice={i} />
                  </MobileCardRow>
                  <MobileCardRow label={t('Total')}>
                    <Money sar={fromHalalas(money.totalHalalas)} className="font-semibold text-heading" />
                  </MobileCardRow>
                </>
              )
            }}
            empty={
              <EmptyState
                icon="Percent"
                title={t('No output VAT in range')}
                description={t('No issued invoices match these filters.')}
              />
            }
          />
        )}
        <ServerScopeNote />
      </Section>
    </>
  )
}

/** The VAT return figure, live only. On a build with an API this replaces the
 *  gap notice with what `GET /accounting/tax/return` computed: output VAT for
 *  the period at the configured rate. Input VAT arrives `inputVatModelled:false`
 *  — expense-side VAT is not tracked yet — so this deliberately shows **no net
 *  payable**: a net that subtracts an input VAT of nothing would read as
 *  reconciled when it is simply not modelled. `financeReports` is null on the
 *  fixtures, so this never mounts there. */
function TaxReturnPanel({ from, to }: { from: string; to: string }) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const query = useTaxReturn({ from: from || undefined, to: to || undefined })

  if (query.isLoading) return <Loading label={t('Computing the return…')} />
  if (query.error || !query.data) {
    return <ErrorState description={query.error?.message} onRetry={() => void query.refetch()} />
  }

  const r = query.data
  const ratePercent = (r.rateBps / 100).toFixed(2)

  return (
    <div className="flex flex-col gap-3">
      <ServerTotalsNote endpoint="GET /accounting/tax/return" />
      <div className={isMobile ? 'flex flex-col gap-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-3'}>
        <Card className="flex flex-col gap-1 rounded-lg p-4">
          <p className="text-[11px] font-medium text-muted">
            {t('Output VAT')} ({ratePercent}%)
          </p>
          <p className="font-display text-[24px] font-black leading-tight text-salis-blue" dir="ltr">
            {formatSar(fromHalalas(r.outputVatHalalas))}
          </p>
          <p className="text-[11px] text-muted">
            {r.invoiceCount} {t('issued invoices in range')}
          </p>
        </Card>
        <Card className="flex flex-col gap-1 rounded-lg p-4">
          <p className="text-[11px] font-medium text-muted">{t('Taxable sales')}</p>
          <p className="mt-1 text-[18px] font-bold text-heading" dir="ltr">
            {formatSar(fromHalalas(r.taxableSalesHalalas))}
          </p>
          <p className="text-[11px] text-muted">{t('Net of discount, the VAT base')}</p>
        </Card>
        <Card className="flex flex-col gap-1 rounded-lg p-4">
          <p className="text-[11px] font-medium text-muted">{t('Input VAT')}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-heading">
            <Icon name="Info" size={15} className="text-salis-orange" />
            {t('Not modelled')}
          </p>
          <p className="text-[11px] text-muted">
            {t(
              'Expense-side VAT is not tracked yet, so no net payable is shown — output VAT is not a filing figure on its own.',
            )}
          </p>
        </Card>
      </div>
    </div>
  )
}

function NetCell({ invoice }: { invoice: Invoice }) {
  const money = invoiceMoney(invoice)
  if (!money.fromServer) return <span className="text-muted">—</span>
  return <Money sar={fromHalalas(money.subtotalHalalas - money.discountHalalas)} className="text-body" />
}

function VatCell({ invoice }: { invoice: Invoice }) {
  const money = invoiceMoney(invoice)
  if (!money.fromServer) return <span className="text-muted">—</span>
  return <Money sar={fromHalalas(money.taxHalalas)} className="font-semibold text-heading" />
}
