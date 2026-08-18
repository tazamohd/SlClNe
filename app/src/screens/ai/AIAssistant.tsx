import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AlertCircle, FileBarChart } from 'lucide-react'
import { cn } from '@/lib/cn'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** AI Assistant: conversational chat with SALIS AI.
 *
 *  Design-only screen (no backing collection in repository.ts) — the greeting,
 *  the six suggested prompts and their icon tones are the .dc.html prototype's
 *  fixed demo content, kept as local consts like the other design-only AI
 *  screens in this folder. `AlertCircle` and `FileBarChart` aren't in the
 *  shared icon registry (see Icon.tsx), so they're imported directly from
 *  lucide-react and rendered through SuggestionIcon below, same pattern as
 *  WorkflowBuilder's StepIcon.
 *
 *  The prototype's `messages` list is always empty (`hint-placeholder-count="0"`)
 *  and its send button has no wired handler — a static screenshot of a fresh
 *  chat. A conversational screen that cannot converse reads as broken rather
 *  than faithful, so the transcript and input here are genuinely live: sending
 *  a message (by typing or tapping a suggestion) appends a user bubble, shows
 *  a typing indicator — the screen's real loading state — then an assistant
 *  bubble. The prototype never defined reply content, so the reply is an
 *  explicit demo notice rather than invented analytics. The greeting and
 *  suggestions are the screen's empty state, shown until the first message. */

interface Suggestion {
  title: string
  desc: string
  icon: string
  bg: string
  fg: string
}

const SUGGESTIONS: readonly Suggestion[] = [
  {
    title: 'Revenue Analysis',
    desc: "Show me this month's revenue breakdown",
    icon: 'TrendingUp',
    bg: 'rgba(10,94,215,.1)',
    fg: '#0A5ED7',
  },
  {
    title: 'Low Stock Check',
    desc: 'Which parts need reordering?',
    icon: 'Package',
    bg: 'rgba(249,115,22,.1)',
    fg: '#F97316',
  },
  {
    title: 'Overdue Invoices',
    desc: 'List all overdue invoices this month',
    icon: 'AlertCircle',
    bg: 'rgba(249,115,22,.1)',
    fg: '#F97316',
  },
  {
    title: 'Technician Load',
    desc: 'Show technician workload distribution',
    icon: 'Users',
    bg: 'rgba(11,179,255,.1)',
    fg: '#0BB3FF',
  },
  {
    title: 'Customer Insights',
    desc: 'Top customers by revenue this quarter',
    icon: 'Heart',
    bg: 'rgba(11,31,59,.1)',
    fg: '#0B1F3B',
  },
  {
    title: 'Generate Report',
    desc: 'Create a monthly operations summary',
    icon: 'FileBarChart',
    bg: 'rgba(10,94,215,.1)',
    fg: '#0A5ED7',
  },
]

// Icons the prototype references that aren't in the shared registry —
// imported straight from lucide-react rather than added to ~230-glyph set.
const EXTRA_ICONS: Record<string, typeof AlertCircle> = { AlertCircle, FileBarChart }

function SuggestionIcon({ name, size }: { name: string; size: number }) {
  const Extra = EXTRA_ICONS[name]
  if (Extra) return <Extra size={size} strokeWidth={2} aria-hidden />
  return <Icon name={name} size={size} />
}

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
}

export function AIAssistant() {
  const { t } = usePreferences()
  const { userName } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  // Simulated latency so the typing indicator is a real (if brief) loading
  // state rather than an instant swap.
  useEffect(() => {
    if (!isTyping) return
    const timer = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: 'assistant',
          text: t(
            'This is a demo response — SALIS AI will analyze your live workshop data here once connected.'
          ),
        },
      ])
      setIsTyping(false)
    }, 700)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    setMessages((prev) => [...prev, { id: nextId.current++, role: 'user', text: trimmed }])
    setInput('')
    setIsTyping(true)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    send(input)
  }

  const initial = (userName.trim()[0] ?? 'U').toUpperCase()
  const hasConversation = messages.length > 0

  return (
    <>
      <FeatureHeader icon="Sparkles" title={t('AI Assistant')} subtitle={t('Conversational AI helper')} />

      <Card className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl">
        <div ref={scrollRef} className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-6">
          {!hasConversation ? (
            <>
              <div className="flex flex-col items-center justify-center gap-4 py-6 text-center sm:py-10">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-salis-gradient text-white shadow-[0_20px_30px_-8px_rgba(10,94,215,.35)]">
                  <Icon name="Sparkles" size={32} />
                </span>
                <h2 className="font-display text-xl font-black text-heading sm:text-2xl">
                  {t('How can I help you today?')}
                </h2>
                <p className="max-w-md text-sm text-muted">
                  {t(
                    'Ask me anything about your workshop — revenue, inventory, scheduling, or let me generate reports for you.'
                  )}
                </p>
              </div>

              <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => send(t(s.desc))}
                    className="flex cursor-pointer flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5 text-start transition-all duration-200 hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
                  >
                    <span
                      className="flex w-fit rounded-lg p-1.5"
                      style={{ background: s.bg, color: s.fg }}
                    >
                      <SuggestionIcon name={s.icon} size={14} />
                    </span>
                    <span className="text-[13px] font-medium text-heading">{t(s.title)}</span>
                    <span className="text-[11px] text-muted">{t(s.desc)}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      msg.role === 'user' ? 'bg-inset text-salis-blue' : 'bg-salis-gradient text-white'
                    )}
                  >
                    {msg.role === 'user' ? <span dir="ltr">{initial}</span> : <Icon name="Bot" size={16} />}
                  </span>
                  <div
                    className={cn(
                      'flex-1 rounded-2xl border px-4 py-3.5',
                      msg.role === 'user'
                        ? 'border-[rgba(10,94,215,.25)] bg-[rgba(10,94,215,.08)]'
                        : 'border-border bg-inset'
                    )}
                  >
                    <p className="text-sm leading-relaxed text-body">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping ? (
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-white">
                    <Icon name="Bot" size={16} />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-inset px-4 py-3.5">
                    <span className="sr-only">{t('SALIS AI is typing...')}</span>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-salis-blue" aria-hidden />
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-salis-blue [animation-delay:150ms]"
                      aria-hidden
                    />
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-salis-blue [animation-delay:300ms]"
                      aria-hidden
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border bg-sidebar p-3 sm:p-4">
          <div className="relative mx-auto flex max-w-3xl items-center">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('Ask SALIS AI anything...')}
              aria-label={t('Ask SALIS AI anything...')}
              disabled={isTyping}
              className="h-12 w-full rounded-2xl border-[1.5px] border-border bg-card ps-4 pe-14 text-sm text-heading outline-none transition-colors duration-200 focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.1)] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label={t('Send')}
              className="absolute end-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-salis-gradient text-white shadow-[0_4px_8px_rgba(10,94,215,.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="ArrowUp" size={18} />
            </button>
          </div>
        </form>
      </Card>
    </>
  )
}
