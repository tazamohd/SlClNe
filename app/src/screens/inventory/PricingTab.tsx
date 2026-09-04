import { Section } from '@/components/shell/FeatureScreen'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Money } from '@/components/ui/Money'
import { EmptyState, PermissionDenied, ReadOnlyNotice } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Unknown } from './InventoryBits'
import { costHalalasOf, priceHalalasOf, type Part } from './partFields'

/* ─────────────────────────────────────────────────────────────── auto-reorder */

/** Nothing stores an auto-reorder rule: no table, no collection, no endpoint.
 *  Saying so beats showing the parts table again under a different heading, and
 *  beats an invented list of rules that nothing would ever act on. */
export function AutoReorderTab({ candidates }: { candidates: number }) {
  const { t } = usePreferences()
  return (
    <Section
      title={t('Automatic Reordering')}
      subtitle={t('Rules that raise a purchase order when stock crosses its reorder point.')}
    >
      <EmptyState
        icon="Settings"
        title={t('No auto-reorder rules exist yet')}
        description={t('Reorder rules have no storage behind them — no table, no endpoint — so none can be listed or created here. Until they do, the Alerts tab is the working reorder signal.')}
      />
      <p className="text-center text-[13px] text-muted">
        <span dir="ltr" className="font-mono font-semibold text-salis-orange">
          {candidates}
        </span>{' '}
        {t('parts would trigger a rule today, judged against their reorder points.')}
      </p>
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────────── pricing */

export function PricingTab({
  parts,
  loading,
  hidePrice,
  hideCost,
}: {
  parts: readonly Part[]
  loading: boolean
  hidePrice: boolean
  hideCost: boolean
}) {
  const { t } = usePreferences()

  if (hidePrice && hideCost) {
    return (
      <Section title={t('Pricing & Margin')}>
        <PermissionDenied
          description={t('Your role may see stock levels but not part prices, cost or margin.')}
        />
      </Section>
    )
  }

  const knownCost = parts.some((part) => costHalalasOf(part) !== null)

  const columns: Column<Part>[] = [
    { header: 'Part Name', key: 'name', cell: (part) => part.name, sortValue: (part) => part.name },
    { header: 'SKU', key: 'sku', cell: (part) => part.sku, code: true, sortValue: (part) => part.sku },
    ...(hidePrice
      ? []
      : [
          {
            header: 'Sell Price',
            key: 'price',
            cell: (part: Part) => <Money sar={priceHalalasOf(part) / 100} />,
            numeric: true,
            sortValue: (part: Part) => priceHalalasOf(part),
          },
        ]),
    ...(hideCost || !knownCost
      ? []
      : [
          {
            header: 'Cost',
            key: 'cost',
            cell: (part: Part) => {
              const cost = costHalalasOf(part)
              return cost === null ? <Unknown /> : <Money sar={cost / 100} />
            },
            numeric: true,
            sortValue: (part: Part) => costHalalasOf(part),
          },
          {
            header: 'Margin',
            key: 'margin',
            cell: (part: Part) => {
              const cost = costHalalasOf(part)
              if (cost === null) return <Unknown />
              const margin = priceHalalasOf(part) - cost
              return <Money sar={margin / 100} className="font-semibold text-heading" />
            },
            numeric: true,
            sortValue: (part: Part) => {
              const cost = costHalalasOf(part)
              return cost === null ? null : priceHalalasOf(part) - cost
            },
          },
          {
            header: 'Margin %',
            key: 'margin-pct',
            cell: (part: Part) => {
              const cost = costHalalasOf(part)
              const price = priceHalalasOf(part)
              if (cost === null || price === 0) return <Unknown />
              return (
                <span className="font-mono text-[13px]" dir="ltr">
                  {Math.round(((price - cost) / price) * 100)}%
                </span>
              )
            },
            numeric: true,
          },
        ]),
    {
      header: 'Stock Value',
      key: 'value',
      cell: (part) => <Money sar={(priceHalalasOf(part) * part.stock) / 100} />,
      numeric: true,
      sortValue: (part) => priceHalalasOf(part) * part.stock,
    },
  ]

  return (
    <Section
      title={t('Pricing & Margin')}
      subtitle={t('Sell price against cost, and what the stock on hand is worth.')}
    >
      {hideCost ? (
        <ReadOnlyNotice
          message={t('Cost and margin are hidden from your role, so those columns are not shown.')}
        />
      ) : knownCost ? null : (
        <ReadOnlyNotice
          message={t('This dataset carries no cost figures, so margin cannot be worked out. Sell price and stock value are shown.')}
        />
      )}
      <DataTable
        caption="Part pricing and margin"
        className="border-0 shadow-none"
        columns={columns}
        rows={parts}
        rowKey={(part) => part.sku}
        loading={loading}
        mobileCard={(part) => {
          const cost = costHalalasOf(part)
          return (
            <>
              <MobileCardHeader
                title={part.name}
                trailing={
                  hidePrice ? undefined : <Money sar={priceHalalasOf(part) / 100} />
                }
              />
              <MobileCardRow label={t('SKU')}>
                <span className="font-mono" dir="ltr">
                  {part.sku}
                </span>
              </MobileCardRow>
              {hideCost || !knownCost ? null : (
                <MobileCardRow label={t('Cost')}>
                  {cost === null ? <Unknown /> : <Money sar={cost / 100} />}
                </MobileCardRow>
              )}
              <MobileCardRow label={t('Stock Value')}>
                <Money sar={(priceHalalasOf(part) * part.stock) / 100} />
              </MobileCardRow>
            </>
          )
        }}
        empty={
          <EmptyState
            icon="Tag"
            title={t('No parts to price')}
            description={t('Add parts to start tracking stock.')}
          />
        }
      />
    </Section>
  )
}
