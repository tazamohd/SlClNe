import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/DataTable'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Templates — the Administration module's document/message template manager
 *  (`project/Templates.dc.html`).
 *
 *  Six preview cards (invoice, estimate, job card, email, SMS, receipt), each
 *  carrying the merge fields it renders — shown as code chips, always LTR,
 *  since `{{customer_name}}` is a token, not prose.
 *
 *  Beyond the static mock: the design had no way to find a template once the
 *  list grows, so a search box and category filter were added (neither
 *  appears in `Templates.dc.html`) — both filter for real. Create, Edit and
 *  Duplicate are the design's actions; Delete was added alongside them since
 *  a template manager with no way to remove a template isn't one. All four
 *  are gated on `can('admin', ...)` and, like `Backup`/`OEMIntegrations`,
 *  acknowledge with a toast rather than mutating anything — there is no
 *  template editor screen yet for Create/Edit to open, and Duplicate/Delete
 *  would otherwise silently diverge from what the eventual API returns.
 *
 *  No `templates` collection exists in the repository yet, so the rows live
 *  here — same shape a future `useCollection('templates')` read would
 *  return. */

type TemplateCategory = 'invoice' | 'estimate' | 'job_card' | 'email' | 'sms' | 'receipt'

interface Template {
  id: string
  /** English source name — translated via t() at render. */
  name: string
  category: TemplateCategory
  /** English source description. */
  desc: string
  icon: string
  previewFrom: string
  previewTo: string
  previewFg: string
  /** Merge fields the template renders. Code, not prose — always dir="ltr". */
  variables: readonly string[]
  /** Display date as designed; Latin, so it's rendered dir="ltr". */
  lastEdit: string
}

/** Blue for invoice/receipt, cyan for estimate, orange for the job card,
 *  navy for email, slate for SMS — straight from the design's pill colours.
 *  Never green/red/yellow/purple/pink/teal (README §7). */
const CATEGORY_META: Record<TemplateCategory, { label: string; bg: string; fg: string }> = {
  invoice: { label: 'Invoice', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  estimate: { label: 'Estimate', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
  job_card: { label: 'Job Card', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  email: { label: 'Email', bg: 'rgba(11,31,59,.1)', fg: '#0B1F3B' },
  sms: { label: 'SMS', bg: 'rgba(100,116,139,.1)', fg: '#64748B' },
  receipt: { label: 'Receipt', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
}

const FILTERS = [
  ['all', 'All'],
  ['invoice', 'Invoice'],
  ['estimate', 'Estimate'],
  ['job_card', 'Job Card'],
  ['email', 'Email'],
  ['sms', 'SMS'],
  ['receipt', 'Receipt'],
] as const

type Filter = (typeof FILTERS)[number][0]

/** The design's six rows, verbatim (name, type, description, icon, preview
 *  tint, last-edited date) — `variables` is the one addition, per template
 *  type. */
const TEMPLATES: readonly Template[] = [
  {
    id: 'tax-invoice',
    name: 'Tax Invoice',
    category: 'invoice',
    desc: 'ZATCA-compliant tax invoice template',
    icon: 'Receipt',
    previewFrom: 'rgba(10,94,215,.08)',
    previewTo: 'rgba(11,179,255,.08)',
    previewFg: '#0A5ED7',
    variables: ['{{customer_name}}', '{{invoice_no}}', '{{total_amount}}'],
    lastEdit: 'Jul 20, 2026',
  },
  {
    id: 'service-estimate',
    name: 'Service Estimate',
    category: 'estimate',
    desc: 'Detailed service cost estimate for customers',
    icon: 'FileText',
    previewFrom: 'rgba(11,179,255,.08)',
    previewTo: 'rgba(10,94,215,.08)',
    previewFg: '#0BB3FF',
    variables: ['{{customer_name}}', '{{vehicle_plate}}', '{{estimate_total}}'],
    lastEdit: 'Jul 18, 2026',
  },
  {
    id: 'job-card-print',
    name: 'Job Card Print',
    category: 'job_card',
    desc: 'Workshop job card for printing',
    icon: 'ClipboardList',
    previewFrom: 'rgba(249,115,22,.08)',
    previewTo: 'rgba(10,94,215,.05)',
    previewFg: '#F97316',
    variables: ['{{job_number}}', '{{technician_name}}', '{{vehicle_plate}}'],
    lastEdit: 'Jul 15, 2026',
  },
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    category: 'email',
    desc: 'New customer welcome email',
    icon: 'Mail',
    previewFrom: 'rgba(11,31,59,.08)',
    previewTo: 'rgba(10,94,215,.05)',
    previewFg: '#0B1F3B',
    variables: ['{{customer_name}}', '{{workshop_name}}'],
    lastEdit: 'Jul 12, 2026',
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    category: 'sms',
    desc: 'SMS template for appointment reminders',
    icon: 'MessageSquare',
    previewFrom: 'rgba(100,116,139,.08)',
    previewTo: 'rgba(10,94,215,.05)',
    previewFg: '#64748B',
    variables: ['{{customer_name}}', '{{appointment_date}}'],
    lastEdit: 'Jul 10, 2026',
  },
  {
    id: 'delivery-receipt',
    name: 'Delivery Receipt',
    category: 'receipt',
    desc: 'Vehicle delivery acknowledgment receipt',
    icon: 'Car',
    previewFrom: 'rgba(10,94,215,.08)',
    previewTo: 'rgba(11,179,255,.05)',
    previewFg: '#0A5ED7',
    variables: ['{{customer_name}}', '{{vehicle_plate}}', '{{delivery_date}}'],
    lastEdit: 'Jul 8, 2026',
  },
]

/** 28×28 icon action button matching the design's Edit/Copy chips. Blue for
 *  the routine actions, orange (sparingly) for the destructive one. */
function CardAction({
  icon,
  label,
  tone = 'blue',
  onClick,
}: {
  icon: string
  label: string
  tone?: 'blue' | 'orange'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-md border-none',
        'transition-colors duration-150',
        tone === 'orange'
          ? 'bg-[rgba(249,115,22,.08)] text-salis-orange hover:bg-[rgba(249,115,22,.16)]'
          : 'bg-[rgba(10,94,215,.06)] text-salis-blue hover:bg-[rgba(10,94,215,.12)]'
      )}
    >
      <Icon name={icon} size={13} />
    </button>
  )
}

export function Templates() {
  const { t } = usePreferences()
  const { can } = useSession()
  const { show } = useToast()
  const isMobile = useIsMobile()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const canCreate = can('admin', 'c')
  const canEdit = can('admin', 'e')
  const canDelete = can('admin', 'x')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return TEMPLATES.filter((tpl) => {
      const matchesCategory = filter === 'all' || tpl.category === filter
      const matchesQuery =
        !needle ||
        tpl.name.toLowerCase().includes(needle) ||
        tpl.desc.toLowerCase().includes(needle)
      return matchesCategory && matchesQuery
    })
  }, [query, filter])

  const create = () =>
    show({
      title: t('Opening template editor'),
      description: t('Design a new document or message template.'),
    })

  const edit = (tpl: Template) =>
    show({ title: t('Opening editor'), description: t(tpl.name) })

  const duplicate = (tpl: Template) =>
    show({ title: t('Template duplicated'), description: t(tpl.name) })

  const remove = (tpl: Template) =>
    show({ title: t('Template deleted'), description: t(tpl.name) })

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* The design's glowing brand tile — same treatment as Branches. */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div
              className={cn(
                'relative flex rounded-xl bg-salis-gradient text-white',
                'shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]',
                isMobile ? 'p-2.5' : 'p-3'
              )}
            >
              <Icon name="FileCode" size={isMobile ? 22 : 28} />
            </div>
          </div>
          <div className="min-w-0">
            <h1
              className={cn(
                'font-display font-black text-heading',
                isMobile ? 'text-xl' : 'text-3xl'
              )}
            >
              {t('Templates')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Administration')}</p>
          </div>
        </div>
        {canCreate ? (
          <Button size="md" onClick={create}>
            <Icon name="Plus" size={16} />
            {t('Create Template')}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          icon={<Icon name="Search" size={15} />}
          inputSize="md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Search templates...')}
          aria-label={t('Search templates...')}
          className="w-full sm:w-64"
        />
        <div role="tablist" aria-label={t('Category')} className="flex gap-2 overflow-x-auto pb-0.5">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={cn(
                'h-8 flex-shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5',
                'font-action text-xs font-semibold transition-all duration-150',
                filter === id
                  ? 'border-none bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]'
                  : 'border border-border bg-card text-body hover:border-salis-blue hover:text-salis-blue'
              )}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="rounded-lg p-6">
          <EmptyState
            icon={query ? 'SearchX' : 'FileCode'}
            title={query ? t('No templates match your search') : t('No templates in this category')}
            description={t('Try a different name or category.')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tpl) => {
            const meta = CATEGORY_META[tpl.category]
            return (
              <Card
                key={tpl.id}
                className="overflow-hidden transition-all duration-200 hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
              >
                <div
                  className="flex h-24 items-center justify-center sm:h-[120px]"
                  style={{ background: `linear-gradient(135deg, ${tpl.previewFrom}, ${tpl.previewTo})` }}
                >
                  <Icon name={tpl.icon} size={40} style={{ color: tpl.previewFg, opacity: 0.4 }} />
                </div>
                <div className="p-4">
                  <Badge background={meta.bg} color={meta.fg}>
                    {t(meta.label)}
                  </Badge>
                  <h3 className="mt-2 text-[15px] font-bold text-heading">{t(tpl.name)}</h3>
                  <p className="mt-1 text-xs text-muted">{t(tpl.desc)}</p>
                  {tpl.variables.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1" dir="ltr">
                      {tpl.variables.map((token) => (
                        <span
                          key={token}
                          className="rounded bg-inset px-1.5 py-0.5 font-mono text-[10px] text-faint"
                        >
                          {token}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-faint" dir="ltr">
                      {tpl.lastEdit}
                    </span>
                    <div className="flex gap-1.5">
                      {canEdit ? (
                        <CardAction icon="Pencil" label={t('Edit')} onClick={() => edit(tpl)} />
                      ) : null}
                      {canCreate ? (
                        <CardAction icon="Copy" label={t('Duplicate')} onClick={() => duplicate(tpl)} />
                      ) : null}
                      {canDelete ? (
                        <CardAction
                          icon="Trash2"
                          label={t('Delete')}
                          tone="orange"
                          onClick={() => remove(tpl)}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
