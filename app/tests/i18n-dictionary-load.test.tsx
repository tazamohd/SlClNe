import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  PreferencesProvider,
  preloadArabic,
  resetArabicCacheForTests,
  useT,
} from '@/providers/PreferencesProvider'
import { STORAGE_KEYS } from '@/lib/storage'

/** The two states an Arabic render can start in, and what the user sees in each.
 *
 *  `test-setup.ts` warms the dictionary before every other test file runs, which
 *  is right — it reproduces a real Arabic session, whose language is known
 *  before the first paint. The side effect is that no other test ever sees the
 *  un-warmed state, and that state is not hypothetical: it is what a user hits
 *  toggling language mid-session, and what an Arabic user hits when the
 *  dictionary misses `main.tsx`'s deadline. Both paths end in Arabic; only the
 *  first frame differs. So this file resets the cache to pin down both. */

function Label() {
  const t = useT()
  return <p>{t('Sign In')}</p>
}

const renderLabel = () =>
  render(
    <PreferencesProvider>
      <Label />
    </PreferencesProvider>
  )

const EN = 'Sign In'
const AR = 'تسجيل الدخول'

describe('the Arabic dictionary as it resolves', () => {
  beforeEach(() => {
    window.localStorage.setItem(STORAGE_KEYS.lang, 'ar')
  })

  afterAll(async () => {
    // Leave the module cache as the setup file found it, for anything that runs after.
    await preloadArabic()
  })

  it('falls back to the English source on the first frame, then swaps in Arabic', async () => {
    resetArabicCacheForTests()
    renderLabel()

    // Nothing is awaited yet: this is the frame the provider renders before its
    // effect has resolved the dictionary. The label reads, it just reads English.
    expect(screen.getByText(EN)).toBeInTheDocument()

    // And the effect swaps it without a remount or a second navigation.
    expect(await screen.findByText(AR)).toBeInTheDocument()
    expect(screen.queryByText(EN)).not.toBeInTheDocument()
  })

  it('renders Arabic on the first pass when the dictionary is already warm', async () => {
    await preloadArabic()
    renderLabel()

    // No `find`, no await: a warmed cache reaches the `useState` initialiser, so
    // there is no English frame to miss. This is what every other test file gets.
    expect(screen.getByText(AR)).toBeInTheDocument()
    expect(screen.queryByText(EN)).not.toBeInTheDocument()
  })

  it('never renders an empty label, warm or cold', async () => {
    resetArabicCacheForTests()
    renderLabel()
    expect(screen.getByText(EN).textContent).not.toBe('')
    expect((await screen.findByText(AR)).textContent).not.toBe('')
  })
})
