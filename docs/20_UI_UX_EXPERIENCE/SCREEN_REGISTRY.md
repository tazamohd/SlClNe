<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/capability.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/MASTER_REGISTRY.json (built by app/scripts/build-registry.mjs)
-->

# Screen registry

**Status:** GENERATED (a view over a registry this documentation does not own) · **Sources as of:** 2026-09-19

`project-control/MASTER_REGISTRY.json` is built by `app/scripts/build-registry.mjs` from the screen sources and the design bundle. This document is a reading of it, not a second copy — the numbers below change when that registry is rebuilt, never when someone edits this file.

## Totals

| Measure | Count | Of |
| --- | --- | --- |
| Registered capabilities | 436 | — |
| Product screens | 381 | 436 |
| Reference-only | 28 | 436 |
| Rendered | 436 | 436 |
| Placeholder | 0 | 436 |
| Data-backed (live API) | 161 | 436 |
| Mock-only (design fixtures) | 37 | 436 |
| End-to-end covered | 436 | 436 |
| Content-asserted (not just routed) | 436 | 436 |
| Has a loading state | 194 | 436 |
| Has an error state | 157 | 436 |
| Has an empty state | 265 | 436 |
| Arabic verified | 118 | 436 |
| RTL hazards | 0 | — |
| Tablet verified | 4 | 436 |
| Golden paths passing | 23 of 23 | — |

## The gap this table is really showing

Every screen renders and every screen has an end-to-end assertion on its content. But **37 of 436 still read design fixtures rather than the API**, and only 4 are tablet-verified. "Rendered and asserted" is a real achievement and it is not the same as "wired to production data" — conflating the two is how a project reports itself ready and then discovers the last third of the work.

## By surface

| Surface | Screens | Data-backed | In navigation |
| --- | --- | --- | --- |
| auth | 29 | 1 | 0 |
| app | 316 | 145 | 89 |
| call-center | 2 | 0 | 2 |
| customer-app | 11 | 6 | 0 |
| portal | 8 | 8 | 4 |
| reference | 28 | 0 | 0 |
| kiosk | 1 | 1 | 1 |
| native | 2 | 0 | 0 |
| public | 39 | 0 | 0 |

## By capability

| Capability | Screens | Data-backed | Loading | Error | Empty | Arabic verified |
| --- | --- | --- | --- | --- | --- | --- |
| CAP-WORKSHOP | 26 | 25 | 25 | 24 | 21 | 2 |
| CAP-CUSTOMERS | 4 | 4 | 4 | 4 | 4 | 1 |
| CAP-VEHICLES | 5 | 5 | 5 | 5 | 5 | 0 |
| CAP-INVENTORY | 9 | 9 | 9 | 9 | 9 | 0 |
| CAP-PROCUREMENT | 3 | 3 | 3 | 3 | 3 | 1 |
| CAP-BILLING | 6 | 6 | 6 | 4 | 4 | 2 |
| CAP-ACCOUNTING | 9 | 9 | 9 | 9 | 7 | 0 |
| CAP-HR | 11 | 11 | 11 | 11 | 10 | 1 |
| CAP-CRM | 13 | 11 | 11 | 11 | 13 | 0 |
| CAP-REPORTING | 11 | 11 | 11 | 9 | 7 | 0 |
| CAP-GOVERNANCE | 2 | 2 | 2 | 1 | 2 | 0 |
| CAP-PORTALS | 11 | 9 | 9 | 9 | 8 | 0 |
| CAP-AI | 19 | 4 | 4 | 4 | 16 | 9 |
| CAP-PLATFORM | 35 | 9 | 15 | 8 | 23 | 10 |
| CAP-IDENTITY | 19 | 1 | 1 | 1 | 2 | 12 |
| CAP-WEBSITE | 39 | 0 | 0 | 0 | 0 | 23 |
| CAP-CUSTOMERAPP | 11 | 6 | 11 | 11 | 11 | 0 |
| CAP-DESIGNSYSTEM | 203 | 36 | 58 | 34 | 120 | 57 |

## Full registry

The per-screen rows — route, shell, module, permissions, states, design source, flags — are in `project-control/MASTER_REGISTRY.json`. They are not duplicated here: a 424-row table in Markdown is unreadable and would go stale the moment a screen is added.
