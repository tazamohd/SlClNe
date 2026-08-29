import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FeatureHeader, StatRow } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { formatSar, parseSar } from '@/components/ui/Money'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { isLive } from '@/data/repository'

export function DashboardHome() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const { data: jobs = [], isLoading: jL, isError: jE, error: jErr, refetch: jR } = useCollection('jobs')
  const { data: appointments = [], isLoading: aL } = useCollection('appointments')
  const { data: customers = [], isLoading: cL } = useCollection('customers')

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

  const jobColumns: Column<(typeof recentJobs)[number]>[] = [
    { header: 'Job', cell: (job) => job.id, code: true },
    { header: 'Customer', cell: (job) => <span className="font-medium text-heading">{job.cust}</span> },
    { header: 'Vehicle', cell: (job) => job.veh },
    { header: 'Status', cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} /> },
  ]

  const apptColumns: Column<(typeof upcomingAppointments)[number]>[] = [
    { header: 'Customer', cell: (appt) => <span className="font-medium text-heading">{appt.cust}</span> },
    { header: 'Time', cell: (appt) => appt.time, code: true },
    { header: 'Vehicle', cell: (appt) => appt.veh, code: true },
  ]

  if (jL || aL || cL) return <Loading label={t('Loading dashboard...')} />
  if (jE) return <ErrorState description={jErr?.message} onRetry={() => void jR()} />

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="LayoutDashboard"
        title={t('Dashboard')}
        subtitle={t('Welcome back')}
        actions={
          isLive && can('jobcards', 'c') ? (
            <div className="flex flex-wrap gap-2.5">
              <Button size="md" onClick={() => navigate('/job-cards')}>
                <Icon name="Plus" size={16} />
                {t('New Job')}
              </Button>
              <Button size="md" variant="outline" onClick={() => navigate('/customers')}>
                <Icon name="UserPlus" size={16} />
                {t('New Customer')}
              </Button>
              <Button size="md" variant="outline" onClick={() => navigate('/appointment-calendar')}>
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
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-heading">{t('Recent Jobs')}</h2>
            <p className="mt-0.5 text-[13px] text-muted">{t('Last 5 job cards')}</p>
          </div>
          <DataTable
            caption="Recent jobs"
            columns={jobColumns}
            rows={recentJobs}
            rowKey={(job) => job.id}
            empty={t('No job cards yet')}
            mobileCard={(job) => (
              <>
                <MobileCardHeader
                  title={job.id}
                  code
                  trailing={<StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />}
                />
                <MobileCardRow>{job.cust}</MobileCardRow>
                <MobileCardRow>{job.veh}</MobileCardRow>
              </>
            )}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-heading">{t('Upcoming Appointments')}</h2>
            <p className="mt-0.5 text-[13px] text-muted">{t('Next 5 appointments')}</p>
          </div>
          <DataTable
            caption="Upcoming appointments"
            columns={apptColumns}
            rows={upcomingAppointments}
            rowKey={(_, i) => `row-${i}`}
            empty={t('No upcoming appointments')}
            mobileCard={(appt) => (
              <>
                <MobileCardHeader title={appt.cust} />
                <MobileCardRow label={t('Time')}>{appt.time}</MobileCardRow>
                <MobileCardRow label={t('Vehicle')}>{appt.veh}</MobileCardRow>
              </>
            )}
          />
        </div>
      </div>
    </div>
  )
}
