import { useEffect, useRef, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { Icon } from './Icon'

/** A centred modal dialog hosting a create/edit form.
 *
 *  The app had no dialog primitive — every "Add X" button was inert. This is
 *  the shared host: a labelled `role="dialog"`, Escape and backdrop-click to
 *  close, focus moved inside on open and body scroll locked while open. Logical
 *  CSS throughout, so it mirrors under RTL. Rendered through a portal so it
 *  escapes any transformed/overflow-clipped ancestor.
 *
 *  It owns the chrome only; the caller supplies the fields as children and the
 *  submit handler. The footer's submit button reflects `saving`. All visible
 *  copy is passed in already translated, so this file needs no `t()`. */
export interface FormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  /** Dialog heading. */
  title: string
  /** Submit button label (e.g. t('Add customer')). */
  submitLabel: string
  /** Label while the write is in flight (e.g. t('Saving...')). */
  savingLabel: string
  /** Cancel button label (e.g. t('Cancel')). */
  cancelLabel: string
  /** Accessible label for the ✕ close control (e.g. t('Close')). */
  closeLabel: string
  saving?: boolean
  /** Disables submit for client-side validation without a saving state. */
  submitDisabled?: boolean
  children: ReactNode
}

export function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel,
  savingLabel,
  cancelLabel,
  closeLabel,
  saving = false,
  submitDisabled = false,
  children,
}: FormModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useRef(`fm-${Math.random().toString(36).slice(2)}`).current

  // Escape closes; body scroll locks while open; focus moves inside on open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, saving, onClose])

  if (!open) return null

  function submit(e: FormEvent) {
    e.preventDefault()
    if (saving || submitDisabled) return
    onSubmit()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(11,31,59,.45)] p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        // Backdrop click (not a drag ending inside) closes.
        if (e.target === e.currentTarget && !saving) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-fade-up flex max-h-[90vh] w-full max-w-[440px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 id={titleId} className="font-display text-lg font-bold text-heading">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={closeLabel}
            className="flex cursor-pointer items-center rounded border-none bg-transparent p-1 text-muted transition-colors hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="XCircle" size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">{children}</div>
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={saving || submitDisabled}>
              {saving ? savingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
