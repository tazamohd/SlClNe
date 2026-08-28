import { useEffect, useRef, useState, type FormEvent } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

interface ChatMessage {
  id: number
  role: 'user' | 'bot'
  text: string
  ts: string
}

const QUICK_REPLIES = [
  'What are your opening hours?',
  'I need to book a service',
  'Track my vehicle status',
  'Request a quote',
  'Speak to a human agent',
  'View my service history',
] as const

export function AIChatbot() {
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

  useEffect(() => {
    if (!isTyping) return
    const timer = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: 'bot',
          text: t(
            'This is a demo response. Once the chatbot service is connected, I will provide real answers to customer queries using your workshop knowledge base.'
          ),
          ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsTyping(false)
    }, 800)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    setMessages((prev) => [
      ...prev,
      {
        id: nextId.current++,
        role: 'user',
        text: trimmed,
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
    setIsTyping(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  const initial = (userName.trim()[0] ?? 'U').toUpperCase()
  const hasConversation = messages.length > 0

  return (
    <>
      <FeatureHeader
        icon="MessageCircle"
        title={t('AI Chatbot')}
        subtitle={t('Customer & staff conversational interface')}
      />

      <Card className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-salis-gradient text-white">
            <Icon name="Bot" size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-heading">{t('SALIS Support Bot')}</p>
            <p className="text-xs text-muted">{t('Online')}</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
          {!hasConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-salis-gradient text-white shadow-[0_20px_30px_-8px_rgba(10,94,215,.35)]">
                <Icon name="MessageCircle" size={32} />
              </span>
              <div>
                <h2 className="font-display text-xl font-black text-heading">
                  {t('Welcome! How can I help?')}
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted">
                  {t('Ask me about services, appointments, vehicle status, or anything else.')}
                </p>
              </div>
              <div className="flex max-w-lg flex-wrap justify-center gap-2">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => send(t(qr))}
                    className="cursor-pointer rounded-full border border-border bg-card px-3.5 py-2 text-[13px] text-body transition-colors hover:border-[rgba(10,94,215,.3)] hover:text-salis-blue"
                  >
                    {t(qr)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      msg.role === 'user'
                        ? 'bg-inset text-salis-blue'
                        : 'bg-salis-gradient text-white'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <span dir="ltr">{initial}</span>
                    ) : (
                      <Icon name="Bot" size={16} />
                    )}
                  </span>
                  <div className="flex flex-col gap-1">
                    <div
                      className={cn(
                        'flex-1 rounded-2xl border px-4 py-3',
                        msg.role === 'user'
                          ? 'border-[rgba(10,94,215,.25)] bg-[rgba(10,94,215,.08)]'
                          : 'border-border bg-inset'
                      )}
                    >
                      <p className="text-sm leading-relaxed text-body">{msg.text}</p>
                    </div>
                    <span className="px-1 text-[11px] text-muted">{msg.ts}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-white">
                    <Icon name="Bot" size={16} />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-inset px-4 py-3">
                    <span className="sr-only">{t('Bot is typing...')}</span>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-salis-blue" aria-hidden />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-salis-blue [animation-delay:150ms]" aria-hidden />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-salis-blue [animation-delay:300ms]" aria-hidden />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border bg-sidebar p-3 sm:p-4">
          <div className="relative mx-auto flex max-w-3xl items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Type your message...')}
              aria-label={t('Type your message...')}
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
