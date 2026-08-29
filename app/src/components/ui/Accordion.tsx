import { createContext, useCallback, useContext, useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

interface AccordionContextValue {
  openItems: Set<string>
  toggle: (id: string) => void
  baseId: string
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

function useAccordionContext() {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('AccordionItem must be used inside <Accordion>')
  return ctx
}

export interface AccordionProps {
  children: ReactNode
  className?: string
  multiple?: boolean
  defaultOpen?: string[]
}

export function Accordion({ children, className, multiple, defaultOpen }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen ?? []))
  const baseId = useId()

  const toggle = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          if (!multiple) next.clear()
          next.add(id)
        }
        return next
      })
    },
    [multiple],
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggle, baseId }}>
      <div className={cn('divide-y divide-border rounded-lg border border-border', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export interface AccordionItemProps {
  id: string
  title: ReactNode
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function AccordionItem({ id, title, children, className, disabled }: AccordionItemProps) {
  const { openItems, toggle, baseId } = useAccordionContext()
  const isOpen = openItems.has(id)
  const triggerId = `${baseId}-trigger-${id}`
  const panelId = `${baseId}-panel-${id}`

  return (
    <div className={cn('first:rounded-t-lg last:rounded-b-lg', className)}>
      <button
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => toggle(id)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-3 text-start text-sm font-medium text-heading transition-colors hover:bg-inset',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span>{title}</span>
        <Icon
          name="ChevronDown"
          size={16}
          className={cn('text-muted transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="px-4 pb-4 text-sm text-body"
        >
          {children}
        </div>
      )}
    </div>
  )
}
