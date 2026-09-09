import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { handleBack } from '@/lib/back-stack'
import {
  applyStatusBarTheme,
  exitApp,
  hideSplash,
  isNative,
  listenAppState,
  listenBackButton,
  listenKeyboardHide,
  listenKeyboardShow,
  listenUrlOpen,
  nativePlatform,
} from '@/lib/native'
import { usePreferences } from './PreferencesProvider'

/** Routes that are the bottom of the back stack.
 *
 *  Back from one of these leaves the app, because there is nowhere sensible
 *  left to go: the signed-in landing screen, the customer app's home tab, and
 *  the two unauthenticated entry points. Anywhere else, back navigates. */
const ROOT_ROUTES = new Set(['/', '/dashboard', '/customer-app/home', '/login', '/welcome'])

/** Mounts the native shell's behaviour. Renders nothing.
 *
 *  Everything it calls is inert off native (see `lib/native.ts`), so this is
 *  mounted unconditionally rather than behind a platform check — one code path
 *  in development, in the browser build and on a device.
 *
 *  It sits **inside** the router because the back button is a navigation
 *  concern: it needs `useNavigate` and the current path to decide between
 *  closing a layer, going back, and leaving the app.
 */
export function NativeBridge() {
  const { theme } = usePreferences()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  /* Hide the launch splash once React has actually painted a screen, rather
   * than on the config's 2000ms timer. */
  useEffect(() => {
    hideSplash()
  }, [])

  /* A native app's status bar is part of the app, not the browser's chrome —
   * a light bar over the dark theme is the giveaway that a web view is being
   * shown rather than an app.
   *
   * Deferred to the next frame because the colour is read from the tokens, and
   * the `dark` class those tokens key off is applied by `PreferencesProvider`,
   * an *ancestor* of this component. React flushes passive effects child-first,
   * so reading synchronously here would sample the theme being replaced and
   * leave the bar one toggle behind for as long as the theme stayed put. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => applyStatusBarTheme(theme))
    return () => cancelAnimationFrame(frame)
  }, [theme])

  /* Android back. Read the path from a ref-like closure over `pathname`: the
   * effect re-subscribes on navigation, which is cheap and keeps the decision
   * reading the path the user is actually on. */
  useEffect(
    () =>
      listenBackButton(({ canGoBack }) => {
        /* A modal, drawer or palette is on top: close that and stop. Back has
         * to undo the last thing that appeared before it means "navigate". */
        if (handleBack()) return
        /* `canGoBack` is the web view's own history depth, which is not the
         * same question as whether this app has somewhere to go: a deep link
         * opens on a screen with no history behind it. Both have to say yes. */
        if (canGoBack && !ROOT_ROUTES.has(pathname)) {
          navigate(-1)
          return
        }
        exitApp()
      }),
    [navigate, pathname]
  )

  /* The keyboard covers the bottom of the screen, and on iOS it does so
   * without changing `100dvh`. Publishing its height as a custom property lets
   * a layout give the space back — the customer app's bottom tab bar is the
   * one that would otherwise sit behind it. `keyboard-open` is the same fact
   * as a class, for rules that only need the boolean. */
  useEffect(() => {
    if (!isNative()) return
    const root = document.documentElement
    const stopShow = listenKeyboardShow(({ keyboardHeight }) => {
      root.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
      root.classList.add('keyboard-open')
    })
    const stopHide = listenKeyboardHide(() => {
      root.style.setProperty('--keyboard-height', '0px')
      root.classList.remove('keyboard-open')
    })
    return () => {
      stopShow()
      stopHide()
      root.style.removeProperty('--keyboard-height')
      root.classList.remove('keyboard-open')
    }
  }, [])

  /* A phone app is backgrounded far more often than a tab is hidden, and it
   * can be gone for days. `staleTime` is 60s, so anything the user left behind
   * is refetched on the way back in. */
  useEffect(
    () =>
      listenAppState((active) => {
        if (active) window.dispatchEvent(new Event('focus'))
      }),
    []
  )

  /* A deep link that arrives while the app is already open does not reload the
   * web view, so the router has to be told. Only the app's own origin is
   * followed, and only its path — a URL from anywhere else is not something to
   * navigate to on the strength of having received it. */
  useEffect(
    () =>
      listenUrlOpen((url) => {
        const path = samePathFor(url)
        if (path) navigate(path)
      }),
    [navigate]
  )

  /* `platform-ios` / `platform-android` on <html>, for the handful of rules
   * that genuinely differ per platform rather than per viewport. */
  useEffect(() => {
    if (!isNative()) return
    const cls = `platform-${nativePlatform()}`
    document.documentElement.classList.add(cls)
    return () => document.documentElement.classList.remove(cls)
  }, [])

  return null
}

/** The in-app path a deep link points at, or `null` if it points elsewhere.
 *
 *  Custom schemes (`com.salisauto.app://job-cards`) and https links both reach
 *  here. The check is that the link resolves to this app's own origin — an
 *  `appUrlOpen` payload is attacker-controllable on Android, where any app can
 *  fire an intent at a registered scheme, so a raw `navigate(url)` would let
 *  another app choose the screen and the query string it opens with.
 *
 *  Exported for the test; nothing else should need it. */
export function samePathFor(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin)
    /* A custom scheme has no meaningful origin, so match on the scheme itself
     * and take the rest as a path.
     *
     * `host` has to be folded back in, and this is the part that is easy to get
     * wrong: for a non-special scheme `URL` reads `//job-cards` as an
     * *authority*, so `com.salisauto.app://job-cards` parses as host
     * `job-cards` with an empty pathname, while the three-slash spelling parses
     * as an empty host with pathname `/job-cards`. Capacitor emits the first
     * form, so reading `pathname` alone sends every deep link to `/`. */
    if (parsed.protocol === 'com.salisauto.app:') {
      const path = `${parsed.host}${parsed.pathname}`.replace(/^\/*/, '')
      return `/${path}${parsed.search}${parsed.hash}`
    }
    if (parsed.origin !== window.location.origin) return null
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return null
  }
}
