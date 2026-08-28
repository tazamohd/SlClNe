import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Message {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  channel: 'Email' | 'SMS' | 'WhatsApp' | 'System'
  read: boolean
  priority: 'High' | 'Normal' | 'Low'
}

const MESSAGES: Message[] = [
  { id: 'MSG-0421', from: 'Ahmed Al-Rashid', subject: 'Service appointment confirmation', preview: 'Please confirm my appointment for the oil change scheduled on Aug 20...', date: 'Aug 18, 2026', channel: 'WhatsApp', read: false, priority: 'High' },
  { id: 'MSG-0420', from: 'Gulf Motor Supply', subject: 'Order PO-2026-0849 shipped', preview: 'Your order of 30 brake pad sets has been dispatched via Aramex...', date: 'Aug 18, 2026', channel: 'Email', read: false, priority: 'Normal' },
  { id: 'MSG-0419', from: 'Khalid Mohammed', subject: 'Invoice query', preview: 'I have a question about the charges on INV-2026-1285...', date: 'Aug 17, 2026', channel: 'Email', read: true, priority: 'Normal' },
  { id: 'MSG-0418', from: 'System', subject: 'Low stock alert: Air Filters', preview: 'Air Filter (Hyundai) stock has fallen below reorder level...', date: 'Aug 17, 2026', channel: 'System', read: true, priority: 'High' },
  { id: 'MSG-0417', from: 'Fatima Al-Saud', subject: 'Vehicle pickup request', preview: 'When will my Nissan Patrol be ready for collection?', date: 'Aug 16, 2026', channel: 'SMS', read: true, priority: 'Normal' },
  { id: 'MSG-0416', from: 'System', subject: 'Appointment reminder', preview: 'Reminder: 5 appointments scheduled for tomorrow...', date: 'Aug 16, 2026', channel: 'System', read: true, priority: 'Low' },
  { id: 'MSG-0415', from: 'Al-Rajhi Auto Parts', subject: 'New price list available', preview: 'Our updated Q3 2026 price list is now available for download...', date: 'Aug 15, 2026', channel: 'Email', read: true, priority: 'Low' },
]

const CHANNEL_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  Email: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', icon: 'Mail' },
  SMS: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)', icon: 'Smartphone' },
  WhatsApp: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', icon: 'MessageCircle' },
  System: { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)', icon: 'Bell' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  High: { bg: 'var(--tint-orange)', fg: '#F97316' },
  Normal: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Low: { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)' },
}

export function PortalCommunications() {
  const { t } = usePreferences()

  const unreadCount = MESSAGES.filter((m) => !m.read).length

  const kpis = [
    { label: t('Total Messages'), value: '248', icon: 'MessageSquare', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Unread'), value: String(unreadCount), icon: 'Mail', bg: 'var(--tint-orange)', fg: '#F97316' },
    { label: t('Sent Today'), value: '12', icon: 'Send', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Response Rate'), value: '94%', icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Message>[] = [
    { header: t('From'), cell: (m) => m.from },
    { header: t('Subject'), cell: (m) => (
      <div>
        <p className={`text-sm ${m.read ? '' : 'font-semibold'}`}>{m.subject}</p>
        <p className="mt-0.5 text-xs text-muted">{m.preview.slice(0, 60)}...</p>
      </div>
    ) },
    { header: t('Channel'), cell: (m) => <Badge background={CHANNEL_STYLES[m.channel].bg} color={CHANNEL_STYLES[m.channel].fg}>{t(m.channel)}</Badge> },
    { header: t('Priority'), cell: (m) => <Badge background={PRIORITY_STYLES[m.priority].bg} color={PRIORITY_STYLES[m.priority].fg}>{t(m.priority)}</Badge> },
    { header: t('Date'), cell: (m) => m.date },
    { header: t('Status'), cell: (m) => m.read
      ? <span className="text-xs text-muted">{t('Read')}</span>
      : <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('Unread')}</Badge>
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="MessageSquare" title={t('Communications')} subtitle={t('Messages, notifications, and alerts')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Portal communications"
        columns={columns}
        rows={MESSAGES}
        rowKey={(m) => m.id}
        mobileCard={(m) => (
          <>
            <MobileCardHeader title={m.from} trailing={
              !m.read
                ? <span className="h-2.5 w-2.5 rounded-full bg-salis-blue" />
                : null
            } />
            <MobileCardRow label={t('Subject')}>{m.subject}</MobileCardRow>
            <MobileCardRow label={t('Channel')}>{t(m.channel)}</MobileCardRow>
            <MobileCardRow label={t('Priority')}>{t(m.priority)}</MobileCardRow>
            <MobileCardRow label={t('Date')}>{m.date}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
