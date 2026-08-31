import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { preloadArabic } from './providers/PreferencesProvider'
import { readStored, STORAGE_KEYS } from './lib/storage'
import './styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

function mount(): void {
  createRoot(container!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

/** An Arabic session waits for its dictionary before the first paint.
 *
 *  The chunk is lazy so English sessions never download it, but a returning
 *  Arabic user would otherwise see one frame of English source strings before
 *  the dictionary resolves. Awaiting here costs that user a single chunk on a
 *  cold load and costs an English user nothing. A failed load is not fatal —
 *  `t()` already falls back to the English source, so mount either way. */
if (readStored(STORAGE_KEYS.lang) === 'ar') {
  preloadArabic().then(mount, mount)
} else {
  mount()
}
