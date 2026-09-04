import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Section } from '@/components/shell/FeatureScreen'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { Select } from '@/components/ui/Select'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { DateCell, Qty, Unknown } from './InventoryBits'
import {
  ledgerTotals,
  onHandFrom,
  openingFrom,
  runningBalances,
  type LedgerTotals,
  type MovementRow,
  type MovementType,
} from './ledger'
import type { MovementApi } from './movementApi'
import { partRef, type Part } from './partFields'

/* ─────────────────────────────────────────────────────── transfers and audit */

/** The ledger endpoint is per part, so both ledger tabs start by choosing one.
 *  There is no all-parts movement feed to show, and inventing one by fanning
 *  out a request per part would be a different screen with different costs. */
export function LedgerTab({
  parts,
  loading,
  api,
  unavailable,
  only,
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  reconcile,
}: {
  parts: readonly Part[]
  loading: boolean
  api: MovementApi | null
  unavailable: string | null
  only?: readonly MovementType[]
  title: string
  subtitle: string
  emptyTitle: string
  emptyDescription: string
  reconcile?: boolean
}) {
  const { t } = usePreferences()
  const [sku, setSku] = useState<string>('')
  const selected = parts.find((part) => part.sku === sku) ?? parts[0] ?? null

  return (
    <Section title={t(title)} subtitle={t(subtitle)}>
      {loading ? (
        <Loading label={t('Loading parts...')} />
      ) : !selected ? (
        <EmptyState
          icon="Package"
          title={t('No parts tracked yet')}
          description={t('Add parts to start tracking stock.')}
        />
      ) : (
        <>
          <label className="flex flex-col gap-1">
            <span className="font-action text-xs font-medium text-heading">{t('Part')}</span>
            <Select
              value={selected.sku}
              onChange={(event) => setSku(event.target.value)}
              aria-label={t('Part')}
              className="h-12 w-full max-w-[420px] bg-inset font-action text-sm"
            >
              {parts.map((part) => (
                <option key={part.sku} value={part.sku}>
                  {`${part.name} — ${part.sku}`}
                </option>
              ))}
            </Select>
          </label>
          <MovementHistory
            part={selected}
            api={api}
            unavailable={unavailable}
            only={only}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            reconcile={reconcile}
          />
        </>
      )}
    </Section>
  )
}

const TYPE_LABEL: Record<string, string> = {
  in: 'Received',
  out: 'Consumed',
  transfer: 'Transferred',
  adjust: 'Adjusted Up',
  adjust_down: 'Adjusted Down',
  return: 'Returned',
  damage: 'Damaged',
}

/** `GET /inventory/:id/movements`, with the balance each row left behind and —
 *  when asked — the §A11 reconciliation the whole ledger has to satisfy. */
export function MovementHistory({
  part,
  api,
  unavailable,
  only,
  emptyTitle,
  emptyDescription,
  reconcile,
}: {
  part: Part
  api: MovementApi | null
  unavailable: string | null
  only?: readonly MovementType[]
  emptyTitle: string
  emptyDescription: string
  reconcile?: boolean
}) {
  const { t } = usePreferences()
  const ref = partRef(part)
  const query = useQuery<MovementRow[], Error>({
    queryKey: ['inventory-movements', ref],
    queryFn: () => (api as MovementApi).list(ref),
    enabled: api !== null,
  })

  if (!api) {
    return (
      <EmptyState
        icon="CloudOff"
        title={t('The stock ledger is unavailable')}
        description={t(unavailable ?? 'The stock ledger cannot be reached from this build.')}
      />
    )
  }
  if (query.isLoading) return <Loading label={t('Loading movements...')} />
  if (query.isError) {
    return (
      <ErrorState
        title={t("Couldn't load the movement history")}
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const rows = query.data ?? []
  const balances = runningBalances(part.stock, rows)
  const totals = ledgerTotals(rows)
  const opening = openingFrom(part.stock, rows)
  const shown = only ? rows.filter((row) => only.includes(row.type as MovementType)) : rows
  const shownBalances = new Map(rows.map((row, index) => [row.id, balances[index] ?? 0]))

  const columns: Column<MovementRow>[] = [
    { header: 'When', cell: (row) => <DateCell value={row.createdAt} />, code: true },
    {
      header: 'Movement',
      cell: (row) => (
        <Badge background="var(--tint-blue)" color="var(--salis-blue)">
          {t(TYPE_LABEL[row.type] ?? row.type)}
        </Badge>
      ),
    },
    {
      header: 'Quantity',
      cell: (row) => (
        <span
          className={row.delta < 0 ? 'font-mono text-[13px] text-salis-orange' : 'font-mono text-[13px]'}
          dir="ltr"
        >
          {row.delta > 0 ? `+${row.delta}` : row.delta}
        </span>
      ),
    },
    {
      header: 'On Hand After',
      cell: (row) => <Qty value={shownBalances.get(row.id) ?? null} />,
      code: true,
    },
    { header: 'Reference', cell: (row) => row.ref ?? <Unknown />, code: true },
    { header: 'Reason', cell: (row) => row.reason ?? <Unknown /> },
  ]

  return (
    <>
      {reconcile ? (
        <Reconciliation
          opening={opening}
          totals={totals}
          onHand={part.stock}
          movements={rows.length}
        />
      ) : null}
      <DataTable
        caption="Stock movements"
        className="border-0 shadow-none"
        columns={columns}
        rows={shown}
        rowKey={(row) => row.id}
        stickyHeader={false}
        mobileCard={(row) => (
          <>
            <MobileCardHeader
              title={t(TYPE_LABEL[row.type] ?? row.type)}
              trailing={
                <span
                  className={row.delta < 0 ? 'font-mono text-salis-orange' : 'font-mono'}
                  dir="ltr"
                >
                  {row.delta > 0 ? `+${row.delta}` : row.delta}
                </span>
              }
            />
            <MobileCardRow label={t('When')}>
              <DateCell value={row.createdAt} />
            </MobileCardRow>
            <MobileCardRow label={t('On Hand After')}>
              <Qty value={shownBalances.get(row.id) ?? null} />
            </MobileCardRow>
            {row.reason ? (
              <MobileCardRow label={t('Reason')}>{row.reason}</MobileCardRow>
            ) : null}
          </>
        )}
        empty={<EmptyState icon="History" title={t(emptyTitle)} description={t(emptyDescription)} />}
      />
    </>
  )
}

/** The §A11 equation, spelled out against this part's own ledger.
 *
 *  Shown rather than asserted silently: if the two sides ever disagree the
 *  screen says so, because a quantity the UI keeps consistent while the
 *  database drifts is worse than a visible failure. */
function Reconciliation({
  opening,
  totals,
  onHand,
  movements,
}: {
  opening: number
  totals: LedgerTotals
  onHand: number
  movements: number
}) {
  const { t } = usePreferences()
  const derived = onHandFrom(opening, totals)
  const agrees = derived === onHand && totals.inconsistent.length === 0

  const terms: [string, number][] = [
    ['Opening', opening],
    ['Received', totals.received],
    ['Transfer In', totals.transferIn],
    ['Returned', totals.returned],
    ['Consumed', -totals.consumed],
    ['Transfer Out', -totals.transferOut],
    ['Adjustments', totals.adjustments],
    ['Damaged', -totals.damaged],
  ]

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-inset p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {terms.map(([label, value]) => (
          <span key={label} className="flex flex-col">
            <span className="text-[11px] text-muted">{t(label)}</span>
            <span className="font-mono text-sm font-semibold text-heading" dir="ltr">
              {value > 0 && label !== 'Opening' ? `+${value}` : value}
            </span>
          </span>
        ))}
        <span className="flex-1" />
        <span className="flex flex-col items-end">
          <span className="text-[11px] text-muted">{t('On Hand')}</span>
          <span
            className={
              agrees
                ? 'font-mono text-sm font-semibold text-salis-blue'
                : 'font-mono text-sm font-semibold text-salis-orange'
            }
            dir="ltr"
          >
            {onHand}
          </span>
        </span>
      </div>
      {agrees ? (
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <Icon name="ShieldCheck" size={15} className="flex-shrink-0 text-salis-blue" />
          {t('The ledger reconciles with the recorded quantity across')}{' '}
          <span dir="ltr" className="font-mono">
            {movements}
          </span>{' '}
          {t('movements.')}
        </p>
      ) : (
        <p role="alert" className="flex items-start gap-2 text-[13px] text-salis-orange">
          <Icon name="AlertTriangle" size={15} className="mt-0.5 flex-shrink-0" />
          {t('The ledger does not reconcile with the recorded quantity. The movements add up to')}{' '}
          <span dir="ltr" className="font-mono">
            {derived}
          </span>
          {'. '}
          {totals.inconsistent.length
            ? t('Some rows record an effect that disagrees with their own type and quantity.')
            : t('Report this before trusting either number.')}
        </p>
      )}
    </div>
  )
}
