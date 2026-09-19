import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { ErrorState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  MAX_PAGE_SIZE,
  RepositoryError,
  useCollection,
  usePagedCollection,
  useUpdate,
  type RowOf,
} from '@/data/useCollection'
import { rowId } from '../registry/writes'

/** Internal Warehouse (BLK-004) — the bays stock is put away in, and how full
 *  each one is.
 *
 *  This screen used to render a hardcoded `ZONES` array of six zones whose
 *  `capacity`, `utilized` and `itemCount` were all invented, and then computed
 *  its four KPIs *from* that array — arithmetic that was internally consistent
 *  over entirely made-up inputs. It now reads `warehouseZones`
 *  (`GET/PATCH /warehouse-zones`) and `parts` (`GET /inventory`).
 *
 *  ─── What is derived and what is recorded ────────────────────────────────
 *
 *  **Derived, from stock:** every item count, every stored quantity and every
 *  utilisation percentage on this screen. A zone's items are the `parts` rows
 *  whose `zoneCode` is that zone, counted here; its stored quantity is the sum
 *  of their on-hand. Nothing records those numbers, so nothing can disagree
 *  with the inventory.
 *
 *  **Recorded, on the zone row:** `capacityUnits` — how many units the bay
 *  holds — plus its code, name, kind and lifecycle status. That is right:
 *  capacity is a property of the bay, and no stock ledger knows it.
 *
 *  A zone is "Full" when the stock in it reaches its capacity; that is derived
 *  too, which is why `warehouseZoneStatus` has no `full` member. A zone holding
 *  nothing reads 0%, and is never hidden.
 *
 *  Two limits are shown on the screen rather than papered over: stock not
 *  assigned to any bay yet, and (against a live API with a large catalogue) a
 *  parts list longer than one page, which would make the counts a partial view.
 */

type Zone = RowOf<'warehouseZones'>
type Part = RowOf<'parts'>

/** A zone with the stock facts counted from `parts`. */
type ZoneUtilisation = Zone & {
  itemCount: number
  storedUnits: number
  /** Null when the zone's capacity is unmeasured (`capacityUnits === 0`) —
   *  rendered as a dash rather than a fabricated percentage. */
  utilization: number | null
  full: boolean
}

/** What the bay is for. Deliberately worded so no label repeats a zone *name*
 *  ("Receiving", "Cold Storage", "Hazmat" are names of bays A5, A3 and A4): a
 *  purpose column echoing the name column reads as if the two were one field. */
const KIND_LABEL: Record<string, string> = {
  storage: 'Storage',
  receiving: 'Goods In',
  shipping: 'Goods Out',
  cold: 'Refrigerated',
  hazmat: 'Hazardous',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  maintenance: 'Maintenance',
  closed: 'Closed',
}

function statusStyle(zone: ZoneUtilisation) {
  if (zone.status === 'maintenance') return { background: 'var(--tint-orange)', color: 'var(--salis-orange)' }
  if (zone.status === 'closed') return { background: 'var(--tint-neutral)', color: 'var(--text-muted)' }
  if (zone.full) return { background: 'var(--tint-orange)', color: 'var(--salis-orange)' }
  return { background: 'var(--tint-blue)', color: 'var(--salis-blue)' }
}

export function InternalWarehouse() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const toast = useToast()
  const update = useUpdate('warehouseZones')
  const [movingId, setMovingId] = useState<string | null>(null)

  const zones = useCollection('warehouseZones')
  /* The whole catalogue in one read, because every zone's count is a group over
   * it. `MAX_PAGE_SIZE` is the ceiling the API enforces, so a tenant with more
   * parts than that would be counted from a partial list — which the screen
   * says out loud below rather than presenting as a total. */
  const parts = usePagedCollection('parts', { pageSize: MAX_PAGE_SIZE })

  const partRows: readonly Part[] = parts.data?.rows ?? []
  const partsTotal = parts.data?.page.total ?? partRows.length
  const partsTruncated = partsTotal > partRows.length

  const mayWrite = can('inventory', 'e')

  const rows = useMemo<ZoneUtilisation[]>(
    () =>
      (zones.data ?? []).map((zone) => {
        const held = partRows.filter((part) => part.zoneCode === zone.code)
        const storedUnits = held.reduce((sum, part) => sum + (part.stock ?? 0), 0)
        const utilization =
          zone.capacityUnits > 0 ? Math.round((storedUnits / zone.capacityUnits) * 100) : null
        return {
          ...zone,
          itemCount: held.length,
          storedUnits,
          utilization,
          full: zone.capacityUnits > 0 && storedUnits >= zone.capacityUnits,
        }
      }),
    [zones.data, partRows],
  )

  const totals = useMemo(() => {
    const totalCapacity = rows.reduce((sum, zone) => sum + zone.capacityUnits, 0)
    const totalStored = rows.reduce((sum, zone) => sum + zone.storedUnits, 0)
    const unassigned = partRows.filter((part) => !part.zoneCode)
    return {
      zones: rows.length,
      totalCapacity,
      totalStored,
      /* Derived from the same two real numbers the table shows, not averaged
       * over per-zone percentages. */
      avgUtilization: totalCapacity > 0 ? Math.round((totalStored / totalCapacity) * 100) : 0,
      activeZones: rows.filter((zone) => zone.status === 'active').length,
      unassignedItems: unassigned.length,
      unassignedUnits: unassigned.reduce((sum, part) => sum + (part.stock ?? 0), 0),
    }
  }, [rows, partRows])

  const zoneName = (zone: Zone) => (rtl && zone.nameAr ? zone.nameAr : zone.name)

  const moveTo = async (zone: ZoneUtilisation, status: Zone['status']) => {
    const id = rowId(zone)
    if (!id) return
    setMovingId(id)
    try {
      await update.mutateAsync({ id, patch: { status } as Partial<Zone> })
      toast.show({
        title: status === 'maintenance' ? t('Zone under maintenance') : t('Zone back in service'),
        description: zoneName(zone),
      })
    } catch (cause) {
      toast.show({
        title: t('Could not update zone'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setMovingId(null)
    }
  }

  const kpis = [
    { label: t('Total Zones'), value: String(totals.zones), icon: 'LayoutGrid', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Capacity'), value: String(totals.totalCapacity), icon: 'Warehouse', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Utilization'), value: `${totals.avgUtilization}%`, icon: 'BarChart3', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active Zones'), value: String(totals.activeZones), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const actionCell = (zone: ZoneUtilisation) => {
    const id = rowId(zone)
    const busy = movingId === id
    return zone.status === 'maintenance' ? (
      <Button size="sm" variant="subtle" disabled={busy} onClick={() => void moveTo(zone, 'active')}>
        <Icon name="CheckCircle" size={13} />
        {busy ? t('Updating...') : t('Return to Service')}
      </Button>
    ) : (
      <Button size="sm" variant="subtle" disabled={busy} onClick={() => void moveTo(zone, 'maintenance')}>
        <Icon name="Wrench" size={13} />
        {busy ? t('Updating...') : t('Under Maintenance')}
      </Button>
    )
  }

  const columns: Column<ZoneUtilisation>[] = [
    { header: 'Code', cell: (zone) => <span className="font-mono text-xs text-muted" dir="ltr">{zone.code}</span> },
    { header: 'Zone Name', cell: (zone) => <span className="font-medium text-heading">{zoneName(zone)}</span> },
    { header: 'Purpose', cell: (zone) => <span className="text-muted">{t(KIND_LABEL[zone.kind] ?? zone.kind)}</span> },
    { header: 'Capacity', cell: (zone) => <span className="font-mono text-heading" dir="ltr">{zone.capacityUnits}</span> },
    { header: 'Stored', cell: (zone) => <span className="font-mono text-heading" dir="ltr">{zone.storedUnits}</span> },
    {
      header: 'Utilized',
      cell: (zone) => (
        <span className="font-mono text-heading" dir="ltr">
          {zone.utilization === null ? '—' : `${zone.utilization}%`}
        </span>
      ),
    },
    { header: 'Items', cell: (zone) => <span className="font-mono text-heading" dir="ltr">{zone.itemCount}</span> },
    {
      header: 'Status',
      cell: (zone) => (
        <Badge {...statusStyle(zone)}>
          {zone.status === 'active' && zone.full ? t('Full') : t(STATUS_LABEL[zone.status] ?? zone.status)}
        </Badge>
      ),
    },
    ...(mayWrite ? [{ header: 'Actions', cell: actionCell }] : []),
  ]

  if (zones.isError) {
    return <ErrorState description={zones.error?.message} onRetry={() => void zones.refetch()} />
  }
  if (parts.isError) {
    return <ErrorState description={parts.error?.message} onRetry={() => void parts.refetch()} />
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Warehouse" title={t('Internal Warehouse')} subtitle={t('Warehouse zones and locations')} />

      <div className={isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'}>
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Warehouse zones"
        columns={columns}
        rows={rows}
        rowKey={(zone) => zone.code}
        loading={zones.isLoading || parts.isLoading}
        empty={<EmptyState icon="Warehouse" title={t('No warehouse zones found')} />}
        mobileCard={(zone) => (
          <>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name="Warehouse" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{zoneName(zone)}</p>
                    <p className="text-xs text-muted" dir="ltr">{zone.code}</p>
                  </div>
                </div>
              }
              trailing={
                <Badge {...statusStyle(zone)}>
                  {zone.status === 'active' && zone.full ? t('Full') : t(STATUS_LABEL[zone.status] ?? zone.status)}
                </Badge>
              }
            />
            <MobileCardRow label={t('Capacity')} value={String(zone.capacityUnits)} />
            <MobileCardRow label={t('Stored')} value={String(zone.storedUnits)} />
            <MobileCardRow
              label={t('Utilized')}
              value={zone.utilization === null ? '—' : `${zone.utilization}%`}
            />
            <MobileCardRow label={t('Items')} value={String(zone.itemCount)} />
            {mayWrite ? <div className="pt-2">{actionCell(zone)}</div> : null}
          </>
        )}
      />

      <p className="text-xs text-muted">
        {t('Item counts and utilisation are counted from the parts assigned to each zone; capacity is recorded on the zone. One part is stored in one zone.')}
      </p>
      {totals.unassignedItems > 0 ? (
        <p className="text-xs text-muted">
          {`${t('Not yet put away')}: ${totals.unassignedItems} ${t('items')} · ${totals.unassignedUnits} ${t('units')}`}
        </p>
      ) : null}
      {partsTruncated ? (
        <p className="text-xs text-muted">
          {`${t('Counted from the first')} ${partRows.length} ${t('of')} ${partsTotal} ${t('parts')}`}
        </p>
      ) : null}
    </div>
  )
}
