import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface ChatMetric {
  label: string
  value: string
  icon: string
  change: string
}

const METRICS: ChatMetric[] = [
  { label: 'Active Chats', value: '12', icon: 'MessageSquare', change: '+3 today' },
  { label: 'Avg. Response Time', value: '1.8 min', icon: 'Clock', change: '-0.4 min' },
  { label: 'Resolved Today', value: '34', icon: 'CheckCircle', change: '+8 vs yesterday' },
  { label: 'Customer Rating', value: '4.7', icon: 'Star', change: '+0.2 this week' },
]

interface RecentChat {
  id: string
  customer: string
  agent: string
  subject: string
  status: 'Active' | 'Waiting' | 'Resolved' | 'Escalated'
  duration: string
  messages: number
}

const RECENT_CHATS: RecentChat[] = [
  { id: 'CH-001', customer: 'Ahmed Al-Rashid', agent: 'Sara Al-Mutairi', subject: 'Invoice correction', status: 'Active', duration: '8 min', messages: 6 },
  { id: 'CH-002', customer: 'Nora Al-Fahad', agent: 'Omar Hassan', subject: 'Service scheduling', status: 'Waiting', duration: '15 min', messages: 4 },
  { id: 'CH-003', customer: 'Khalid Mohammed', agent: 'Sara Al-Mutairi', subject: 'Parts inquiry', status: 'Active', duration: '5 min', messages: 3 },
  { id: 'CH-004', customer: 'Fatima Al-Saud', agent: 'Tariq Al-Dosari', subject: 'Warranty status', status: 'Resolved', duration: '22 min', messages: 11 },
  { id: 'CH-005', customer: 'Yusuf Ibrahim', agent: 'Omar Hassan', subject: 'Recall notification', status: 'Escalated', duration: '30 min', messages: 14 },
  { id: 'CH-006', customer: 'Layla Al-Otaibi', agent: 'Sara Al-Mutairi', subject: 'Payment issue', status: 'Resolved', duration: '12 min', messages: 7 },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Waiting: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Resolved: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Escalated: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function SupportChatDashboard() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const columns: Column<RecentChat>[] = [
    { header: 'ID', cell: (chat) => <span className="font-mono text-xs text-muted">{chat.id}</span> },
    { header: 'Customer', cell: (chat) => <span className="font-semibold text-heading">{chat.customer}</span> },
    { header: 'Agent', cell: (chat) => chat.agent },
    { header: 'Subject', cell: (chat) => chat.subject },
    { header: 'Duration', cell: (chat) => chat.duration },
    { header: 'Messages', cell: (chat) => chat.messages },
    { header: 'Status', cell: (chat) => <Badge background={STATUS_STYLES[chat.status].bg} color={STATUS_STYLES[chat.status].fg}>{t(chat.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Recent conversations"
      columns={columns}
      rows={RECENT_CHATS}
      rowKey={(chat) => chat.id}
      mobileCard={(chat) => (
        <>
          <MobileCardHeader
            title={chat.customer}
            trailing={<Badge background={STATUS_STYLES[chat.status].bg} color={STATUS_STYLES[chat.status].fg}>{t(chat.status)}</Badge>}
          />
          <MobileCardRow label={t('Agent')} value={chat.agent} />
          <MobileCardRow label={t('Subject')} value={chat.subject} />
          <MobileCardRow label={t('Duration')} value={chat.duration} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Headset" title={t('Support Dashboard')} subtitle={t('Chat metrics & activity')} />
        <div className="grid grid-cols-2 gap-3">
          {METRICS.map((m) => (
            <Card key={m.label} className="rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                  <Icon name={m.icon} size={14} />
                </span>
                <span className="text-xs text-muted">{t(m.label)}</span>
              </div>
              <p className="mt-1 text-lg font-bold text-heading">{m.value}</p>
              <p className="text-[11px] text-muted">{t(m.change)}</p>
            </Card>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Headset" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Support Chat Dashboard')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Overview of chat support performance')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <Card key={m.label} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex rounded-xl p-2.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                <Icon name={m.icon} size={20} />
              </span>
              <div>
                <p className="text-xs text-muted">{t(m.label)}</p>
                <p className="text-xl font-bold text-heading">{m.value}</p>
                <p className="text-[11px] text-muted">{t(m.change)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {table}
    </div>
  )
}
