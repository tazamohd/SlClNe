import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'start' | 'end'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  const show = () => {
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setVisible(true), 200)
  }

  const hide = () => {
    clearTimeout(timeout.current)
    setVisible(false)
  }

  const positionClass =
    side === 'bottom'
      ? 'top-full mt-1.5 start-1/2 -translate-x-1/2'
      : side === 'start'
        ? 'end-full me-1.5 top-1/2 -translate-y-1/2'
        : side === 'end'
          ? 'start-full ms-1.5 top-1/2 -translate-y-1/2'
          : 'bottom-full mb-1.5 start-1/2 -translate-x-1/2'

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-[var(--salis-navy)] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg',
            positionClass,
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
