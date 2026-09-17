<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/release.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - the extractors
       - project-control/*.json
-->

# Known limitations

**Sources as of:** 2026-09-17

Properties of the system as it stands. Each is a deliberate position or a known gap — none is a defect report, and none is speculation.

| # | Limitation | Consequence | Evidence |
| --- | --- | --- | --- |
| L-01 | 108 of 170 relationships have no foreign key | Orphaned references are possible; no cascade; integrity depends on application code | `server/src/db/schema.ts` |
| L-02 | 284 of 425 screens read design fixtures, not the API | Behaviour under real data, latency and error conditions is unproven for those screens | `project-control/STATUS.json` |
| L-03 | 17 of 18 lifecycles declare states but no legal transitions | An illegal status move is refused only where a handler happens to check | `packages/contract/src/entities/*.ts` |
| L-04 | Only 4 of 425 screens are tablet-verified | Tablet is the primary device on a workshop floor; layout regressions would not be caught | `project-control/STATUS.json` |
| L-05 | Requirements are reverse-engineered from the implementation | The set cannot answer whether the system does what the business asked for | `docs/09_SYSTEM_ANALYSIS/REQUIREMENTS_CATALOG.md` |
| L-06 | 273 endpoints have no test matched to them by path | Over-reports (helpers and golden paths do not match), but the write endpoints among them are real exposure | `project-control/API_REGISTRY.json` |
| L-07 | Market, pricing and financial figures are unsourced | Anything in those sections is marked `RESEARCH_REQUIRED` and must not be quoted | `docs/02_MARKET_BUSINESS_RESEARCH/` |
| L-08 | ZATCA and privacy material states system behaviour, not legal sufficiency | Compliance conclusions are marked `LEGAL_REVIEW_REQUIRED` | `docs/26_LEGAL_COMPLIANCE/` |
