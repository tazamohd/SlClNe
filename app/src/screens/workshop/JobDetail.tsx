import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { Timeline, type TimelineStep } from '@/components/ui/Timeline'
import { Money } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { EmptyState } from '@/components/ui/DataTable'

/** A single job card: stage timeline, assigned technician, parts and costs.
 *
 *  Costs are role-gated. Part cost and margin are hidden from advisors,
 *  technicians, QC, front desk and call centre (FIELD_RULES), so this screen
 *  drops the whole totals panel for them rather than showing blanked-out rows
 *  that invite "why can't I see this". */
export function JobDetail() {
  const { t, rtl } = usePreferences()
  const { fieldHidden } = useSession()
  const [params] = useSearchParams()
  const { data: jobs = [], isLoading } = useCollection('jobs')

  const jobId = params.get('id')
  const job = jobId ? jobs.find((row) => row.id === jobId) : jobs[0]

  if (isLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
  }

  if (!job) {
    return (
      <Card className="p-6">
        <EmptyState
          icon="FileQuestion"
          title={t('Job card not found')}
          description={t('It may have been deleted, or the link is out of date.')}
          action={
            <Link to="/job-cards" className="font-action text-[13px] font-medium">
              {t('Back to Job Cards')}
            </Link>
          }
        />
      </Card>
    )
  }

  const hideCosts = fieldHidden('Part cost / margin')

  return (
    <div className="flex max-w-[1100px] flex-col gap-6">
      <div>
        <Link
          to="/job-cards"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Back to Job Cards')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-black text-heading" dir="ltr">
            {job.id}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {job.cust} · {job.veh}
          </p>
        </div>
        <div className="flex gap-2.5">
          <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
          <Button size="md">
            <Icon name="Printer" size={15} />
            {t('Print Job Card')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="p-6">
          <h3 className="mb-5 text-[17px] font-bold text-heading">{t('Timeline')}</h3>
          <Timeline steps={TIMELINE} />
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="mb-3 text-[15px] font-bold text-heading">{t('Assigned Technician')}</h3>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-salis-gradient text-[13px] font-bold text-white">
                {ASSIGNED_TECH[0]}
              </span>
              <span className="text-sm text-body">{ASSIGNED_TECH}</span>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-[15px] font-bold text-heading">{t('Parts Used')}</h3>
            <div className="flex flex-col gap-2">
              {PARTS_USED.map((part) => (
                <div key={part.name} className="flex justify-between text-[13px]">
                  <span className="text-body">{t(part.name)}</span>
                  {/* Part prices follow the same redaction rule as the totals. */}
                  {hideCosts ? (
                    <span className="text-faint">—</span>
                  ) : (
                    <Money sar={part.sar} className="text-muted" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {hideCosts ? null : (
            <Card className="flex flex-col gap-2 p-5">
              <CostRow label={t('Labor Cost')} sar={350} />
              <CostRow label={t('Parts Cost')} sar={490} />
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-heading">
                <span>{t('Total Cost')}</span>
                <Money sar={840} className="font-bold" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function CostRow({ label, sar }: { label: string; sar: number }) {
  return (
    <div className="flex justify-between text-[13px] text-muted">
      <span>{label}</span>
      <Money sar={sar} className="text-muted" />
    </div>
  )
}

const ASSIGNED_TECH = 'Yousef Al-Otaibi'

const PARTS_USED = [
  { name: 'Oil Filter', sar: 85 },
  { name: 'Brake Pads', sar: 310 },
  { name: 'Air Filter', sar: 95 },
]

const TIMELINE: TimelineStep[] = [
  { icon: 'CheckCircle', label: 'Vehicle Checked In', time: 'Jul 18, 9:02 AM', done: true },
  { icon: 'SearchCheck', label: 'Diagnostics Started', time: 'Jul 18, 9:40 AM', done: true },
  { icon: 'Package', label: 'Parts Ordered', time: 'Jul 18, 11:15 AM', done: true },
  { icon: 'Wrench', label: 'Repair In Progress', time: 'Jul 19, 8:30 AM', done: true },
  { icon: 'ShieldCheck', label: 'Quality Check', done: false },
  { icon: 'Car', label: 'Ready for Delivery', done: false },
]
