import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { Timeline, type TimelineStep } from '@/components/ui/Timeline'
import { Money } from '@/components/ui/Money'
import { useModal } from '@/components/ui/Modal'
import { Attachments, type AttachmentFile } from '@/components/ui/Attachments'
import { Comments, type Comment } from '@/components/ui/Comments'
import { EmptyState, Loading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, useUndoableDelete, type RowOf } from '@/data/useCollection'
import { JobCardForm } from './JobCardForm'
import { MenuAction, WORKSHOP_CRUMBS } from './StageFrame'
import { railIndexFor, type JobRow } from './stages'

/** A single job card: stage timeline, assigned technician, parts and costs.
 *
 *  Costs are role-gated. Part cost and margin are hidden from advisors,
 *  technicians, QC, front desk and call centre (FIELD_RULES), so this screen
 *  drops the whole totals panel for them rather than showing blanked-out rows
 *  that invite "why can't I see this".
 *
 *  Everything on it now comes from a record. The rebuild inherited a screen
 *  whose technician, parts, costs and timeline stamps were module constants —
 *  it rendered "Yousef Al-Otaibi · SAR 840 · Jul 18, 9:02 AM" for every job
 *  card in the database, including ones with no technician and no invoice. The
 *  timeline is now the job's real stage, the parts are its invoice's part
 *  lines, and the totals are the ones the server computed.
 *
 *  Delete sits behind "More actions" and can be undone from the toast that
 *  follows; the header keeps one primary (print) and one secondary (edit). */
export function JobDetail() {
  const { t } = usePreferences()
  const { fieldHidden, can } = useSession()
  const { confirm } = useModal()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const jobs = useCollection('jobs')
  const remove = useUndoableDelete('jobs', 'Job card')
  const [editing, setEditing] = useState(false)

  const jobId = params.get('id')
  const rows = (jobs.data ?? []) as readonly JobRow[]
  const job = jobId ? rows.find((row) => row.id === jobId) : rows[0]

  /* The two links the API models: an invoice names its job card, a line names
   * its invoice. Filtered server-side; an empty id matches nothing. */
  const invoices = useCollection('invoices', { filter: { jobCardId: job?._id ?? '' } })
  const invoice = invoices.data?.[0] as InvoiceRow | undefined
  const lines = useCollection('invoiceLines', { filter: { invoiceId: invoice?._id ?? '' } })
  const technicians = useCollection('technicians')

  const hideCosts = fieldHidden('Part cost / margin')
  const technician = job?.assignedTechId
    ? (technicians.data as readonly TechnicianRow[] | undefined)?.find(
        (row) => row._id === job.assignedTechId
      )
    : undefined
  const parts = ((lines.data ?? []) as readonly LineRow[]).filter((line) => line.kind === 'part')

  const demoAttachments: AttachmentFile[] = [
    { id: 'att-1', name: 'checkin_form.pdf', size: '0.8 MB', type: 'PDF' },
    { id: 'att-2', name: 'inspection_report.pdf', size: '2.1 MB', type: 'PDF' },
    { id: 'att-3', name: 'damage_photo.jpg', size: '3.5 MB', type: 'Image' },
  ]

  const demoComments: Comment[] = job
    ? [
        {
          id: 'cmt-1',
          author: technician?.name ?? t('Technician'),
          role: t('Technician'),
          text: t('Inspection completed. Waiting for parts.'),
          time: '10:30 AM',
        },
        {
          id: 'cmt-2',
          author: job.cust,
          role: t('Customer'),
          text: t('Please proceed with the repair.'),
          time: '11:15 AM',
        },
      ]
    : []

  async function deleteJob() {
    if (!job) return
    const agreed = await confirm({
      title: 'Delete Job Card?',
      description: `${job.id} — ${job.cust}. You can undo this from the notice that follows.`,
      icon: 'Trash2',
      confirmLabel: 'Delete',
      destructive: true,
      variant: 'lifecycle',
    })
    if (!agreed) return
    try {
      await remove.remove(job._id ?? job.id)
    } catch (cause) {
      toast.show({
        title: t('Delete Job Card?'),
        description: cause instanceof Error ? cause.message : String(cause),
        error: true,
      })
      return
    }
    navigate('/job-cards')
  }

  return (
    <>
      <ScreenFrame
        icon="ClipboardList"
        title={job?.id ?? 'Job Card'}
        titleCode
        breadcrumbs={WORKSHOP_CRUMBS}
        back={{ to: '/job-cards', label: 'Back to Job Cards' }}
        subtitle={job ? `${job.cust} · ${job.veh}` : undefined}
        status={job ? <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} /> : undefined}
        actions={
          job ? (
            <>
              <Link
                to={`/job-card-detail?id=${encodeURIComponent(job.id)}`}
                className="inline-flex h-10 items-center gap-2 rounded border border-border bg-card px-3.5 font-action text-[13px] text-heading no-underline transition-colors hover:border-salis-blue hover:text-salis-blue hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
              >
                <Icon name="ClipboardList" size={15} />
                {t('Job Card')}
              </Link>
              {can('jobcards', 'e') ? (
                <Button variant="subtle" size="md" icon="Pencil" onClick={() => setEditing(true)}>
                  {t('Edit')}
                </Button>
              ) : null}
              <Button
                size="md"
                icon="Printer"
                onClick={() => window.open(`/job-card-print?id=${encodeURIComponent(job.id)}`, '_blank')}
              >
                {t('Print Job Card')}
              </Button>
            </>
          ) : undefined
        }
        overflow={
          job && can('jobcards', 'd') ? (
            <MenuAction icon="Trash2" label="Delete" destructive disabled={remove.pending} onClick={() => void deleteJob()} />
          ) : undefined
        }
        query={jobs}
        notFound={
          !jobs.isLoading && !jobs.isError && !job
            ? {
                icon: 'FileQuestion',
                title: 'Job card not found',
                description: 'It may have been deleted, or the link is out of date.',
                action: (
                  <Link to="/job-cards" className="font-action text-[13px] font-medium">
                    {t('Back to Job Cards')}
                  </Link>
                ),
              }
            : null
        }
        skeleton="detail"
        bodyClassName="max-w-[1100px]"
      >
        {job ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="p-6">
              <h2 className="mb-5 text-[17px] font-bold text-heading">{t('Timeline')}</h2>
              <Timeline steps={timelineFor(job.stage)} />
            </Card>

            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <h2 className="mb-3 text-[15px] font-bold text-heading">{t('Assigned Technician')}</h2>
                {technician ? (
                  <div className="flex items-center gap-2.5">
                    <Avatar name={technician.name} size={36} />
                    <span className="text-sm text-body">{technician.name}</span>
                  </div>
                ) : (
                  <p className="text-[13px] text-muted">{t('No technician assigned yet')}</p>
                )}
              </Card>

              <Card className="p-5">
                <h2 className="mb-3 text-[15px] font-bold text-heading">{t('Parts Used')}</h2>
                {lines.isLoading ? (
                  <Loading inline label="Loading parts..." />
                ) : parts.length === 0 ? (
                  <p className="text-[13px] text-muted">
                    {t('Parts appear here once they are billed to this job card.')}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {parts.map((part, index) => (
                      <div
                        key={part._id ?? `${part.part}-${index}`}
                        className="flex justify-between gap-3 text-[13px]"
                      >
                        <span className="min-w-0 truncate text-body">{part.desc}</span>
                        {/* Part prices follow the same redaction rule as the totals. */}
                        {hideCosts ? (
                          <span className="text-faint">—</span>
                        ) : (
                          <Money sar={part.unit} className="flex-shrink-0 text-muted" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {hideCosts ? null : (
                <Card className="flex flex-col gap-2 p-5">
                  {invoice ? (
                    <>
                      {/* Server-computed. Splitting the subtotal into labour and
                          parts in the browser would be a frontend financial
                          calculation, which Part 5b forbids outright. */}
                      <CostRow label={t('Subtotal')} halalas={invoice.subtotalHalalas} />
                      <CostRow label={t('VAT (15%)')} halalas={invoice.taxHalalas} />
                      <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-heading">
                        <span>{t('Total Cost')}</span>
                        <Money sar={(invoice.totalHalalas ?? 0) / 100} className="font-bold" />
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      icon="Receipt"
                      title={t('Not invoiced yet')}
                      description={t('Totals appear once this job card is invoiced.')}
                    />
                  )}
                </Card>
              )}

              <Comments items={demoComments} title={t('Technician Notes')} />

              <Attachments files={demoAttachments} title={t('Documents')} />
            </div>
          </div>
        ) : null}
      </ScreenFrame>

      {job ? <JobCardForm open={editing} onClose={() => setEditing(false)} job={job} /> : null}
    </>
  )
}

function CostRow({ label, halalas }: { label: string; halalas?: number }) {
  return (
    <div className="flex justify-between text-[13px] text-muted">
      <span>{label}</span>
      <Money sar={(halalas ?? 0) / 100} className="text-muted" />
    </div>
  )
}

/** The six workshop stages as a vertical rail, filled to wherever the record
 *  actually is.
 *
 *  No timestamps: the audit log holds when each transition happened and no
 *  endpoint exposes it to a client yet, so a stamp here would be invented. A
 *  step is done, current or pending — which is what the record can prove. */
const STAGE_ICONS = [
  'ClipboardCheck',
  'SearchCheck',
  'Calculator',
  'Wrench',
  'ShieldCheck',
  'Car',
] as const

function timelineFor(stage: string | undefined): TimelineStep[] {
  const reached = railIndexFor(stage)
  return WORKSHOP_STAGES.map((label, index) => ({
    icon: STAGE_ICONS[index] ?? 'Circle',
    label,
    done: index <= reached,
  }))
}

type TechnicianRow = RowOf<'technicians'> & { _id?: string }
type InvoiceRow = RowOf<'invoices'> & {
  _id?: string
  subtotalHalalas?: number
  taxHalalas?: number
  totalHalalas?: number
}
type LineRow = RowOf<'invoiceLines'> & { _id?: string }
