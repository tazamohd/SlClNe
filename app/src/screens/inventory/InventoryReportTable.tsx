import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Money } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Qty, Unknown } from './InventoryBits'
import type { MovementRow } from './ledger'
import { availableOf, partRef, priceHalalasOf, type Part } from './partFields'

/* ──────────────────────────────────────────────────────────── details table */

/** Every tracked part with what it holds, what it is worth and — when the
 *  ledger is readable — what it consumed in the reporting window. */
export function DetailsTable({
  parts,
  loading,
  hidePrice,
  ledger,
  since,
}: {
  parts: readonly Part[]
  loading: boolean
  hidePrice: boolean
  ledger: Record<string, MovementRow[]> | undefined
  since: number
}) {
  const { t } = usePreferences()

  const consumedInPeriod = (part: Part): number | null => {
    if (!ledger) return null
    const rows = ledger[partRef(part)]
    if (!rows) return null
    return rows
      .filter((row) => row.type === 'out' && new Date(row.createdAt).getTime() >= since)
      .reduce((sum, row) => sum + row.qty, 0)
  }

  const columns: Column<Part>[] = [
    { header: 'Part', key: 'name', cell: (part) => part.name, sortValue: (part) => part.name },
    { header: 'SKU', key: 'sku', cell: (part) => part.sku, code: true, sortValue: (part) => part.sku },
    {
      header: 'On Hand',
      key: 'stock',
      cell: (part) => <Qty value={part.stock} />,
      numeric: true,
      sortValue: (part) => part.stock,
    },
    {
      header: 'Reorder Level',
      key: 'reorder',
      cell: (part) => <Qty value={part.reorder} muted />,
      numeric: true,
      sortValue: (part) => part.reorder,
    },
    {
      header: 'Available',
      key: 'available',
      cell: (part) => <Qty value={availableOf(part) ?? part.stock} muted />,
      numeric: true,
      sortValue: (part) => availableOf(part) ?? part.stock,
    },
    ...(ledger
      ? [
          {
            header: 'Consumed',
            key: 'consumed',
            cell: (part: Part) => {
              const value = consumedInPeriod(part)
              return value === null ? <Unknown /> : <Qty value={value} muted />
            },
            numeric: true,
            sortValue: (part: Part) => consumedInPeriod(part),
          },
        ]
      : []),
    ...(hidePrice
      ? []
      : [
          {
            header: 'Value',
            key: 'value',
            cell: (part: Part) => <Money sar={(priceHalalasOf(part) * part.stock) / 100} />,
            numeric: true,
            sortValue: (part: Part) => priceHalalasOf(part) * part.stock,
          },
        ]),
  ]

  return (
    <DataTable
      caption="Per-part stock levels and valuation"
      className="border-0 shadow-none"
      columns={columns}
      rows={parts}
      rowKey={(part) => part.sku}
      loading={loading}
      mobileCard={(part) => (
        <>
          <MobileCardHeader
            title={part.name}
            trailing={
              hidePrice ? undefined : <Money sar={(priceHalalasOf(part) * part.stock) / 100} />
            }
          />
          <MobileCardRow label={t('SKU')}>
            <span className="font-mono" dir="ltr">
              {part.sku}
            </span>
          </MobileCardRow>
          <MobileCardRow label={t('On Hand')}>
            <span className="font-mono" dir="ltr">
              {part.stock} / {part.reorder}
            </span>
          </MobileCardRow>
        </>
      )}
      empty={
        <EmptyState
          icon="Package"
          title={t('No parts match')}
          description={t('No tracked part matches the current filter.')}
        />
      }
    />
  )
}
