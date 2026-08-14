import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FeatureHeader, SearchField, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useCollection, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import {
  httpMovementApi,
  ledgerTotals,
  movementUnavailableReason,
  partRef,
  type MovementApi,
  type MovementRow,
} from './Inventory'

type Part = RowOf<'parts'>

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

  if (isError) {
    return (
      <>
        <ReportsHeader
          period={period}
          onPeriod={setPeriod}
          onExport={exportCsv}
          canExport={false}
        />
        <Section title={t('Inventory Reports')}>
          <ErrorState
            title={t("Couldn't load the parts list")}
            description={t('The request failed. Nothing has been changed — retry, or check the service status if this keeps happening.')}
            onRetry={() => void refetch()}
          />
        </Section>
      </>
    )
  }

  return (
    <>
      <ReportsHeader
        period={period}
        onPeriod={setPeriod}
        onExport={exportCsv}
        canExport={parts.length > 0}
      />

      <StatRow stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <MovementTrend
          rows={periodRows}
          period={period}
          loading={isLoading || ledgerQuery.isLoading}
          error={ledgerQuery.isError ? ledgerQuery.error : null}
          unavailable={ledgerUnavailable}
          hasApi={movements !== null}
          onRetry={() => void ledgerQuery.refetch()}
        />
        <ValueByPart parts={parts} loading={isLoading} hidePrice={hidePrice} />
      </div>

      {movements !== null ? (
        <MovementBreakdown
          totals={periodTotals}
          loading={isLoading || ledgerQuery.isLoading}
          period={period}
        />
      ) : null}

      <Section
        title={t('Stock Details')}
        subtitle={t('Every tracked part, with what it holds and what it is worth.')}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-body">
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
          loading={isLoading}
          hidePrice={hidePrice}
          ledger={ledger}
          since={since}
        />
      </Section>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────── header */

type PeriodId = 'week' | 'month' | 'quarter' | 'year'

const PERIODS: Record<PeriodId, { label: string; days: number }> = {
  week: { label: 'This Week', days: 7 },
  month: { label: 'This Month', days: 30 },
  quarter: { label: 'This Quarter', days: 90 },
  year: { label: 'This Year', days: 365 },
}

const PERIOD_ORDER: PeriodId[] = ['week', 'month', 'quarter', 'year']

function ReportsHeader({
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
    <FeatureHeader
      icon="Package"
      title={t('Inventory Reports')}
      subtitle={t('Stock value, movement trends and reorder pressure, over the real parts ledger.')}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label={t('Reporting period')} className="flex flex-wrap gap-1">
            {PERIOD_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={period === id}
                onClick={() => onPeriod(id)}
                className={
                  'h-9 cursor-pointer rounded-lg border px-3 font-action text-[13px] font-medium transition-colors ' +
                  (period === id
                    ? 'border-transparent bg-salis-gradient text-white'
                    : 'border-border bg-card text-body hover:border-border-strong')
                }
              >
                {t(PERIODS[id].label)}
              </button>
            ))}
          </div>
          <Button onClick={onExport} disabled={!canExport}>
            <Icon name="Download" size={16} />
            {t('Export Report')}
          </Button>
        </div>
      }
    />
  )
}

/* ─────────────────────────────────────────────────────────────── trend chart */

/** Total units moved per bucket across the selected window — a real ledger
 *  trend when the movement API is reachable, and an honest "needs the API"
 *  panel when it is not, exactly as the Inventory ledger degrades. */
function MovementTrend({
  rows,
  period,
  loading,
  error,
  unavailable,
  hasApi,
  onRetry,
}: {
  rows: readonly MovementRow[]
  period: PeriodId
  loading: boolean
  error: Error | null
  unavailable: string | null
  hasApi: boolean
  onRetry: () => void
}) {
  const { t } = usePreferences()

  const body = (() => {
    if (!hasApi) {
      return (
        <EmptyState
          icon="CloudOff"
          title={t('The movement trend needs the API')}
          description={t(unavailable ?? 'This build is reading design fixtures, which hold no movement ledger.')}
        />
      )
    }
    if (loading) return <Loading label={t('Loading movements...')} />
    if (error) {
      return (
        <ErrorState
          title={t("Couldn't load the movement history")}
          description={error.message}
          onRetry={onRetry}
        />
      )
    }
    if (rows.length === 0) {
      return (
        <EmptyState
          icon="History"
          title={t('No movements in this period')}
          description={t('Nothing moved any part in the selected window. Choose a longer period, or record a movement from the Inventory screen.')}
        />
      )
    }
    return <TrendChart rows={rows} period={period} />
  })()

  return (
    <Section title={t('Stock Movement Trend')} subtitle={t('Total units moved, across every part.')}>
      {body}
    </Section>
  )
}

/** Buckets the window into twelve equal spans and plots the units moved in each
 *  as an area under a line. Pure SVG so it carries no chart dependency; colours
 *  reference the brand tokens, never a hex literal. */
function TrendChart({ rows, period }: { rows: readonly MovementRow[]; period: PeriodId }) {
  const { t } = usePreferences()
  const buckets = 12
  const now = Date.now()
  const span = PERIODS[period].days * 24 * 60 * 60 * 1000
  const start = now - span
  const step = span / buckets

  const totals = new Array(buckets).fill(0)
  for (const row of rows) {
    const at = new Date(row.createdAt).getTime()
    const index = Math.min(buckets - 1, Math.max(0, Math.floor((at - start) / step)))
    totals[index] += Math.abs(row.delta)
  }
  const max = Math.max(1, ...totals)

  const width = 600
  const height = 190
  const top = 12
  const floor = 168
  const point = (index: number) => {
    const x = 20 + (index / (buckets - 1)) * (width - 40)
    const y = floor - (totals[index] / max) * (floor - top)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }
  const points = totals.map((_, index) => point(index))
  const linePath = `M${points.join(' L')}`
  const areaPath = `${linePath} L${(width - 20).toFixed(1)},${floor} L20,${floor} Z`

  const axis = [0, Math.floor(buckets / 3), Math.floor((buckets * 2) / 3), buckets - 1].map((index) => {
    const date = new Date(start + index * step)
    return {
      x: 20 + (index / (buckets - 1)) * (width - 40),
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }
  })

  const gradId = 'inventory-report-trend'
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full"
      role="img"
      aria-label={t('Stock movement trend')}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--salis-blue)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--salis-blue)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="var(--salis-blue)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {axis.map((entry) => (
        <text
          key={entry.label}
          x={entry.x}
          y={floor + 14}
          fontSize="11"
          fill="var(--text-muted)"
          textAnchor="middle"
          fontFamily="Inter,sans-serif"
        >
          {entry.label}
        </text>
      ))}
    </svg>
  )
}

/* ────────────────────────────────────────────────────────── value breakdown */

/** Stock value by part, worth-most first — the design draws this by category,
 *  but parts carry no category, so it is by part, which the data supports. */
function ValueByPart({
  parts,
  loading,
  hidePrice,
}: {
  parts: readonly Part[]
  loading: boolean
  hidePrice: boolean
}) {
  const { t } = usePreferences()

  if (hidePrice) {
    return (
      <Section title={t('Stock by Part')} subtitle={t('Units on hand, most first.')}>
        <UnitsByPart parts={parts} loading={loading} />
      </Section>
    )
  }

  const ranked = parts
    .map((part) => ({ part, value: priceHalalasOf(part) * part.stock }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
  const max = Math.max(1, ...ranked.map((entry) => entry.value))

  return (
    <Section title={t('Stock Value by Part')} subtitle={t('Sell-price value on hand, most first.')}>
      {loading ? (
        <Loading label={t('Loading parts...')} />
      ) : ranked.length === 0 ? (
        <EmptyState icon="Package" title={t('No parts tracked yet')} />
      ) : (
        <div className="flex flex-col gap-3.5">
          {ranked.map(({ part, value }) => (
            <div key={part.sku}>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="truncate text-body">{part.name}</span>
                <span className="ms-2 flex-shrink-0 font-mono font-semibold text-muted" dir="ltr">
                  <Money sar={value / 100} />
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                <div
                  className="h-full rounded-full bg-salis-blue"
                  style={{ inlineSize: `${Math.round((value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

function UnitsByPart({ parts, loading }: { parts: readonly Part[]; loading: boolean }) {
  const { t } = usePreferences()
  const ranked = parts.slice().sort((a, b) => b.stock - a.stock).slice(0, 6)
  const max = Math.max(1, ...ranked.map((part) => part.stock))
  if (loading) return <Loading label={t('Loading parts...')} />
  if (ranked.length === 0) return <EmptyState icon="Package" title={t('No parts tracked yet')} />
  return (
    <div className="flex flex-col gap-3.5">
      {ranked.map((part) => (
        <div key={part.sku}>
          <div className="mb-1 flex justify-between text-[13px]">
            <span className="truncate text-body">{part.name}</span>
            <span className="ms-2 flex-shrink-0 font-mono font-semibold text-muted" dir="ltr">
              {part.stock}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
            <div
              className="h-full rounded-full bg-salis-blue"
              style={{ inlineSize: `${Math.round((part.stock / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────── movement breakdown by type */

/** What the ledger did in the period, by term of the §A11 equation. Every value
 *  is a sum over the real movement rows in the window. */
function MovementBreakdown({
  totals,
  loading,
  period,
}: {
  totals: ReturnType<typeof ledgerTotals>
  loading: boolean
  period: PeriodId
}) {
  const { t } = usePreferences()
  const entries: { label: string; value: number }[] = [
    { label: 'Received', value: totals.received },
    { label: 'Returned', value: totals.returned },
    { label: 'Consumed', value: totals.consumed },
    { label: 'Transferred', value: totals.transferOut },
    { label: 'Damaged', value: totals.damaged },
  ]
  const anyMovement = entries.some((entry) => entry.value > 0)

  return (
    <Section
      title={t('Movement Breakdown')}
      subtitle={`${t('Units by movement, over')} ${t(PERIODS[period].label).toLowerCase()}.`}
    >
      {loading ? (
        <Loading label={t('Loading movements...')} />
      ) : !anyMovement ? (
        <EmptyState
          icon="History"
          title={t('No movements in this period')}
          description={t('Nothing moved any part in the selected window.')}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {entries.map((entry) => (
            <div key={entry.label} className="rounded-lg border border-border bg-inset p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted">{t(entry.label)}</p>
              <p className="mt-1 font-mono text-2xl font-black text-heading" dir="ltr">
                {entry.value}
              </p>
              <p className="text-[11px] text-muted">{t('units')}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

/* ──────────────────────────────────────────────────────────── details table */

function DetailsTable({
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
    { header: 'Part', cell: (part) => part.name },
    { header: 'SKU', cell: (part) => part.sku, code: true },
    { header: 'On Hand', cell: (part) => <Num value={part.stock} />, code: true },
    { header: 'Reorder Level', cell: (part) => <Num value={part.reorder} muted />, code: true },
    {
      header: 'Available',
      cell: (part) => <Num value={availableOf(part) ?? part.stock} muted />,
      code: true,
    },
    ...(ledger
      ? [
          {
            header: 'Consumed',
            cell: (part: Part) => {
              const value = consumedInPeriod(part)
              return value === null ? <Dash /> : <Num value={value} muted />
            },
          },
        ]
      : []),
    ...(hidePrice
      ? []
      : [
          {
            header: 'Value',
            cell: (part: Part) => <Money sar={(priceHalalasOf(part) * part.stock) / 100} />,
          },
        ]),
  ]

  return (
    <DataTable
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

/* ──────────────────────────────────────────────────────────────── small bits */

function Num({ value, muted }: { value: number; muted?: boolean }) {
  return (
    <span
      className={muted ? 'font-mono text-[13px] text-muted' : 'font-mono text-[13px]'}
      dir="ltr"
    >
      {value}
    </span>
  )
}

function Dash() {
  const { t } = usePreferences()
  return (
    <span className="text-[13px] text-muted" title={t('Not recorded in this dataset')}>
      —
    </span>
  )
}

/* ─────────────────────────────────────────── part-row accessors (see Inventory) */

interface PartExtras {
  reserved?: number
  available?: number
  priceHalalas?: number
}

const extras = (part: Part): PartExtras => part as Part & PartExtras

function reservedOf(part: Part): number | null {
  const value = extras(part).reserved
  return typeof value === 'number' ? value : null
}

function availableOf(part: Part): number | null {
  const value = extras(part).available
  return typeof value === 'number' ? value : part.stock - (reservedOf(part) ?? 0)
}

function priceHalalasOf(part: Part): number {
  const value = extras(part).priceHalalas
  return typeof value === 'number' ? value : Math.round(parseSar(part.price) * 100)
}
