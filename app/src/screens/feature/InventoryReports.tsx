import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SearchField, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { formatSar } from '@/components/ui/Money'
import { useToast } from '@/components/ui/Toast'
import { useCollection } from '@/data/useCollection'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import {
  MovementBreakdown,
  MovementTrend,
  PERIODS,
  PERIOD_ORDER,
  ValueByPart,
  type PeriodId,
} from '../inventory/InventoryReportPanels'
import { DetailsTable } from '../inventory/InventoryReportTable'
import { availableOf, priceHalalasOf, reservedOf } from '../inventory/partFields'
import {
  httpMovementApi,
  ledgerTotals,
  movementUnavailableReason,
  partRef,
  type MovementApi,
  type MovementRow,
} from './Inventory'

/** Inventory Reports (`project/InventoryReports.dc.html`).
 *
 *  The designed reports screen, built over the real `parts` collection and the
 *  per-part movement ledger rather than the prototype's baked-in figures. Every
 *  number here is derived, never stated: stock value from price × on-hand, the
 *  reorder count from each part against its own point, and — when the movement
 *  API is reachable — the trend and the received/consumed breakdown from the
 *  ledger the Inventory screen writes.
 *
 *  Two honesty rules the design could ignore and this cannot. The prototype's
 *  "Turnover Rate" and "Dead Stock" KPIs need a cost basis and a movement
 *  history the fixtures do not carry, so they are shown only when the ledger is
 *  reachable and are labelled for what they actually measure. And the category
 *  breakdown the design draws has no field behind it — parts carry no category —
 *  so the breakdown is by part value, which the data does support.
 *
 *  `api` is injected only by tests; production reads the real transport. */
export function InventoryReports({ api }: { api?: MovementApi | null } = {}) {
  const { t } = usePreferences()
  const { fieldHidden } = useSession()
  const isMobile = useIsMobile()
  const toast = useToast()
  const { data: parts = [], isLoading, isError, refetch } = useCollection('parts')

  const [period, setPeriod] = useState<PeriodId>('month')
  const [query, setQuery] = useState('')
  const [lowOnly, setLowOnly] = useState(false)

  const hidePrice = fieldHidden('Supplier purchase price')

  const movements = useMemo(() => (api === undefined ? httpMovementApi() : api), [api])
  const ledgerUnavailable = movements ? null : movementUnavailableReason()

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return parts.filter((part) => {
      if (lowOnly && part.stock > part.reorder) return false
      if (!needle) return true
      return [part.name, part.sku].some((field) => field.toLowerCase().includes(needle))
    })
  }, [parts, query, lowOnly])

  const stockValueHalalas = useMemo(
    () => parts.reduce((sum, part) => sum + priceHalalasOf(part) * part.stock, 0),
    [parts]
  )
  const unitsOnHand = useMemo(() => parts.reduce((sum, part) => sum + part.stock, 0), [parts])
  const belowReorder = useMemo(
    () => parts.filter((part) => part.stock <= part.reorder).length,
    [parts]
  )
  const knowsReserved = parts.some((part) => reservedOf(part) !== null)
  const reservedUnits = knowsReserved
    ? parts.reduce((sum, part) => sum + (reservedOf(part) ?? 0), 0)
    : null

  // The movement ledger, read once per part and kept keyed by the reference the
  // rows belong to, so the trend, the breakdown and the per-part period columns
  // all draw on one fetch rather than one each.
  const ledgerQuery = useQuery<Record<string, MovementRow[]>, Error>({
    queryKey: ['inventory-report-ledger', parts.map((part) => partRef(part)).sort()],
    enabled: movements !== null && parts.length > 0,
    queryFn: async () => {
      const api = movements as MovementApi
      const entries = await Promise.all(
        parts.map(async (part) => [partRef(part), await api.list(partRef(part))] as const)
      )
      return Object.fromEntries(entries)
    },
  })

  const window = PERIODS[period]
  const since = Date.now() - window.days * 24 * 60 * 60 * 1000
  const ledger = ledgerQuery.data
  const periodRows = useMemo(() => {
    if (!ledger) return []
    return Object.values(ledger)
      .flat()
      .filter((row) => new Date(row.createdAt).getTime() >= since)
  }, [ledger, since])

  const periodTotals = useMemo(() => ledgerTotals(periodRows), [periodRows])

  const stats: Stat[] = [
    hidePrice
      ? { label: 'Units On Hand', value: unitsOnHand, caption: 'Across every tracked part', highlight: true }
      : {
          label: 'Stock Value',
          value: formatSar(stockValueHalalas / 100, { bare: true }),
          caption: 'On hand at sell price',
          highlight: true,
        },
    { label: 'Units On Hand', value: unitsOnHand, caption: 'Total quantity in stock' },
    { label: 'Below Reorder', value: belowReorder, caption: 'Parts needing attention', tone: 'warning' },
    {
      label: 'Reserved Units',
      value: reservedUnits ?? '—',
      caption: knowsReserved ? 'Held against open work' : 'Not recorded in this dataset',
      tone: 'info',
    },
  ]

  const exportCsv = useCallback(() => {
    const header = ['Part', 'SKU', 'On Hand', 'Reorder Level', 'Reserved', 'Available', 'Value SAR']
    const body = filtered.map((part) =>
      [
        part.name,
        part.sku,
        String(part.stock),
        String(part.reorder),
        reservedOf(part) === null ? '' : String(reservedOf(part)),
        String(availableOf(part) ?? part.stock),
        ((priceHalalasOf(part) * part.stock) / 100).toFixed(2),
      ]
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [header.join(','), ...body].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'inventory-report.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast.show({
      title: t('Exported'),
      description: t('inventory-report.csv — parts currently in view.'),
    })
  }, [filtered, t, toast])

  return (
    <ScreenFrame
      icon="Package"
      eyebrow="Parts"
      title="Inventory Reports"
      subtitle={t('Stock value, movement trends and reorder pressure, over the real parts ledger.')}
      actions={
        <ReportActions
          period={period}
          onPeriod={setPeriod}
          onExport={exportCsv}
          canExport={!isError && parts.length > 0}
        />
      }
      loading={isLoading}
      skeleton="dashboard"
      error={
        isError
          ? {
              message: `${t("Couldn't load the parts list")}. ${t('The request failed. Nothing has been changed — retry, or check the service status if this keeps happening.')}`,
              onRetry: () => void refetch(),
            }
          : null
      }
    >
      <StatRow stats={stats} />

      <div className={isMobile ? 'flex flex-col gap-5' : 'grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]'}>
        <MovementTrend
          rows={periodRows}
          period={period}
          loading={ledgerQuery.isLoading}
          error={ledgerQuery.isError ? ledgerQuery.error : null}
          unavailable={ledgerUnavailable}
          hasApi={movements !== null}
          onRetry={() => void ledgerQuery.refetch()}
        />
        <ValueByPart parts={parts} loading={false} hidePrice={hidePrice} />
      </div>

      {movements !== null ? (
        <MovementBreakdown totals={periodTotals} loading={ledgerQuery.isLoading} period={period} />
      ) : null}

      <Section
        title={t('Stock Details')}
        subtitle={t('Every tracked part, with what it holds and what it is worth.')}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[13px] text-body">
              <input
                type="checkbox"
                checked={lowOnly}
                onChange={(event) => setLowOnly(event.target.checked)}
                className="h-4 w-4 accent-salis-blue"
              />
              {t('Below reorder only')}
            </label>
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder={t('Search parts...')}
              className="w-full sm:w-[260px]"
            />
          </div>
        }
      >
        <DetailsTable
          parts={filtered}
          loading={false}
          hidePrice={hidePrice}
          ledger={ledger}
          since={since}
        />
      </Section>
    </ScreenFrame>
  )
}

/* ─────────────────────────────────────────────────────────────────── header */

function ReportActions({
  period,
  onPeriod,
  onExport,
  canExport,
}: {
  period: PeriodId
  onPeriod: (next: PeriodId) => void
  onExport: () => void
  canExport: boolean
}) {
  const { t } = usePreferences()
  return (
    <>
      <ChipGroup label={t('Reporting period')} className="flex flex-wrap gap-1.5">
        {PERIOD_ORDER.map((id) => (
          <Chip key={id} label={t(PERIODS[id].label)} selected={period === id} onToggle={() => onPeriod(id)} />
        ))}
      </ChipGroup>
      <Button onClick={onExport} disabled={!canExport}>
        <Icon name="Download" size={16} />
        {t('Export Report')}
      </Button>
    </>
  )
}
