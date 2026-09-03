/** The security headers the delivered application is served with.
 *
 *  Defined once, in a plain module, because the same set has to reach four
 *  places that cannot import from each other: `vite.config.ts` (so `npm run
 *  preview` — and therefore the E2E suite — runs under the real policy),
 *  `nginx.conf` for the container, and `vercel.json` / `netlify.toml` for the
 *  hosted deploys. `npm run gen:headers` rewrites the three deploy files from
 *  this module, and `check-headers.mjs` fails the build when they drift.
 *
 *  The API sets its own, stricter set in `server/src/app.ts` — that process
 *  serves JSON and can deny every fetch directive outright. This file is about
 *  the thing a browser actually loads and executes, which is where an XSS would
 *  land, and which was until now served with no security headers at all.
 *
 *  ── Why this CSP is as tight as it is ────────────────────────────────────
 *
 *  The build makes it affordable, and each directive was checked against the
 *  built output rather than assumed:
 *
 *    script-src 'self'   Vite emits only external module scripts — `dist/`
 *                        contains zero inline <script> blocks — so no nonce and
 *                        no 'unsafe-inline' is needed. This is the directive
 *                        that actually stops an injected script, so it is the
 *                        one worth not weakening.
 *    style-src           'unsafe-inline' is here under protest: 95 source files
 *                        use React's `style={{…}}`, which emits a style
 *                        attribute, and the noscript fallback in index.html is
 *                        inline too. Attribute styles cannot carry a nonce.
 *                        Narrow it to style-src-elem 'self' once the inline
 *                        style props are gone.
 *    font-src 'self'     Inter and Poppins are self-hosted under /fonts. No
 *                        Google Fonts, no external host of any kind.
 *    img-src             'self' plus data: — no data: URI survives the build
 *                        today, but icon libraries emit them and a build that
 *                        starts to would otherwise fail silently in production.
 *    connect-src         'self' only. THIS IS THE ONE TO EDIT: when
 *                        VITE_API_BASE_URL points at another origin — which it
 *                        does in every deployment where nginx does not proxy
 *                        the API — that origin must be added here or every
 *                        request the app makes is blocked.
 *    frame-ancestors     'none' — nothing here is ever meant to be framed, and
 *                        this is the directive that enforces it. X-Frame-Options
 *                        is kept alongside for browsers that predate CSP3.
 *    object-src 'none'   No plugins. Removes a whole injection class for free.
 */

/** @type {Record<string, string>} */
export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '),

  /** Belt and braces with frame-ancestors, for pre-CSP3 browsers. */
  'X-Frame-Options': 'DENY',

  /** Stops a browser second-guessing a declared Content-Type. */
  'X-Content-Type-Options': 'nosniff',

  /** Matches the API. Sending no Referer at all is strictly stronger than
   *  strict-origin-when-cross-origin and costs this application nothing. */
  'Referrer-Policy': 'no-referrer',

  /** Two years, subdomains included, preload-eligible. Only ever sent over
   *  HTTPS — a browser ignores it on http, so it is safe to set statically. */
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  /** Deny the hardware this application never asks for. A workshop system that
   *  suddenly wants a microphone is a compromised one. */
  'Permissions-Policy': [
    'accelerometer=()',
    'autoplay=()',
    'camera=()',
    'display-capture=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
  ].join(', '),

  /** Keeps this origin out of another document's browsing-context group. */
  'Cross-Origin-Opener-Policy': 'same-origin',

  /** Refuses cross-origin embedding of these assets. */
  'Cross-Origin-Resource-Policy': 'same-origin',
}

/** The header names, in the order they should be written to a config file. */
export const HEADER_NAMES = Object.keys(SECURITY_HEADERS)
