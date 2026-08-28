import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'

interface Campaign {
  name: string
  channel: 'Email' | 'SMS' | 'WhatsApp' | 'Social'
  status: 'Active' | 'Paused' | 'Completed' | 'Draft'
  reach: number
  conversions: number
  budget: number
}

const CAMPAIGNS: Campaign[] = [
  { name: 'Summer Service Special', channel: 'Email', status: 'Active', reach: 12400, conversions: 186, budget: 5000 },
  { name: 'Ramadan Offer SMS', channel: 'SMS', status: 'Completed', reach: 8900, conversions: 267, budget: 3500 },
  { name: 'WhatsApp Follow-up', channel: 'WhatsApp', status: 'Active', reach: 6200, conversions: 124, budget: 2000 },
  { name: 'Instagram Ad Campaign', channel: 'Social', status: 'Active', reach: 9800, conversions: 98, budget: 7500 },
  { name: 'Loyalty Rewards Blast', channel: 'Email', status: 'Paused', reach: 4300, conversions: 64, budget: 1500 },
  { name: 'New Branch Opening', channel: 'Social', status: 'Draft', reach: 0, conversions: 0, budget: 5500 },
]

const CHANNEL_ICONS: Record<string, string> = {
  Email: 'Mail',
  SMS: 'MessageSquare',
  WhatsApp: 'MessageCircle',
  Social: 'Share2',
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Paused: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Completed: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Draft: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
}

export function MarketingHub() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [_filter] = useState('all')

  const kpis = [
    { label: t('Active Campaigns'), value: '12', icon: 'Megaphone', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Reach'), value: '45,200', icon: 'Eye', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Conversion Rate'), value: '3.8%', icon: 'TrendingUp', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Monthly Budget'), value: formatSar(25000), icon: 'Wallet', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<Campaign>[] = [
    { header: 'Campaign', cell: (c) => <span className="font-medium text-heading">{c.name}</span> },
    {
      header: 'Channel',
      cell: (c) => (
        <div className="flex items-center gap-1.5">
          <Icon name={CHANNEL_ICONS[c.channel]} size={14} className="text-muted" />
          <span className="text-body">{t(c.channel)}</span>
        </div>
      ),
    },
    { header: 'Status', cell: (c) => <Badge background={STATUS_STYLES[c.status].bg} color={STATUS_STYLES[c.status].fg}>{t(c.status)}</Badge> },
    { header: 'Reach', cell: (c) => <span className="font-mono text-heading">{c.reach.toLocaleString()}</span> },
    { header: 'Conversions', cell: (c) => <span className="font-mono text-heading">{c.conversions.toLocaleString()}</span> },
    { header: 'Budget', cell: (c) => <Money sar={c.budget} /> },
  ]

  const table = (
    <DataTable
      caption="Marketing campaigns"
      columns={columns}
      rows={CAMPAIGNS}
      rowKey={(c) => c.name}
      mobileCard={(c) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-[var(--tint-blue)] p-1.5 text-salis-blue" aria-hidden><Icon name={CHANNEL_ICONS[c.channel]} size={14} /></span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{c.name}</p>
                  <p className="text-xs text-muted">{t(c.channel)}</p>
                </div>
              </div>
            }
            trailing={<Badge background={STATUS_STYLES[c.status].bg} color={STATUS_STYLES[c.status].fg}>{t(c.status)}</Badge>}
          />
          <MobileCardRow label={t('Reach')} value={c.reach.toLocaleString()} />
          <MobileCardRow label={t('Conversions')} value={String(c.conversions)} />
          <MobileCardRow label={t('Budget')} value={<Money sar={c.budget} />} />
        </>
      )}
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
