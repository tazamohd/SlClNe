import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { cycleFocus, focusFirst } from '@/lib/focusTrap'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  side?: 'start' | 'end'
  width?: string
  className?: string
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'end',
  width = 'w-80',
  className,
}: DrawerProps) {
  const { t } = usePreferences()
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      const el = drawerRef.current
      if (el) cycleFocus(el, e)
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    requestAnimationFrame(() => focusFirst(drawerRef.current))
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus.current?.focus()
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label={t('Close')}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative flex flex-col bg-card shadow-xl',
          width,
          'max-h-full overflow-y-auto',
          side === 'end' ? 'ms-auto' : 'me-auto',
          'animate-fade-up motion-reduce:animate-none',
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-base font-bold text-heading">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('Close')}
              className="flex rounded-lg p-1 text-muted hover:bg-inset hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
