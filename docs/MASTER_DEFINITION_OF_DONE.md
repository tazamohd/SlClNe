# SALIS AUTO — Definition of Done

The unit of completion is a **capability**, not a file. "Customer management" is
done; `Customers.tsx` is not a thing that can be done.

A route returning HTTP 200 is the floor, not the ceiling. In the registry that is
`status: IMPLEMENTED` — the lowest rung above `DISCOVERED`, and five rungs below
`PRODUCTION_READY`.

---

## Per capability

Every line applies unless the registry records it `N/A` with a reason.

### Renders
- [ ] Design implemented — matches `*.dc.html` where one exists
- [ ] Desktop at 1280 / 1440 / 1536 / 1920
- [ ] Tablet at 768 / 820 / 834 / 1024, portrait **and** landscape
- [ ] Mobile at 390 / 430 — the designed `.Mobile` layout where one exists,
      a deliberate responsive design where none does. Never a shrunken desktop.
- [ ] Arabic strings present, no English leaking through
- [ ] RTL verified — direction, icons, chevrons, tables, charts, modal placement,
      dates, numbers, currency; Latin runs (plates, VINs, SKUs, money) pinned LTR

### States
- [ ] Loading
- [ ] Empty — honest, not filled with invented rows
- [ ] Error, with a retry path
- [ ] Success
- [ ] Permission denied
- [ ] Read-only where the role's grant is view-only
- [ ] Large dataset — paginated or virtualized, not 10,000 rows in the DOM

### Behaviour
- [ ] Reads through the repository seam, never `fetch` in a component
- [ ] Writes persist to the database and survive a reload
- [ ] Validation with inline field errors, in both languages
- [ ] Every visible action does something real — no dead CTA
- [ ] Modals wired, focus-trapped, Escape-closable, restoring focus
- [ ] Business rules enforced server-side, surfaced client-side
- [ ] RBAC enforced on the server; the client gate is convenience only
- [ ] Mutations write an audit record
- [ ] Notifications fire where the flow specifies them
- [ ] Optimistic updates roll back on rejection — the UI never shows a state the
      server refused

### Quality
- [ ] Accessibility: axe clean at serious/critical, keyboard-reachable,
      labelled, contrast-checked, reduced-motion respected
- [ ] No console errors or warnings
- [ ] No forbidden hue — blue and orange only
- [ ] Unit test for its calculations and rules
- [ ] Integration test for its screen behaviour
- [ ] Route check generated from the registry
- [ ] Visual baseline, desktop and mobile, EN and AR
- [ ] Registry updated, with `evidence[]` naming a screenshot or test artefact

---

## What "verified" means

The registry distinguishes four levels per dimension, and the difference matters:

| Level | Meaning |
|---|---|
| `MISSING` | Not built |
| `PARTIAL` | Built, nobody has checked it |
| `DONE` | Built and self-checked by the implementing agent |
| `VERIFIED` | Checked by a different agent, with evidence recorded |

An agent may set its own work to `DONE`. Only Agent 03 sets `VERIFIED`, and only
after re-running the checks rather than reading the claim. **No agent certifies
its own work.**

---

## Evidence

"Done" without evidence is a claim. Each completed capability records:

- **implementation** — the commit
- **test** — the passing suite and which assertions cover it
- **build** — typecheck and production build green
- **responsive** — screenshots at 390 and 1024
- **RBAC** — the persona matrix rows for this capability, showing DENIED where
  expected and no UNEXPECTED ACCESS anywhere

---

## Capability-level gates

Beyond the per-screen list, a domain is not done until:

- Its business invariants have tests, and a violated invariant fails CI
- Its golden path passes end to end, on desktop, at 390 px, and in Arabic
- Its data has no orphan relationships
- Its concurrent-edit case is handled — two users, one record, no corruption
- Its repeated request is idempotent where money or stock is involved

---

## Explicitly not done

These are the ways a capability looks finished and is not, listed because each
has happened somewhere in this codebase already:

- A route that renders `PendingScreen`
- A button with an empty handler
- A total hardcoded rather than derived — the mock's outstanding balance
  disagreed with the invoices printed directly beneath it
- A field rule that never fires because RBAC already excludes every role it hides
  from, mistaken for working redaction
- A tab that shows the same table as the tab beside it
- An export button that exports nothing
- A screen that renders in English and falls back to English in Arabic
- A test that asserts a route returns 200 and nothing else
