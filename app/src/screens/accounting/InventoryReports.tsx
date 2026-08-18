import { useMemo } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Part = RowOf<'parts'>

/** Stock reports: valuation, reorder exposure and a per-part breakdown.
 *
 *  The design's KPI row includes a turnover rate and a dead-stock figure —
 *  both need a sales/ageing history the parts collection doesn't carry, so
 *  they'd be invented numbers dressed up as data. Every figure here comes out
 *  of a `reduce` over `parts` instead, same discipline as the ledger reports
 *  in Reports.tsx: a report can't disagree with the table it summarises if it
 *  never states a number the table didn't produce. */

/** Brand-safe chart palette — the five `--chart-*` tokens, no green or red. */
const CHART_COLORS = ['#0A5ED7', '#0BB3FF', '#38BDF8', '#64748B', '#F97316']

function ValuationBars({ rows }: { rows: readonly { label: string; value: number }[] }) {
  const { t } = usePreferences()
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={row.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-body">{t(row.label)}</span>
            <Money sar={row.value} className="font-semibold text-heading" />
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-inset">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (row.value / max) * 100)}%`,
                background: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportActions() {
  const { t } = usePreferences()
  return (
    <>
      <Button variant="subtle" size="md">
        <Icon name="FileDown" size={15} />
        {t('Export')}
      </Button>
      <Button variant="subtle" size="md">
        <Icon name="Printer" size={15} />
        {t('Print')}
      </Button>
    </>
  )
}

/** Stock level against the part's own reorder point. Blue is the neutral/
 *  positive tone here — orange is reserved for the low-stock warning. */
function StockBadge({ part }: { part: Part }) {
  const { t } = usePreferences()
  const low = part.stock <= part.reorder
  return low ? (
    <Badge background="rgba(249,115,22,.1)" color="#F97316">
      {t('Low Stock')}
    </Badge>
  ) : (
    <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
      {t('In Stock')}
    </Badge>
  )
}

export function InventoryReports() {
  const { t } = usePreferences()
  const { data: parts = [], isLoading } = useCollection('parts')

  const totals = useMemo(() => {
    const stockValue = parts.reduce((sum, part) => sum + part.stock * parseSar(part.price), 0)
    const unitsOnHand = parts.reduce((sum, part) => sum + part.stock, 0)
    const belowReorder = parts.filter((part) => part.stock <= part.reorder).length
    return { stockValue, unitsOnHand, belowReorder }
  }, [parts])

  const valuationByPart = useMemo(
    () =>
      [...parts]
        .map((part) => ({ label: part.name, value: part.stock * parseSar(part.price) }))
        .sort((a, b) => b.value - a.value),
    [parts]
  )

  const stats: Stat[] = [
    {
      label: 'Stock Value',
      value: formatSar(totals.stockValue),
      caption: 'Across all tracked parts',
      highlight: true,
      icon: 'Package',
    },
    {
      label: 'Below Reorder',
      value: totals.belowReorder,
      caption: 'Parts at or under reorder level',
      tone: 'warning',
      icon: 'AlertTriangle',
    },
    {
      label: 'Units On Hand',
      value: totals.unitsOnHand,
      caption: 'Total quantity in stock',
      tone: 'info',
      icon: 'RefreshCw',
    },
    {
      label: 'Parts Tracked',
      value: parts.length,
      caption: 'Active SKUs',
      icon: 'Archive',
    },
  ]

  const columns: Column<Part>[] = [
    { header: 'Part', cell: (part) => part.name },
    { header: 'SKU', cell: (part) => part.sku, code: true },
    {
      header: 'On Hand',
      cell: (part) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {part.stock}
        </span>
      ),
    },
    {
      header: 'Reorder Level',
      cell: (part) => (
        <span className="font-mono text-[13px] text-muted" dir="ltr">
          {part.reorder}
        </span>
      ),
    },
    {
      header: 'Value',
      cell: (part) => <Money sar={part.stock * parseSar(part.price)} className="font-semibold" />,
    },
    { header: 'Status', cell: (part) => <StockBadge part={part} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Package"
        title={t('Inventory Reports')}
        subtitle={t('Stock reports')}
        actions={<ReportActions />}
      />
      <StatRow stats={stats} />

      <Section title={t('Valuation by Part')} subtitle={t('Stock value per SKU, highest first')}>
        {valuationByPart.length ? (
          <ValuationBars rows={valuationByPart} />
        ) : (
          <p className="text-[13px] text-muted">{t('No parts tracked yet')}</p>
        )}
      </Section>

      <Section title={t('Stock Movement')} subtitle={t('On-hand quantity against reorder level')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={parts}
          rowKey={(part) => part.sku}
          loading={isLoading}
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
              <MobileCardRow label={t('Value')}>
                <Money sar={part.stock * parseSar(part.price)} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Package"
              title={t('No parts tracked yet')}
              description={t('Add parts to start generating stock reports.')}
            />
          }
        />
      </Section>
    </>
  )
}
