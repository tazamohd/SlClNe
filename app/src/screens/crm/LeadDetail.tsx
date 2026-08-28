import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money, parseSar } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** CRM lead deep-dive: contact + deal info, activity timeline and notes for
 *  one lead. Mirrors the Kanban card opened from LeadPipeline.
 *
 *  Contact details, the deal's probability/close-date and the activity feed
 *  aren't part of the `leads` collection yet (it only carries the pipeline
 *  card fields), so — same call as JobDetail's assigned technician and parts
 *  list — they're demo constants here rather than placeholders that vary
 *  with the selected lead. */

type Lead = RowOf<'leads'>

const STAGE_TONE: Record<string, readonly [string, string]> = {
  new: ['rgba(100,116,139,.12)', '#64748B'],
  qualified: ['rgba(11,179,255,.12)', '#0BB3FF'],
  proposal: ['rgba(10,94,215,.1)', '#0A5ED7'],
  negotiation: ['rgba(10,94,215,.16)', '#0A5ED7'],
  won: ['rgba(11,31,59,.12)', '#0B1F3B'],
  lost: ['rgba(100,116,139,.1)', '#64748B'],
}

export function LeadDetail() {
  const { t, rtl } = usePreferences()
  const [params] = useSearchParams()
  const { data: leads = [], isLoading } = useCollection('leads')

  const key = params.get('id') ?? params.get('name')
  const lead: Lead | undefined = key ? leads.find((row) => row.name === key) : leads[0]

  if (isLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
  }

  if (!lead) {
    return (
      <Card className="p-6">
        <EmptyState
          icon="SearchX"
          title={t('Lead not found')}
          description={t('It may have been deleted, or the link is out of date.')}
          action={
            <Link to="/lead-pipeline" className="font-action text-[13px] font-medium">
              {t('Back to Lead Pipeline')}
            </Link>
          }
        />
      </Card>
    )
  }

  const [stageBg, stageFg] = STAGE_TONE[lead.stage] ?? STAGE_TONE.new
  const stageLabel = lead.stage.replace(/_/g, ' ')

  return (
    <div className="flex max-w-[960px] flex-col gap-6">
      <div>
        <Link
          to="/lead-pipeline"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Back to Lead Pipeline')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[22px] font-bold text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
          {lead.name.trim()[0] ?? '?'}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-black text-heading">{lead.name}</h1>
          <p className="mt-0.5 text-sm text-muted">{lead.company}</p>
        </div>
        <Badge background={stageBg} color={stageFg}>
          {t(stageLabel[0].toUpperCase() + stageLabel.slice(1))}
        </Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="md">
            <Icon name="Pencil" size={14} />
            {t('Edit')}
          </Button>
          <Button size="md">
            <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={14} />
            {t('Convert to Opportunity')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-[17px] font-bold text-heading">{t('Contact Information')}</h3>
          <div className="flex flex-col gap-3.5">
            <ContactRow icon="Mail" label={t('Email')} value={CONTACT.email} dir="ltr" />
            <ContactRow icon="Phone" label={t('Phone')} value={CONTACT.phone} mono dir="ltr" />
            <ContactRow icon="MapPin" label={t('Location')} value={CONTACT.location} />
            <ContactRow icon="Globe" label={t('Lead Source')} value={t(lead.source)} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-[17px] font-bold text-heading">{t('Deal Information')}</h3>
          <div className="flex flex-col gap-3.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">{t('Deal Value')}</span>
              <Money sar={parseSar(lead.value)} className="text-sm font-bold text-heading" />
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">{t('Probability')}</span>
              <span className="font-mono text-sm font-bold text-salis-blue" dir="ltr">
                {DEAL.probability}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">{t('Expected Close')}</span>
              <span className="text-sm text-body">{DEAL.expectedClose}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">{t('Last Contact')}</span>
              <span className="text-sm text-body">{lead.date}</span>
            </div>
            <div>
              <p className="mb-1 text-[13px] text-muted">{t('Lead Score')}</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                  <div
                    className="h-full rounded-full bg-salis-gradient-r"
                    style={{ width: `${Math.min(lead.score, 100)}%` }}
                  />
                </div>
                <span className="font-mono text-sm font-bold text-salis-blue" dir="ltr">
                  {lead.score}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-[17px] font-bold text-heading">{t('Activity Timeline')}</h3>
        <div className="flex flex-col gap-0 border-s-2 border-border ps-5">
          {ACTIVITY.map((event) => (
            <div key={event.title} className="relative pb-5">
              <span
                className="absolute top-0.5 h-3 w-3 rounded-full border-2 border-card"
                style={{ insetInlineStart: '-27px', background: event.color }}
              />
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[13px] font-semibold text-heading">{t(event.title)}</span>
                <span className="text-[11px] text-muted">{event.date}</span>
              </div>
              <p className="m-0 text-[13px] text-muted">{t(event.desc)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-[17px] font-bold text-heading">{t('Notes')}</h3>
        <div className="flex flex-col gap-3">
          {NOTES.map((note) => (
            <div key={note.date} className="rounded-[10px] border border-border bg-inset p-3">
              <p className="m-0 text-[13px] text-body">{t(note.text)}</p>
              <p className="mt-1.5 text-[11px] text-muted">
                {note.author} · {note.date}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            placeholder={t('Add a note...')}
            className="h-10 flex-1 rounded-lg border border-border bg-inset px-3 text-[13px] text-heading outline-none"
          />
          <Button size="md">
            <Icon name="Send" size={14} />
            {t('Send')}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function ContactRow({
  icon,
  label,
  value,
  mono,
  dir,
}: {
  icon: string
  label: string
  value: string
  mono?: boolean
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue">
        <Icon name={icon} size={14} />
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[11px] text-muted">{label}</p>
        <p className={`m-0 text-[13px] text-body ${mono ? 'font-mono' : ''}`} dir={dir}>
          {value}
        </p>
      </div>
    </div>
  )
}

// Demo contact/deal fields the `leads` collection doesn't carry yet.
const CONTACT = {
  email: 'huda@riyadhmotors.sa',
  phone: '+966 50 445 7821',
  location: 'Riyadh, Saudi Arabia',
}

const DEAL = {
  probability: '75%',
  expectedClose: 'Sep 1, 2026',
}

const ACTIVITY = [
  {
    title: 'Proposal Sent',
    date: 'Jul 18, 2026',
    desc: 'Sent comprehensive service agreement proposal via email',
    color: '#0A5ED7',
  },
  {
    title: 'Meeting',
    date: 'Jul 15, 2026',
    desc: 'On-site visit at Riyadh Motors Group headquarters',
    color: '#0BB3FF',
  },
  {
    title: 'Phone Call',
    date: 'Jul 12, 2026',
    desc: 'Initial discovery call — discussed fleet size and requirements',
    color: '#0BB3FF',
  },
  {
    title: 'Lead Created',
    date: 'Jul 10, 2026',
    desc: 'Referred by Ahmed Al-Rashid (existing customer)',
    color: '#64748B',
  },
]

const NOTES = [
  {
    text: 'Interested in comprehensive fleet maintenance package. Has 45+ vehicles across 3 locations. Decision maker confirmed. Budget approved for Q3.',
    author: 'Khalid Al-Amri',
    date: 'Jul 18, 2026',
  },
  {
    text: 'Initial meeting went well. They need customized reporting. Pricing discussion scheduled for next week.',
    author: 'Khalid Al-Amri',
    date: 'Jul 12, 2026',
  },
]
