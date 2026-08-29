import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Button } from './Button'
import { Icon } from './Icon'

/** The dialog system, covering the six families the design ships as
 *  `UI.Modals.*.dc.html`.
 *
 *  The bundle draws them as static cards in a grid, so none of the behaviour a
 *  dialog needs is in the prototypes: focus never moved, Escape did nothing, the
 *  page behind kept scrolling, and closing left focus on `<body>`. All of that is
 *  here instead, once.
 *
 *  Two layouts carry all six families. `panel` is the header/body/footer card
 *  (Add Customer, Assign Technician, Filter Builder, Scan Barcode); `centred` is
 *  the medallion-and-two-lines confirmation (Delete Job Card?, Deactivate User?,
 *  Session Expiring). Each family only picks a default layout and a width. */

export type ModalVariant = 'crud' | 'lifecycle' | 'status' | 'actions' | 'data' | 'capture'
export type ModalLayout = 'panel' | 'centred'

/** Widths follow the density of each family: the data modals hold a filter
 *  builder with three selects on a row, the status modals hold one sentence. */
const VARIANTS: Record<ModalVariant, { width: string; layout: ModalLayout }> = {
  crud: { width: 'max-w-[480px]', layout: 'panel' },
  lifecycle: { width: 'max-w-[480px]', layout: 'panel' },
  status: { width: 'max-w-[420px]', layout: 'centred' },
  actions: { width: 'max-w-[460px]', layout: 'panel' },
  data: { width: 'max-w-[580px]', layout: 'panel' },
  capture: { width: 'max-w-[440px]', layout: 'panel' },
}

/** Solid Action Orange, overriding the primary button's brand gradient. For
 *  deletes, deactivations and anything else that cannot be undone — the design
 *  reserves this treatment for exactly those, and never uses red. */
export const DESTRUCTIVE_BUTTON =
  'bg-none bg-salis-orange shadow-none hover:bg-none hover:bg-salis-orange-hover hover:shadow-none'

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),' +
  'select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Every open dialog, oldest last. Escape and the focus trap read the tail:
 *  a confirmation raised from inside a form dialog must close itself and leave
 *  the form standing. */
const openDialogs: object[] = []
let scrollLocks = 0

export interface ModalProps {
  open: boolean
  /** Called for Escape, the close button and a backdrop click. */
  onClose: () => void
  /** Labels the dialog for assistive tech. An English source string — it is
   *  translated here, so callers pass plain text. */
  title: string
  variant?: ModalVariant
  /** Overrides the family's default layout. */
  layout?: ModalLayout
  /** lucide name for the header chip (panel) or the medallion (centred). */
  icon?: string
  /** One or two lines under the title. Also becomes `aria-describedby`. */
  description?: ReactNode
  /** Trailing detail beside the title, e.g. the design's "5 selected". */
  meta?: ReactNode
  /** Buttons for the footer bar. Omit for a dialog that closes from its body. */
  footer?: ReactNode
  /** Orange medallion and orange framing — see `DESTRUCTIVE_BUTTON`. */
  destructive?: boolean
  /** `false` blocks Escape, the backdrop and the close button, for a dialog the
   *  user has to answer. Defaults to `true`. */
  dismissible?: boolean
  /** How the dialog fills a phone. Panel layouts take the whole screen because
   *  they hold forms and lists; a two-line confirmation would look absurd
   *  stretched to 844px, so it rises from the bottom edge instead. */
  sheet?: 'full' | 'bottom'
  children?: ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  variant = 'crud',
  layout,
  icon,
  description,
  meta,
  footer,
  destructive,
  dismissible = true,
  sheet,
  children,
  className,
}: ModalProps) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  // Stable identity for this dialog's slot in the stack.
  const token = useRef({})
  const titleId = useId()
  const descriptionId = useId()

  const shape = VARIANTS[variant]
  const resolvedLayout = layout ?? shape.layout
  const resolvedSheet = sheet ?? (resolvedLayout === 'centred' ? 'bottom' : 'full')

  useEffect(() => {
    if (!open) return
    const id = token.current
    openDialogs.push(id)
    return () => {
      const at = openDialogs.indexOf(id)
      if (at >= 0) openDialogs.splice(at, 1)
    }
  }, [open])

  // The page behind must not scroll under the dialog. Counted, so closing a
  // nested confirmation doesn't hand scrolling back to the form still open.
  useEffect(() => {
    if (!open) return
    const { body } = document
    const previous = body.style.overflow
    scrollLocks += 1
    body.style.overflow = 'hidden'
    return () => {
      scrollLocks -= 1
      if (scrollLocks === 0) body.style.overflow = previous
    }
  }, [open])

  // Focus moves in on open and returns to whatever opened the dialog on close —
  // otherwise a keyboard user lands back at the top of the document.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    restoreTo.current = opener instanceof HTMLElement ? opener : null
    const panel = panelRef.current
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel)?.focus()
    return () => {
      const target = restoreTo.current
      if (target && document.contains(target)) target.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      // Only the top-most dialog reacts.
      if (openDialogs[openDialogs.length - 1] !== token.current) return

      if (event.key === 'Escape') {
        if (!dismissible) return
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return
      // Deliberately no `offsetParent` visibility filter: the panel is inside a
      // fixed overlay, where that property is unreliable, and dropping every
      // candidate would leave the trap with nothing to cycle through.
      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => !element.closest('[aria-hidden="true"]')
      )
      if (!focusable.length) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const outside = !panel.contains(active)
      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault()
        first.focus()
      }
    }
    // Capture, so a dialog closes even when the focused control stops the event.
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, dismissible, onClose])

  if (!open) return null

  const heading = t(title)
  const medallion = (
    <span
      className={cn(
        'flex rounded-full p-3.5',
        destructive
          ? 'bg-tint-orange text-salis-orange'
          : 'bg-salis-blue/[.09] text-salis-blue'
      )}
    >
      <Icon name={icon ?? (destructive ? 'AlertTriangle' : 'Info')} size={28} />
    </span>
  )

  const closeButton = dismissible ? (
    <button
      type="button"
      onClick={onClose}
      aria-label={t('Close')}
      className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-colors duration-150 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 focus-visible:ring-offset-card"
    >
      <Icon name="X" size={16} />
    </button>
  ) : null

  return createPortal(
    <div
      // Below the toast layer: a save confirmation must stay readable over the
      // dialog that triggered it.
      className={cn(
        'fixed inset-0 z-[90] flex bg-salis-navy/[.55]',
        isMobile
          ? resolvedSheet === 'full'
            ? 'items-stretch'
            : 'items-end'
          : 'items-center justify-center p-6'
      )}
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex min-h-0 w-full animate-fade-up flex-col border border-border bg-card shadow-lg outline-none',
          'motion-reduce:animate-none',
          isMobile
            ? resolvedSheet === 'full'
              ? 'h-full rounded-none'
              : 'max-h-[92vh] rounded-t-2xl'
            : cn('max-h-[85vh] rounded-2xl', shape.width),
          className
        )}
      >
        {resolvedLayout === 'panel' ? (
          <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-border px-5 py-4">
            {icon ? (
              <span
                className={cn(
                  'flex flex-shrink-0 rounded-lg p-1.5',
                  destructive
                    ? 'bg-tint-orange text-salis-orange'
                    : 'bg-salis-blue/[.08] text-salis-blue'
                )}
              >
                <Icon name={icon} size={16} />
              </span>
            ) : null}
            <h2 id={titleId} className="min-w-0 truncate text-base font-bold text-heading">
              {heading}
            </h2>
            {meta ? <span className="flex-shrink-0 text-xs text-muted">{meta}</span> : null}
            <span className="flex-1" />
            {closeButton}
          </div>
        ) : null}

        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto',
            resolvedLayout === 'centred'
              ? 'flex flex-col items-center gap-3.5 p-6 text-center'
              : 'flex flex-col gap-3.5 p-5'
          )}
        >
          {resolvedLayout === 'centred' ? (
            <>
              {/* The centred layout has no header bar, so the close affordance
                  lives beside the title for pointer users; Escape covers the
                  keyboard, and the footer always carries a way out. */}
              {closeButton ? (
                <span className="absolute top-3 end-3">{closeButton}</span>
              ) : null}
              {medallion}
              <h2 id={titleId} className="text-lg font-bold text-heading">
                {heading}
              </h2>
              {description ? (
                <p id={descriptionId} className="max-w-[320px] text-sm text-muted">
                  {description}
                </p>
              ) : null}
            </>
          ) : description ? (
            <p id={descriptionId} className="text-[13px] text-muted">
              {description}
            </p>
          ) : null}
          {children}
        </div>

        {footer ? (
          <div
            className={cn(
              'flex flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-border px-5 py-3.5',
              resolvedLayout === 'centred' ? 'justify-center' : 'justify-end'
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}

/** A confirmation the caller can `await`.
 *
 *  `title` and the labels are English source strings, translated at render. */
export interface ConfirmRequest {
  title: string
  description?: string
  /** lucide name for the medallion. Defaults by `destructive`. */
  icon?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Orange medallion and orange confirm — deletes and deactivations. */
  destructive?: boolean
  variant?: ModalVariant
}

interface ModalValue {
  /** Resolves `true` when the user confirms, `false` on cancel, Escape or the
   *  backdrop. Safe to call from inside another dialog. */
  confirm: (request: ConfirmRequest) => Promise<boolean>
  /** Cancels the top-most confirmation, as Escape would. */
  dismiss: () => void
}

const ModalContext = createContext<ModalValue | null>(null)

interface Queued {
  id: number
  request: ConfirmRequest
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Queued[]>([])
  // Resolvers live outside state: settling one must not depend on a state
  // updater running exactly once.
  const resolvers = useRef(new Map<number, (answer: boolean) => void>())
  const nextId = useRef(0)

  const confirm = useCallback<ModalValue['confirm']>(
    (request) =>
      new Promise<boolean>((resolve) => {
        const id = nextId.current++
        resolvers.current.set(id, resolve)
        setQueue((current) => [...current, { id, request }])
      }),
    []
  )

  const settle = useCallback((id: number, answer: boolean) => {
    const resolve = resolvers.current.get(id)
    if (!resolve) return
    resolvers.current.delete(id)
    setQueue((current) => current.filter((entry) => entry.id !== id))
    resolve(answer)
  }, [])

  const dismiss = useCallback(() => {
    setQueue((current) => {
      const top = current[current.length - 1]
      if (top) settle(top.id, false)
      return current
    })
  }, [settle])

  const value = useMemo(() => ({ confirm, dismiss }), [confirm, dismiss])

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* Rendered as siblings rather than nested, so a confirmation raised from
          inside a form dialog outlives the form's own render tree. */}
      {queue.map((entry) => (
        <ConfirmDialog
          key={entry.id}
          request={entry.request}
          onSettle={(answer) => settle(entry.id, answer)}
        />
      ))}
    </ModalContext.Provider>
  )
}

function ConfirmDialog({
  request,
  onSettle,
}: {
  request: ConfirmRequest
  onSettle: (answer: boolean) => void
}) {
  const { t } = usePreferences()
  return (
    <Modal
      open
      onClose={() => onSettle(false)}
      variant={request.variant ?? 'status'}
      layout="centred"
      title={request.title}
      description={request.description ? t(request.description) : undefined}
      icon={request.icon}
      destructive={request.destructive}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={() => onSettle(false)}>
            {t(request.cancelLabel ?? 'Cancel')}
          </Button>
          <Button
            size="lg"
            onClick={() => onSettle(true)}
            className={request.destructive ? DESTRUCTIVE_BUTTON : undefined}
          >
            {t(request.confirmLabel ?? 'Confirm')}
          </Button>
        </>
      }
    />
  )
}

export function useModal(): ModalValue {
  const value = useContext(ModalContext)
  if (!value) throw new Error('useModal must be used within a ModalProvider')
  return value
}
