<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/capability.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/MASTER_REGISTRY.json (built by app/scripts/build-registry.mjs)
-->

# Screen registry

**Status:** GENERATED (a view over a registry this documentation does not own) · **Sources as of:** 2026-09-18

`project-control/MASTER_REGISTRY.json` is built by `app/scripts/build-registry.mjs` from the screen sources and the design bundle. This document is a reading of it, not a second copy — the numbers below change when that registry is rebuilt, never when someone edits this file.

## Totals

| Measure | Count | Of |
| --- | --- | --- |
| Registered capabilities | 433 | — |
| Product screens | 395 | 433 |
| Reference-only | 28 | 433 |
| Rendered | 433 | 433 |
| Placeholder | 0 | 433 |
| Data-backed (live API) | 115 | 433 |
| Mock-only (design fixtures) | 280 | 433 |
| End-to-end covered | 433 | 433 |
| Content-asserted (not just routed) | 433 | 433 |
| Has a loading state | 158 | 433 |
| Has an error state | 124 | 433 |
| Has an empty state | 179 | 433 |
| Arabic verified | 81 | 433 |
| RTL hazards | 0 | — |
| Tablet verified | 4 | 433 |
| Golden paths passing | 23 of 23 | — |

## The gap this table is really showing

Every screen renders and every screen has an end-to-end assertion on its content. But **280 of 433 still read design fixtures rather than the API**, and only 4 are tablet-verified. "Rendered and asserted" is a real achievement and it is not the same as "wired to production data" — conflating the two is how a project reports itself ready and then discovers the last third of the work.

## By surface

| Surface | Screens | Data-backed | In navigation |
| --- | --- | --- | --- |
| auth | 28 | 0 | 0 |
| app | 314 | 102 | 88 |
| call-center | 2 | 0 | 2 |
| customer-app | 11 | 5 | 0 |
| portal | 8 | 7 | 4 |
| reference | 28 | 0 | 0 |
| kiosk | 1 | 1 | 1 |
| native | 2 | 0 | 0 |
| public | 39 | 0 | 0 |

## By capability

| Capability | Screens | Data-backed | Loading | Error | Empty | Arabic verified |
| --- | --- | --- | --- | --- | --- | --- |
| CAP-WORKSHOP | 23 | 22 | 21 | 20 | 18 | 2 |
| CAP-CUSTOMERS | 4 | 4 | 4 | 4 | 4 | 1 |
| CAP-VEHICLES | 5 | 5 | 5 | 5 | 5 | 0 |
| CAP-INVENTORY | 8 | 2 | 4 | 4 | 8 | 0 |
| CAP-PROCUREMENT | 3 | 3 | 3 | 3 | 3 | 1 |
| CAP-BILLING | 6 | 6 | 6 | 4 | 4 | 2 |
| CAP-ACCOUNTING | 8 | 8 | 8 | 8 | 6 | 0 |
| CAP-HR | 11 | 11 | 11 | 11 | 10 | 1 |
| CAP-CRM | 13 | 11 | 11 | 11 | 13 | 0 |
| CAP-REPORTING | 11 | 9 | 11 | 9 | 7 | 0 |
| CAP-GOVERNANCE | 2 | 1 | 2 | 1 | 2 | 0 |
| CAP-PORTALS | 11 | 8 | 8 | 8 | 8 | 0 |
| CAP-AI | 19 | 4 | 4 | 4 | 4 | 4 |
| CAP-PLATFORM | 36 | 5 | 12 | 6 | 17 | 17 |
| CAP-IDENTITY | 18 | 0 | 0 | 0 | 0 | 13 |
| CAP-WEBSITE | 39 | 0 | 0 | 0 | 0 | 21 |
| CAP-CUSTOMERAPP | 11 | 5 | 11 | 11 | 11 | 0 |
| CAP-DESIGNSYSTEM | 205 | 11 | 37 | 15 | 59 | 19 |

## Full registry

The per-screen rows — route, shell, module, permissions, states, design source, flags — are in `project-control/MASTER_REGISTRY.json`. They are not duplicated here: a 424-row table in Markdown is unreadable and would go stale the moment a screen is added.
