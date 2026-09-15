<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — jobcards

**Status:** GENERATED · **Sources as of:** 2026-09-15 · 56 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/diagnostics/copies` | jobcards:v | token | `diagCopies` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/copies/:id` | jobcards:v | token | `diagCopies` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/copies/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/diagnostics/copies/export` | jobcards:x | token | `diagCopies` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/devices` | jobcards:v | token | `obdDevices` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/devices/:id` | jobcards:v | token | `obdDevices` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/diagnostics/devices/:id/clear-codes` | jobcards:e | token | — | — | — | `server/src/routes/obd.ts` |
| GET | `/api/v1/diagnostics/devices/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/diagnostics/devices/:id/readings` | jobcards:v | token | — | — | — | `server/src/routes/obd.ts` |
| POST | `/api/v1/diagnostics/devices/:id/rescan` | jobcards:e | token | — | — | — | `server/src/routes/obd.ts` |
| GET | `/api/v1/diagnostics/devices/export` | jobcards:x | token | `obdDevices` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/findings` | jobcards:v | token | `diagFindings` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/findings/:id` | jobcards:v | token | `diagFindings` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/findings/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/diagnostics/findings/export` | jobcards:x | token | `diagFindings` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/integrations` | jobcards:v | token | — | — | 1 | `server/src/routes/obd.ts` |
| GET | `/api/v1/diagnostics/labour` | jobcards:v | token | `diagLabour` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/labour/:id` | jobcards:v | token | `diagLabour` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/labour/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/diagnostics/labour/export` | jobcards:x | token | `diagLabour` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/parts` | jobcards:v | token | `diagParts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/parts/:id` | jobcards:v | token | `diagParts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/parts/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/diagnostics/parts/export` | jobcards:x | token | `diagParts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/readings` | jobcards:v | token | `obdDtcReadings` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/readings/:id` | jobcards:v | token | `obdDtcReadings` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/readings/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/diagnostics/readings/export` | jobcards:x | token | `obdDtcReadings` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/stages` | jobcards:v | token | `diagStages` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/stages/:id` | jobcards:v | token | `diagStages` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/diagnostics/stages/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/diagnostics/stages/export` | jobcards:x | token | `diagStages` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/jobs` | jobcards:v | token | `jobCards` | — | 5 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/jobs` | jobcards:c | token | `jobCards` | — | 5 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/jobs/:id` | jobcards:d | token | `jobCards` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/jobs/:id` | jobcards:v | token | `jobCards` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/jobs/:id` | jobcards:e | token | `jobCards` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/jobs/:id/assign` | jobcards:e | token | — | — | — | `server/src/routes/workshop.ts` |
| GET | `/api/v1/jobs/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/jobs/:id/transition` | jobcards:e | token | — | — | — | `server/src/routes/workshop.ts` |
| POST | `/api/v1/jobs/bulk-delete` | jobcards:d | token | `jobCards` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/jobs/bulk-update` | jobcards:e | token | `jobCards` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/jobs/export` | jobcards:x | token | `jobCards` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/kb/dtc` | jobcards:v | token | `dtcCodes` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/kb/dtc/:id` | jobcards:v | token | `dtcCodes` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/kb/dtc/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/kb/dtc/export` | jobcards:x | token | `dtcCodes` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/kb/procedures` | jobcards:v | token | `kbProcedures` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/kb/procedures/:id` | jobcards:v | token | `kbProcedures` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/kb/procedures/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/kb/procedures/export` | jobcards:x | token | `kbProcedures` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/reports/workshop` | jobcards:v | token | — | — | 1 | `server/src/routes/workshop-reports.ts` |
| GET | `/api/v1/services` | jobcards:v | token | `services` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/services/:id` | jobcards:v | token | `services` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/services/:id/history` | jobcards:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/services/export` | jobcards:x | token | `services` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| services | `/services` | `label` | `label`, `createdAt` | — | createdAt asc | read-only |
| jobs | `/jobs` | `code`, `customerName`, `vehicleLabel` | `code`, `customerName`, `status`, `priority`, `createdAt` | `status`, `stage`, `priority`, `service`, `assignedTechId` | createdAt asc | yes |
| obdDevices | `/diagnostics/devices` | `code`, `vehicleLabel`, `plate`, `vin` | `code`, `bay`, `createdAt` | `status`, `bay` | createdAt asc | read-only |
| obdReadings | `/diagnostics/readings` | `dtcCode`, `description` | `readAt`, `createdAt`, `severity` | `deviceId`, `source`, `cleared`, `severity` | readAt desc | read-only |
| dtcCodes | `/kb/dtc` | `code`, `description` | `code`, `severity` | `severity`, `system` | createdAt asc | read-only |
| kbProcedures | `/kb/procedures` | `code`, `title`, `make`, `category` | `code`, `title`, `views`, `mins` | `category`, `tsb` | createdAt asc | read-only |
| diagStages | `/diagnostics/stages` | `label`, `ownerName` | `createdAt` | `role` | createdAt asc | read-only |
| diagFindings | `/diagnostics/findings` | `finding`, `dtc` | `createdAt`, `severity` | `severity`, `system` | createdAt asc | read-only |
| diagParts | `/diagnostics/parts` | `partSku`, `description` | `createdAt` | `stock` | createdAt asc | read-only |
| diagLabour | `/diagnostics/labour` | `task` | `createdAt` | — | createdAt asc | read-only |
| diagCopies | `/diagnostics/copies` | `recipient` | `createdAt` | `state` | createdAt asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
