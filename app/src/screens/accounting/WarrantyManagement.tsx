import { useMemo, useState } from 'react'
import { StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { ListPageHeader } from '@/components/shell/ListPage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { ErrorState } from '@/components/ui/States'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { RepositoryError, useCollection, useUpdate, type RowOf } from '@/data/useCollection'
import {
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'
import { rowId } from '../registry/writes'
import { WarrantyFormModal } from './WarrantyFormModal'

/** Equipment warranties (BLK-004) — cover on the shop's own tools and fixed
 *  assets, never a customer's vehicle. Reads and writes `equipmentWarranties`
 *  (`GET/POST/PATCH/DELETE /equipment-warranties`), a flat generic collection
 *  with no bespoke router behind it, so create, edit, delete and the one
 *  lifecycle move — `active` to `claimed` — are all real against a live API. */

type Warranty = RowOf<'equipmentWarranties'>

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  active: ['var(--tint-blue)', 'var(--salis-blue)'],
  expired: ['var(--tint-neutral)', 'var(--text-muted)'],
  claimed: ['var(--tint-orange)', 'var(--salis-orange)'],
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  expired: 'Expired',
  claimed: 'Claimed',
}

const COVERAGE_PALETTE: Record<string, readonly [string, string]> = {
  full: ['var(--tint-blue)', 'var(--salis-blue)'],
  limited: ['var(--tint-navy)', 'var(--salis-navy)'],
  extended: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
}

const COVERAGE_LABEL: Record<string, string> = {
  full: 'Full',
  limited: 'Limited',
  extended: 'Extended',
}

const EXPIRING_WINDOW_DAYS = 90

export function WarrantyManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const toast = useToast()
  const update = useUpdate('equipmentWarranties')
  const { data: warranties = [], isLoading, isError, error, refetch } = useCollection('equipmentWarranties')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Warranty | null>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const mayWrite = can('accounting', 'e')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return warranties
    return warranties.filter(
      (w) =>
        w.warrantyNumber.toLowerCase().includes(needle) ||
        w.itemName.toLowerCase().includes(needle) ||
        w.provider.toLowerCase().includes(needle),
    )
  }, [warranties, query])

  const totals = useMemo(() => {
    const now = new Date()
    const window = new Date(now.getTime() + EXPIRING_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    let active = 0
    let expiringSoon = 0
    let claimed = 0
    for (const w of warranties) {
      if (w.status === 'active') {
        active++
        const end = new Date(w.end)
        if (end >= now && end <= window) expiringSoon++
      }
      if (w.status === 'claimed') claimed++
    }
    return { total: warranties.length, active, expiringSoon, claimed }
  }, [warranties])

  const handleClaim = async (warranty: Warranty) => {
    const id = rowId(warranty)
    if (!id) return
    setClaimingId(id)
    try {
      await update.mutateAsync({ id, patch: { status: 'claimed' } as Partial<Warranty> })
      toast.show({ title: t('Warranty marked as claimed'), description: t(warranty.itemName) })
    } catch (cause) {
      toast.show({
        title: t('Could not update warranty'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setClaimingId(null)
    }
  }

  const stats: Stat[] = [
    { label: 'Total Warranties', value: totals.total, caption: 'All records', highlight: true },
    { label: 'Active', value: totals.active, caption: 'Currently valid', tone: 'info' },
    { label: 'Expiring Soon', value: totals.expiringSoon, caption: 'Within 90 days', tone: 'warning' },
    { label: 'Claimed', value: totals.claimed, caption: 'Warranty claims filed' },
  ]

  const columns: Column<Warranty>[] = [
    { header: 'Warranty ID', cell: (w) => w.warrantyNumber, code: true },
    { header: 'Item', cell: (w) => w.itemName },
    { header: 'Provider', cell: (w) => w.provider },
    { header: 'Start Date', cell: (w) => <span dir="ltr" className="text-muted">{w.start}</span> },
    { header: 'End Date', cell: (w) => <span dir="ltr" className="text-muted">{w.end}</span> },
    {
      header: 'Coverage',
      cell: (w) => {
        const [bg, fg] = COVERAGE_PALETTE[w.coverage] ?? COVERAGE_PALETTE.full
        return <Badge background={bg} color={fg}>{t(COVERAGE_LABEL[w.coverage] ?? w.coverage)}</Badge>
      },
    },
    {
      header: 'Status',
      cell: (w) => {
        const [bg, fg] = STATUS_PALETTE[w.status] ?? STATUS_PALETTE.active
        return <Badge background={bg} color={fg}>{t(STATUS_LABEL[w.status] ?? w.status)}</Badge>
      },
    },
    ...(mayWrite
      ? [
          {
            header: 'Actions',
            cell: (w: Warranty) => (
              <div className="flex items-center gap-2">
                {w.status === 'active' ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void handleClaim(w)}
                    disabled={claimingId === rowId(w)}
                  >
                    <Icon name="ShieldAlert" size={13} />
                    {claimingId === rowId(w) ? t('Updating...') : t('Mark as Claimed')}
                  </Button>
                ) : null}
                <Button size="sm" variant="subtle" onClick={() => setEditing(w)}>
                  <Icon name="Pencil" size={13} />
                  {t('Edit')}
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ]

  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const table = (
    <DataTable
      caption="Warranties"
      columns={columns}
      rows={filtered}
      rowKey={(w) => rowId(w) ?? w.warrantyNumber}
      loading={isLoading}
      mobileCard={(w) => {
        const [bg, fg] = STATUS_PALETTE[w.status] ?? STATUS_PALETTE.active
        const [covBg, covFg] = COVERAGE_PALETTE[w.coverage] ?? COVERAGE_PALETTE.full
        return (
          <>
            <MobileCardHeader title={w.warrantyNumber} code trailing={<Badge background={bg} color={fg}>{t(STATUS_LABEL[w.status] ?? w.status)}</Badge>} />
            <MobileCardRow>{w.itemName}</MobileCardRow>
            <MobileCardRow label={t('Coverage')}><Badge background={covBg} color={covFg}>{t(COVERAGE_LABEL[w.coverage] ?? w.coverage)}</Badge></MobileCardRow>
          </>
        )
      }}
      empty={<EmptyState icon="Shield" title={t('No warranties match the filter')} />}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Shield" title={t('Warranty Management')} subtitle={t('Track warranty coverage and expiration dates')} />
        {mayWrite ? (
          <Button size="md" onClick={() => setCreating(true)}>
            <Icon name="Plus" size={16} />
            {t('New Warranty')}
          </Button>
        ) : null}
        <WarrantyFormModal open={creating} onClose={() => setCreating(false)} />
        <WarrantyFormModal open={Boolean(editing)} onClose={() => setEditing(null)} existingRecord={editing ?? undefined} />
        <StatRow stats={stats} />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('ID, item or provider')}
          aria-label={t('Search warranties')}
          inputSize="sm"
        />
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <ListPageHeader
        title={t('Warranty Management')}
        subtitle={t('Track warranty coverage and expiration dates')}
        actions={
          mayWrite ? (
            <Button size="md" onClick={() => setCreating(true)}>
              <Icon name="Plus" size={16} />
              {t('New Warranty')}
            </Button>
          ) : null
        }
      />
      <WarrantyFormModal open={creating} onClose={() => setCreating(false)} />
      <WarrantyFormModal open={Boolean(editing)} onClose={() => setEditing(null)} existingRecord={editing ?? undefined} />
      <StatRow stats={stats} />

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('ID, item or provider')}
          aria-label={t('Search warranties')}
          inputSize="sm"
        />
      </label>

      {table}
    </div>
  )
}
