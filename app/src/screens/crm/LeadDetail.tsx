import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DetailPage, type DetailSection, type DetailStat } from '@/components/shell/DetailPage'
import { EmptyState } from '@/components/ui/States'
import { Money, parseSar } from '@/components/ui/Money'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { useCollection, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { rowId } from '../registry/writes'
import { LeadStageBadge } from './crm-badges'

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
 *    an honest empty state. `crm-gaps` pins the four missing endpoints.
 *
 *  The prototype's Edit, Convert and Send-note buttons are not rendered: the
 *  `leads` collection is read-only server-side (no `writable: true`, no convert
 *  route), so wiring them would be a control that cannot do what it says. The
 *  gap is reported, not papered over with a dead CTA. */
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
  const [params] = useSearchParams()
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
  const score = Number(lead.score ?? 0)
  const memberSince = lead._createdAt ? lead._createdAt.slice(0, 10) : undefined

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
      children: isLost ? (
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
    <DetailPage
      back={{ to: '/lead-pipeline', label: 'Lead Pipeline' }}
      title={lead.name}
      avatar={{ initial: lead.name.trim()[0] ?? '?' }}
      subtitle={lead.company || undefined}
      status={<LeadStageBadge value={stage} />}
      summary={summary}
      sections={sections}
    />
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
