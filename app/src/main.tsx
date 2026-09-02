import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initialLanguage, preloadArabic } from './providers/PreferencesProvider'
import './styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

const root = createRoot(container)

function mount(): void {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

/** How long an Arabic session waits for its dictionary before painting anyway. */
const DICTIONARY_DEADLINE_MS = 1500

/** An Arabic session waits for its dictionary before the first paint.
 *
 *  The dictionary is lazy so English sessions never download it, but a
 *  returning Arabic user would otherwise see one frame of English source
 *  strings before it resolves. Waiting here costs that user a single chunk on a
 *  cold load and costs an English user nothing.
 *
 *  The wait is bounded, because an unbounded one trades the English flash for a
 *  blank page and the blank page is worse: nothing is painted until the
 *  dictionary arrives, so a slow connection gets an empty `#root` for as long
 *  as it takes. Past the deadline we mount in English and the provider's own
 *  effect swaps the dictionary in when it lands — the flash this preload exists
 *  to remove, but only for the sessions that would otherwise have seen nothing
 *  at all. A failed load is not fatal either: `t()` falls back to the English
 *  source, so mount either way. */
if (initialLanguage() === 'ar') {
  const deadline = new Promise((resolve) => setTimeout(resolve, DICTIONARY_DEADLINE_MS))
  Promise.race([preloadArabic(), deadline]).then(mount, mount)
} else {
  mount()
}
