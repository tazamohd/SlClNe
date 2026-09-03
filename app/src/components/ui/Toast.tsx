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
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

/** Corner toasts, matching the design's card treatment.
 *
 *  The prototypes showed one toast at a time; a bulk action, an optimistic
 *  save and its rollback all need to report at once, so this is a queue of up
 *  to three, newest at the bottom, each on its own timer. Error toasts are
 *  orange — the palette has no red (README §7) — and announced assertively;
 *  everything else is polite. An `action` (or `undo`) makes the toast the
 *  place a destructive change can be taken back, which the Definition of Done
 *  asks for on every delete. */
export type ToastTone = 'success' | 'error' | 'info' | 'progress'

export interface Toast {
  id: number
  title: string
  description?: string
  /** Kept for the 160-odd callers that predate `tone`. `error: true` reads as
   *  `tone: 'error'`. */
  error?: boolean
  tone?: ToastTone
  /** A single follow-up control — "View", "Retry". `label` is an English
   *  source string. */
  action?: { label: string; onClick: () => void }
  /** Sugar for `action: { label: 'Undo', onClick }`. */
  undo?: () => void
  /** Stays until dismissed. `progress` toasts are sticky by default. */
  sticky?: boolean
}

export type ToastInput = Omit<Toast, 'id'>

export interface ToastValue {
  /** Show a toast; returns its id so it can be updated or dismissed. */
  show: (toast: ToastInput, duration?: number) => number
  /** Patch a toast in place — a progress toast becoming a success. */
  update: (id: number, patch: Partial<ToastInput>, duration?: number) => void
  /** Dismiss one toast, or the newest when no id is given. */
  dismiss: (id?: number) => void
  /** Wrap a promise in loading → success/error toasts. Resolves or rejects
   *  exactly as the promise does; the toast is a side effect. */
  promise: <T>(
    work: Promise<T>,
    copy: { loading: string; success: string; error?: string }
  ) => Promise<T>
}

const ToastContext = createContext<ToastValue | null>(null)

const DEFAULT_DURATION = 3200
const MAX_VISIBLE = 3

function toneOf(toast: Pick<Toast, 'tone' | 'error'>): ToastTone {
  return toast.tone ?? (toast.error ? 'error' : 'success')
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = usePreferences()
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const remaining = useRef(new Map<number, number>())
  const nextId = useRef(1)

  const clearTimer = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
  }, [])

  const dismiss = useCallback<ToastValue['dismiss']>(
    (id) => {
      setToasts((current) => {
        const target = id ?? current[current.length - 1]?.id
        if (target === undefined) return current
        clearTimer(target)
        remaining.current.delete(target)
        return current.filter((toast) => toast.id !== target)
      })
    },
    [clearTimer]
  )

  const schedule = useCallback(
    (id: number, duration: number) => {
      clearTimer(id)
      if (duration <= 0 || !Number.isFinite(duration)) return
      remaining.current.set(id, duration)
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      )
    },
    [clearTimer, dismiss]
  )

  const show = useCallback<ToastValue['show']>(
    (input, duration) => {
      const id = nextId.current++
      const toast: Toast = { ...input, id }
      const sticky = toast.sticky ?? toneOf(toast) === 'progress'
      setToasts((current) => {
        const next = [...current, toast]
        // Oldest goes first when the stack is full — never the one just shown.
        const overflow = next.length - MAX_VISIBLE
        if (overflow > 0) {
          for (const dropped of next.slice(0, overflow)) clearTimer(dropped.id)
          return next.slice(overflow)
        }
        return next
      })
      if (!sticky) schedule(id, duration ?? DEFAULT_DURATION)
      return id
    },
    [clearTimer, schedule]
  )

  const update = useCallback<ToastValue['update']>(
    (id, patch, duration) => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, ...patch } : toast))
      )
      const sticky = patch.sticky ?? (patch.tone === 'progress')
      if (sticky) clearTimer(id)
      else schedule(id, duration ?? DEFAULT_DURATION)
    },
    [clearTimer, schedule]
  )

  const promise = useCallback<ToastValue['promise']>(
    (work, copy) => {
      const id = show({ title: t(copy.loading), tone: 'progress' })
      return work.then(
        (result) => {
          update(id, { title: t(copy.success), tone: 'success' })
          return result
        },
        (error: unknown) => {
          const message = error instanceof Error ? error.message : undefined
          update(id, {
            title: t(copy.error ?? 'Something went wrong'),
            description: message,
            tone: 'error',
          })
          throw error
        }
      )
    },
    [show, update, t]
  )

  // Hovering or focusing a toast pauses its clock: a user reading the undo
  // offer should not have it vanish under the pointer.
  const pause = useCallback(
    (id: number) => {
      clearTimer(id)
    },
    [clearTimer]
  )
  const resume = useCallback(
    (id: number) => {
      const left = remaining.current.get(id)
      if (left) schedule(id, Math.max(1200, left))
    },
    [schedule]
  )

  useEffect(() => {
    const active = timers.current
    return () => {
      for (const timer of active.values()) clearTimeout(timer)
    }
  }, [])

  const value = useMemo<ToastValue>(
    () => ({ show, update, dismiss, promise }),
    [show, update, dismiss, promise]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length ? (
        <div
          data-testid="toast-queue"
          className="pointer-events-none fixed bottom-4 end-4 z-toast flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2 sm:bottom-6 sm:end-6"
        >
          {toasts.map((toast) => (
            <ToastCard
              key={toast.id}
              toast={toast}
              onDismiss={() => dismiss(toast.id)}
              onPause={() => pause(toast.id)}
              onResume={() => resume(toast.id)}
            />
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

const TONE_ICON: Record<ToastTone, string> = {
  success: 'CheckCircle',
  error: 'AlertCircle',
  info: 'Info',
  progress: 'Loader',
}

function ToastCard({
  toast,
  onDismiss,
  onPause,
  onResume,
}: {
  toast: Toast
  onDismiss: () => void
  onPause: () => void
  onResume: () => void
}) {
  const { t } = usePreferences()
  const tone = toneOf(toast)
  const action = toast.action ?? (toast.undo ? { label: 'Undo', onClick: toast.undo } : undefined)
  const isError = tone === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      data-testid={`toast-${tone}`}
      tabIndex={-1}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocus={onPause}
      onBlur={onResume}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
      }}
      className={cn(
        'pointer-events-auto flex animate-fade-up items-start gap-3 rounded-lg border border-border bg-card px-4 py-3.5 shadow-lg motion-reduce:animate-none',
        isError && 'border-salis-orange/40'
      )}
    >
      <span
        className={cn(
          'flex flex-shrink-0 rounded p-1.5',
          isError ? 'bg-tint-orange text-salis-orange' : 'bg-salis-blue/[.12] text-salis-blue',
          tone === 'progress' && 'animate-pulse motion-reduce:animate-none'
        )}
      >
        <Icon name={TONE_ICON[tone]} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-heading">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-[13px] text-muted">{toast.description}</p>
        ) : null}
        {action ? (
          <button
            type="button"
            data-testid="toast-action"
            onClick={() => {
              action.onClick()
              onDismiss()
            }}
            className="mt-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-border bg-inset px-2.5 font-action text-xs font-semibold text-salis-blue transition-colors hover:border-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            {toast.undo && !toast.action ? <Icon name="Undo2" size={13} /> : null}
            {t(action.label)}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('Dismiss')}
        className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-inset hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <Icon name="X" size={14} />
      </button>
    </div>
  )
}

export function useToast(): ToastValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used within a ToastProvider')
  return value
}
