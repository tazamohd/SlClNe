import { lazy, Suspense, useEffect, useState } from 'react'

/** The ⌘K palette, loaded on first open.
 *
 *  `GlobalSearch.tsx` carries the entity registry and the command list, and
 *  both headers import it — which put ~20 kB into the shared entry for a
 *  surface most sessions open once. Lazy here, so the chunk arrives on the
 *  first ⌘K and the entry stays inside its budget. The `open` prop is what
 *  triggers the import; nothing renders until then, so there is no fallback
 *  to draw. */
const Palette = lazy(() => import('./GlobalSearch'))

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <Suspense fallback={null}>
      <Palette open={open} onClose={onClose} />
    </Suspense>
  )
}

/** Open/close state plus the Cmd+K / Ctrl+K shortcut. Lives apart from the
 *  palette so the headers can bind the key without importing the palette. */
export function useGlobalSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return { open, setOpen }
}
