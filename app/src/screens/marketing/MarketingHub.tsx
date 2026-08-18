import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'

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
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Paused: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Completed: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Draft: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function MarketingHub() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [_filter] = useState('all')

  const kpis = [
    { label: t('Active Campaigns'), value: '12', icon: 'Megaphone', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Reach'), value: '45,200', icon: 'Eye', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Conversion Rate'), value: '3.8%', icon: 'TrendingUp', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Monthly Budget'), value: formatSar(25000), icon: 'Wallet', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

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
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {CAMPAIGNS.map((c) => (
          <MobileCard key={c.name}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={CHANNEL_ICONS[c.channel]} size={14} /></span>
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
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Megaphone" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Marketing Hub')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Campaign overview and performance')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Campaign')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Channel')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Reach')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Conversions')}</th>
                <th className="pb-3 text-end font-medium">{t('Budget')}</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c) => (
                <tr key={c.name} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{c.name}</td>
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name={CHANNEL_ICONS[c.channel]} size={14} className="text-muted" />
                      <span className="text-body">{t(c.channel)}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4">
                    <Badge background={STATUS_STYLES[c.status].bg} color={STATUS_STYLES[c.status].fg}>{t(c.status)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{c.reach.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{c.conversions.toLocaleString()}</td>
                  <td className="py-3 text-end"><Money sar={c.budget} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
