# SALIS AUTO — Performance Audit Report

**Date:** 2026-08-29
**Branch:** `main` (post W2+W3 merge, 10 PRs)
**Build tool:** Vite 5.4.21, target `es2022`
**Build time:** 6.35 s (1 821 modules)

---

## 1. Production Build Summary

| Metric | Value |
|---|---|
| Total JS (uncompressed) | 1 785 KB |
| Total JS (gzip) | ~370 KB |
| Total CSS (uncompressed) | 78 KB |
| Total CSS (gzip) | 14 KB |
| Main bundle (`index-*.js`) | 138 KB (39 KB gzip) |
| Total dist size | 3.4 MB |
| Code-split route chunks | 150+ |

### Vendor chunks (cache-stable)

| Chunk | Size | Gzip |
|---|---|---|
| `react-vendor` | 142 KB | 46 KB |
| `icons-vendor` (lucide-react) | 113 KB | 20 KB |
| `query-vendor` (@tanstack) | 34 KB | 10 KB |
| `router-vendor` (react-router) | 23 KB | 9 KB |
| `vendor` (everything else) | 20 KB | 7 KB |

These are split via `manualChunks` in `vite.config.ts` and are **correctly** cache-stable — a screen-level change never re-downloads React or the router.

---

## 2. Code Splitting & Lazy Loading

### What's working well

- **217 `React.lazy()` calls** across `routes/index.tsx` (201) and `routes/SpecScreenResolver.tsx` (16). Every screen is route-split — the initial bundle carries only the shell, router, and shared UI primitives.
- Shared UI components (`Card`, `Badge`, `Icon`, `Button`, `Input`, etc.) are extracted into their own small chunks (< 2 KB each), so they load once and cache across routes.
- Vendor splitting is effective: React, React Router, TanStack Query, and Lucide icons are each in dedicated chunks.

### Concerns

| Issue | Severity | Details |
|---|---|---|
| **`SpecScreenResolver` chunk: 183 KB** | Medium | This is the largest JS chunk. It bundles `spec-screens.ts` (screen metadata) and `feature/definitions.ts` inline. These large generated-data modules are imported statically into the resolver, preventing tree-shaking. Consider dynamic-importing the `SPEC_SCREENS` and `FEATURE_DEF_BY_ROUTE` data so the resolver chunk stays small. |
| **`HRScreens` chunk: 36 KB** | Low | Nine HR sub-screens are bundled into a single lazy chunk. Since they all share the same `import()`, loading one HR screen pulls in all nine. This is acceptable today but could be split per-screen if HR traffic patterns diverge. |
| **`ModalsFlow` chunk: 23 KB** | Low | All flow-modal components bundle together. Acceptable for now. |

---

## 3. Arabic Translations — Lazy Loading

Arabic content is split into **two dedicated chunks**, both outside the main bundle:

| Chunk | Size | Gzip |
|---|---|---|
| `ar-*.js` (base translations) | 84 KB | 37 KB |
| `ar-overrides-*.js` (override layer) | 43 KB | 20 KB |

**Loading mechanism:** `PreferencesProvider.tsx` uses a dynamic `import()`:
```ts
import('@/data/ar-overrides').then((m) => m.AR_OVERRIDES)
```

**Verdict:** Arabic translations are **correctly lazy-loaded**. They are not in the main bundle and are only fetched when the user selects Arabic. The `ar-*.js` base file is also lazy (imported from `ar-overrides`, not from the entry point).

---

## 4. React.memo Usage

| Component | Has `memo`? |
|---|---|
| `Card` | Yes |
| `Badge` | Yes |
| `Icon` | Yes |

These are the **hot-path** UI primitives rendered hundreds of times per screen. `memo` is correctly applied to them.

Other screen-level components (e.g. `Dashboard`, `JobCards`, `Invoices`) are **not** wrapped in `memo`, which is appropriate — they are top-level route components that re-render only on navigation or data changes, not on parent re-renders.

---

## 5. Duplicate Dependencies

The `npm ls` output shows no duplicate React, React DOM, or React Router versions. Vendor chunking confirms a single `react-vendor` chunk.

No duplicate dependency concern detected.

---

## 6. Recommendations

### Priority: Medium

1. **Split `SpecScreenResolver` data** — The 183 KB `SpecScreenResolver` chunk is the single largest JS file. The `SPEC_SCREENS` array and `FEATURE_DEF_BY_ROUTE` map are large generated data. Dynamic-importing these (or splitting the resolver into a smaller routing shim + lazy data) would reduce the chunk by ~100 KB.

2. **Consider further splitting `ar.ts`** — At 84 KB, the base Arabic translations file could be split per-module (workshop translations, CRM translations, etc.) to reduce initial Arabic load. This is a future optimization — the current lazy-load is already good.

### Priority: Low

3. **Monitor `icons-vendor` size (113 KB)** — Lucide-react uses tree-shaking, but all icons used anywhere end up in this chunk. If icon count grows, consider a named-icon manifest to verify only needed icons are bundled.

4. **CSS is a single 78 KB file** — Tailwind purges unused classes at build time, so this is already optimized. No action needed.

---

## 7. Overall Assessment

**The build is well-optimized.** The 69% bundle reduction from PR #28 is confirmed — the main bundle at 138 KB (39 KB gzip) is excellent for an application of this scope (150+ screens). Route-level code splitting, vendor chunking, and lazy Arabic translations are all correctly implemented. The primary remaining opportunity is splitting the `SpecScreenResolver` data away from the resolver routing logic.
