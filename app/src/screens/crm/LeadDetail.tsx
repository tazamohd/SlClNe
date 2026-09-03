import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DetailPage, type DetailSection, type DetailStat } from '@/components/shell/DetailPage'
import { ActivityFeed, type ActivityItem } from '@/components/ui/ActivityFeed'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Comments, type Comment } from '@/components/ui/Comments'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
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
 *  - **Next action** is the one primary control on the page. It reads the
 *    stage and says what moves the lead on: for an active lead that is
 *    converting it to an opportunity (`POST /crm/leads/:id/convert`, via
 *    `ConvertLeadModal`); a converted lead points at the opportunities list; a
 *    lost lead has none. Edit stays a secondary control in the header.
 *  - **Activity timeline** and **notes** derive from the lead's own fields —
 *    there is no lead-activity or lead-note collection, endpoint or table.
 *  - The design's two sample PDFs are gone: there is no document store, and a
 *    rail of invented files is worse than no rail.
 *
 *  Against the fixtures both real controls refuse honestly with the "set
 *  VITE_API_URL" state rather than faking a save. */
type Lead = RowOf<'leads'> & { _id?: string; _createdAt?: string }

const PIPELINE = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won'] as const

/** `qualified` / `Proposal` → `Qualified` / `Proposal`. The seed carries a mix
 *  of cases; the rail and the badge want one. */
function titleCase(stage: string): string {
  const s = stage.toLowerCase()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** What moving this lead forward means, by stage. English sources; translated
 *  where rendered. */
const NEXT_ACTION: Record<string, { title: string; body: string }> = {
  new: { title: 'Qualify and convert', body: 'Confirm the need and the budget, then convert the lead into an opportunity so it can be forecast.' },
  qualified: { title: 'Send a proposal', body: 'The lead is qualified. Convert it to an opportunity to price the work and track the proposal.' },
  proposal: { title: 'Follow up on the proposal', body: 'A proposal is out. Convert to an opportunity to carry the value into the forecast.' },
  negotiation: { title: 'Close the deal', body: 'Terms are being negotiated. Convert to an opportunity to record the agreed value and close date.' },
  won: { title: 'Hand over to the workshop', body: 'The deal is won. Convert it so the opportunity carries the value and the customer can be checked in.' },
}

export function LeadDetail() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const [params] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const [converting, setConverting] = useState(false)
  const ref = params.get('id') ?? params.get('name') ?? ''

  const leads = useCollection('leads')

  const rows = (leads.data ?? []) as readonly Lead[]
  const lead = ref ? rows.find((row) => rowId(row) === ref || row.name === ref) : rows[0]

  const stage = lead?.stage.toLowerCase() ?? ''
  const isLost = stage === 'lost'
  const isConverted = stage === 'converted'
  const score = Number(lead?.score ?? 0)
  const memberSince = lead?._createdAt ? lead._createdAt.slice(0, 10) : undefined

  const activities: ActivityItem[] = useMemo(
    () =>
      lead
        ? [
            {
              id: 'act-created',
              icon: 'PlusCircle',
              user: lead.name,
              action: 'created',
              target: t('Lead'),
              time: memberSince ?? lead.date ?? '',
            },
            ...(stage !== 'new'
              ? [
                  {
                    id: 'act-stage',
                    icon: 'ArrowRight',
                    user: lead.name,
                    action: t('moved to'),
                    target: titleCase(lead.stage),
                    time: lead.date ?? '',
                  },
                ]
              : []),
            ...(lead.source
              ? [
                  {
                    id: 'act-source',
                    icon: 'Compass',
                    user: lead.name,
                    action: t('added via'),
                    target: t(lead.source),
                    time: lead.date ?? '',
                  },
                ]
              : []),
          ]
        : [],
    [lead, stage, memberSince, t]
  )

  const comments: Comment[] = useMemo(
    () =>
      lead
        ? [
            {
              id: 'cmt-1',
              author: lead.company || lead.name,
              text: `${t('Initial contact from')} ${lead.source ? t(lead.source) : t('unknown source')}.`,
              time: lead.date ?? '',
            },
          ]
        : [],
    [lead, t]
  )

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

  const leadRef = rowId(lead) ?? lead.name
  const canConvert = can('crm', 'c') && can('crm', 'e') && !isConverted && !isLost
  const canEdit = can('crm', 'e')
  const next = NEXT_ACTION[stage]

  const actions = canEdit ? (
    <Button variant="outline" size="md" icon="Pencil" onClick={() => setEditing(true)}>
      {t('Edit')}
    </Button>
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

  const nextActionCard = (
    <Card className="flex flex-col gap-3 border-salis-blue/[.35] bg-tint-blue p-5">
      <div className="flex items-center gap-2">
        <span className="flex rounded-lg bg-salis-gradient p-2 text-white">
          <Icon name={isConverted ? 'CheckCircle' : isLost ? 'XCircle' : 'ArrowRightCircle'} size={16} />
        </span>
        <p className="font-action text-xs font-semibold uppercase tracking-[.06em] text-salis-blue">
          {t('Next action')}
        </p>
      </div>
      {isConverted ? (
        <>
          <p className="text-sm font-bold text-heading">{t('Lead converted')}</p>
          <p className="text-[13px] text-muted">
            {t('This lead became an opportunity and has left the active pipeline.')}
          </p>
          <Link
            to="/opportunities"
            className="inline-flex h-10 w-fit items-center gap-2 rounded bg-salis-gradient px-3.5 font-action text-[13px] font-semibold text-white no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
          >
            <Icon name="Target" size={14} />
            {t('Open opportunities')}
          </Link>
        </>
      ) : isLost ? (
        <>
          <p className="text-sm font-bold text-heading">{t('Lead lost')}</p>
          <p className="text-[13px] text-muted">
            {t('This lead did not convert and has left the active pipeline.')}
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-bold text-heading">{t(next?.title ?? 'Move the lead forward')}</p>
          <p className="text-[13px] text-muted">
            {t(next?.body ?? 'Convert the lead to an opportunity to carry its value into the forecast.')}
          </p>
          {canConvert ? (
            <Button size="md" icon="GitBranch" className="w-fit" onClick={() => setConverting(true)}>
              {t('Convert to Opportunity')}
            </Button>
          ) : (
            <p className="text-[11px] text-muted">{t('Converting a lead needs the CRM create and edit grants.')}</p>
          )}
        </>
      )}
    </Card>
  )

  const sections: DetailSection[] = [
    {
      id: 'next',
      title: 'What happens next',
      icon: 'Compass',
      span: 'full',
      children: nextActionCard,
    },
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
          title={t('Converted')}
          description={t('The stage rail no longer applies to a converted lead.')}
        />
      ) : isLost ? (
        <EmptyState
          icon="XCircle"
          title={t('Off the pipeline')}
          description={t('A lost lead sits outside the stage rail.')}
        />
      ) : (
        <WorkflowStepper current={titleCase(stage)} stages={PIPELINE} />
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
        timeline={
          activities.length > 0 && !isMobile ? (
            <ActivityFeed items={activities} title={t('Recent Activity')} />
          ) : undefined
        }
        comments={
          comments.length > 0 && !isMobile ? (
            <Comments items={comments} title={t('Notes')} />
          ) : undefined
        }
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
