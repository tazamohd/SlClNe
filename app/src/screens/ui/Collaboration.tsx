import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ListPageHeader } from '@/components/shell/ListPage'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Collaboration pattern-library screens: ActivityFeed, Comments, Messages.
 *
 *  Reference pages under `/ui/*`, rendered inside the standard AppShell —
 *  no design has a Mobile variant, so these just stay legible down to 390px
 *  rather than swapping layouts. Feed/thread/conversation data is local demo
 *  state mirroring the `.dc.html` fixtures; avatars are gradient initial
 *  circles per the design system, never remote images (README §7 — blue is
 *  the only "active" tone, orange the only warning). */

// ── Activity Feed ───────────────────────────────────────────────────────────

interface ActivityItem {
  user: string
  action: string
  detail: string
  time: string
  icon: string
  dotBg: string
  dotFg: string
}

const ACTIVITY_ITEMS: readonly ActivityItem[] = [
  { user: 'Khalid Al-Amri', action: 'created job card', detail: 'JC-A3F8B2C1 for Toyota Camry 2022', time: '2 min ago', icon: 'Plus', dotBg: '#0A5ED7', dotFg: 'var(--surface-card)' },
  { user: 'Yousef Al-Otaibi', action: 'updated status to In Progress', detail: 'Engine diagnostics started', time: '15 min ago', icon: 'Wrench', dotBg: '#0BB3FF', dotFg: 'var(--surface-card)' },
  { user: 'System', action: 'sent notification', detail: 'Low stock alert: Brake Pads (18 remaining)', time: '1 hour ago', icon: 'AlertTriangle', dotBg: '#F97316', dotFg: 'var(--surface-card)' },
  { user: 'Ahmed Al-Rashid', action: 'approved estimate', detail: 'EST-0231 — SAR 1,250 for maintenance', time: '2 hours ago', icon: 'Check', dotBg: '#0A5ED7', dotFg: 'var(--surface-card)' },
  { user: 'Fatima Al-Zahrani', action: 'scheduled appointment', detail: 'Layla Al-Sulaiman — Jul 25, 10:00 AM', time: '3 hours ago', icon: 'Calendar', dotBg: '#0BB3FF', dotFg: 'var(--surface-card)' },
  { user: 'System', action: 'generated invoice', detail: 'INV-2026-0142 — SAR 1,840', time: '4 hours ago', icon: 'FileText', dotBg: '#64748B', dotFg: 'var(--surface-card)' },
  { user: 'Omar Al-Ghamdi', action: 'added vehicle', detail: 'Hyundai Sonata 2023 — RUH 3357', time: 'Yesterday', icon: 'Car', dotBg: '#0B1F3B', dotFg: 'var(--surface-card)' },
]

export function UIActivityFeed() {
  const { t } = usePreferences()

  return (
    <>
      <ListPageHeader title={t('Activity Feed')} subtitle={t('UI Patterns')} />
      <div className="max-w-2xl border-s-2 border-border ps-5">
        {ACTIVITY_ITEMS.map((item) => (
          <div key={`${item.user}-${item.time}`} className="relative pb-5">
            <span
              className="absolute top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-page"
              style={{ background: item.dotBg, color: item.dotFg, insetInlineStart: '-29px' }}
            >
              {item.icon === 'AlertTriangle' ? (
                <AlertTriangle size={8} strokeWidth={2} aria-hidden />
              ) : (
                <Icon name={item.icon} size={8} />
              )}
            </span>
            <Card className="rounded-xl p-3.5">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-semibold text-heading">{item.user}</span>
                <span className="text-xs text-muted">{t(item.action)}</span>
              </div>
              <p className="m-0 text-xs text-body">{t(item.detail)}</p>
              <span className="mt-1 block text-[10px] text-faint" dir="ltr">
                {item.time}
              </span>
            </Card>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Comments ─────────────────────────────────────────────────────────────────

interface CommentItem {
  author: string
  initial: string
  role: string
  roleTone: readonly [string, string]
  time: string
  text: string
  likes: string
  nested: boolean
}

const COMMENT_ITEMS: readonly CommentItem[] = [
  { author: 'Fatima Al-Zahrani', initial: 'F', role: 'Service Advisor', roleTone: ['rgba(10,94,215,.1)', '#0A5ED7'], time: '2 hours ago', text: 'Customer approved the extra brake pad replacement over the phone. Estimate updated to SAR 1,250.', likes: '3', nested: false },
  { author: 'Yousef Al-Otaibi', initial: 'Y', role: 'Technician', roleTone: ['rgba(11,179,255,.1)', '#0BB3FF'], time: '1 hour ago', text: "Noted. Starting on the front pads now — should be done before 2 PM.", likes: '1', nested: true },
  { author: 'Ahmed Al-Rashid', initial: 'A', role: 'Customer', roleTone: ['rgba(100,116,139,.1)', '#64748B'], time: '45 min ago', text: "Thanks! Please also check the AC while it's in the bay.", likes: '0', nested: false },
  { author: 'Fatima Al-Zahrani', initial: 'F', role: 'Service Advisor', roleTone: ['rgba(10,94,215,.1)', '#0A5ED7'], time: '30 min ago', text: 'Added an AC diagnostic line item. No charge if nothing is found.', likes: '2', nested: true },
]

function Avatar({ initial }: { initial: string }) {
  return (
    <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-xs font-bold text-white">
      {initial}
    </span>
  )
}

export function UIComments() {
  const { t } = usePreferences()
  const [draft, setDraft] = useState('')

  return (
    <>
      <ListPageHeader title={t('Comments')} subtitle={t('UI Patterns')} />
      <Card className="max-w-3xl rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex rounded-[10px] bg-[rgba(10,94,215,.08)] p-2 text-salis-blue">
            <Icon name="MessageSquare" size={16} />
          </span>
          <h2 className="m-0 text-base font-bold text-heading">{t('Job Card JC-A3F8B2C1')}</h2>
          <Badge background="rgba(10,94,215,.08)" color="var(--salis-blue)">
            {COMMENT_ITEMS.length}
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {COMMENT_ITEMS.map((comment, index) => (
            <div
              key={`${comment.author}-${index}`}
              className={cn('flex gap-3', comment.nested && 'ms-[46px]')}
            >
              <Avatar initial={comment.initial} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-heading">{comment.author}</span>
                  <Badge background={comment.roleTone[0]} color={comment.roleTone[1]}>
                    {t(comment.role)}
                  </Badge>
                  <span className="text-[11px] text-faint" dir="ltr">
                    {comment.time}
                  </span>
                </div>
                <p className="m-0 text-[13px] leading-relaxed text-body">{t(comment.text)}</p>
                <div className="mt-1.5 flex gap-3.5">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-action text-[11px] font-medium text-salis-blue"
                  >
                    <Icon name="CornerDownRight" size={11} />
                    {t('Reply')}
                  </button>
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-action text-[11px] font-medium text-muted"
                  >
                    <Icon name="ThumbsUp" size={11} />
                    {comment.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2.5 border-t border-border pt-4.5">
          <Avatar initial="K" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t('Write a comment...')}
            aria-label={t('Write a comment...')}
            className="h-10 flex-1 rounded-[10px] border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
          />
          <Button size="md" disabled={!draft.trim()}>
            {t('Post')}
          </Button>
        </div>
      </Card>
    </>
  )
}

// ── Messages ─────────────────────────────────────────────────────────────────

interface ConversationItem {
  name: string
  initial: string
  preview: string
  time: string
  unreadCount: number
}

const CONVERSATIONS: readonly ConversationItem[] = [
  { name: 'Ahmed Al-Rashid', initial: 'A', preview: 'Great, thank you!', time: '10:33 AM', unreadCount: 0 },
  { name: 'Fatima Al-Zahrani', initial: 'F', preview: 'Is the part available?', time: '9:15 AM', unreadCount: 2 },
  { name: 'Omar Al-Ghamdi', initial: 'O', preview: "I'll bring the car tomorrow", time: 'Yesterday', unreadCount: 0 },
  { name: 'Mohammed Hassan', initial: 'M', preview: 'Please send the invoice', time: 'Jul 20', unreadCount: 1 },
  { name: 'Sara Al-Mutairi', initial: 'S', preview: 'Thanks for the great service', time: 'Jul 19', unreadCount: 0 },
]

interface ChatBubble {
  from: 'them' | 'me'
  text: string
  time: string
}

const CHAT_TRANSCRIPT: readonly ChatBubble[] = [
  { from: 'them', text: 'Hi, when will my car be ready?', time: '10:30 AM' },
  { from: 'me', text: 'Your Camry is in the QC stage now. Should be ready by 4 PM today.', time: '10:32 AM' },
  { from: 'them', text: 'Great, thank you!', time: '10:33 AM' },
]

export function UIMessages() {
  const { t } = usePreferences()
  const [active, setActive] = useState(0)
  const [message, setMessage] = useState('')

  return (
    <>
      <ListPageHeader title={t('Messages')} subtitle={t('UI Patterns')} />
      <div className="flex h-auto flex-col gap-5 lg:h-[calc(100vh-13rem)] lg:min-h-[420px] lg:flex-row">
        <Card className="flex w-full flex-shrink-0 flex-col overflow-hidden rounded-2xl lg:max-w-[300px]">
          <div className="border-b border-border p-3.5">
            <span className="relative flex items-center">
              <Icon name="Search" size={14} className="pointer-events-none absolute text-muted start-2.5" />
              <input
                placeholder={t('Search messages...')}
                aria-label={t('Search messages...')}
                className="h-9 w-full rounded-lg border border-border bg-inset ps-8 pe-2.5 text-xs text-heading outline-none focus:border-salis-blue"
              />
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CONVERSATIONS.map((conversation, index) => (
              <button
                key={conversation.name}
                type="button"
                onClick={() => setActive(index)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 border-0 border-b border-border bg-transparent p-3 text-start',
                  'transition-colors hover:bg-[rgba(10,94,215,.04)]',
                  active === index && 'bg-[rgba(10,94,215,.04)]'
                )}
              >
                <Avatar initial={conversation.initial} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-heading">
                      {conversation.name}
                    </span>
                    <span className="flex-shrink-0 text-[10px] text-muted" dir="ltr">
                      {conversation.time}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {t(conversation.preview)}
                  </span>
                </span>
                {conversation.unreadCount > 0 ? (
                  <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[9px] font-bold text-white">
                    {conversation.unreadCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-1 flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2.5 border-b border-border p-3.5 px-4.5">
            <Avatar initial={CONVERSATIONS[active].initial} />
            <div>
              <p className="m-0 text-sm font-semibold text-heading">{CONVERSATIONS[active].name}</p>
              <p className="m-0 text-[11px] text-salis-blue">{t('Online')}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4.5">
            {CHAT_TRANSCRIPT.map((bubble, index) => (
              <div
                key={index}
                className={cn(
                  'max-w-[70%] rounded-[14px] px-4 py-3',
                  bubble.from === 'me'
                    ? 'self-end rounded-ee-[4px] bg-salis-gradient text-white'
                    : 'self-start rounded-ss-[4px] border border-border bg-inset text-body'
                )}
              >
                <p className="m-0 text-[13px]">{t(bubble.text)}</p>
                <span
                  className={cn('mt-1 block text-[10px]', bubble.from === 'me' ? 'text-white/70' : 'text-faint')}
                  dir="ltr"
                >
                  {bubble.time}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 border-t border-border p-3.5 px-4.5">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t('Type a message...')}
              aria-label={t('Type a message...')}
              className="h-10 flex-1 rounded-[10px] border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
            />
            <button
              type="button"
              disabled={!message.trim()}
              aria-label={t('Send')}
              className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-none bg-salis-gradient text-white disabled:opacity-50"
            >
              <Icon name="Send" size={16} />
            </button>
          </div>
        </Card>
      </div>
    </>
  )
}
