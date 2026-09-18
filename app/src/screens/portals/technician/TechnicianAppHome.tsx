import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/States'
import { isDone, todayIso, type AppointmentRow } from '../portal-data'
import type { JobRow } from '@/screens/workshop/stages'

/* This screen was MOCK_ONLY (BLK-004): every KPI (5 jobs today, "6.5h
 * logged" — the exact invented figure TechnicianPortal.tsx's own comment
 * says was deliberately dropped — 2 unread) and every notification row was
 * hardcoded fixture data, and the greeting hardcoded "Ahmed" instead of the
 * signed-in technician.
 *
 * Jobs Today and Completed are now real, from the same `jobs`/`appointments`
 * collections and the same `isDone`/`todayIso` helpers TechnicianPortal.tsx
 * uses. Hours Logged has no time-clock collection — shown as "Not
 * connected", the same honest placeholder TechnicianMobile.tsx already uses,
 * rather than an invented figure. There is no notifications collection in
 * Repository (app/src/data/repository.ts) or API_REGISTRY.json, so the
 * notification feed is an honest GAP note instead of invented messages. */
export function TechnicianAppHome() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { userName } = useSession()

  const jobs = useCollection('jobs')
  const appointments = useCollection('appointments')

  const rows = (jobs.data ?? []) as readonly JobRow[]
  const today = todayIso()
  const schedule = ((appointments.data ?? []) as readonly AppointmentRow[]).filter(
    (row) => !row.scheduledDate || row.scheduledDate === today
  )
  const loading = jobs.isLoading || appointments.isLoading

  const kpis = [
    { label: t('Jobs Today'), value: loading ? '…' : String(schedule.length), icon: 'Clipboard', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Completed'), value: loading ? '…' : String(rows.filter(isDone).length), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Hours Logged'), value: t('Not connected'), icon: 'Clock', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const notifications = (
    <Card className="rounded-2xl p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-heading">{t('Notifications')}</h2>
      <EmptyState
        icon="Bell"
        title={t('Notifications has no data source yet')}
        description={t('Job assignments, parts updates and schedule changes are not recorded by any system this API exposes.')}
      />
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Home" title={t('Home')} subtitle={`${t('Welcome')}, ${userName}`} />
        <div className="grid grid-cols-3 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
              </div>
              <p className="mt-1.5 font-display text-lg font-black text-heading">{k.value}</p>
              <p className="text-[10px] font-medium text-muted">{k.label}</p>
            </Card>
          ))}
        </div>
        {notifications}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Home" title={t('Home')} subtitle={`${t('Welcome back')}, ${userName}`} />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-black text-heading">{k.value}</p>
          </Card>
        ))}
      </div>

      {notifications}
    </div>
  )
}
