<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/design.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - app/src/**
       - project-control/MASTER_REGISTRY.json
-->

# Frontend design

**Status:** GENERATED · **Sources as of:** 2026-09-19

Covers: the repository seam, screen states, navigation, Arabic and RTL, the mobile shell.

## The repository seam

Screens never call HTTP. They call `app/src/data/repository.ts`, which is backed either by the ported design fixtures or by the HTTP client in `app/src/data/http/`. That indirection is what makes the fixture-to-API migration **per collection and reversible** rather than a single flag day.

`app/src/data/http/endpoints.ts` maps each collection to its URL, and it is typed as a **total** `Record<CollectionKey, string | null>`. Adding a collection to the repository fails the typecheck until someone decides where it comes from, so the gap cannot be forgotten and cannot be papered over with a guessed URL that would 404 in production. `null` is deliberate — it records that the contract has no list endpoint for that collection.

## Current state of the migration

| Measure | Count | Of |
| --- | --- | --- |
| Screens reading the live API | 167 | 436 |
| Screens reading design fixtures | 31 | 436 |
| Rendering | 436 | 436 |
| Content-asserted end to end | 436 | 436 |

## Screen states

Four states a data-backed screen needs, and the counts that have them:

| State | Screens with it | Why it matters |
| --- | --- | --- |
| Loading | 196 of 436 | A screen that renders empty while fetching reads as "no data" and is indistinguishable from a real empty result |
| Error | 159 of 436 | A failed fetch with no error state is a blank screen the user cannot act on |
| Empty | 268 of 436 | Zero rows is a normal state and needs its own design, not a table with no rows |
| Permission | enforced by `RequireAccess` | A screen a role may not see must not render and then fail; it must not be reachable |

The gap is real: a fixture-backed screen has no fetch to fail, so it needs no loading or error state — which is exactly why those counts will have to rise as the remaining screens are connected.

## Arabic and RTL

119 of 436 screens are Arabic-verified and RTL hazards are held at **0**. RTL is treated as a correctness property rather than a styling preference: logical CSS properties are linted (`app/scripts/check-logical-css.mjs`), because a physical `margin-left` is a bug in an RTL layout and will not be caught by eye.

## Mobile

The same source is packaged for iOS and Android with Capacitor — not a second codebase, and not a web view of a different build. Responsive layout is a property of the screens themselves.

**4 of 436 screens are tablet-verified**, which is the weakest number on this page. A tablet is the primary device on a workshop floor.
