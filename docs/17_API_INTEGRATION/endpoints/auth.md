<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — auth

**Status:** GENERATED · **Sources as of:** 2026-09-15 · 24 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/2fa/enrol` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/2fa/verify` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/biometric/challenge` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/biometric/enrol` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/forgot-password` | — | token | — | — | 2 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/login` | — | token | — | — | 12 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/logout` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| GET | `/api/v1/auth/me` | — | token | — | — | 2 | `server/src/auth/routes.ts` |
| GET | `/api/v1/auth/providers` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/refresh` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/register` | — | token | — | — | 5 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/request-otp` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/reset-password` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| GET | `/api/v1/auth/sessions` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| DELETE | `/api/v1/auth/sessions/:id` | — | token | — | — | — | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/sessions/revoke-all` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/social/:provider` | — | token | — | — | — | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/sso/callback` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/sso/start` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/switch-role` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/verify-otp` | — | token | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/public/customers/register` | — | public | — | — | 5 | `server/src/auth/routes.ts` |
| POST | `/api/v1/public/customers/resend-otp` | — | public | — | — | 1 | `server/src/auth/routes.ts` |
| POST | `/api/v1/public/customers/verify-otp` | — | public | — | — | 1 | `server/src/auth/routes.ts` |

## Query contract for generated collection routes

_No generated collection routes in this domain._

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
