import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

interface ChatMessage {
  id: number
  sender: string
  text: string
  timestamp: string
  isAgent: boolean
}

const MESSAGES: ChatMessage[] = [
  { id: 1, sender: 'Ahmed Al-Rashid', text: 'Hi, I need help with my last service invoice. The total seems incorrect.', timestamp: '10:02 AM', isAgent: false },
  { id: 2, sender: 'Sara Al-Mutairi', text: 'Hello Ahmed! Let me pull up your invoice right away. Could you share the invoice number?', timestamp: '10:03 AM', isAgent: true },
  { id: 3, sender: 'Ahmed Al-Rashid', text: 'Sure, it is INV-1042. The brake pad replacement was charged twice.', timestamp: '10:04 AM', isAgent: false },
  { id: 4, sender: 'Sara Al-Mutairi', text: 'I can see the duplicate charge. I will create a credit note and send you the corrected invoice shortly.', timestamp: '10:06 AM', isAgent: true },
  { id: 5, sender: 'Ahmed Al-Rashid', text: 'Thank you! Also, can I reschedule my next service to next week?', timestamp: '10:07 AM', isAgent: false },
  { id: 6, sender: 'Sara Al-Mutairi', text: 'Absolutely. I have moved your appointment to Sunday, Aug 24 at 9:00 AM. You will receive an SMS confirmation.', timestamp: '10:09 AM', isAgent: true },
]

interface ActiveChat {
  id: number
  customer: string
  subject: string
  status: 'Active' | 'Waiting' | 'Resolved'
  lastMessage: string
  unread: number
}

const ACTIVE_CHATS: ActiveChat[] = [
  { id: 1, customer: 'Ahmed Al-Rashid', subject: 'Invoice query', status: 'Active', lastMessage: '2 min ago', unread: 3 },
  { id: 2, customer: 'Nora Al-Fahad', subject: 'Service booking', status: 'Waiting', lastMessage: '15 min ago', unread: 0 },
  { id: 3, customer: 'Khalid Mohammed', subject: 'Parts availability', status: 'Active', lastMessage: '20 min ago', unread: 1 },
  { id: 4, customer: 'Fatima Al-Saud', subject: 'Warranty claim', status: 'Resolved', lastMessage: '1 hour ago', unread: 0 },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Waiting: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Resolved: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function Chat() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [message, setMessage] = useState('')

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="MessageSquare" title={t('Live Chat')} subtitle={t('Customer support')} />
        {ACTIVE_CHATS.map((chat) => (
          <MobileCard key={chat.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-salis-gradient text-xs font-bold text-white">
                    {chat.customer[0]}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{chat.customer}</p>
                    <p className="text-xs text-muted">{chat.subject}</p>
                  </div>
                </div>
              }
              trailing={
                <div className="flex items-center gap-1.5">
                  {chat.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-salis-blue px-1 text-[10px] font-bold text-white">
                      {chat.unread}
                    </span>
                  )}
                  <Badge background={STATUS_STYLES[chat.status].bg} color={STATUS_STYLES[chat.status].fg}>{t(chat.status)}</Badge>
                </div>
              }
            />
            <p className="text-xs text-muted">{chat.lastMessage}</p>
          </MobileCard>
        ))}
        <div className="mt-2 rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold text-heading">{t('Quick Reply')}</p>
          <div className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('Type a message...')}
              aria-label={t('Type a message...')}
              inputSize="sm"
              className="flex-1"
            />
            <button type="button" aria-label={t('Send')} className="flex items-center justify-center rounded-lg bg-salis-gradient px-3 text-white focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2">
              <Icon name="Send" size={16} />
            </button>
          </div>
        </div>
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Live Chat')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Real-time customer support')}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Card className="w-80 flex-shrink-0 rounded-2xl p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-heading">{t('Conversations')}</p>
          <div className="flex flex-col gap-1">
            {ACTIVE_CHATS.map((chat) => (
              <div key={chat.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${chat.id === 1 ? 'bg-[rgba(10,94,215,.06)]' : 'hover:bg-surface-secondary'}`}>
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-xs font-bold text-white">
                  {chat.customer[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold text-heading">{chat.customer}</span>
                    {chat.unread > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-salis-blue px-1 text-[10px] font-bold text-white">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted">{chat.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-1 flex-col rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-5 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-salis-gradient text-xs font-bold text-white">A</span>
            <div>
              <p className="text-sm font-semibold text-heading">{ACTIVE_CHATS[0].customer}</p>
              <p className="text-xs text-muted">{ACTIVE_CHATS[0].subject}</p>
            </div>
            <div className="ms-auto">
              <Badge background={STATUS_STYLES.Active.bg} color={STATUS_STYLES.Active.fg}>{t('Active')}</Badge>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
            {MESSAGES.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isAgent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.isAgent ? 'bg-salis-gradient text-white' : 'bg-surface-secondary text-body'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`mt-1 text-[10px] ${msg.isAgent ? 'text-white/70' : 'text-muted'}`}>{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border px-5 py-3">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('Type a message...')}
              aria-label={t('Type a message...')}
              inputSize="md"
              className="flex-1"
            />
            <button type="button" aria-label={t('Send')} className="flex h-10 w-10 items-center justify-center rounded-xl bg-salis-gradient text-white shadow-sm focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2">
              <Icon name="Send" size={18} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
