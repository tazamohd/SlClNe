import { useMemo } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { FieldGrid, ReadField } from '@/components/ui/FieldGrid'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

/** VAT / ZATCA screen.
 *
 *  The design hardcoded every figure — "Tax Due: SAR 42,150" and the filed
 *  amounts never reconciled against anything. Here output and input VAT are
 *  pulled out of the invoice and expense rows that actually exist, at the
 *  standard 15% Saudi rate, so the headline can't drift from the ledger the
 *  way it did in the mockup (see README "One number that changed"). */

const VAT_RATE = 0.15

/** `invoice.amount` / `expense.amount` are VAT-inclusive totals, the same
 *  convention InvoiceCreate uses (`total = subtotal + subtotal * VAT_RATE`).
 *  To recover the VAT component from an inclusive total: amount * rate / (1 + rate). */
function vatComponent(amountInclusive: number): number {
  return (amountInclusive * VAT_RATE) / (1 + VAT_RATE)
}

/** Historical filings aren't backed by a collection yet — there's no per-quarter
 *  ledger to derive them from, only the ~10 rows seeded for the current period.
 *  Typed here as the future `GET /api/tax/filings` read, same shape the mockup
 *  used. The current quarter is the one exception: its amount is computed below
 *  from live data rather than repeating the design's placeholder "—". */
const FILED_RETURNS = [
  { period: 'Q2 2026 (Apr–Jun)', filing: 'Jul 31, 2026', amountSar: 42150 },
  { period: 'Q1 2026 (Jan–Mar)', filing: 'Apr 30, 2026', amountSar: 38200 },
  { period: 'Q4 2025 (Oct–Dec)', filing: 'Jan 31, 2026', amountSar: 35800 },
] as const

const UPCOMING_PERIOD = { period: 'Q3 2026 (Jul–Sep)', filing: 'Oct 31, 2026' } as const

/** ZATCA registration status — also not a collection yet (no filing ever shows
 *  as overdue in the seed data). Typed as the future `GET /api/tax/status` read. */
const ZATCA_COMPLIANT = true

const RETURN_STATUS: Record<string, readonly [string, string]> = {
  filed: ['rgba(10,94,215,.1)', '#0A5ED7'],
  upcoming: ['rgba(249,115,22,.1)', '#F97316'],
}

function ReturnStatusBadge({ value }: { value: 'filed' | 'upcoming' }) {
  const { t } = usePreferences()
  const [background, color] = RETURN_STATUS[value]
  return (
    <Badge background={background} color={color}>
      {t(value[0].toUpperCase() + value.slice(1))}
    </Badge>
  )
}

interface ReturnRow {
  period: string
  filing: string
  amountSar: number
  status: 'filed' | 'upcoming'
  /** Set only for the current quarter, when input VAT exceeds output VAT. */
  refundable?: boolean
}

export function TaxManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const { data: invoices = [], isLoading: invoicesLoading } = useCollection('invoices')
  const { data: expenses = [], isLoading: expensesLoading } = useCollection('expenses')

  const { outputVat, inputVat, netVat } = useMemo(() => {
    // Output VAT: due on every issued invoice, whether or not it's been
    // collected yet — VAT is owed on issuance (accrual), not on receipt.
    const output = invoices.reduce((sum, invoice) => sum + vatComponent(parseSar(invoice.amount)), 0)

    // Input VAT: only expenses actually approved for payment can be reclaimed.
    // Rejected claims never happened; pending ones aren't settled yet.
    const input = expenses
      .filter((expense) => expense.status === 'approved')
      .reduce((sum, expense) => sum + vatComponent(parseSar(expense.amount)), 0)

    return { outputVat: output, inputVat: input, netVat: output - input }
  }, [invoices, expenses])

  const netDue = netVat > 0

  const stats: Stat[] = [
    { label: 'VAT Rate', value: '15%', caption: 'ZATCA Standard Rate', icon: 'Percent' },
    {
      label: 'Tax Due',
      value: formatSar(Math.abs(netVat)),
      caption: netDue
        ? `${t('Due')}: ${UPCOMING_PERIOD.filing}`
        : t('Input VAT exceeds output VAT this period'),
      tone: netDue ? 'warning' : 'info',
      icon: 'AlertCircle',
    },
    {
      label: 'ZATCA Status',
      value: ZATCA_COMPLIANT ? t('Compliant') : t('Action Required'),
      caption: `${t('Last Filed')}: ${FILED_RETURNS[0].filing}`,
      tone: 'info',
      icon: 'CheckCircle',
    },
  ]

  const returns: ReturnRow[] = [
    { ...UPCOMING_PERIOD, amountSar: Math.abs(netVat), status: 'upcoming', refundable: !netDue },
    ...FILED_RETURNS.map((r) => ({ ...r, status: 'filed' as const })),
  ]

  function fileReturn() {
    toast.show({
      title: t('VAT return filed'),
      description: t('Submitted to ZATCA for the current period.'),
    })
  }

  const columns: Column<ReturnRow>[] = [
    { header: 'Period', cell: (r) => r.period },
    { header: 'Filing Date', cell: (r) => r.filing },
    {
      header: 'Amount',
      cell: (r) => (
        <span className="inline-flex items-baseline gap-1.5">
          <Money sar={r.amountSar} className="font-semibold text-heading" />
          {r.refundable ? <span className="text-[11px] text-muted">({t('refundable')})</span> : null}
        </span>
      ),
    },
    { header: 'Status', cell: (r) => <ReturnStatusBadge value={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Landmark"
        title={t('Tax Management')}
        subtitle={`${t('Accounting')} · ZATCA`}
      />

      <StatRow stats={stats} />

      <Section
        title={t('VAT Returns')}
        toolbar={
          can('accounting', 'c') ? (
            <Button size="md" onClick={fileReturn}>
              <Icon name="FileText" size={14} />
              {t('File Return')}
            </Button>
          ) : null
        }
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted">
          <span>
            {t('Output VAT')} <Money sar={outputVat} className="font-semibold text-body" />
          </span>
          <span>
            {t('Input VAT')} <Money sar={inputVat} className="font-semibold text-body" />
          </span>
        </div>
        <DataTable
          columns={columns}
          rows={returns}
          rowKey={(r) => r.period}
          loading={invoicesLoading || expensesLoading}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.period} trailing={<ReturnStatusBadge value={r.status} />} />
              <MobileCardRow label={t('Filing Date')}>{r.filing}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <span className="inline-flex items-baseline gap-1.5">
                  <Money sar={r.amountSar} className="text-heading" />
                  {r.refundable ? (
                    <span className="text-[11px] text-muted">({t('refundable')})</span>
                  ) : null}
                </span>
              </MobileCardRow>
            </>
          )}
        />
      </Section>

      <Section title={t('Tax Settings')}>
        <FieldGrid>
          <ReadField label={t('VAT Registration #')} value="300123456700003" code />
          <ReadField label={t('Tax Period')} value={t('Quarterly')} />
        </FieldGrid>
      </Section>
    </>
  )
}
