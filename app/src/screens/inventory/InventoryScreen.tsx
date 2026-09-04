import { useCallback, useMemo, useState, type KeyboardEvent } from 'react'
import { TabBar } from '@/components/shell/FeatureScreen'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { useCommand, type Command } from '@/components/shell/commands'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { KpiCard, TONES, type Kpi } from '@/components/ui/KpiCard'
import { formatSar } from '@/components/ui/Money'
import { ReadOnlyNotice } from '@/components/ui/States'
import { useCollection } from '@/data/useCollection'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { AddPartModal } from './AddPartModal'
import { httpMovementApi, movementUnavailableReason, type MovementApi } from './movementApi'
import { PartLedgerDrawer } from './MovementDrawer'
import { LedgerTab } from './MovementHistory'
import { isBelowReorder, priceHalalasOf, reservedOf, shortfallOf, type Part } from './partFields'
import { AlertsTab, OverviewTab, applyPartFilters, type PartFilter } from './PartsTable'
import { AutoReorderTab, PricingTab } from './PricingTab'
import { RecordMovementModal } from './RecordMovementModal'

/* ═════════════════════════════════════════════════════════════════ the screen */

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'Package' },
  { id: 'alerts', label: 'Alerts', icon: 'AlertTriangle' },
  { id: 'reorder', label: 'Auto-Reorder', icon: 'Settings' },
  { id: 'transfers', label: 'Transfers', icon: 'ArrowLeftRight' },
  { id: 'pricing', label: 'Pricing', icon: 'TrendingUp' },
  { id: 'audit', label: 'Audit', icon: 'History' },
] as const

/** Inventory & parts management.
 *
 *  Six tabs that all rendered the same table were a named piece of technical
 *  debt: the screen said "Transfers" and showed the parts list, so a reader had
 *  no way to tell a tab with nothing behind it from a tab that was lying. Each
 *  one carries its own content, and the two that have nothing behind them yet
 *  say exactly that and why.
 *
 *  Stock quantity is never written from here. It changes only through
 *  `POST /inventory/:id/movement`, which locks the part row, applies the §A11
 *  invariant and appends to the ledger — so on-hand is a consequence of the
 *  movements, not a field a screen can set.
 *
 *  `api` is injected only by tests. Production renders `<Inventory />` and gets
 *  the real transport. */
export function Inventory({ api }: { api?: MovementApi | null } = {}) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { can, fieldHidden, user } = useSession()
  const { data: parts = [], isLoading, isError, refetch } = useCollection('parts')
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<ReadonlySet<PartFilter>>(() => new Set())
  // The open ledger is remembered by SKU, not by row. Holding the row would
  // pin the quantity it had when it was opened, and every figure in the ledger
  // — the projection, the running balances, the reconciliation — is derived
  // from the current quantity. After a movement lands, the list is refetched
  // and the ledger has to move with it or it starts contradicting itself.
  const [ledgerSku, setLedgerSku] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [picking, setPicking] = useState(false)

  // `api === undefined` means "not injected", which is the production path.
  // `api === null` is a test saying "there is no transport", which is a
  // different statement and must not be overwritten by the real one.
  const movements = useMemo(() => (api === undefined ? httpMovementApi() : api), [api])
  const unavailable = movements ? null : movementUnavailableReason()

  const mayEdit = can('inventory', 'e')
  const mayCreate = can('inventory', 'c')
  // Purchase price is hidden from advisors, technicians, QC, front desk and
  // call centre (FIELD_RULES), so the price column drops out entirely for them
  // rather than showing a column of dashes.
  const hidePrice = fieldHidden('Supplier purchase price')
  const hideCost = fieldHidden('Part cost / margin')

  const lowStock = useMemo(
    () => parts.filter(isBelowReorder).slice().sort((a, b) => shortfallOf(b) - shortfallOf(a)),
    [parts]
  )

  const searched = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return parts
    return parts.filter((part) =>
      [part.name, part.sku].some((field) => field.toLowerCase().includes(needle))
    )
  }, [parts, query])
  const filtered = useMemo(() => applyPartFilters(searched, filters), [searched, filters])

  const ledgerPart = parts.find((part) => part.sku === ledgerSku) ?? null
  const openLedger = useCallback((part: Part) => setLedgerSku(part.sku), [])
  const startMovement = useCallback(() => setPicking(true), [])

  // A scanner types the SKU and sends Enter. One match — or an exact SKU among
  // several — opens that part's ledger without a second tap.
  const selectScan = useCallback(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return
    const exact = parts.find((part) => part.sku.toLowerCase() === needle)
    const target = exact ?? (searched.length === 1 ? searched[0] : null)
    if (target) openLedger(target)
  }, [parts, query, searched, openLedger])

  const commands = useMemo<readonly Command[]>(
    () =>
      mayEdit
        ? [
            {
              id: 'inventory.record-movement',
              label: 'Record Movement',
              icon: 'ArrowUpDown',
              keywords: ['stock', 'receive', 'consume', 'ledger', 'parts'],
              group: 'create',
              screen: 'Inventory',
              run: startMovement,
            },
          ]
        : [],
    [mayEdit, startMovement]
  )
  useCommand(commands)

  const searchBox = (
    <PartSearch value={query} onChange={setQuery} onSubmit={selectScan} compact={!isMobile} />
  )

  const body =
    tab === 'alerts' ? (
      <AlertsTab
        parts={lowStock.filter((part) => searched.includes(part))}
        loading={isLoading}
        mayEdit={mayEdit}
        onReceive={openLedger}
      />
    ) : tab === 'reorder' ? (
      <AutoReorderTab candidates={lowStock.length} />
    ) : tab === 'transfers' ? (
      <LedgerTab
        parts={parts}
        loading={isLoading}
        api={movements}
        unavailable={unavailable}
        only={['transfer']}
        title={t('Stock Transfers')}
        subtitle={t('Movements between branches, newest last, for the part you select.')}
        emptyTitle={t('No transfers recorded')}
        emptyDescription={t('This part has never been transferred between branches.')}
      />
    ) : tab === 'pricing' ? (
      <PricingTab parts={searched} loading={isLoading} hidePrice={hidePrice} hideCost={hideCost} />
    ) : tab === 'audit' ? (
      <LedgerTab
        parts={parts}
        loading={isLoading}
        api={movements}
        unavailable={unavailable}
        title={t('Stock Movement Audit')}
        subtitle={t('Every movement recorded against the part you select, with the balance it left behind.')}
        emptyTitle={t('No movements recorded')}
        emptyDescription={t("Nothing has moved this part's stock since it was opened.")}
        reconcile
      />
    ) : (
      <OverviewTab
        parts={filtered}
        allParts={parts}
        loading={isLoading}
        hidePrice={hidePrice}
        filters={filters}
        onFilters={setFilters}
        onOpen={openLedger}
      />
    )

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow="Parts"
        title="Inventory & Parts Management"
        subtitle={t('Stock, reservations and the movement ledger behind every quantity.')}
        actions={
          <>
            {isMobile ? null : searchBox}
            {mayCreate ? (
              <Button variant="outline" onClick={() => setCreating(true)}>
                <Icon name="Plus" size={16} />
                {t('Add Part')}
              </Button>
            ) : null}
            {mayEdit ? (
              <Button onClick={startMovement}>
                <Icon name="ArrowUpDown" size={16} />
                {t('Record Movement')}
              </Button>
            ) : null}
          </>
        }
        toolbar={
          <>
            {isMobile ? searchBox : null}
            <TabBar tabs={TABS} value={tab} onChange={setTab} />
          </>
        }
        notice={
          <>
            <BranchScope branchId={user?.branchId ?? null} />
            {mayEdit ? null : (
              <ReadOnlyNotice
                message={t('Read-only — your role can view stock but not record movements.')}
              />
            )}
          </>
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
        <InventoryKpis parts={parts} lowStock={lowStock.length} hidePrice={hidePrice} />

        {/* The tab bar is a `tablist` whose panel is rendered here, so the panel
            says what it is and can be reached with a keyboard rather than being
            an anonymous region that follows a set of buttons. */}
        <div
          role="tabpanel"
          tabIndex={0}
          aria-label={t(TABS.find((entry) => entry.id === tab)?.label ?? 'Overview')}
          className="flex flex-col gap-6 focus-visible:outline-none"
        >
          {body}
        </div>
      </ScreenFrame>

      {creating ? <AddPartModal onClose={() => setCreating(false)} /> : null}

      {picking ? (
        <RecordMovementModal
          parts={parts}
          initialSku={searched.length === 1 ? searched[0]?.sku : undefined}
          onClose={() => setPicking(false)}
          onPick={(part) => {
            setPicking(false)
            openLedger(part)
          }}
        />
      ) : null}

      {ledgerPart ? (
        <PartLedgerDrawer
          part={ledgerPart}
          api={movements}
          unavailable={unavailable}
          mayEdit={mayEdit}
          onClose={() => setLedgerSku(null)}
        />
      ) : null}
    </>
  )
}

/* ─────────────────────────────────────────────────────────────── the header */

/** Scanner-friendly SKU search: Latin, upper-case, Enter selects.
 *
 *  A barcode scanner types the code and presses Enter, so the box is pinned
 *  LTR and monospaced, asks the keyboard for capitals, and treats Enter as
 *  "open the one part this matches". Typing a name still filters the list. */
function PartSearch({
  value,
  onChange,
  onSubmit,
  compact,
}: {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  compact: boolean
}) {
  const { t } = usePreferences()
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    onSubmit()
  }
  return (
    <span className={cn('relative block w-full', compact && 'sm:w-[280px]')}>
      <Icon
        name="ScanBarcode"
        size={16}
        className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t('Scan or type a SKU…')}
        aria-label={t('Search parts by name or SKU')}
        dir="ltr"
        inputMode="text"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        className={cn(
          'h-11 w-full rounded border border-border bg-inset ps-9 pe-3 font-mono text-[13px] text-heading outline-none',
          'transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]'
        )}
      />
    </span>
  )
}

/** The figures the whole list adds up to, computed from the rows on screen. */
function InventoryKpis({
  parts,
  lowStock,
  hidePrice,
}: {
  parts: readonly Part[]
  lowStock: number
  hidePrice: boolean
}) {
  const { t } = usePreferences()
  // A dataset that carries no reservations says so. Summing it to zero would
  // claim that nothing is committed, which is a different statement from
  // not knowing.
  const knowsReserved = parts.some((part) => reservedOf(part) !== null)
  const reservedUnits = parts.reduce((sum, part) => sum + (reservedOf(part) ?? 0), 0)
  const reservedHalalas = parts.reduce(
    (sum, part) => sum + (reservedOf(part) ?? 0) * priceHalalasOf(part),
    0
  )
  const unitsOnHand = parts.reduce((sum, part) => sum + part.stock, 0)
  const stockHalalas = parts.reduce((sum, part) => sum + priceHalalasOf(part) * part.stock, 0)
  const unknownCaption = t('Not recorded in this dataset')

  const kpis: Kpi[] = [
    {
      label: t('SKUs'),
      value: String(parts.length),
      icon: 'Package',
      ...TONES.blue,
      caption: t('Tracked parts'),
    },
    {
      label: t('Below Reorder'),
      value: String(lowStock),
      icon: 'AlertTriangle',
      ...TONES.orange,
      caption: t('At or under their reorder point'),
    },
    hidePrice
      ? {
          label: t('Reserved Units'),
          value: knowsReserved ? String(reservedUnits) : '—',
          icon: 'Lock',
          ...TONES.bright,
          caption: knowsReserved ? t('Held against open work') : unknownCaption,
        }
      : {
          label: t('Reserved Value'),
          value: knowsReserved ? formatSar(reservedHalalas / 100) : '—',
          icon: 'Lock',
          mono: true,
          ...TONES.bright,
          caption: knowsReserved ? t('Held against open work, at sell price') : unknownCaption,
        },
    hidePrice
      ? {
          label: t('Units On Hand'),
          value: String(unitsOnHand),
          icon: 'Layers',
          ...TONES.navy,
          caption: t('Across every tracked part'),
        }
      : {
          label: t('Stock Value'),
          value: formatSar(stockHalalas / 100),
          icon: 'Coins',
          mono: true,
          ...TONES.navy,
          caption: t('On hand at sell price'),
        },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  )
}

/** Which stock these numbers are.
 *
 *  The design puts a branch dropdown here. It cannot be one: reads are scoped
 *  by row-level security to the branch in the caller's token, so a client-side
 *  picker could only ever re-label the same rows — and the three branch names
 *  the prototype offered exist nowhere in the system. Nothing lists branches
 *  either: `branches` is a table with no collection and no endpoint. So this
 *  states the scope instead of pretending to change it. */
function BranchScope({ branchId }: { branchId: string | null }) {
  const { t } = usePreferences()
  return (
    <p className="flex flex-wrap items-center gap-2 rounded border border-border bg-inset px-3 py-2 text-[13px] text-body">
      <Icon name="Warehouse" size={15} className="flex-shrink-0 text-muted" />
      {branchId ? (
        <>
          {t('Stock for the branch this session belongs to.')}
          <span dir="ltr" className="font-mono text-xs text-muted">
            {branchId}
          </span>
        </>
      ) : (
        t('Stock for the branch this session belongs to. The server decides which — it is not chosen here.')
      )}
    </p>
  )
}
