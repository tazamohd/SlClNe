import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_CAMPAIGNS = [
  { id: 'EC-001', name: 'Summer Service Special', subject: '20% Off All AC Services', recipients: 2450, sent: 2380, opened: 1428, clicked: 356, status: 'Completed', date: '2026-07-15' },
  { id: 'EC-002', name: 'Oil Change Reminder', subject: 'Your Vehicle is Due for Service', recipients: 1800, sent: 1780, opened: 1246, clicked: 534, status: 'Completed', date: '2026-07-28' },
  { id: 'EC-003', name: 'New Customer Welcome', subject: 'Welcome to SALIS AUTO', recipients: 320, sent: 320, opened: 256, clicked: 128, status: 'Active', date: '2026-08-01' },
  { id: 'EC-004', name: 'Parts Flash Sale', subject: 'Limited Time: 30% Off Parts', recipients: 3200, sent: 0, opened: 0, clicked: 0, status: 'Scheduled', date: '2026-08-20' },
  { id: 'EC-005', name: 'Loyalty Points Update', subject: 'Your Rewards Summary', recipients: 1560, sent: 1540, opened: 924, clicked: 231, status: 'Completed', date: '2026-07-01' },
  { id: 'EC-006', name: 'Workshop Newsletter', subject: 'Monthly Workshop Update', recipients: 4100, sent: 0, opened: 0, clicked: 0, status: 'Draft', date: '—' },
  { id: 'EC-007', name: 'Insurance Renewal', subject: 'Your Insurance is Expiring Soon', recipients: 680, sent: 670, opened: 469, clicked: 201, status: 'Completed', date: '2026-07-10' },
  { id: 'EC-008', name: 'Eid Service Offer', subject: 'Prepare Your Car for Eid', recipients: 5200, sent: 0, opened: 0, clicked: 0, status: 'Scheduled', date: '2026-09-15' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Completed: ['rgba(100,116,139,.1)', '#64748B'],
  Scheduled: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Draft: ['rgba(11,31,59,.1)', 'var(--salis-navy, #0B1F3B)'],
}

export function EmailMarketingCampaigns() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const filtered = MOCK_CAMPAIGNS

  const totalSent = MOCK_CAMPAIGNS.reduce((a, c) => a + c.sent, 0)
  const totalOpened = MOCK_CAMPAIGNS.reduce((a, c) => a + c.opened, 0)
  const totalClicked = MOCK_CAMPAIGNS.reduce((a, c) => a + c.clicked, 0)
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0
  const clickRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0

  const kpis = [
    { label: t('Total Campaigns'), value: String(MOCK_CAMPAIGNS.length), icon: 'Mail', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Emails Sent'), value: totalSent.toLocaleString(), icon: 'Send', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Open Rate'), value: `${openRate}%`, icon: 'Eye', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Click Rate'), value: `${clickRate}%`, icon: 'MousePointerClick', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Mail" title={t('Email Campaigns')} subtitle={t('Marketing')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {filtered.map(c => {
          const [bg, fg] = STATUS_COLORS[c.status] ?? STATUS_COLORS.Draft
          return (
            <MobileCard key={c.id}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Mail" size={14} /></span>
                    <div>
                      <p className="text-[13px] font-semibold text-heading">{c.name}</p>
                      <p className="text-xs text-muted">{c.subject}</p>
                    </div>
                  </div>
                }
                trailing={<Badge background={bg} color={fg}>{t(c.status)}</Badge>}
              />
              <MobileCardRow label={t('Recipients')}>{c.recipients.toLocaleString()}</MobileCardRow>
              <MobileCardRow label={t('Opened')}>{c.sent > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : '—'}</MobileCardRow>
            </MobileCard>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="Mail" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Email Campaigns')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Email marketing campaign management')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Subject')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Recipients')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Sent')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Open Rate')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Click Rate')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const [bg, fg] = STATUS_COLORS[c.status] ?? STATUS_COLORS.Draft
                const or = c.sent > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : '—'
                const cr = c.opened > 0 ? `${Math.round((c.clicked / c.opened) * 100)}%` : '—'
                return (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-medium text-heading">{c.name}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{c.subject}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{c.recipients.toLocaleString()}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{c.sent.toLocaleString()}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{or}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{cr}</td>
                    <td className="py-3"><Badge background={bg} color={fg}>{t(c.status)}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
