import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Language, Theme } from '@/data/types'
import { readStored, writeStored, STORAGE_KEYS } from '@/lib/storage'

/** Theme + language, persisted and applied to <html>.
 *
 *  The prototypes had a persistence bug worth not repeating: every screen
 *  computed `this.props.theme ?? localStorage.getItem(...)`, and since the prop
 *  always resolved to that file's own hardcoded default, the stored value was
 *  never read. Because each `<a href>` was a full page load, a toggle died the
 *  moment you navigated. Here the preference lives above the router, so it
 *  simply persists. */

interface PreferencesValue {
  theme: Theme
  language: Language
  /** `true` when the language is Arabic — the document is then RTL. */
  rtl: boolean
  dir: 'rtl' | 'ltr'
  notifications: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  setNotifications: (on: boolean) => void
  /** Translate an English source string. Falls back to the source when a key
   *  has no Arabic yet — never renders an empty label. */
  t: (source: string) => string
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

function initialTheme(): Theme {
  const stored = readStored(STORAGE_KEYS.theme)
  if (stored === 'light' || stored === 'dark') return stored
  const prefersLight =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: light)').matches
  return prefersLight ? 'light' : 'dark'
}

function initialLanguage(): Language {
  const stored = readStored(STORAGE_KEYS.lang)
  return stored === 'ar' ? 'ar' : 'en'
}

let arCache: Record<string, string> | null = null

async function loadArabic(): Promise<Record<string, string>> {
  if (arCache) return arCache
  const [{ AR }, { AR_OVERRIDES }] = await Promise.all([
    import('@/data/generated/ar'),
    import('@/data/ar-overrides'),
  ])
  arCache = { ...AR, ...AR_OVERRIDES }
  return arCache
}

/** Warms the dictionary cache so the first Arabic render is already translated.
 *  The test harness awaits this in setup: assertions run synchronously after
 *  render, so they cannot wait out the lazy chunk the way a user does. */
export async function preloadArabic(): Promise<void> {
  await loadArabic()
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const [language, setLanguageState] = useState<Language>(initialLanguage)
  const [notifications, setNotificationsState] = useState(
    () => (readStored(STORAGE_KEYS.notifications) ?? 'on') === 'on'
  )
  const [arLookup, setArLookup] = useState<Record<string, string> | null>(arCache)

  useEffect(() => {
    if (language === 'ar' && !arLookup) {
      loadArabic().then(setArLookup)
    }
  }, [language, arLookup])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const setTheme = useCallback((next: Theme) => {
    writeStored(STORAGE_KEYS.theme, next)
    setThemeState(next)
  }, [])

  const setLanguage = useCallback((next: Language) => {
    writeStored(STORAGE_KEYS.lang, next)
    setLanguageState(next)
  }, [])

  const setNotifications = useCallback((on: boolean) => {
    writeStored(STORAGE_KEYS.notifications, on ? 'on' : 'off')
    setNotificationsState(on)
  }, [])

  const value = useMemo<PreferencesValue>(() => {
    const rtl = language === 'ar'
    const dict = arLookup
    return {
      theme,
      language,
      rtl,
      dir: rtl ? 'rtl' : 'ltr',
      notifications,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      setLanguage,
      toggleLanguage: () => setLanguage(rtl ? 'en' : 'ar'),
      setNotifications,
      t: (source: string) => (rtl && dict ? (dict[source] ?? source) : source),
    }
  }, [theme, language, notifications, arLookup, setTheme, setLanguage, setNotifications])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesValue {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences must be used within a PreferencesProvider')
  return value
}

/** Shorthand for the common case of just needing the translator. */
export function useT(): (source: string) => string {
  return usePreferences().t
}
