import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Card } from './Card'
import { Icon } from './Icon'
import { Badge } from './Badge'

export interface KanbanCard {
  id: string
  content: ReactNode
}

export interface KanbanColumn {
  id: string
  title: string
  icon?: string
  cards: readonly KanbanCard[]
  color?: string
}

export interface KanbanViewProps {
  columns: readonly KanbanColumn[]
  onCardClick?: (cardId: string, columnId: string) => void
  className?: string
}

const DEFAULT_BG = [
  'rgba(10,94,215,.08)',
  'var(--tint-orange)',
  'rgba(100,116,139,.08)',
  'rgba(10,94,215,.05)',
]

export function KanbanView({ columns, onCardClick, className }: KanbanViewProps) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  return (
    <div className={cn('flex gap-4', isMobile ? 'flex-col' : 'overflow-x-auto', className)}>
      {columns.map((col, ci) => (
        <Card
          key={col.id}
          className="flex min-w-[220px] flex-1 flex-col p-4"
          style={{ background: col.color ?? DEFAULT_BG[ci % DEFAULT_BG.length] }}
        >
          <div className="mb-3 flex items-center gap-2">
            {col.icon ? (
              <Icon name={col.icon} size={16} className="text-salis-blue" />
            ) : null}
            <h2 className="text-sm font-bold text-heading">{t(col.title)}</h2>
            <Badge background="var(--tint-blue)" color="var(--salis-blue)">
              {col.cards.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {col.cards.map((card) => (
              <Card
                key={card.id}
                className={cn(
                  'p-3 transition-shadow hover:shadow-md',
                  onCardClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue'
                )}
                onClick={onCardClick ? () => onCardClick(card.id, col.id) : undefined}
                tabIndex={onCardClick ? 0 : undefined}
                role={onCardClick ? 'button' : undefined}
                onKeyDown={onCardClick ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onCardClick(card.id, col.id)
                  }
                } : undefined}
              >
                {card.content}
              </Card>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
