import { isNative } from './native'

/** Registering — and, just as importantly, unregistering — the service worker.
 *
 *  ### Where it runs, and where it deliberately does not
 *
 *  **Production web builds only.** In `vite dev` the worker would sit in front
 *  of the dev server's module graph and serve yesterday's modules through HMR,
 *  which is the classic way to lose an afternoon.
 *
 *  **Never under Capacitor.** The native shell already ships every asset inside
 *  the app bundle, so a worker buys nothing there and costs something real: a
 *  second, independent copy of the app that updates on its own schedule and can
 *  outlive an app update. iOS compounds it — `WKWebView` on a custom scheme has
 *  no service worker support at all, so the registration would simply fail.
 *
 *  `disable()` exists because "stop shipping the service worker" has to be a
 *  decision that can actually be carried out. A worker already installed on a
 *  user's device keeps serving its cached shell whether or not the app still
 *  registers one, so the off switch has to actively tear the old one down.
 */

/** Where the worker lives, and the scope it controls.
 *
 *  Both come from `BASE_URL`, which is `/` for Netlify, Vercel and the
 *  container, and `/<repo>/` on GitHub Pages. A worker registered at the origin
 *  root from a page served under a sub-path would be refused by the browser,
 *  and one registered without an explicit scope would only ever see the
 *  directory it was served from. */
const WORKER_URL = `${import.meta.env.BASE_URL}sw.js`
const SCOPE = import.meta.env.BASE_URL

/** Whether this build should have a service worker at all. */
export function shouldRegister(): boolean {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false
  if (isNative()) return false
  return import.meta.env.PROD
}

/** Install the worker, or tear down an existing one where it does not belong.
 *
 *  Called from `main.tsx` after mount rather than before: registration competes
 *  with the first paint for the same connection, and a worker that installs
 *  half a second later costs this visit nothing — it only ever serves the
 *  *next* one. */
export function initServiceWorker(): void {
  if (!shouldRegister()) {
    void disable()
    return
  }
  void register()
}

async function register(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register(WORKER_URL, { scope: SCOPE })

    /* A brand-new installation has no page to disrupt, so it can take over
     * immediately and make this very visit offline-capable. An *update* must
     * not: the running page loads its lazy route chunks by hash, and the new
     * build does not have the old hashes. So an update waits, and the next
     * full load picks it up. `sw.js` declines to `skipWaiting()` on its own for
     * the same reason. */
    if (!navigator.serviceWorker.controller) {
      registration.installing?.addEventListener('statechange', function onChange(this: ServiceWorker) {
        if (this.state === 'installed') this.postMessage({ type: 'SKIP_WAITING' })
      })
    }
  } catch {
    /* An unregistrable worker is not a broken app: every request simply goes
     * to the network, which is exactly what happened before this existed. */
  }
}

/** Remove any worker this app previously installed, and drop its caches.
 *
 *  Scoped to `salis-auto-*` cache names so a worker from something else served
 *  on the same origin — a docs site, another app on the same Pages domain — is
 *  left alone. */
async function disable(): Promise<void> {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
    await clearCaches()
  } catch {
    /* Nothing to do about a failed cleanup, and nothing depends on it. */
  }
}

/** Drop the cached build. Used on sign-out and by `disable()`.
 *
 *  No user data is in there — `sw.js` never caches an API response, which is
 *  the load-bearing half of that promise — but a shared workshop terminal
 *  should not hand the next person a warm copy of the previous tenant's build
 *  either. */
export async function clearCaches(): Promise<void> {
  try {
    if (typeof caches === 'undefined') return
    const names = await caches.keys()
    await Promise.all(
      names.filter((name) => name.startsWith('salis-auto-')).map((name) => caches.delete(name))
    )
  } catch {
    /* Storage can be unavailable (private mode, a locked-down profile). */
  }
}
