import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PrintLayout, InfoRow, SignatureLine } from '@/components/ui/PrintLayout'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { Loading, EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import {
  fetchEstimateLines,
  RepositoryError,
  type EstimateLineRow,
} from './api'

type Estimate = RowOf<'estimates'> & {
  _id?: string
  totalHalalas?: number
  subtotalHalalas?: number
  taxHalalas?: number
  discountHalalas?: number
  custPhone?: string | null
  custVat?: string | null
  plate?: string | null
  vin?: string | null
  validUntil?: string | null
}

/** Print-optimized estimate / quotation view.
 *
 *  Rendered in a clean A4 layout for `window.print()`. Carries a clear notice
 *  that it is not an invoice, a validity period, and an approval signature
 *  line. */
export function EstimatePrint() {
  const { t, rtl } = usePreferences()
  const [params] = useSearchParams()

  const estimates = useCollection('estimates')
  const id = params.get('id')
  const rows = (estimates.data ?? []) as readonly Estimate[]
  const estimate = id ? rows.find((e) => e.id === id || e._id === id) : rows[0]
  const ref = estimate?._id ?? estimate?.id

  const lines = useQuery<{ rows: EstimateLineRow[] }, RepositoryError>({
    queryKey: ['estimate-lines', ref],
    queryFn: () => fetchEstimateLines(ref as string),
    enabled: Boolean(ref),
    retry: false,
  })

  const amount = useMemo(() => {
    if (!estimate) return 0
    return estimate.totalHalalas != null ? estimate.totalHalalas / 100 : parseSar(estimate.amount)
  }, [estimate])

  if (estimates.isLoading) return <Loading label={t('Loading estimate...')} />
  if (!estimate) {
    return (
      <EmptyState
        icon="FileQuestion"
        title={t('Estimate not found')}
        description={t('It may have been deleted, or the link is out of date.')}
      />
    )
  }

  const lineRows = lines.data?.rows ?? []

  return (
    <PrintLayout
      documentTitle={t('Estimate / Quotation')}
      documentNumber={estimate.id}
      date={new Date().toISOString().slice(0, 10)}
      headerExtra={
        estimate.validUntil ? (
          <p className="text-sm text-body">
            <span className="font-semibold text-heading">{t('Valid Until')}:</span>{' '}
            <span dir="ltr" className="font-mono">{estimate.validUntil}</span>
          </p>
        ) : (
          <p className="text-sm text-body">
            <span className="font-semibold text-heading">{t('Valid Until')}:</span>{' '}
            {t('30 days from date of issue')}
          </p>
        )
      }
      customerInfo={
        <>
          <InfoRow label={t('Name')} value={estimate.cust} />
          <InfoRow label={t('Phone')} value={estimate.custPhone} />
          <InfoRow label={t('VAT No.')} value={estimate.custVat} />
        </>
      }
      vehicleInfo={
        <>
          <InfoRow label={t('Vehicle')} value={estimate.veh} />
          <InfoRow label={t('Plate')} value={estimate.plate} />
          <InfoRow label={t('VIN')} value={estimate.vin} />
        </>
      }
      notice={
        <div className="flex items-center gap-2">
          <Icon name="Info" size={14} className="flex-shrink-0 text-salis-blue" />
          <span className="font-semibold">
            {t('This is an estimate only and does not constitute an invoice. Prices may vary based on actual work performed.')}
          </span>
        </div>
      }
      footer={
        <div className="space-y-6">
          {/* Terms */}
          <div>
            <h4 className="mb-1.5 text-xs font-bold uppercase text-heading">
              {t('Terms & Conditions')}
            </h4>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-body">
              <li>{t('This estimate is valid for 30 days from the date of issue.')}</li>
              <li>{t('Actual costs may vary if additional work is required.')}</li>
              <li>{t('Customer approval is required before work commences.')}</li>
              <li>{t('All parts carry manufacturer warranty.')}</li>
            </ul>
          </div>

          {/* Approval signature */}
          <div>
            <p className="mb-3 text-xs text-body">
              {t('I authorize the work described above and accept the total amount.')}
            </p>
            <div className="flex items-end justify-between gap-8">
              <SignatureLine label={t('Customer Signature')} />
              <div className="text-end">
                <p className="text-xs text-muted">{t('Date')}: _______________</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* Line items table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-inset">
              <Th align="start" className="w-8">#</Th>
              <Th align="start">{t('Description')}</Th>
              <Th align="start">{t('Type')}</Th>
              <Th align="end">{t('Qty')}</Th>
              <Th align="end">{t('Unit Price')}</Th>
              <Th align="end">{t('Amount')}</Th>
            </tr>
          </thead>
          <tbody>
            {lineRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-xs text-faint">
                  {t('No line items to show')}
                </td>
              </tr>
            ) : (
              lineRows.map((line, index) => {
                const lineTotal = line.qty * line.unitPriceHalalas
                return (
                  <tr key={line.id} className="border-b border-border">
                    <td className="px-3 py-2.5 text-xs text-faint">{index + 1}</td>
                    <td className="px-3 py-2.5 text-heading">
                      {rtl && line.descriptionAr ? line.descriptionAr : line.description}
                      {line.partSku && (
                        <span className="ms-1.5 font-mono text-[10px] text-faint" dir="ltr">
                          {line.partSku}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted">
                      {line.kind === 'labour' ? t('Labour') : t('Part')}
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <span dir="ltr" className="font-mono">{line.qty}</span>
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <Money sar={line.unitPriceHalalas / 100} className="text-body" />
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <Money sar={lineTotal / 100} className="font-semibold text-heading" />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-72 space-y-1.5">
          {estimate.subtotalHalalas != null ? (
            <>
              <TotalRow label={t('Subtotal')} amount={estimate.subtotalHalalas / 100} />
              {estimate.discountHalalas ? (
                <TotalRow label={t('Discount')} amount={-(estimate.discountHalalas / 100)} />
              ) : null}
              <TotalRow label={`${t('VAT')} (15%)`} amount={(estimate.taxHalalas ?? 0) / 100} />
            </>
          ) : null}
          <div className="flex justify-between border-t-2 border-salis-navy pt-2 text-base font-bold text-salis-navy">
            <span>{t('Estimated Total')}</span>
            <Money sar={amount} className="font-bold" />
          </div>
          <p className="text-[10px] text-faint">
            {t('VAT is included and computed server-side at the ZATCA rate.')}
          </p>
        </div>
      </div>
    </PrintLayout>
  )
}

function Th({
  children,
  align,
  className = '',
}: {
  children: React.ReactNode
  align: 'start' | 'end'
  className?: string
}) {
  return (
    <th
      className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted ${
        align === 'end' ? 'text-end' : 'text-start'
      } ${className}`}
    >
      {children}
    </th>
  )
}

function TotalRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-sm text-body">
      <span>{label}</span>
      <Money sar={amount} className="text-body" />
    </div>
  )
}
