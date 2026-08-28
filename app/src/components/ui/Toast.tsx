import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

/** Corner toast, matching the design's card treatment.
 *
 *  Error toasts are orange — the palette has no red (README §7). */
export interface Toast {
  id: number
  title: string
  description?: string
  error?: boolean
}

interface ToastValue {
  /** Show a toast; it dismisses itself after `duration` ms. */
  show: (toast: Omit<Toast, 'id'>, duration?: number) => void
  dismiss: () => void
}

const ToastContext = createContext<ToastValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = usePreferences()
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  // One toast at a time, like the prototypes — a new one replaces the old and
  // resets the timer rather than stacking.
  const show = useCallback<ToastValue['show']>((next, duration = 3200) => {
    clearTimeout(timer.current)
    setToast({ ...next, id: Date.now() })
    timer.current = setTimeout(() => setToast(null), duration)
  }, [])

  const dismiss = useCallback(() => {
    clearTimeout(timer.current)
    setToast(null)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          key={toast.id}
          className="fixed bottom-6 end-6 z-[100] flex min-w-[280px] animate-fade-up items-start gap-3 rounded-lg border border-border bg-card px-4 py-3.5 shadow-lg"
        >
          <span
            className={
              'flex flex-shrink-0 rounded p-1.5 ' +
              (toast.error
                ? 'bg-tint-orange text-salis-orange'
                : 'bg-salis-blue/[.12] text-salis-blue')
            }
          >
            <Icon name={toast.error ? 'AlertCircle' : 'CheckCircle'} size={18} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-heading">{toast.title}</p>
            {toast.description ? (
              <p className="mt-0.5 text-[13px] text-muted">{toast.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t('Dismiss')}
            className="flex cursor-pointer rounded border-none bg-transparent p-0 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used within a ToastProvider')
  return value
}
