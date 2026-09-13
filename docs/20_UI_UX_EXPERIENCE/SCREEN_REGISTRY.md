<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/capability.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - project-control/MASTER_REGISTRY.json (built by app/scripts/build-registry.mjs)
-->

# Screen registry

**Status:** GENERATED (a view over a registry this documentation does not own) · **Generated:** 2026-09-13

`project-control/MASTER_REGISTRY.json` is built by `app/scripts/build-registry.mjs` from the screen sources and the design bundle. This document is a reading of it, not a second copy — the numbers below change when that registry is rebuilt, never when someone edits this file.

## Totals

| Measure | Count | Of |
| --- | --- | --- |
| Registered capabilities | 424 | — |
| Product screens | 384 | 424 |
| Reference-only | 28 | 424 |
| Rendered | 424 | 424 |
| Placeholder | 0 | 424 |
| Data-backed (live API) | 99 | 424 |
| Mock-only (design fixtures) | 285 | 424 |
| End-to-end covered | 424 | 424 |
| Content-asserted (not just routed) | 424 | 424 |
| Has a loading state | 143 | 424 |
| Has an error state | 111 | 424 |
| Has an empty state | 169 | 424 |
| Arabic verified | 82 | 424 |
| RTL hazards | 0 | — |
| Tablet verified | 4 | 424 |
| Golden paths passing | 23 of 23 | — |

## The gap this table is really showing

Every screen renders and every screen has an end-to-end assertion on its content. But **285 of 424 still read design fixtures rather than the API**, and only 4 are tablet-verified. "Rendered and asserted" is a real achievement and it is not the same as "wired to production data" — conflating the two is how a project reports itself ready and then discovers the last third of the work.

## By surface

| Surface | Screens | Data-backed | In navigation |
| --- | --- | --- | --- |
| auth | 28 | 0 | 0 |
| app | 313 | 89 | 78 |
| call-center | 2 | 0 | 2 |
| customer-app | 11 | 3 | 0 |
| portal | 8 | 6 | 4 |
| reference | 28 | 0 | 0 |
| kiosk | 1 | 1 | 1 |
| native | 2 | 0 | 0 |
| public | 31 | 0 | 0 |

## By capability

| Capability | Screens | Data-backed | Loading | Error | Empty | Arabic verified |
| --- | --- | --- | --- | --- | --- | --- |
| CAP-WORKSHOP | 16 | 12 | 12 | 12 | 10 | 2 |
| CAP-CUSTOMERS | 3 | 3 | 3 | 3 | 3 | 0 |
| CAP-VEHICLES | 4 | 4 | 4 | 4 | 4 | 0 |
| CAP-INVENTORY | 7 | 1 | 3 | 3 | 7 | 0 |
| CAP-PROCUREMENT | 1 | 1 | 1 | 1 | 1 | 0 |
| CAP-BILLING | 6 | 6 | 6 | 4 | 4 | 2 |
| CAP-ACCOUNTING | 7 | 5 | 7 | 7 | 5 | 0 |
| CAP-HR | 5 | 5 | 5 | 5 | 4 | 1 |
| CAP-CRM | 12 | 10 | 10 | 10 | 12 | 0 |
| CAP-REPORTING | 11 | 9 | 11 | 9 | 7 | 0 |
| CAP-GOVERNANCE | 2 | 1 | 1 | 1 | 2 | 0 |
| CAP-PORTALS | 11 | 7 | 8 | 8 | 8 | 0 |
| CAP-AI | 10 | 3 | 3 | 3 | 3 | 4 |
| CAP-PLATFORM | 36 | 5 | 12 | 6 | 16 | 17 |
| CAP-IDENTITY | 18 | 0 | 0 | 0 | 0 | 13 |
| CAP-WEBSITE | 31 | 0 | 0 | 0 | 0 | 22 |
| CAP-CUSTOMERAPP | 11 | 3 | 11 | 11 | 11 | 0 |
| CAP-DESIGNSYSTEM | 233 | 24 | 46 | 24 | 72 | 21 |

## Full registry

The per-screen rows — route, shell, module, permissions, states, design source, flags — are in `project-control/MASTER_REGISTRY.json`. They are not duplicated here: a 424-row table in Markdown is unreadable and would go stale the moment a screen is added.
