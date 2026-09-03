import { Link } from 'react-router-dom'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Card } from '@/components/ui/Card'
import { Money } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/States'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { InvoiceStatusBadge } from '@/screens/registry/badges'
import { UNKNOWN } from '@/screens/registry/writes'
import { fromHalalas, invoiceMoney } from '@/screens/finance/money'
import { mineOnly, todayIso, type AppointmentRow, type InvoiceRow, type VehicleRow } from '../portal-data'

/** The client portal's home, from the three collections its tabs read.
 *
 *  The design's four tiles and six-row activity feed were constants. The
 *  tiles now count the rows the server returned for this customer, and the
 *  feed is what a customer actually has in flight: the next appointment and
 *  the invoices still open. "Messages" had no collection behind it and is
 *  gone rather than fixed at five. */
export function ClientPortalDashboard() {
  const { t } = usePreferences()
  const { user, userName } = useSession()

  const vehicles = useCollection('vehicles')
  const appointments = useCollection('appointments')
  const invoices = useCollection('invoices')

  const vehicleRows = mineOnly((vehicles.data ?? []) as readonly VehicleRow[], user?.id)
  const today = todayIso()
  const upcoming = ((appointments.data ?? []) as readonly AppointmentRow[]).filter(
    (row) => !row.scheduledDate || row.scheduledDate >= today
  )
  const openInvoices = ((invoices.data ?? []) as readonly InvoiceRow[]).filter(
    (row) => row.status !== 'paid'
  )

  const kpis = [
    { label: t('My Vehicles'), value: vehicles.isLoading ? UNKNOWN : String(vehicleRows.length), icon: 'Car', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Appointments'), value: appointments.isLoading ? UNKNOWN : String(upcoming.length), icon: 'Calendar', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Open Invoices'), value: invoices.isLoading ? UNKNOWN : String(openInvoices.length), icon: 'FileText', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const next = upcoming[0]

  return (
    <ScreenFrame
      icon="LayoutDashboard"
      title="My Dashboard"
      subtitle={`${t('Welcome back')}, ${userName}`}
      query={vehicles}
      skeleton="dashboard"
      toolbar={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden>
              <Icon name="Calendar" size={16} />
            </span>
            <h2 className="text-sm font-semibold text-heading">{t('Next appointment')}</h2>
          </div>
          {next ? (
            <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-heading">{t(next.svc)}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted">
                  {next.veh} · {next.bay}
                </p>
              </div>
              <span className="font-mono text-[13px] font-semibold text-heading" dir="ltr">
                {next.scheduledDate ? `${next.scheduledDate} ${next.time}` : next.time}
              </span>
            </div>
          ) : (
            <EmptyState
              icon="CalendarX"
              title={t('Nothing booked yet')}
              description={t('Your next visit appears here once you book it.')}
              action={
                <Link to="/client-portal-appointments" className="font-action text-[13px] font-medium">
                  {t('Appointments')}
                </Link>
              }
            />
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-orange p-1.5 text-salis-orange" aria-hidden>
              <Icon name="Receipt" size={16} />
            </span>
            <h2 className="text-sm font-semibold text-heading">{t('Open Invoices')}</h2>
          </div>
          {openInvoices.length === 0 ? (
            <EmptyState
              icon="CheckCircle"
              title={t('Nothing owed right now')}
              description={t('New invoices appear here as soon as the workshop issues them.')}
            />
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {openInvoices.slice(0, 4).map((invoice, index) => (
                <li
                  key={invoice._id ?? `${invoice.id}-${index}`}
                  className="flex min-h-[48px] items-center gap-3 rounded-xl border border-border px-3.5 py-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[13px] font-semibold text-heading" dir="ltr">
                      {invoice.id}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted">{invoice.due}</span>
                  </span>
                  <Money sar={fromHalalas(invoiceMoney(invoice).totalHalalas)} className="text-[13px] font-semibold text-heading" />
                  <InvoiceStatusBadge value={invoice.status} />
                </li>
              ))}
            </ul>
          )}
          <Link to="/client-portal-invoices" className="font-action text-[13px] font-medium">
            {t('View All')}
          </Link>
        </Card>
      </div>
    </ScreenFrame>
  )
}
