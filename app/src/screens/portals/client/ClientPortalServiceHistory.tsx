import { StatusBadge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Loading, ErrorState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection } from '@/data/useCollection'
import { derived } from '@/screens/registry/writes'
import type { JobRow as WorkshopJobRow } from '@/screens/workshop/stages'
import { isDone } from '../portal-data'

/* This screen was MOCK_ONLY (BLK-004): every row (a fictional "WO-8821"
 * oil change by a fictional "Ahmed Al-Farsi" for SAR 350, ...) was a
 * hardcoded fixture.
 *
 * Reads the real `jobs` collection CustomerPortal.tsx already reads,
 * filtered to completed work with the same `isDone` helper. There is no
 * technician-name or per-job cost field on this collection (cost lives on
 * invoices, keyed separately), so those columns are dropped rather than
 * invented; the completion date uses `derived()` the same way
 * ClientPortalVehicles.tsx does for a column the collection carries only
 * from a live API, not the design fixtures. */
export function ClientPortalServiceHistory() {
  const { t } = usePreferences()
  const { data, isLoading, isError, error, refetch } = useCollection('jobs')
  const rows = (data ?? []) as readonly WorkshopJobRow[]
  const completed = rows.filter(isDone)

  const columns: Column<WorkshopJobRow>[] = [
    { header: t('Job Card'), cell: (j) => j.id, code: true },
    { header: t('Vehicle'), cell: (j) => j.veh },
    { header: t('Service'), cell: (j) => t((j.svc ?? '').replace(/_/g, ' ')) },
    { header: t('Completed'), cell: (j) => derived(j._createdAt) },
    { header: t('Status'), cell: (j) => <StatusBadge value={j.st} label={t((j.st ?? '').replace(/_/g, ' '))} /> },
  ]

  if (isLoading) return <Loading label={t('Loading service history...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="History" title={t('Service History')} subtitle={t('Completed service timeline')} />

      <DataTable
        caption="Client service history"
        columns={columns}
        rows={completed}
        rowKey={(j) => j.id}
        empty={<p className="py-8 text-center text-sm text-muted">{t('No completed service yet')}</p>}
        mobileCard={(j) => (
          <>
            <MobileCardHeader title={t((j.svc ?? '').replace(/_/g, ' '))} trailing={<StatusBadge value={j.st} label={t((j.st ?? '').replace(/_/g, ' '))} />} />
            <MobileCardRow label={t('Vehicle')}>{j.veh}</MobileCardRow>
            <MobileCardRow label={t('Job Card')}>{j.id}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
