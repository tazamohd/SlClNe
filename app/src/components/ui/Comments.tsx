import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Avatar } from './Avatar'
import { Card } from './Card'
import { Icon } from './Icon'
import { Button } from './Button'

export interface Comment {
  id: string
  author: string
  avatar?: string
  role?: string
  text: string
  time: string
}

export interface CommentsProps {
  items: readonly Comment[]
  title?: string
  onAdd?: (text: string) => void
  className?: string
}

export function Comments({ items, title, onAdd, className }: CommentsProps) {
  const { t } = usePreferences()
  const [draft, setDraft] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed || !onAdd) return
    onAdd(trimmed)
    setDraft('')
  }

  return (
    <Card className={cn('flex flex-col gap-3.5 p-5', className)}>
      {title ? (
        <div className="flex items-center gap-2">
          <Icon name="MessageSquare" size={16} className="text-salis-blue" />
          <h2 className="text-sm font-bold text-heading">{t(title)}</h2>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        {items.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar name={c.avatar ?? c.author} />
            <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-heading">{c.author}</span>
                {c.role ? (
                  <span className="rounded-full bg-[rgba(10,94,215,.08)] px-2 py-0.5 text-[10px] font-medium text-salis-blue">
                    {t(c.role)}
                  </span>
                ) : null}
                <span className="ms-auto text-xs text-muted">{c.time}</span>
              </div>
              <p className="mt-1.5 text-sm text-body">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
      {onAdd ? (
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('Add a comment...')}
            aria-label={t('Add a comment')}
            className="h-9 flex-1 rounded-lg border border-border bg-inset px-3 text-sm text-heading outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          />
          <Button type="submit" size="sm" disabled={!draft.trim()}>
            {t('Post')}
          </Button>
        </form>
      ) : null}
    </Card>
  )
}
