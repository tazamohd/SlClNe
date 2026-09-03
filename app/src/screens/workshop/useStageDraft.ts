import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/lib/useDebounce'
import { clearStored, readStored, writeStored } from '@/lib/storage'

/** Keeps a stage form's half-typed state per job card.
 *
 *  A check-in interrupted by a phone call used to start over; the odometer,
 *  the fuel level and three lines of reported issues were gone with the tab.
 *  The draft lives in local storage under the job card's id — so two cards
 *  open in two tabs never share a draft — and is written a beat after the last
 *  keystroke rather than on every one. `saved` is what the "Draft saved"
 *  caption reads; `clear` is called once the server has the real record.
 *
 *  `initial` must be a stable reference (a module constant): it is both the
 *  untouched state and the "nothing to save" comparison. */
const DRAFT_PREFIX = 'salis-draft:'

export function draftKeyFor(screen: string, jobId: string): string {
  return `${DRAFT_PREFIX}${screen}:${jobId}`
}

export function useStageDraft<T extends object>(screen: string, jobId: string | undefined, initial: T) {
  const key = jobId ? draftKeyFor(screen, jobId) : null
  const [draft, setDraft] = useState<T>(initial)
  const [saved, setSaved] = useState(false)
  const loadedFor = useRef<string | null>(null)

  // Load once per job card. A new id (the user followed a link to another
  // card) resets to that card's own draft, or to the blank form.
  useEffect(() => {
    if (!key || loadedFor.current === key) return
    loadedFor.current = key
    const raw = readStored(key)
    if (!raw) {
      setDraft(initial)
      setSaved(false)
      return
    }
    try {
      setDraft({ ...initial, ...(JSON.parse(raw) as Partial<T>) })
      setSaved(true)
    } catch {
      setDraft(initial)
      setSaved(false)
    }
  }, [key, initial])

  const settled = useDebounce(draft, 400)
  useEffect(() => {
    if (!key || loadedFor.current !== key) return
    if (settled === initial) return
    writeStored(key, JSON.stringify(settled))
    setSaved(true)
  }, [settled, key, initial])

  const clear = useCallback(() => {
    if (key) clearStored(key)
    setDraft(initial)
    setSaved(false)
  }, [key, initial])

  return { draft, setDraft, saved, clear }
}
