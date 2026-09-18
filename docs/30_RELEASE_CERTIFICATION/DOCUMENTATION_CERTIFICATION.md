<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/release.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - the gap report
       - the extractors
-->

# Documentation certification

**Sources as of:** 2026-09-18 · **Score: 81 / 100**

## What this score is

A grade of the documentation, not of the product. Each dimension states why points were withheld, because a score without that is a number nobody can act on.

| Dimension | Weight | Score | Reasoning |
| --- | --- | --- | --- |
| Coverage | 15 | 15/15 | 35 of 35 required documents present; every entity, endpoint, rule and screen catalogued |
| Accuracy against implementation | 20 | 18/20 | Every factual document is generated from source and diffed by `docs:check`, so it cannot drift silently. Two points withheld: no human has verified that the parses capture intent, and nothing is marked VERIFIED. |
| Traceability | 15 | 11/15 | Objective → capability → requirement → entity → API → permission → screen → test resolves in both directions and the breaks are enumerated. Withheld: requirements are as-built, so the chain has no business-need anchor at the top. |
| Business and product documentation | 10 | 5/10 | Capability map, objectives and product structure are generated and accurate. Market, pricing and financial material is unsourced and marked `RESEARCH_REQUIRED` rather than written. |
| API and data documentation | 10 | 10/10 | All 418 endpoints and all 73 entities documented from source, with guards, scopes, query contracts and the FK caveat stated. |
| Architecture and system design | 10 | 8/10 | C4 levels 1–3, dynamic views, database design and the cross-cutting mechanisms are documented from the code. Withheld: no target-state architecture, and infrastructure is documented only as far as the repository shows it. |
| Operations and ITIL | 10 | 5/10 | Runbooks and service management exist in the pre-existing `docs/system/` tree and are indexed, not regenerated. No production telemetry exists to document against. |
| Diagrams | 5 | 5/5 | ERDs, C4, state machines and sequences are generated as Mermaid source in version control, regenerated with the code. |
| Discoverability and cross-linking | 5 | 4/5 | Index, registry, source-of-truth map and per-section purposes. Withheld: the pre-existing tree is classified but not yet migrated, so two structures coexist. |

**Total: 81 / 100.**

## Release gates for documentation

Documentation cannot pass a release gate if any of these is true. Each is checked by `node tools/docs/check.mjs`.

| Gate | Status |
| --- | --- |
| A critical API is undocumented | pass |
| The database or its isolation model is undocumented | pass |
| A critical business rule is undocumented | pass |
| Security architecture is undocumented | pass |
| Backup and restore are undocumented | pass — indexed from `docs/system/operations/backup-recovery.md` |
| A generated document differs from a fresh generation | checked by `docs:check` |
| A document is marked VERIFIED without evidence | pass — nothing is marked VERIFIED |
| Live documents materially contradict the implementation | checked by `docs:check` |

## What is certified

That the generated documents in this set were derived from the source files named in their banners, on the date above, by `tools/docs/`.

## What is not certified

- That the system is production-ready. See [production readiness](PRODUCTION_READINESS.md): 8 of 15 criteria are met.
- That the test suites pass. This set catalogues what they contain; it does not run them.
- That the authored documents are accurate. They carry no generator banner and no verification date.
- That the system satisfies any legal or regulatory obligation.
