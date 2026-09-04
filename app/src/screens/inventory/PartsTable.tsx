import { Section } from '@/components/shell/FeatureScreen'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { DataTable, DensityToggle, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Qty, StockBadge } from './InventoryBits'
import {
  availableOf,
  backorderableOf,
  isBelowReorder,
  priceHalalasOf,
  reservedOf,
  shortfallOf,
  stockRank,
  type Part,
} from './partFields'

/* ───────────────────────────────────────────────────────────── chip filters */

export type PartFilter = 'below-reorder' | 'out-of-stock' | 'reserved' | 'backorderable'

/** The quick filters over the parts list. The last two are offered only when
 *  the dataset carries the field — a chip that can never match is a lie. */
export const PART_FILTERS: readonly {
  id: PartFilter
  label: string
  match: (part: Part) => boolean
  offered?: (parts: readonly Part[]) => boolean
}[] = [
  { id: 'below-reorder', label: 'Below Reorder', match: isBelowReorder },
  { id: 'out-of-stock', label: 'Out of Stock', match: (part) => part.stock <= 0 },
  {
    id: 'reserved',
    label: 'Reserved',
    match: (part) => (reservedOf(part) ?? 0) > 0,
    offered: (parts) => parts.some((part) => reservedOf(part) !== null),
  },
  {
    id: 'backorderable',
    label: 'Backorderable',
    match: backorderableOf,
    offered: (parts) => parts.some(backorderableOf),
  },
]

export function applyPartFilters(parts: readonly Part[], active: ReadonlySet<PartFilter>): Part[] {
  const rules = PART_FILTERS.filter((filter) => active.has(filter.id))
  if (rules.length === 0) return [...parts]
  return parts.filter((part) => rules.every((rule) => rule.match(part)))
}

/* ────────────────────────────────────────────────────────────────── overview */

export function OverviewTab({
  parts,
  allParts,
  loading,
  hidePrice,
  filters,
  onFilters,
  onOpen,
}: {
  /** The rows after search and chips. */
  parts: readonly Part[]
  /** Every part, so the chips can tell which filters the dataset supports. */
  allParts: readonly Part[]
  loading: boolean
  hidePrice: boolean
  filters: ReadonlySet<PartFilter>
  onFilters: (next: ReadonlySet<PartFilter>) => void
  onOpen: (part: Part) => void
}) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const toggle = (id: PartFilter) => {
    const next = new Set(filters)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onFilters(next)
  }
  const offered = PART_FILTERS.filter((filter) => filter.offered?.(allParts) ?? true)

  const columns: Column<Part>[] = [
    { header: 'Part Name', key: 'name', cell: (part) => part.name, sortValue: (part) => part.name },
    { header: 'SKU', key: 'sku', cell: (part) => part.sku, code: true, sortValue: (part) => part.sku },
    {
      header: 'On Hand',
      key: 'stock',
      cell: (part) => <Qty value={part.stock} />,
      numeric: true,
      sortValue: (part) => part.stock,
    },
    {
      header: 'Available',
      key: 'available',
      cell: (part) => <Qty value={availableOf(part)} muted />,
      numeric: true,
      sortValue: (part) => availableOf(part),
    },
    {
      header: 'Reorder At',
      key: 'reorder',
      cell: (part) => <Qty value={part.reorder} muted />,
      numeric: true,
      sortValue: (part) => part.reorder,
    },
    ...(hidePrice
      ? []
      : [
          {
            header: 'Price',
            key: 'price',
            cell: (part: Part) => <Money sar={priceHalalasOf(part) / 100} />,
            numeric: true,
            sortValue: (part: Part) => priceHalalasOf(part),
          },
        ]),
    {
      header: 'Stock Status',
      key: 'status',
      cell: (part) => <StockBadge part={part} />,
      sortValue: stockRank,
    },
  ]

  return (
    <Section
      title={t('Inventory Summary')}
      subtitle={t('Every tracked part, with what it holds and what is free to use.')}
    >
      <DataTable
        caption="Current stock levels by part"
        className="border-0 shadow-none"
        columns={columns}
        rows={parts}
        rowKey={(part) => part.sku}
        loading={loading}
        onRowClick={onOpen}
        toolbar={
          <>
            <ChipGroup multi label={t('Filter parts')} className="flex flex-wrap gap-1.5">
              {offered.map((filter) => (
                <Chip
                  key={filter.id}
                  multi
                  label={t(filter.label)}
                  selected={filters.has(filter.id)}
                  onToggle={() => toggle(filter.id)}
                />
              ))}
            </ChipGroup>
            {isMobile ? null : (
              <>
                <span className="flex-1" />
                <DensityToggle />
              </>
            )}
          </>
        }
        mobileCard={(part) => (
          <>
            <MobileCardHeader title={part.name} trailing={<StockBadge part={part} />} />
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
            {hidePrice ? null : (
              <MobileCardRow label={t('Price')}>
                <Money
                  sar={priceHalalasOf(part) / 100}
                  className="font-semibold text-heading"
                />
              </MobileCardRow>
            )}
          </>
        )}
        empty={
          filters.size > 0 ? (
            <EmptyState
              icon="Package"
              title={t('No parts match')}
              description={t('No tracked part matches the current filter.')}
            />
          ) : (
            <EmptyState
              icon="Package"
              title={t('No parts tracked yet')}
              description={t('Add parts to start tracking stock.')}
            />
          )
        }
      />
    </Section>
  )
}

/* ──────────────────────────────────────────────────────────────────── alerts */

export function AlertsTab({
  parts,
  loading,
  mayEdit,
  onReceive,
}: {
  parts: readonly Part[]
  loading: boolean
  mayEdit: boolean
  onReceive: (part: Part) => void
}) {
  const { t } = usePreferences()

  const columns: Column<Part>[] = [
    { header: 'Part Name', key: 'name', cell: (part) => part.name, sortValue: (part) => part.name },
    { header: 'SKU', key: 'sku', cell: (part) => part.sku, code: true, sortValue: (part) => part.sku },
    {
      header: 'On Hand',
      key: 'stock',
      cell: (part) => <Qty value={part.stock} />,
      numeric: true,
      sortValue: (part) => part.stock,
    },
    {
      header: 'Reorder At',
      key: 'reorder',
      cell: (part) => <Qty value={part.reorder} muted />,
      numeric: true,
      sortValue: (part) => part.reorder,
    },
    {
      header: 'Shortfall',
      key: 'shortfall',
      cell: (part) => (
        <span className="font-mono text-[13px] font-semibold text-salis-orange" dir="ltr">
          {shortfallOf(part)}
        </span>
      ),
      numeric: true,
      sortValue: shortfallOf,
    },
    { header: 'Severity', key: 'severity', cell: (part) => <StockBadge part={part} />, sortValue: stockRank },
    ...(mayEdit
      ? [
          {
            header: 'Action',
            cell: (part: Part) => (
              <Button variant="outline" size="sm" onClick={() => onReceive(part)}>
                <Icon name="ArrowDown" size={14} />
                {t('Receive')}
              </Button>
            ),
          },
        ]
      : []),
  ]

  return (
    <Section
      title={t('Low Stock Alerts')}
      subtitle={t('Parts at or below their reorder point, worst shortfall first.')}
    >
      <DataTable
        caption="Low stock alerts"
        className="border-0 shadow-none"
        columns={columns}
        rows={parts}
        rowKey={(part) => part.sku}
        loading={loading}
        mobileCard={(part) => (
          <>
            <MobileCardHeader title={part.name} trailing={<StockBadge part={part} />} />
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
            <MobileCardRow label={t('Shortfall')}>
              <span className="font-mono font-semibold text-salis-orange" dir="ltr">
                {shortfallOf(part)}
              </span>
            </MobileCardRow>
            {mayEdit ? (
              <Button variant="outline" size="sm" onClick={() => onReceive(part)}>
                <Icon name="ArrowDown" size={14} />
                {t('Receive')}
              </Button>
            ) : null}
          </>
        )}
        empty={
          <EmptyState
            icon="ShieldCheck"
            title={t('No low stock alerts')}
            description={t('Every part is above its reorder point.')}
          />
        }
      />
    </Section>
  )
}
