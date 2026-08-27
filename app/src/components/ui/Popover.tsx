import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface PopoverProps {
  trigger: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'start' | 'end'
  align?: 'start' | 'center' | 'end'
  className?: string
  contentClassName?: string
}

export function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'start',
  className,
  contentClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
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
    <div ref={containerRef} className={cn('relative inline-flex', className)} onClick={() => setOpen((p) => !p)} role="group" tabIndex={-1}>
      {trigger}
      {open && (
        <div
          className={cn(
            'absolute z-40 min-w-[180px] rounded-lg border border-border bg-card p-3 shadow-lg',
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
