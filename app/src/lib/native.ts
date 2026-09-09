import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp, type BackButtonListenerEvent } from '@capacitor/app'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Keyboard, type KeyboardInfo } from '@capacitor/keyboard'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import type { Theme } from '@/data/types'

/** The Capacitor bridge.
 *
 *  Five plugins were declared in `package.json` and configured in
 *  `capacitor.config.ts`, and nothing in `src/` had ever imported one — so the
 *  splash never hid on its own schedule, the status bar never followed the
 *  theme, Android's back button closed the app from any screen, and the
 *  keyboard covered whatever you were typing into.
 *
 *  Everything here is a **no-op off native**. That is the whole contract of
 *  this file: the same call sites run in a browser, in jsdom and on a device,
 *  and only the device does anything. The guard is `Capacitor.isNativePlatform()`
 *  rather than a `try`/`catch`, because the web implementations of these
 *  plugins do not throw uniformly — some reject, some resolve having done
 *  nothing, and `Keyboard` has no web implementation to call at all.
 *
 *  Every promise is swallowed rather than surfaced. A status-bar tint that
 *  failed is not worth an unhandled rejection, let alone a visible error: the
 *  app is still perfectly usable without it.
 */

/** True only inside the iOS or Android shell. `false` in every browser, in
 *  `vite preview`, and under jsdom. */
export const isNative = (): boolean => Capacitor.isNativePlatform()

/** `'ios'`, `'android'` or `'web'`. */
export const nativePlatform = (): string => Capacitor.getPlatform()

/** Runs `fn` on a device and does nothing anywhere else, discarding whatever it
 *  returns or throws. Every wrapper below is this plus a plugin call — keeping
 *  the guard and the swallow in one place is what stops a future call site
 *  forgetting one of them. */
function onNative(fn: () => Promise<unknown>): void {
  if (!isNative()) return
  try {
    void fn().catch(() => {})
  } catch {
    /* A plugin that throws synchronously must not take a render with it. */
  }
}

// ── Splash screen ───────────────────────────────────────────────────────────

/** Hide the launch splash.
 *
 *  `capacitor.config.ts` sets `launchAutoHide` with a 2000ms duration, which is
 *  a timer, not a readiness signal: a fast device shows a splash over an app
 *  that has been interactive for a second, and a slow one uncovers a blank
 *  screen while the bundle is still parsing. Calling this once the first screen
 *  has actually mounted replaces the guess with the fact. */
export const hideSplash = (): void => onNative(() => SplashScreen.hide())

// ── Status bar ──────────────────────────────────────────────────────────────

/** The colour immediately under the status bar, read from the design tokens
 *  rather than restated here.
 *
 *  `--surface-sidebar` is what both shells paint their header with — white in
 *  the light theme and the brand navy in the dark one, which is already the
 *  splash and native background in `capacitor.config.ts`. Reading it means a
 *  token change reaches the status bar too, instead of leaving a pair of hex
 *  literals here to drift out of the palette.
 *
 *  Returns `null` rather than guessing when the property is missing or is not a
 *  plain hex: the plugin wants `#RRGGBB`, and a bar left at its default colour
 *  is a much smaller problem than one set to something invalid. */
function statusBarColor(): string | null {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--surface-sidebar')
    .trim()
  return /^#[0-9a-f]{6}$/i.test(value) ? value : null
}

/** Match the status bar to the app's theme.
 *
 *  `Style.Dark` means *dark content on a light bar*, which is the opposite of
 *  what the name suggests and the single easiest thing to get backwards here —
 *  so the light theme asks for `Dark`. `setBackgroundColor` is Android-only and
 *  resolves to nothing on iOS, where the bar is transparent over the web view.
 *
 *  Reads the colour from the DOM, so the caller is responsible for calling it
 *  only once the theme class is actually on `<html>` — see `NativeBridge`.
 *
 *  Deliberately does **not** call `setOverlaysWebView`. Leaving Android's web
 *  view inset by the system means `env(safe-area-inset-top)` is 0 there and the
 *  shells' own padding stays 0 with it, which is correct; turning overlay on
 *  would make the shells responsible for a status bar they cannot measure from
 *  this container. */
export function applyStatusBarTheme(theme: Theme): void {
  onNative(() => StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light }))
  const color = statusBarColor()
  if (color) onNative(() => StatusBar.setBackgroundColor({ color }))
}

// ── Haptics ─────────────────────────────────────────────────────────────────

/** A light tap. For a discrete choice — changing tab, toggling a control. */
export const hapticSelection = (): void =>
  onNative(() => Haptics.impact({ style: ImpactStyle.Light }))

/** A firmer tap. For committing something — submitting, confirming a destructive action. */
export const hapticImpact = (): void =>
  onNative(() => Haptics.impact({ style: ImpactStyle.Medium }))

/** The system's success/failure pattern, for an outcome the user did not
 *  directly trigger the timing of. */
export const hapticResult = (ok: boolean): void =>
  onNative(() =>
    Haptics.notification({ type: ok ? NotificationType.Success : NotificationType.Error })
  )

// ── Listeners ───────────────────────────────────────────────────────────────

/** What every `listen*` helper returns: call it to unsubscribe.
 *
 *  `addListener` is asynchronous, so a component that mounts and unmounts
 *  before it resolves would otherwise leak a listener that outlives it. Each
 *  helper therefore records that it was cancelled and removes the handle the
 *  moment it arrives. */
export type Unsubscribe = () => void

/** The no-op unsubscribe returned off native, so callers never branch. */
const NOT_LISTENING: Unsubscribe = () => {}

function listen(subscribe: () => Promise<{ remove: () => Promise<void> }>): Unsubscribe {
  if (!isNative()) return NOT_LISTENING
  let cancelled = false
  let handle: { remove: () => Promise<void> } | null = null
  subscribe().then(
    (h) => {
      handle = h
      if (cancelled) void h.remove().catch(() => {})
    },
    () => {}
  )
  return () => {
    cancelled = true
    void handle?.remove().catch(() => {})
    handle = null
  }
}

/** Android's hardware/gesture back button.
 *
 *  Capacitor does not act on it by default: without a listener the button
 *  closes the app, from any screen, including one with a modal open. */
export const listenBackButton = (handler: (event: BackButtonListenerEvent) => void): Unsubscribe =>
  listen(() => CapacitorApp.addListener('backButton', handler))

/** Foreground/background transitions, for refreshing data a user left behind. */
export const listenAppState = (handler: (active: boolean) => void): Unsubscribe =>
  listen(() => CapacitorApp.addListener('appStateChange', ({ isActive }) => handler(isActive)))

/** A deep link opened while the app was already running. */
export const listenUrlOpen = (handler: (url: string) => void): Unsubscribe =>
  listen(() => CapacitorApp.addListener('appUrlOpen', ({ url }) => handler(url)))

/** Software keyboard shown, with the height it takes. */
export const listenKeyboardShow = (handler: (info: KeyboardInfo) => void): Unsubscribe =>
  listen(() => Keyboard.addListener('keyboardWillShow', handler))

/** Software keyboard dismissed. */
export const listenKeyboardHide = (handler: () => void): Unsubscribe =>
  listen(() => Keyboard.addListener('keyboardWillHide', handler))

/** Close the app. Only ever called for a back press with nothing left to pop —
 *  which is what Android users expect from back on a root screen. */
export const exitApp = (): void => onNative(() => CapacitorApp.exitApp())
