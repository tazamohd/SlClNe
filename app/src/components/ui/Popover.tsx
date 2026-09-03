import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { focusFirst } from '@/lib/focusTrap'

export interface PopoverProps {
  /** The control that opens the panel. It is wrapped, not cloned, so any
   *  element works; the wrapper carries the toggle. */
  trigger: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'start' | 'end'
  align?: 'start' | 'center' | 'end'
  /** Close after any click inside the panel — right for a menu of actions,
   *  wrong for a filter panel. Defaults to `true`. */
  closeOnSelect?: boolean
  className?: string
  contentClassName?: string
}

/** Small anchored panel: an overflow menu, a filter tray, a picker.
 *
 *  Opens on the trigger only — the previous version toggled on any click in
 *  its container, so a click on a checkbox inside the panel closed it. Escape
 *  and an outside click close it; focus moves into the panel on open and back
 *  to the trigger on close, so a keyboard user is never stranded. */
export function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'start',
  closeOnSelect = true,
  className,
  contentClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        triggerRef.current?.querySelector<HTMLElement>('button, [href], [tabindex]')?.focus()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    requestAnimationFrame(() => focusFirst(panelRef.current))
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, close])

  const alignClass =
    align === 'center'
      ? 'start-1/2 -translate-x-1/2'
      : align === 'end'
        ? 'end-0'
        : 'start-0'

  const sideClass =
    side === 'top'
      ? 'bottom-full mb-2'
      : side === 'start'
        ? 'end-full me-2 top-0'
        : side === 'end'
          ? 'start-full ms-2 top-0'
          : 'top-full mt-2'

  return (
    <div ref={containerRef} role="group" className={cn('relative inline-flex', className)}>
      <span
        ref={triggerRef}
        className="contents"
        onClick={() => setOpen((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        role="presentation"
        tabIndex={-1}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {trigger}
      </span>
      {open && (
        <div
          id={panelId}
          ref={panelRef}
          tabIndex={-1}
          onClick={closeOnSelect ? close : undefined}
          role="presentation"
          className={cn(
            'absolute z-40 min-w-[180px] rounded-lg border border-border bg-card p-3 shadow-lg outline-none',
            sideClass,
            side === 'top' || side === 'bottom' ? alignClass : '',
            'animate-fade-up motion-reduce:animate-none',
            contentClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
