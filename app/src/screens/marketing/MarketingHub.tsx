import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

/** Marketing Hub (`/marketing-hub`) — an overview across every campaign
 *  channel, read from `campaigns` (`GET /crm/campaigns`) through the
 *  repository seam, the same collection `Crm.tsx`'s per-channel screens
 *  (`EmailMarketing`, `SMSCampaigns`, `WhatsAppCampaigns`) already read.
 *
 *  This used to render a fixed `CAMPAIGNS` array and four hardcoded KPI tiles
 *  ("Active Campaigns: 12", "Total Reach: 45,200"…) that never moved no
 *  matter what a shop actually ran. The tiles below are now totals over the
 *  real rows, and an empty catalog shows the empty state rather than six
 *  invented campaigns.
 */

type Campaign = RowOf<'campaigns'>

const CHANNEL_ICONS: Record<string, string> = {
  email: 'Mail',
  sms: 'MessageSquare',
  whatsapp: 'MessageCircle',
  social: 'Share2',
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  running: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  scheduled: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  paused: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  completed: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  draft: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
}

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.draft
}

export function MarketingHub() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: campaigns = [], isLoading, isError, error, refetch } = useCollection('campaigns')

  const activeCount = campaigns.filter((c) => c.status === 'running').length
  const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0)
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
  const totalBudget = campaigns.reduce((sum, c) => sum + parseSar(c.budget), 0)
  const conversionRate = totalReach ? `${((totalConversions / totalReach) * 100).toFixed(1)}%` : '0%'

  const kpis = [
    { label: t('Active Campaigns'), value: String(activeCount), icon: 'Megaphone', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Reach'), value: totalReach.toLocaleString('en-US'), icon: 'Eye', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Conversion Rate'), value: conversionRate, icon: 'TrendingUp', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Budget'), value: formatSar(totalBudget), icon: 'Wallet', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<Campaign>[] = [
    { header: 'Campaign', cell: (c) => <span className="font-medium text-heading">{t(c.name)}</span> },
    {
      header: 'Channel',
      cell: (c) => (
        <div className="flex items-center gap-1.5">
          <Icon name={CHANNEL_ICONS[c.type] ?? 'Megaphone'} size={14} className="text-muted" />
          <span className="text-body">{t(c.type)}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (c) => (
        <Badge background={statusStyle(c.status).bg} color={statusStyle(c.status).fg}>
          {t(c.status)}
        </Badge>
      ),
    },
    { header: 'Reach', cell: (c) => <span className="font-mono text-heading">{c.reach.toLocaleString('en-US')}</span> },
    { header: 'Conversions', cell: (c) => <span className="font-mono text-heading">{c.conversions.toLocaleString('en-US')}</span> },
    { header: 'Budget', cell: (c) => <Money sar={parseSar(c.budget)} /> },
  ]

  if (isLoading) return <Loading label="Loading campaigns..." />
  if (isError) {
    return (
      <Card className="p-6">
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      </Card>
    )
  }

  const table = (
    <DataTable
      caption="Marketing campaigns"
      columns={columns}
      rows={campaigns}
      rowKey={(c) => c.name}
      mobileCard={(c) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden>
                  <Icon name={CHANNEL_ICONS[c.type] ?? 'Megaphone'} size={14} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{t(c.name)}</p>
                  <p className="text-xs text-muted">{t(c.type)}</p>
                </div>
              </div>
            }
            trailing={
              <Badge background={statusStyle(c.status).bg} color={statusStyle(c.status).fg}>
                {t(c.status)}
              </Badge>
            }
          />
          <MobileCardRow label={t('Reach')} value={c.reach.toLocaleString('en-US')} />
          <MobileCardRow label={t('Conversions')} value={String(c.conversions)} />
          <MobileCardRow label={t('Budget')} value={<Money sar={parseSar(c.budget)} />} />
        </>
      )}
      empty={<EmptyState icon="Megaphone" title={t('No campaigns yet')} />}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Megaphone" title={t('Marketing Hub')} subtitle={t('Campaign overview')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <p className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Megaphone" title={t('Marketing Hub')} subtitle={t('Campaign overview and performance')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
