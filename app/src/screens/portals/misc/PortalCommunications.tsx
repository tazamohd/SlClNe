import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Email: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', icon: 'Mail' },
  SMS: { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)', icon: 'Smartphone' },
  WhatsApp: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', icon: 'MessageCircle' },
  System: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)', icon: 'Bell' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  High: { bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
  Normal: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Low: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function PortalCommunications() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const unreadCount = MESSAGES.filter((m) => !m.read).length

  const kpis = [
    { label: t('Total Messages'), value: '248', icon: 'MessageSquare', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Unread'), value: String(unreadCount), icon: 'Mail', bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
    { label: t('Sent Today'), value: '12', icon: 'Send', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Response Rate'), value: '94%', icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="MessageSquare" title={t('Communications')} subtitle={t('Messages & notifications')} />
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
        {MESSAGES.map((m) => (
          <MobileCard key={m.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: CHANNEL_STYLES[m.channel].bg, color: CHANNEL_STYLES[m.channel].fg }} aria-hidden>
                    <Icon name={CHANNEL_STYLES[m.channel].icon} size={14} />
                  </span>
                  <div>
                    <p className={`text-[13px] font-semibold ${m.read ? 'text-heading' : 'text-salis-blue'}`}>{m.from}</p>
                    <p className="text-xs text-muted">{m.subject}</p>
                  </div>
                </div>
              }
              trailing={
                !m.read
                  ? <span className="h-2.5 w-2.5 rounded-full bg-salis-blue" />
                  : null
              }
            />
            <MobileCardRow label={t('Channel')} value={t(m.channel)} />
            <MobileCardRow label={t('Priority')} value={t(m.priority)} />
            <MobileCardRow label={t('Date')} value={m.date} />
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
            <Icon name="MessageSquare" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Communications')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Messages, notifications, and alerts')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('From')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Subject')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Channel')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Priority')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {MESSAGES.map((m) => (
                <tr key={m.id} className="border-b border-border/50">
                  <td className={`py-3 pe-4 font-medium ${m.read ? 'text-heading' : 'text-salis-blue'}`}>{m.from}</td>
                  <td className="py-3 pe-4 text-body">
                    <p className={`text-sm ${m.read ? '' : 'font-semibold'}`}>{m.subject}</p>
                    <p className="mt-0.5 text-xs text-muted">{m.preview.slice(0, 60)}...</p>
                  </td>
                  <td className="py-3 pe-4">
                    <Badge background={CHANNEL_STYLES[m.channel].bg} color={CHANNEL_STYLES[m.channel].fg}>{t(m.channel)}</Badge>
                  </td>
                  <td className="py-3 pe-4">
                    <Badge background={PRIORITY_STYLES[m.priority].bg} color={PRIORITY_STYLES[m.priority].fg}>{t(m.priority)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-muted">{m.date}</td>
                  <td className="py-3">
                    {m.read
                      ? <span className="text-xs text-muted">{t('Read')}</span>
                      : <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Unread')}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
