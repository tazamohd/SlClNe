<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — platform

**Status:** GENERATED · **Sources as of:** 2026-09-09 · 3 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/public/leads` | — | public | — | — | 2 | `server/src/routes/public.ts` |
| GET | `/health` | — | public | — | — | 2 | `server/src/routes/health.ts` |
| GET | `/ready` | — | public | — | — | 1 | `server/src/routes/health.ts` |

## Query contract for generated collection routes

_No generated collection routes in this domain._

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
