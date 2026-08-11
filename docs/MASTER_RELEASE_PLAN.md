# SALIS AUTO — Release Plan

Waves, gates and the certification model. Live state is in
`project-control/STATUS.json` and `BLOCKERS.json`; this page is the policy those
files are measured against.

---

## Where we are

**W0 — Reconnaissance.** The registry, control system and gates exist.
402 capabilities discovered, 114 rendering, 248 product routes on placeholders,
57 built screens owing their designed mobile layout, 9 computed blockers.

Nothing is releasable. The largest single fact: **no capability is backed by real
data**, so none can satisfy the Definition of Done regardless of how it looks.

---

## Waves

| Wave | Content | Exit |
|---|---|---|
| **W0** | Registry, control system, gates | Regenerates cleanly; gap report accurate |
| **W1** | UI foundation · backend + schema + RLS · auth and authz · test harness | Contracts stable and merged. **Critical path** — ten product agents wait here |
| **W2** | Ten product domains against real endpoints | Every domain capability implemented |
| **W3** | Mobile, tablet, Arabic/RTL, accessibility, security, performance | Sweeps current with W2, not queued behind it |
| **W4** | Full regression, golden paths, chaos | No regression carried forward |
| **W5** | Restore drill, staging, certification | Every gate passes |

Effort: 265 engineer-days. Elapsed depends entirely on W1 — with four foundation
agents it is roughly two weeks, and ten product agents idle for all of it.
Shortening W1 shortens the project; nothing else does.

---

## Gates

Run per tranche, and again on the integration branch before any merge:

```bash
npm run typecheck
npm run test
npm run build
npm run registry          # rebuild; fails on new flags
npm run check-no-fake     # ratchet: placeholders may fall, never rise
npm run check-tokens      # ratchet: forbidden hues and colour drift
npm run smoke
npm run e2e               # routes, journeys, breakpoints, RTL, a11y, visual
npm run rbac-lab          # persona matrix
npm run integrity         # financial, inventory, orphans, data quality
```

The two ratchets are deliberately not zero-gates yet. A gate that fails on every
run gets switched off within a day; one that forbids regression is obeyed. They
become zero-gates at W5 via `--strict`.

---

## Certification

Twenty-two categories, each scored out of 10, **each requiring ≥ 9.5**:

Architecture · UI/UX · Desktop · Tablet · Mobile · Arabic/RTL · Backend · Data ·
Mini ERP · ERP · Portals · Website · AI · Integrations · RBAC · Security ·
Accessibility · Performance · Testing · Observability · Recovery · Documentation

A strong category never compensates for a weak one. Security and business
integrity cannot be averaged away.

### Absolute blockers

Any one of these means not ready, whatever the scores say:

P0 or P1 defect · critical golden-path failure · cross-tenant access ·
unauthorized financial operation · financial or inventory corruption ·
authentication bypass · critical security vulnerability · exposed secret ·
major data-loss path · failed backup restore · broken critical mobile workflow ·
broken invoice or payment workflow

### Final sweep

Before certification, the repository is searched for `TODO`, `FIXME`, `XXX`,
`PendingScreen`, "Coming Soon", "Not Implemented", `placeholder`, `console.log`,
empty handlers, unexplained disabled buttons, fake API responses, hardcoded
permissions, hardcoded colours, duplicate components, unused and orphan routes.
Every hit is resolved or documented — none is ignored.

### The report

`docs/SALIS_AUTO_FINAL_PRODUCTION_CERTIFICATION.md`, generated from the registry
and CI artefacts, never hand-written: coverage per surface and dimension,
security findings, integrity status, suite results, open defects, known
limitations, blockers, final score.

**10/10 — PRODUCTION READY** is stated only when the evidence supports it, and
never on route coverage alone. A beautiful UI with broken persistence is not
10/10. A working backend with broken mobile is not 10/10. A complete desktop app
missing its portals is not 10/10. A complete app with untested recovery is not
10/10.

---

## Open items outside the code

- **Rotate the three GitHub PATs** pasted in chat; add secret scanning to CI
- The repository is **public** and carries the design bundle, 235 production
  screenshots, the RBAC matrix and the API contract
- This environment cannot push — pushes go through the user until the GitHub
  account is connected
- Credentials needed before an integration leaves `EXTERNAL_DEPENDENCY`: ZATCA,
  payment gateway, Unifonic, WhatsApp Cloud API, SES, an OIDC provider, map
  tiles, the OBD bridge
- Hosting must be provisioned before the staging gate: CDN, API host, managed
  Postgres, object storage, Sentry
