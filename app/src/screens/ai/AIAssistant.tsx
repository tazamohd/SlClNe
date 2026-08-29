import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MobileCard, MobilePageHeader } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

interface Suggestion {
  icon: string
  title: string
  desc: string
  iconBg: string
  iconFg: string
}

function useSuggestions(t: (s: string) => string): Suggestion[] {
  return [
    { icon: 'TrendingUp', title: t('Revenue Analysis'), desc: t('Show me this month\'s revenue breakdown'), iconBg: 'var(--tint-blue)', iconFg: 'var(--salis-blue)' },
    { icon: 'Package', title: t('Low Stock Check'), desc: t('Which parts need reordering?'), iconBg: 'var(--tint-orange)', iconFg: 'var(--salis-orange)' },
    { icon: 'AlertCircle', title: t('Overdue Invoices'), desc: t('List all overdue invoices this month'), iconBg: 'var(--tint-orange)', iconFg: 'var(--salis-orange)' },
    { icon: 'Users', title: t('Technician Load'), desc: t('Show technician workload distribution'), iconBg: 'var(--tint-bright)', iconFg: 'var(--salis-blue-bright)' },
    { icon: 'Heart', title: t('Customer Insights'), desc: t('Top customers by revenue this quarter'), iconBg: 'var(--tint-navy)', iconFg: 'var(--text-heading)' },
    { icon: 'FileBarChart', title: t('Generate Report'), desc: t('Create a monthly operations summary'), iconBg: 'var(--tint-blue)', iconFg: 'var(--salis-blue)' },
  ]
}

export function AIAssistant() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const suggestions = useSuggestions(t)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now(), role: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    if (!isLive) {
      toast.show({ title: t('Connect the API') })
      return
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    sendMessage(suggestion.desc)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const greeting = (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-salis-blue opacity-25 blur-[20px]" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-salis-gradient text-white shadow-[0_20px_30px_rgba(10,94,215,.3)]">
          <Icon name="Sparkles" size={32} />
        </div>
      </div>
      <h2 className="font-display text-2xl font-black text-heading">
        {t('How can I help you today?')}
      </h2>
      <p className="max-w-[400px] text-center text-sm text-muted">
        {t('Ask me anything about your workshop — revenue, inventory, scheduling, or let me generate reports for you.')}
      </p>
    </div>
  )

  const suggestionGrid = (
    <div className={
      isMobile
        ? 'grid grid-cols-2 gap-3'
        : 'mx-auto grid w-full max-w-[720px] grid-cols-3 gap-3'
    }>
      {suggestions.map((s) => (
        <button
          key={s.title}
          type="button"
          onClick={() => handleSuggestionClick(s)}
          disabled={!isLive}
          className="flex cursor-pointer flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5 text-start transition-all hover:border-salis-blue/[.3] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          <span
            className="flex rounded-lg p-1.5"
            style={{ background: s.iconBg, color: s.iconFg }}
          >
            <Icon name={s.icon} size={14} />
          </span>
          <span className="text-[13px] font-medium text-heading">{s.title}</span>
          <span className="text-[11px] text-muted">{s.desc}</span>
        </button>
      ))}
    </div>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col motion-reduce:animate-none" style={{ height: 'calc(100dvh - 56px)' }}>
        <MobilePageHeader
          icon="Sparkles"
          title="SALIS AI"
          subtitle={t('AI Assistant')}
        />
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-5">
              {greeting}
              {suggestionGrid}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <MobileCard key={msg.id}>
                  <div className="flex gap-2.5">
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${msg.role === 'assistant' ? 'bg-salis-gradient' : 'bg-heading'}`}
                    >
                      {msg.role === 'assistant' ? 'AI' : 'U'}
                    </span>
                    <p className="text-sm leading-relaxed text-body">{msg.text}</p>
                  </div>
                </MobileCard>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="border-t border-border bg-card p-3">
          <div className="flex gap-2">
            <Input
              inputSize="md"
              placeholder={t('Ask SALIS AI anything...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!isLive}
              className="flex-1"
            />
            <Button type="submit" disabled={!isLive || !input.trim()} aria-label={t('Send')}>
              <Icon name="ArrowUp" size={18} />
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col motion-reduce:animate-none" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="flex items-center gap-2 border-b border-border bg-card px-6 py-3">
        <span className="flex rounded-lg bg-salis-gradient p-1.5 text-white">
          <Icon name="Sparkles" size={16} />
        </span>
        <span className="text-sm font-semibold text-heading">SALIS AI</span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" disabled={!isLive} aria-label={t('New Chat')}
          onClick={() => setMessages([])}>
          <Icon name="Plus" size={14} />
          {t('New Chat')}
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-5">
            {greeting}
            {suggestionGrid}
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${msg.role === 'assistant' ? 'bg-salis-gradient' : 'bg-heading'}`}
                >
                  {msg.role === 'assistant' ? 'AI' : 'U'}
                </span>
                <Card className="flex-1 rounded-[14px] p-3.5">
                  <p className="text-sm leading-relaxed text-body">{msg.text}</p>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-[720px] gap-2.5">
          <div className="relative flex flex-1 items-center">
            <Input
              inputSize="md"
              placeholder={t('Ask SALIS AI anything...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!isLive}
              className="w-full !rounded-[14px] !pe-14"
            />
            <button
              type="submit"
              disabled={!isLive || !input.trim()}
              aria-label={t('Send')}
              className="absolute end-1.5 flex h-9 w-9 items-center justify-center rounded-[10px] border-none bg-salis-gradient text-white shadow-[0_4px_8px_rgba(10,94,215,.2)] transition-opacity disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              <Icon name="ArrowUp" size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
