/** The one focus-cycling routine behind every modal surface.
 *
 *  `Modal`, `Drawer` and the `AppShell` nav drawer each carried their own copy
 *  with its own selector string; three copies of a routine that has to agree
 *  about what "focusable" means is how one of them ends up skipping a control
 *  the others reach. This is that routine, once. */

export const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),' +
  'select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Every focusable element inside `container`, in document order, excluding
 *  anything hidden from assistive tech. No `offsetParent` visibility filter:
 *  inside a fixed overlay that property is unreliable, and dropping every
 *  candidate would leave the trap with nothing to cycle through. */
export function focusableWithin(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (element) => !element.closest('[aria-hidden="true"]')
  )
}

/** Keep a Tab / Shift+Tab press inside `container`.
 *
 *  Call it from a keydown handler once the key is known to be `Tab`. Returns
 *  `true` when it moved focus (and prevented the default), `false` when the
 *  browser's own order was fine. A container with nothing focusable receives
 *  focus itself, so keyboard users are never dropped behind the overlay. */
export function cycleFocus(container: HTMLElement, event: KeyboardEvent): boolean {
  if (event.key !== 'Tab') return false
  const focusable = focusableWithin(container)
  if (!focusable.length) {
    event.preventDefault()
    container.focus()
    return true
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  const outside = !container.contains(active)
  if (event.shiftKey && (active === first || outside)) {
    event.preventDefault()
    last.focus()
    return true
  }
  if (!event.shiftKey && (active === last || outside)) {
    event.preventDefault()
    first.focus()
    return true
  }
  return false
}

/** Move focus to the first focusable child, or to the container itself. */
export function focusFirst(container: HTMLElement | null): void {
  if (!container) return
  const first = focusableWithin(container)[0]
  ;(first ?? container).focus()
}
