# Salisco company site

Static marketing landing page for Salisco, the parent company behind SalisAuto
(and future products like FleetCo, Salis SP, QHR, and Raqeeb). Plain HTML/CSS/JS,
bilingual (English/Arabic, RTL-aware), no build step.

This is separate from `app/`, which is the SalisAuto product itself.

## Structure

- `index.html` — the page
- `assets/styles.css` — all styles
- `assets/app.js` — i18n, scroll reveals, live telemetry mock, animations
- `assets/logo.png` — brand mark

`assets/ai-face.png` and `assets/tower.jpg` are referenced as optional photos
(the page degrades gracefully via `onerror` if they're absent).

## Local preview

Serve the folder with any static file server, e.g.:

```sh
npx serve site
```
