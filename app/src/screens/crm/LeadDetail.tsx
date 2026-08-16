import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DetailPage, type DetailSection, type DetailStat } from '@/components/shell/DetailPage'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { Money, parseSar } from '@/components/ui/Money'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { useCollection, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { rowId } from '../registry/writes'
import { LeadStageBadge } from './crm-badges'
import { LeadFormModal } from './LeadForm'
import { ConvertLeadModal } from './ConvertLeadModal'

/** Lead 360 — `LeadDetail.dc.html` and `.Mobile.dc.html`, on the shared
 *  `DetailPage` frame.
 *
 *  The design leads with the contact (name, company), a status pill, two info
 *  panels — Contact and Deal — an activity timeline and a notes thread, with
 *  Edit / Convert to Opportunity / Add note actions.
 *
 *  What the `leads` collection actually carries is `name, company, value,
 *  source, stage, date, score`. So the honest joins are:
 *
 *  - **Contact panel** keeps only what exists: company, source, created date.
 *    Email, phone and location are drawn in the prototype but are on no lead
 *    row anywhere in the schema, so they are omitted rather than invented.
 *  - **Deal panel** shows the deal value, the lead score with its meter, and
 *    the stage — every field real.
 *  - **Conversion path** is the design's promise made honest: a read-only
 *    stage rail derived from `stage`, not a mutation. The pipeline runs
 *    New → Qualified → Proposal → Negotiation → Won; a `lost` lead sits off the
 *    rail and says so.
 *  - **Activity timeline** and **notes** have no server source — there is no
 *    lead-activity or lead-note collection, endpoint or table — so each renders
 *    an honest empty state. `crm-gaps` still pins those two missing endpoints.
 *
 *  **Writes (F-027).** `leads` is now writable and a lead→opportunity conversion
 *  route exists, so Edit and Convert to Opportunity are real controls, gated on
 *  the caller's `crm` grants:
 *
 *  - **Edit** patches the lead through `useUpdate('leads')` (`LeadFormModal`).
 *  - **Convert to Opportunity** posts `POST /crm/leads/:id/convert`
 *    (`ConvertLeadModal`), which creates the opportunity and moves the lead to
 *    `converted` in one server transaction. A lead already `converted` shows the
 *    converted state instead of the action — the route is idempotent, but
 *    offering "convert" on a converted lead would misdescribe what it does.
 *
 *  The Send-note button is still absent: notes have no server home, so a note
 *  control would be a write that cannot land. Against the fixtures both real
 *  controls refuse honestly with the "set VITE_API_URL" state rather than
 *  faking a save. */
type Lead = RowOf<'leads'> & { _id?: string; _createdAt?: string }

const PIPELINE = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won'] as const

/** `qualified` / `Proposal` → `Qualified` / `Proposal`. The seed carries a mix
 *  of cases; the rail and the badge want one. */
function titleCase(stage: string): string {
  const s = stage.toLowerCase()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function LeadDetail() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [params] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const [converting, setConverting] = useState(false)
  const ref = params.get('id') ?? params.get('name') ?? ''

  const leads = useCollection('leads')

  const rows = (leads.data ?? []) as readonly Lead[]
  const lead = ref ? rows.find((row) => rowId(row) === ref || row.name === ref) : rows[0]

  if (leads.isLoading) return <DetailPage title={t('Lead')} loading />

  if (leads.isError) {
    return (
      <DetailPage
        title={t('Lead')}
        back={{ to: '/lead-pipeline', label: 'Lead Pipeline' }}
        error={{ message: leads.error?.message, onRetry: () => void leads.refetch() }}
      />
    )
  }

  if (!lead) {
    return (
      <DetailPage
        title={t('Lead')}
        back={{ to: '/lead-pipeline', label: 'Lead Pipeline' }}
        notFound={{
          title: 'Lead not found',
          description: 'It may have converted or been removed, or the link is out of date.',
        }}
      />
    )
  }

  const stage = lead.stage.toLowerCase()
  const isLost = stage === 'lost'
  const isConverted = stage === 'converted'
  const score = Number(lead.score ?? 0)
  const memberSince = lead._createdAt ? lead._createdAt.slice(0, 10) : undefined
  const leadRef = rowId(lead) ?? lead.name
  // Convert needs both grants because the server does: it creates an
  // opportunity and edits the lead. A converted lead is past the action.
  const canConvert = can('crm', 'c') && can('crm', 'e') && !isConverted
  const canEdit = can('crm', 'e')

  const actions =
    canEdit || canConvert ? (
      <>
        {canConvert ? (
          <Button onClick={() => setConverting(true)}>
            <Icon name="GitBranch" size={14} />
            {t('Convert to Opportunity')}
          </Button>
        ) : null}
        {canEdit ? (
          <Button variant="subtle" onClick={() => setEditing(true)}>
            <Icon name="Pencil" size={14} />
            {t('Edit')}
          </Button>
        ) : null}
      </>
    ) : undefined

  const summary: DetailStat[] = [
    { label: 'Deal Value', value: <Money sar={parseSar(lead.value ?? '')} />, icon: 'DollarSign' },
    {
      label: 'Lead Score',
      value: (
        <span dir="ltr" className="font-mono">
          {score || '—'}
        </span>
      ),
      icon: 'Gauge',
    },
    { label: 'Lead Source', value: lead.source ? t(lead.source) : '—', icon: 'Compass' },
  ]

  const sections: DetailSection[] = [
    {
      id: 'contact',
      title: 'Contact Information',
      icon: 'User',
      span: 'half',
      children: (
        <dl className="m-0 flex flex-col gap-3">
          <Field label={t('Company')} value={lead.company || '—'} />
          <Field label={t('Lead Source')} value={lead.source ? t(lead.source) : '—'} />
          <Field
            label={t('Created')}
            value={
              memberSince ? (
                <span dir="ltr" className="font-mono">
                  {memberSince}
                </span>
              ) : (
                lead.date || '—'
              )
            }
          />
        </dl>
      ),
    },
    {
      id: 'deal',
      title: 'Deal Information',
      icon: 'Briefcase',
      span: 'half',
      children: (
        <div className="flex flex-col gap-4">
          <dl className="m-0 flex flex-col gap-3">
            <Field
              label={t('Deal Value')}
              value={
                <Money
                  sar={parseSar(lead.value ?? '')}
                  className="font-mono text-[13px] font-bold text-heading"
                />
              }
            />
            <Field label={t('Stage')} value={<LeadStageBadge value={stage} />} />
          </dl>
          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-[11px] text-muted">{t('Lead Score')}</p>
            <div className="flex items-center gap-2.5">
              <div
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('Lead Score')}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset"
              >
                <div
                  className="h-full rounded-full bg-salis-gradient"
                  style={{ inlineSize: `${Math.min(Math.max(score, 0), 100)}%` }}
                />
              </div>
              <span dir="ltr" className="font-mono text-[13px] font-bold text-salis-blue">
                {score || '—'}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'conversion',
      title: 'Conversion Path',
      icon: 'GitBranch',
      span: 'full',
      children: isConverted ? (
        <EmptyState
          icon="CheckCircle"
          title={t('Lead converted')}
          description={t('This lead became an opportunity and has left the active pipeline.')}
        />
      ) : isLost ? (
        <EmptyState
          icon="XCircle"
          title={t('Lead lost')}
          description={t('This lead did not convert and has left the active pipeline.')}
        />
      ) : (
        <WorkflowStepper current={titleCase(stage)} stages={PIPELINE} />
      ),
    },
    {
      id: 'activity',
      title: 'Activity Timeline',
      icon: 'Activity',
      span: 'full',
      children: (
        <EmptyState
          icon="Activity"
          title={t('No activity yet')}
          description={t('Calls, meetings and emails logged against this lead will appear here.')}
        />
      ),
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: 'StickyNote',
      span: 'full',
      children: (
        <EmptyState
          icon="StickyNote"
          title={t('No notes yet')}
          description={t('Notes your team records on this lead will appear here.')}
        />
      ),
    },
  ]

  return (
    <>
      <DetailPage
        back={{ to: '/lead-pipeline', label: 'Lead Pipeline' }}
        title={lead.name}
        avatar={{ initial: lead.name.trim()[0] ?? '?' }}
        subtitle={lead.company || undefined}
        status={<LeadStageBadge value={stage} />}
        actions={actions}
        summary={summary}
        sections={sections}
      />

      {editing ? <LeadFormModal open onClose={() => setEditing(false)} lead={lead} /> : null}

      {converting ? (
        <ConvertLeadModal
          open
          onClose={() => setConverting(false)}
          leadRef={leadRef}
          leadName={lead.name}
        />
      ) : null}
    </>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="m-0 text-[13px] text-body">{value}</dd>
    </div>
  )
}
