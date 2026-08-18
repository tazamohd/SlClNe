import { useMemo } from 'react'
import { FeatureHeader, StatRow, Section } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { formatSar, parseSar } from '@/components/ui/Money'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection } from '@/data/useCollection'
import { isLive } from '@/data/repository'

/** Main dashboard — the landing screen after login.
 *
 *  KPI row (Revenue, Jobs Today, Appointments, Customers), recent jobs,
 *  upcoming appointments, and quick-action buttons gated on `isLive`. */
export function DashboardHome() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: jobs = [] } = useCollection('jobs')
  const { data: appointments = [] } = useCollection('appointments')
  const { data: customers = [] } = useCollection('customers')

  const today = new Intl.DateTimeFormat(rtl ? 'ar' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  const revenue = useMemo(
    () => jobs.reduce((sum, j) => sum + parseSar((j as Record<string, string>).total ?? '0'), 0),
    [jobs]
  )
  const todayJobs = useMemo(
    () => jobs.filter((j) => j.st !== 'completed' && j.st !== 'delivered').length,
    [jobs]
  )

  const recentJobs = useMemo(() => jobs.slice(0, 5), [jobs])
  const upcomingAppointments = useMemo(() => appointments.slice(0, 5), [appointments])

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="LayoutDashboard"
        title={t('Dashboard')}
        subtitle={t('Welcome back')}
        actions={
          isLive && can('jobcards', 'c') ? (
            <div className="flex flex-wrap gap-2.5">
              <Button size="md">
                <Icon name="Plus" size={16} />
                {t('New Job')}
              </Button>
              <Button size="md" variant="outline">
                <Icon name="UserPlus" size={16} />
                {t('New Customer')}
              </Button>
              <Button size="md" variant="outline">
                <Icon name="CalendarPlus" size={16} />
                {t('New Appointment')}
              </Button>
            </div>
          ) : null
        }
      />

      <Card className="rounded-2xl p-5">
        <p className="text-[15px] font-medium text-heading">
          {t('Today is')} <span className="font-display font-bold">{today}</span>
        </p>
      </Card>

      <StatRow
        stats={[
          { label: 'Revenue', value: formatSar(revenue), caption: 'All time', highlight: true, icon: 'DollarSign' },
          { label: 'Jobs Today', value: todayJobs, caption: 'Active', tone: 'info', icon: 'Wrench' },
          { label: 'Appointments', value: appointments.length, caption: 'Scheduled', icon: 'Calendar' },
          { label: 'Customers', value: customers.length, caption: 'Total registered', icon: 'Users' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title={t('Recent Jobs')} subtitle={t('Last 5 job cards')}>
          {recentJobs.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-muted">{t('No job cards yet')}</p>
          ) : isMobile ? (
            <div className="flex flex-col divide-y divide-border">
              {recentJobs.map((job) => (
                <div key={job.id} className="py-3">
                  <MobileCardHeader
                    title={job.id}
                    code
                    trailing={<StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />}
                  />
                  <MobileCardRow>{job.cust}</MobileCardRow>
                  <MobileCardRow>{job.veh}</MobileCardRow>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-0 border-b border-solid border-border px-4 py-2.5 text-start font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {t('Job')}
                    </th>
                    <th className="border-0 border-b border-solid border-border px-4 py-2.5 text-start font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {t('Customer')}
                    </th>
                    <th className="border-0 border-b border-solid border-border px-4 py-2.5 text-start font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {t('Vehicle')}
                    </th>
                    <th className="border-0 border-b border-solid border-border px-4 py-2.5 text-start font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {t('Status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.id}>
                      <td className="border-0 border-b border-solid border-border px-4 py-2.5 font-mono text-[13px] text-heading">
                        {job.id}
                      </td>
                      <td className="border-0 border-b border-solid border-border px-4 py-2.5 text-body">
                        {job.cust}
                      </td>
                      <td className="border-0 border-b border-solid border-border px-4 py-2.5 text-body">
                        {job.veh}
                      </td>
                      <td className="border-0 border-b border-solid border-border px-4 py-2.5">
                        <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title={t('Upcoming Appointments')} subtitle={t('Next 5 appointments')}>
          {upcomingAppointments.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-muted">{t('No upcoming appointments')}</p>
          ) : isMobile ? (
            <div className="flex flex-col divide-y divide-border">
              {upcomingAppointments.map((appt, idx) => (
                <div key={idx} className="py-3">
                  <MobileCardHeader title={appt.cust} />
                  <MobileCardRow label={t('Time')}>{appt.time}</MobileCardRow>
                  <MobileCardRow label={t('Vehicle')}>{appt.veh}</MobileCardRow>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[350px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-0 border-b border-solid border-border px-4 py-2.5 text-start font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {t('Customer')}
                    </th>
                    <th className="border-0 border-b border-solid border-border px-4 py-2.5 text-start font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {t('Time')}
                    </th>
                    <th className="border-0 border-b border-solid border-border px-4 py-2.5 text-start font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {t('Vehicle')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((appt, idx) => (
                    <tr key={idx}>
                      <td className="border-0 border-b border-solid border-border px-4 py-2.5 font-medium text-heading">
                        {appt.cust}
                      </td>
                      <td className="border-0 border-b border-solid border-border px-4 py-2.5 font-mono text-[13px] text-body">
                        {appt.time}
                      </td>
                      <td className="border-0 border-b border-solid border-border px-4 py-2.5 font-mono text-[13px] text-body">
                        {appt.veh}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}
