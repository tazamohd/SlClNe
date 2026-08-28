import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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

type Campaign = (typeof MOCK_CAMPAIGNS)[number]

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Completed: ['rgba(100,116,139,.1)', '#64748B'],
  Scheduled: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Draft: ['rgba(11,31,59,.1)', 'var(--salis-navy, #0B1F3B)'],
}

export function EmailMarketingCampaigns() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

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

  const columns: Column<Campaign>[] = [
    { header: 'Campaign', cell: (c) => <span className="font-medium text-heading">{c.name}</span> },
    { header: 'Subject', cell: (c) => <span className="text-[13px] text-muted">{c.subject}</span> },
    { header: 'Recipients', cell: (c) => <span className="font-mono text-[13px] text-heading">{c.recipients.toLocaleString()}</span> },
    { header: 'Sent', cell: (c) => <span className="font-mono text-[13px] text-heading">{c.sent.toLocaleString()}</span> },
    { header: 'Open Rate', cell: (c) => <span className="font-mono text-[13px] text-heading">{c.sent > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : '--'}</span> },
    { header: 'Click Rate', cell: (c) => <span className="font-mono text-[13px] text-heading">{c.opened > 0 ? `${Math.round((c.clicked / c.opened) * 100)}%` : '--'}</span> },
    {
      header: 'Status',
      cell: (c) => {
        const [bg, fg] = STATUS_COLORS[c.status] ?? STATUS_COLORS.Draft
        return <Badge background={bg} color={fg}>{t(c.status)}</Badge>
      },
    },
  ]

  const table = (
    <DataTable
      caption="Email campaigns"
      columns={columns}
      rows={MOCK_CAMPAIGNS as unknown as Campaign[]}
      rowKey={(c) => c.id}
      mobileCard={(c) => {
        const [bg, fg] = STATUS_COLORS[c.status] ?? STATUS_COLORS.Draft
        return (
          <>
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
            <MobileCardRow label={t('Opened')}>{c.sent > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : '--'}</MobileCardRow>
          </>
        )
      }}
    />
  )

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
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <PageHeader icon="Mail" title={t('Email Campaigns')} subtitle={t('Email marketing campaign management')} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
