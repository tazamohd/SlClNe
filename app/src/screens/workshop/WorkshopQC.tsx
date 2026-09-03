import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Money } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import { EmptyState, Loading } from '@/components/ui/States'
import { sodRuleFor } from '@/data/rbac'
import { history, type EntityHistory, type RepositoryError } from '@/data/repository'
import { Checklist, countChecked, type ChecklistItem } from '@/components/ui/Checklist'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { StageFrame } from './StageFrame'
import { stageBusy } from './StageNotice'
import { useJobStage } from './useJobStage'

const QC_CHECKS: ChecklistItem[] = [
  { label: 'Repair Verified' },
  { label: 'Fluids Topped' },
  { label: 'Test Drive' },
  { label: 'Cleaned' },
  { label: 'Quality Check' },
  { label: 'Documents Ready' },
]

/** Stage 5 — quality gate before the vehicle goes back to the customer.
 *
 *  Two moves live here, because the stage machine has two: a card at `repair`
 *  is handed to QC (`repair → qc`), and a card at `qc` is either passed
 *  (`qc → delivery`) or sent back (`qc → repair`). They are deliberately not
 *  one button. Whoever moves a card out of `repair` is claiming to have done
 *  the work, and that claim is exactly what the segregation-of-duties check
 *  reads back when someone tries to pass it — chaining both moves into one
 *  click would make every user fail their own QC. */
/** What this screen does, in the SOD table's own words. */
const QC_ACTIVITY = 'Pass quality check'

export function WorkshopQC() {
  const { t, rtl } = usePreferences()
  const { role, roleMeta, can } = useSession()
  const toast = useToast()
  const stage = useJobStage()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const job = stage.job
  const technicians = useCollection('technicians')
  const invoices = useCollection('invoices', { filter: { jobCardId: job?._id ?? '' } })
  const invoice = invoices.data?.[0] as { _id?: string } | undefined
  const lines = useCollection('invoiceLines', { filter: { invoiceId: invoice?._id ?? '' } })

  const done = countChecked(QC_CHECKS, checked)
  const complete = done === QC_CHECKS.length

  // Named from the SOD table rather than hardcoded here, so the table is the
  // rule and this screen only says which activity it performs.
  const rule = sodRuleFor(QC_ACTIVITY)

  // The control is "whoever performed the repair must not pass its quality
  // check" — a question about a person and a record. This is still a role
  // proxy, and the proxy is wrong in both directions: it blocks every
  // technician including one who never touched this job, and it lets a manager
  // who did the repair sign off their own work.
  //
  // The real control now exists and runs — server-side. `POST
  // /jobs/:id/transition` into `delivery` calls `requireSodClear`, which reads
  // this job card's audit trail and refuses the actor who moved it through
  // repair (`server/src/security/sod.ts`). The refusal comes back as a 403 and
  // this screen shows the server's own sentence, so the enforcement is real
  // whatever the proxy below decides. §36 is why that distinction matters.
  //
  // What is missing for the client half is a way to read one record's trail.
  // The audit log is not a registered collection and no route exposes it, so
  // `sodViolation(QC_ACTIVITY, user.id, history)` in `data/rbac.ts` still has
  // no history to be given. It needs `GET /jobs/:id/history` returning
  // `{ actorId, action, entity, before, after }` rows for this entity — the
  // same shape `readHistory` already builds server-side. Requested; until it
  // exists the proxy stays, because a screen that showed no warning at all
  // would be a worse lie than one that over-warns.
  const sodConflict = role === 'technician'

  // The real segregation-of-duties surface (F-004). The server computes this
  // job card's audit trail and names any conflict — whoever performed the repair
  // must not also pass its quality check — so the screen highlights it per row
  // rather than standing on the role proxy above. Live only: null on the
  // fixtures, where the proxy note remains the honest fallback.
  const jobRef = job?._id ?? job?.id
  const trail = useQuery<EntityHistory, RepositoryError>({
    queryKey: ['job-history', jobRef],
    queryFn: () => history!.job(jobRef as string),
    enabled: Boolean(jobRef) && Boolean(history),
    retry: false,
  })
  const conflictActorIds = new Set((trail.data?.sodConflicts ?? []).map((c) => c.actorId))

  const atRepair = job?.stage === 'repair'
  const atQc = job?.stage === 'qc'
  // `jobcards:a` is what the server additionally demands to move qc → delivery.
  const mayPass = can('jobcards', 'a')

  async function handOver() {
    await stage.advance('qc', { reason: 'handed to quality control' })
  }

  async function approve() {
    if (sodConflict) {
      toast.show({
        title: t('Segregation of duties'),
        description: rule
          ? t('%a and %b must not be done by the same person.')
              .replace('%a', t(rule.a))
              .replace('%b', t(rule.b))
          : t('The technician who performed the repair cannot pass its quality check.'),
        error: true,
      })
      return
    }
    if (!complete) {
      toast.show({
        title: t('Incomplete checklist'),
        description: `${done}/${QC_CHECKS.length} ${t('checks recorded')}`,
        error: true,
      })
      return
    }
    await stage.advance('delivery', {
      reason: `qc ${done}/${QC_CHECKS.length} passed`,
      then: '/workshop-signature',
    })
  }

  const technician = job?.assignedTechId
    ? (technicians.data as readonly TechnicianRow[] | undefined)?.find(
        (row) => row._id === job.assignedTechId
      )
    : undefined
  const work = (lines.data ?? []) as readonly LineRow[]
  const saving = stage.status === 'saving'

  return (
    <StageFrame
      icon="ShieldCheck"
      title="Quality Check"
      stage={stage}
      subtitle={<span dir="ltr">{job ? `${job.id} · ${job.veh}` : '—'}</span>}
      notice={
        atRepair || atQc ? null : (
          <p className="text-[13px] text-muted">
            {t('This job card is not at a stage quality control can act on.')}{' '}
            <span dir="ltr" className="font-mono">
              {job?.stage ?? '—'}
            </span>
          </p>
        )
      }
      actions={
        <>
          {atQc ? (
            <Button
              variant="outline"
              size="lg"
              icon="RotateCcw"
              className="border-salis-orange text-salis-orange hover:bg-salis-orange hover:text-white"
              onClick={() => void stage.advance('repair', { reason: 'returned to repair by qc' })}
              disabled={stageBusy(stage)}
            >
              {t('Return to Repair')}
            </Button>
          ) : null}

          {atRepair ? (
            <Button
              size="lg"
              icon={rtl ? 'ArrowLeft' : 'ArrowRight'}
              loading={saving}
              loadingLabel="Saving..."
              onClick={() => void handOver()}
              disabled={stageBusy(stage)}
            >
              {t('Send to Quality Check')}
            </Button>
          ) : (
            <Button
              size="lg"
              icon="CheckCircle"
              loading={saving}
              loadingLabel="Saving..."
              onClick={() => void approve()}
              disabled={sodConflict || !atQc || !mayPass || stageBusy(stage)}
            >
              {t('Approve QC')}
            </Button>
          )}
        </>
      }
    >
      {sodConflict ? (
        <Card className="flex items-start gap-3 border-salis-orange/40 p-4">
          <span className="flex flex-shrink-0 rounded bg-salis-orange/[.12] p-2 text-salis-orange">
            <Icon name="AlertTriangle" size={18} />
          </span>
          <div>
            <p className="font-action text-sm font-semibold text-heading">
              {t('Segregation of duties')}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {t('The technician who performed the repair cannot pass its quality check.')}{' '}
              {t('Ask a QC inspector or the branch manager to sign off.')}
            </p>
          </div>
        </Card>
      ) : null}

      {/* The segregation-of-duties surface, from the server-computed trail. */}
      {history ? (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2.5 border-0 border-b border-solid border-border p-3.5">
            <Icon name="History" size={16} className="flex-shrink-0 text-salis-blue" />
            <div className="min-w-0">
              <p className="font-action text-sm font-semibold text-heading">{t('Audit trail')}</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {t('Who did what on this job card, and any duties held by one person.')}
              </p>
            </div>
          </div>
          {trail.isLoading ? (
            <div className="p-4">
              <Loading inline label="Loading trail..." />
            </div>
          ) : trail.isError ? (
            <div className="p-4">
              <EmptyState
                icon="ShieldAlert"
                title={t("Couldn't load the audit trail")}
                description={trail.error?.message}
              />
            </div>
          ) : (
            <>
              {conflictActorIds.size > 0 ? (
                <div
                  role="note"
                  className="flex items-start gap-2.5 border-0 border-b border-solid border-border bg-salis-orange/[.07] p-3.5"
                >
                  <Icon name="AlertTriangle" size={15} className="mt-0.5 flex-shrink-0 text-salis-orange" />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-salis-orange">
                      {t('Segregation-of-duties conflict')}
                    </p>
                    {trail.data?.sodConflicts.map((c) => (
                      <p key={`${c.a}-${c.b}`} className="mt-0.5 text-[11.5px] text-body">
                        {t(c.a)} + {t(c.b)} — {c.risk}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
              {trail.data?.entries.length ? (
                <ul className="m-0 flex list-none flex-col p-0">
                  {trail.data.entries.map((entry, index) => {
                    const conflicted = entry.actorId != null && conflictActorIds.has(entry.actorId)
                    return (
                      <li
                        key={entry.id}
                        className={
                          'flex items-start gap-3 p-3.5 ' +
                          (index ? 'border-0 border-t border-solid border-border ' : '') +
                          (conflicted ? 'bg-salis-orange/[.06]' : '')
                        }
                      >
                        <Icon
                          name={conflicted ? 'AlertTriangle' : 'CircleDot'}
                          size={14}
                          className={'mt-0.5 flex-shrink-0 ' + (conflicted ? 'text-salis-orange' : 'text-muted')}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-semibold text-heading">
                            {t(entry.action)}
                            {entry.activities.length ? (
                              <span className="ms-1.5 font-normal text-muted">
                                · {entry.activities.map((a) => t(a)).join(', ')}
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted">
                            {entry.actorRole || t('unknown role')}
                            {entry.at ? ` · ${entry.at}` : ''}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="p-4">
                  <EmptyState icon="History" title={t('No trail entries recorded yet.')} />
                </div>
              )}
            </>
          )}
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          icon="ClipboardCheck"
          title={t('QC Checklist')}
          action={
            <span className="font-mono text-[11px] font-semibold text-muted" dir="ltr">
              {done}/{QC_CHECKS.length}
            </span>
          }
        >
          <Checklist
            items={QC_CHECKS}
            checked={checked}
            onToggle={(label) => setChecked((prev) => ({ ...prev, [label]: !prev[label] }))}
          />
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel icon="FileText" title={t('Work Summary')}>
            {lines.isLoading ? (
              <Loading inline label="Loading parts..." />
            ) : work.length === 0 ? (
              <EmptyState
                icon="FileText"
                title={t('No billed work yet')}
                description={t('Parts appear here once they are billed to this job card.')}
              />
            ) : (
              <div className="flex flex-col gap-2.5">
                {work.map((item, index) => (
                  <div
                    key={item._id ?? `${item.desc}-${index}`}
                    className="flex items-center gap-2.5 text-[13px]"
                  >
                    <Icon
                      name={item.kind === 'labour' ? 'Wrench' : 'Package'}
                      size={14}
                      className="text-muted"
                      aria-label={t(item.kind === 'labour' ? 'Labour' : 'Parts')}
                    />
                    <span className="min-w-0 flex-1 truncate text-body">{item.desc}</span>
                    <Money sar={item.unit} className="font-semibold text-heading" />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel icon="User" title={t('Assigned Technician')}>
            {technician ? (
              <div className="flex items-center gap-2.5">
                <Avatar name={technician.name} size={36} />
                <div>
                  <p className="text-[13px] font-semibold text-heading">{technician.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {sodConflict
                      ? `${t('Signed in as')} ${roleMeta.label}`
                      : technician.specialty || t('Assigned Technician')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-muted">{t('No technician assigned yet')}</p>
            )}
          </Panel>
        </div>
      </div>
    </StageFrame>
  )
}

type TechnicianRow = RowOf<'technicians'> & { _id?: string }
type LineRow = RowOf<'invoiceLines'> & { _id?: string }
