import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { KpiCard } from '@/components/ui/KpiCard'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { PageHeader } from '@/components/ui/PageHeader'
import { todayIso, type AppointmentRow, type InvoiceRow, type VehicleRow } from '../portal-data'

/* This screen was MOCK_ONLY (BLK-004): every KPI (3 vehicles, 5 messages,
 * ...) and every "recent activity" row was a hardcoded fixture.
 *
 * My Vehicles, Appointments and Open Invoices are now real, from the same
 * `vehicles`/`appointments`/`invoices` collections CustomerPortal.tsx
 * already reads. There is no cross-entity activity-feed collection in
 * Repository (app/src/data/repository.ts) or API_REGISTRY.json for the
 * "recent activity" row-level content, so that section is an honest GAP
 * state instead of invented rows. */
export function ClientPortalDashboard() {
  const { t } = usePreferences()
  const { userName } = useSession()

  const vehicles = useCollection('vehicles')
  const appointments = useCollection('appointments')
  const invoices = useCollection('invoices')

  const today = todayIso()
  const upcoming = ((appointments.data ?? []) as readonly AppointmentRow[]).filter(
    (row) => !row.scheduledDate || row.scheduledDate >= today
  )
  const openInvoices = ((invoices.data ?? []) as readonly InvoiceRow[]).filter(
    (row) => (row.balanceHalalas ?? 0) > 0
  )

  const loading = vehicles.isLoading || appointments.isLoading || invoices.isLoading

  const kpis = [
    { label: t('My Vehicles'), value: loading ? '…' : String((vehicles.data as readonly VehicleRow[] | undefined)?.length ?? 0), icon: 'Car', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Appointments'), value: loading ? '…' : String(upcoming.length), icon: 'Calendar', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Open Invoices'), value: loading ? '…' : String(openInvoices.length), icon: 'FileText', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="LayoutDashboard" title={t('My Dashboard')} subtitle={`${t('Welcome back')}, ${userName}`} />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-4">
        <EmptyState
          icon="Activity"
          title={t('Recent Activity has no data source yet')}
          description={t(
            'A cross-account activity feed (service updates, invoice and message notifications) has no collection this API serves. Nothing is shown here rather than invented activity.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">portalActivity</span>
        </p>
      </Card>
    </div>
  )
}
