import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import type { RequisitionRow } from '@/data/repository'
import { derived, UNKNOWN } from '@/screens/registry/writes'
import { fromHalalas } from '@/screens/finance/money'

/** Parts a technician has asked for, read from the requisitions collection —
 *  the record procurement raises a purchase order from. The design's six
 *  invented `PR-` rows and their "Out of Stock" state are gone: stock is the
 *  inventory module's answer, not a column on a request. No API is configured
 *  on a fixture build, so the honest state here is the empty one. */
const STATUS_STYLES: Record<RequisitionRow['status'], { bg: string; fg: string; label: string }> = {
  draft: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)', label: 'Draft' },
  submitted: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)', label: 'Pending' },
  approved: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', label: 'Approved' },
  rejected: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)', label: 'Rejected' },
  ordered: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', label: 'Ordered' },
}

function RequestStatus({ value }: { value: RequisitionRow['status'] }) {
  const { t } = usePreferences()
  const style = STATUS_STYLES[value] ?? STATUS_STYLES.draft
  return (
    <Badge background={style.bg} color={style.fg}>
      {t(style.label)}
    </Badge>
  )
}

export function TechnicianPortalParts() {
  const { t } = usePreferences()
  const requests = useCollection('requisitions')
  const rows = (requests.data ?? []) as readonly RequisitionRow[]

  const countOf = (status: RequisitionRow['status']) => rows.filter((row) => row.status === status).length

  const kpis = [
    { label: t('Total Requests'), value: requests.isLoading ? UNKNOWN : String(rows.length), icon: 'Package', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Pending'), value: requests.isLoading ? UNKNOWN : String(countOf('submitted')), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Approved'), value: requests.isLoading ? UNKNOWN : String(countOf('approved')), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Ordered'), value: requests.isLoading ? UNKNOWN : String(countOf('ordered')), icon: 'Truck', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<RequisitionRow>[] = [
    { header: 'Ref', cell: (row) => row.code, code: true },
    { header: 'Requested by', cell: (row) => row.requester },
    { header: 'Priority', cell: (row) => t(row.priority) },
    { header: 'Needed by', cell: (row) => derived(row.neededBy) },
    { header: 'Estimate', cell: (row) => <Money sar={fromHalalas(row.estimatedTotalHalalas)} />, numeric: true },
    { header: 'Status', cell: (row) => <RequestStatus value={row.status} /> },
  ]

  return (
    <ScreenFrame
      icon="Package"
      title="Parts Requests"
      subtitle={t('Request and track parts')}
      query={requests}
      skeleton="table"
      empty={
        rows.length === 0 && {
          icon: 'Package',
          title: 'No parts requested yet',
          description: 'Parts you request from a job card appear here with their approval status.',
        }
      }
      toolbar={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>
      }
    >
      <DataTable
        caption="Parts requests"
        columns={columns}
        rows={rows}
        rowKey={(row) => row._id ?? row.id}
        mobileCard={(row) => (
          <>
            <MobileCardHeader title={row.code} code trailing={<RequestStatus value={row.status} />} />
            <MobileCardRow label={t('Priority')}>{t(row.priority)}</MobileCardRow>
            <MobileCardRow label={t('Needed by')}>{derived(row.neededBy)}</MobileCardRow>
            <MobileCardRow label={t('Estimate')}>
              <Money sar={fromHalalas(row.estimatedTotalHalalas)} />
            </MobileCardRow>
          </>
        )}
      />
    </ScreenFrame>
  )
}
