import { Link } from 'react-router-dom'
import { useIsMobile } from '@/lib/useMediaQuery'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, usePagedCollection } from '@/data/useCollection'
import { isLive, type LeaveRequestRow, type PayrollRunRow } from '@/data/repository'
import { ConnectApi, Pay, StatCard, StatusPill } from './bits'

/** HR & Payroll overview (`HRPayroll`, `/hr-payroll`) — the landing screen.
 *
 *  The pixel-designed HR screen (`project/HRPayroll.dc.html`): headcount, who is
 *  on leave, the current payroll run's status and pending leave, with routes into
 *  the Staff Directory, Payroll Management, Timesheets and Leave Requests screens
 *  that do the work. Counts come from the list endpoints' `page.total` — a server
 *  figure, not a page the client added up; the payroll net is the run's own
 *  server total, redaction-aware. Gated on `hr` server-side.
 *
 *  Provenance: this screen has a `.dc.html` design; the four it links to are
 *  feature-map screens built to the design system.
 */

const LINKS: readonly [string, string, string, string][] = [
  ['/staff-directory', 'Users', 'Staff Directory', 'Employees, departments and status'],
  ['/payroll-management', 'CreditCard', 'Payroll Management', 'Runs, lines and posting'],
  ['/timesheet-management', 'Clock', 'Timesheets', 'Clock records and worked hours'],
  ['/leave-requests', 'CalendarClock', 'Leave Requests', 'Review and decide leave'],
]

export function HRPayroll() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const headcount = usePagedCollection('employees', { pageSize: 1 })
  const onLeave = usePagedCollection('employees', { pageSize: 1, filter: { status: 'on_leave' } })
  const pendingLeave = usePagedCollection('leaveRequests', { pageSize: 1, filter: { status: 'submitted' } })
  const runs = useCollection('payrollRuns', { sort: 'period:desc' })
  const pending = useCollection('leaveRequests', { sort: 'startDate:desc', filter: { status: 'submitted' } })

  const latestRun = ((runs.data ?? []) as readonly PayrollRunRow[])[0] ?? null
  const pendingRows = (pending.data ?? []) as readonly LeaveRequestRow[]

  const header = (
    <div className="flex items-center gap-3">
      <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
        <Icon name="Users" size={26} />
      </span>
      <div>
        <h1 className="font-display text-2xl font-black text-heading">{t('HR & Payroll')}</h1>
        <p className="mt-1 text-sm text-muted">{t('People, payroll and leave at a glance')}</p>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Users" title={t('HR & Payroll')} subtitle={t('People, payroll and leave at a glance')} />
        {!isLive ? (
          <ConnectApi icon="Users" title="Nothing to summarise yet"
            description="The HR overview counts employees, payroll runs and leave the server holds. The fixture build has none."
            collection="employees" />
        ) : headcount.isError ? (
          <ErrorState description={headcount.error?.message} onRetry={() => void headcount.refetch()} />
        ) : headcount.isLoading ? (
          <Loading label="Loading the overview..." />
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard icon="Users" value={String(headcount.data?.page.total ?? 0)} label="Headcount" />
            <StatCard icon="Clock" value={String(onLeave.data?.page.total ?? 0)} label="On leave" />
            <StatCard icon="CalendarClock" value={String(pendingLeave.data?.page.total ?? 0)} label="Pending leave" />
            <StatCard icon="CreditCard"
              value={latestRun ? <span className="font-mono text-sm" dir="ltr">{latestRun.period}</span> : <span className="text-sm">{t('None')}</span>}
              label="Latest run" />
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {LINKS.map(([to, icon, title, sub]) => (
            <Link key={to} to={to}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 no-underline transition-colors hover:bg-[rgba(10,94,215,.05)]">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--tint-blue)] text-salis-blue">
                <Icon name={icon} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-heading">{t(title)}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted">{t(sub)}</p>
              </div>
              <Icon name="ArrowRight" size={14} className="flex-shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex max-w-[1100px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      {header}

      {!isLive ? (
        <ConnectApi
          icon="Users"
          title="Nothing to summarise yet"
          description="The HR overview counts employees, payroll runs and leave the server holds. The fixture build has none — connect a live API to see the numbers. The screens below still open."
          collection="employees · payrollRuns · leaveRequests"
        />
      ) : headcount.isError ? (
        <ErrorState description={headcount.error?.message} onRetry={() => void headcount.refetch()} />
      ) : headcount.isLoading ? (
        <Loading label="Loading the overview..." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatCard icon="Users" value={String(headcount.data?.page.total ?? 0)} label="Headcount" />
            <StatCard icon="Clock" value={String(onLeave.data?.page.total ?? 0)} label="On leave" />
            <StatCard
              icon="CalendarClock"
              value={String(pendingLeave.data?.page.total ?? 0)}
              label="Pending leave"
            />
            <StatCard
              icon="CreditCard"
              value={
                latestRun ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono text-base" dir="ltr">
                      {latestRun.period}
                    </span>
                    <StatusPill value={latestRun.status} />
                  </span>
                ) : (
                  <span className="text-base">{t('None')}</span>
                )
              }
              label="Latest run"
            />
          </div>

          {latestRun ? (
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--tint-blue)] text-salis-blue">
                  <Icon name="CreditCard" size={18} />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-heading">
                    {t('Payroll')} <span dir="ltr">{latestRun.period}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {latestRun.status === 'posted' && latestRun.postedAt
                      ? `${t('Posted')} ${latestRun.postedAt.slice(0, 10)}`
                      : t('Draft — not yet posted')}
                  </p>
                </div>
              </div>
              <div className="text-end">
                <Pay halalas={latestRun.netPayHalalas} className="text-base font-extrabold text-heading" />
                <p className="mt-0.5 text-[11px] text-muted">{t('Net pay')}</p>
              </div>
              <Link
                to="/payroll-management"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 font-action text-xs font-semibold text-body no-underline transition-colors hover:bg-[rgba(10,94,215,.06)]"
              >
                {t('Open payroll')}
                <Icon name="ArrowRight" size={13} />
              </Link>
            </Card>
          ) : null}

          {pendingRows.length > 0 ? (
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-0 border-b border-solid border-border px-4 py-2.5">
                <span className="flex items-center gap-2 text-[13px] font-bold text-heading">
                  <Icon name="CalendarClock" size={14} className="text-salis-blue" />
                  {t('Leave awaiting a decision')}
                </span>
                <Link
                  to="/leave-requests"
                  className="font-action text-[11px] font-semibold text-salis-blue no-underline hover:underline"
                >
                  {t('Review all')}
                </Link>
              </div>
              <ul className="m-0 flex list-none flex-col p-0">
                {pendingRows.slice(0, 5).map((req, index) => (
                  <li
                    key={req._id ?? `${req.employeeId}-${index}`}
                    className={
                      'flex items-center gap-3 px-4 py-2.5 ' +
                      (index ? 'border-0 border-t border-solid border-border' : '')
                    }
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-body">
                      {req.employeeName}
                    </span>
                    <span className="text-[11px] capitalize text-muted">{t(req.type)}</span>
                    <span className="text-[12px] text-muted">
                      {req.days} {t(req.days === 1 ? 'day' : 'days')}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </>
      )}

      {/* The screens that do the work — reachable whether or not data is live. */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {LINKS.map(([to, icon, title, sub]) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 no-underline transition-colors hover:bg-[rgba(10,94,215,.05)]"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--tint-blue)] text-salis-blue">
              <Icon name={icon} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-heading">{t(title)}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted">{t(sub)}</p>
            </div>
            <Icon
              name="ArrowRight"
              size={16}
              className="flex-shrink-0 text-muted transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
