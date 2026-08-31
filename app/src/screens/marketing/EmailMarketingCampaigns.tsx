import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money, parseSar } from '@/components/ui/Money'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { ErrorState } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

/** Email Marketing Campaigns (`/email-marketing-campaigns`) — the email channel
 *  of the `campaigns` collection (`GET /crm/campaigns`), read through the
 *  repository seam and filtered to `type === 'email'`.
 *
 *  The collection carries a campaign's name, channel, status, reach, opens,
 *  clicks, conversions and the budget and spend the server formatted. It does
 *  not carry a subject line, a per-send delivery count or a send date, so those
 *  three columns are gone rather than filled with a number nothing produced —
 *  the gap line names the read that would supply them.
 *
 *  Rates are per record: one campaign's opens over its own reach. The KPI row
 *  counts records and sums audience counts, never money — each campaign's spend
 *  and budget are shown as the server formatted them and are not added up here.
 */

type Campaign = RowOf<'campaigns'>

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  running: ['var(--tint-blue)', 'var(--salis-blue)'],
  completed: ['var(--tint-neutral)', 'var(--text-muted)'],
  scheduled: ['var(--tint-orange)', 'var(--salis-orange)'],
  draft: ['var(--tint-navy)', 'var(--salis-navy)'],
}

function StatusBadge({ value }: { value: string }) {
  const { t } = usePreferences()
  const [bg, fg] = STATUS_COLORS[value] ?? STATUS_COLORS.draft
  return (
    <Badge background={bg} color={fg}>
      {t(value.charAt(0).toUpperCase() + value.slice(1))}
    </Badge>
  )
}

/** A rate the row itself supports: this campaign's own two counts. Never a
 *  ratio of one page's sums presented as the campaign's performance. */
function rate(part: number, whole: number): string {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : '—'
}

/** What `GET /crm/campaigns` does not return, named rather than invented. */
function FieldGap() {
  const { t } = usePreferences()
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-muted">
      <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
      <span>
        {t('Not recorded in this dataset')}: {t('Subject')}, {t('Sent')}, {t('Date')}.{' '}
        {t('Endpoint')}:{' '}
        <span dir="ltr" className="font-mono text-body">
          GET /crm/campaigns/:id/messages
        </span>
      </span>
    </p>
  )
}

export function EmailMarketingCampaigns() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: all = [], isLoading, isError, error, refetch } = useCollection('campaigns')

  const campaigns = useMemo(() => all.filter((c) => c.type === 'email'), [all])

  /** Audience counts, not money. Summing recipients is arithmetic over counts;
   *  summing spend would be a period total the server owns, so it is not done. */
  const totals = useMemo(
    () => ({
      reach: campaigns.reduce((sum, c) => sum + c.reach, 0),
      conversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
      scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
    }),
    [campaigns],
  )

  const kpis = [
    { label: t('Total Campaigns'), value: String(campaigns.length), icon: 'Mail', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Reach'), value: totals.reach.toLocaleString('en-US'), icon: 'Send', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Conversions'), value: totals.conversions.toLocaleString('en-US'), icon: 'MousePointerClick', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Scheduled'), value: String(totals.scheduled), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<Campaign>[] = [
    { header: 'Campaign', cell: (c) => <span className="font-medium text-heading">{t(c.name)}</span> },
    {
      header: 'Recipients',
      cell: (c) => (
        <span className="font-mono text-[13px] text-heading" dir="ltr">
          {c.reach.toLocaleString('en-US')}
        </span>
      ),
    },
    {
      header: 'Open Rate',
      cell: (c) => (
        <span className="font-mono text-[13px] text-heading" dir="ltr">
          {rate(c.opens, c.reach)}
        </span>
      ),
    },
    {
      header: 'Click Rate',
      cell: (c) => (
        <span className="font-mono text-[13px] text-heading" dir="ltr">
          {rate(c.clicks, c.opens)}
        </span>
      ),
    },
    {
      header: 'Conversions',
      cell: (c) => (
        <span className="font-mono text-[13px] text-heading" dir="ltr">
          {c.conversions}
        </span>
      ),
    },
    { header: 'Spent', cell: (c) => <Money sar={parseSar(c.spent)} />, className: 'text-end' },
    { header: 'Budget', cell: (c) => <Money sar={parseSar(c.budget)} className="text-muted" />, className: 'text-end' },
    { header: 'Status', cell: (c) => <StatusBadge value={c.status} /> },
  ]

  if (isError) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <PageHeader icon="Mail" title={t('Email Campaigns')} subtitle={t('Email marketing campaign management')} />
        <Card className="p-6">
          <ErrorState description={error?.message} onRetry={() => void refetch()} />
        </Card>
      </div>
    )
  }

  const table = (
    <DataTable
      caption="Marketing campaigns"
      columns={columns}
      rows={campaigns}
      rowKey={(c, index) => `${c.name}-${index}`}
      loading={isLoading}
      mobileCard={(c) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
                  <Icon name="Mail" size={14} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{t(c.name)}</p>
                  <p className="text-xs text-muted">{t('Email Marketing')}</p>
                </div>
              </div>
            }
            trailing={<StatusBadge value={c.status} />}
          />
          <MobileCardRow label={t('Recipients')}>{c.reach.toLocaleString('en-US')}</MobileCardRow>
          <MobileCardRow label={t('Opened')}>{rate(c.opens, c.reach)}</MobileCardRow>
          <MobileCardRow label={t('Spent')}>
            <Money sar={parseSar(c.spent)} className="font-semibold text-heading" />
          </MobileCardRow>
        </>
      )}
      empty={<EmptyState icon="Mail" title={t('No campaigns yet')} />}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Mail" title={t('Email Campaigns')} subtitle={t('Marketing')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {table}
        <FieldGap />
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <PageHeader icon="Mail" title={t('Email Campaigns')} subtitle={t('Email marketing campaign management')} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
      <FieldGap />
    </div>
  )
}
