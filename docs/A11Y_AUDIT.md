# Accessibility Audit — SALIS AUTO ERP

Static accessibility pass over the shared UI layer, run without a browser.
Scope owner: Agent 19 (accessibility + responsive).

There is no chromium in this container, so an axe-core **runtime** sweep cannot
run here. This audit is therefore **static**: a JSX tokeniser
(`app/scripts/check-a11y.mjs`) reads every `app/src/**/*.tsx`, reconstructs each
opening tag, and checks six anti-patterns that live in the *source markup*
rather than in computed styles — the structural subset of what axe would flag at
runtime. It is wired to gate regressions (see [The gate](#the-gate)).

The headline finding is that the shared primitives were already built with
accessibility in mind — the design bundle's static prototypes had none of it,
and the port added it: `Modal` already trapped focus and restored it, `Icon`
already hid decoratively, `DataTable` already used `<th scope>` and keyboard-
reachable rows, `Chip`/`Checklist` already rendered real radio/checkbox
semantics, and `Field` already wired every control to a `<label htmlFor>`. The
work here was the remaining, narrower class of gaps a count-based static rule
cannot see — **visible keyboard focus**, a **meaningful-icon escape hatch**, and
**table naming** — plus building the gate itself.

---

## 1. Checker results, by rule

Run: `node scripts/check-a11y.mjs --list`

| Rule | axe family | Count | Where |
|---|---|---:|---|
| `img-alt` | image-alt | 0 | — every `<img>` carries `alt` |
| `noninteractive-role` | interactive-role | 0 | — handlers live on `<button>`, or on `div`/`span` given `role` + `tabIndex` |
| `control-name` | button-name | 0 | — icon-only buttons carry `aria-label` |
| `field-label` | label | **2** | `shell/Topbar.tsx:22`, `screens/workshop/CustomerApproval.tsx:229` |
| `link-name` | link-name | 0 | — anchors have text (incl. numeric phone links) |
| `svg-hidden` | svg-img-alt | 0 | — raw `<svg>` is `aria-hidden` or a labelled `role="img"` |
| **Total** | | **2** | baseline = 2 |

### Before / after

The six rules are **count-based structural** checks; they do not (and a static
scan largely cannot) measure focus visibility, the presence of a focus trap, or
whether a table is *named*. Against those rules the primitive layer scored clean
**both before and after** this work — the total was 2 before and is 2 after, and
neither of the two is in a primitive. What changed is the class of issue the
rules can't count, addressed in [§3](#3-primitive-fixes-and-what-each-buys). So:

- **Structural rule total:** 2 → 2 (no regression; both residuals are
  screen/shell, tracked below).
- **Focus-visibility / semantics gaps in primitives:** 6 fixed (see §3) — these
  propagate to every screen that composes the primitive, and are exactly what an
  axe *runtime* sweep would have raised as `focus-visible` / `aria-*` findings.

The honest summary: this codebase did not have a pile of broken primitives to
repair. It had a small set of keyboard-focus and naming gaps in otherwise-solid
primitives, and a missing gate. Both are now closed.

---

## 2. What the two residuals are

Both are **outside this agent's edit scope** (shell + screens are owned
elsewhere), so they are reported, not fixed:

1. **`shell/Topbar.tsx:22`** — the desktop global-search `<input>` has a
   `placeholder` but no accessible name. A placeholder is not a label (it
   vanishes on input and is skipped by some screen readers). Fix: add
   `aria-label={t('Search')}`. One line; deliberately left to the shell owner.
   *Note:* this input is `hidden sm:flex`, so it never renders on the mobile
   header — a desktop-only defect.

2. **`screens/workshop/CustomerApproval.tsx:229`** — the one-time-code `<input>`
   has only a `placeholder="One-time code"`. Fix: add `aria-label`, or route it
   through the shared `CodeInput`, which already labels each digit box.

Neither trips over anything a keyboard user cannot work around today; both are
name-only omissions that a screen-reader user would feel immediately.

---

## 3. Primitive fixes, and what each buys

All changes are surgical and additive — every existing prop, behaviour, style,
and the RTL logical properties are preserved. All 816 tests and `tsc` stay
green. Because these live in `src/components/ui/*`, each fix lands on **every
screen** that composes the primitive.

| Primitive | Fix | What it buys across the app |
|---|---|---|
| **`Icon.tsx`** | Meaningful-icon opt-out. Still `aria-hidden` by default; when a caller passes `aria-label`/`aria-labelledby` the glyph becomes a named `role="img"` and the forced `aria-hidden` steps aside. | A meaningful icon (a status dot, an icon-only affordance) can now actually be exposed to assistive tech — previously impossible, because `aria-hidden` was hard-set before the prop spread and always won. |
| **`Chip.tsx`** | Added `focus-visible` ring. | Fuel-level radios and belongings/multiselect checkboxes now show where keyboard focus is as you Tab — the selection ring was the only cue and it doesn't move with focus. |
| **`Checklist.tsx`** | `peer` on the `sr-only` checkbox + `peer-focus-visible` ring on the tick box. | Every QC / delivery gate checklist gets a visible focus indicator; the real control is visually hidden, so the styled box now borrows its ring. |
| **`Form.tsx` (FileField)** | Reordered the `sr-only` file input before its drop-zone label and added `peer-focus-visible` ring to the label. | Every file/image upload field shows keyboard focus on the drop zone. Order is invisible (input is `sr-only`); the `htmlFor` pairing is unchanged. |
| **`Modal.tsx`** | `focus-visible` ring on the close button. | Every dialog's close affordance is now keyboard-visible. (Focus trap, `role="dialog"`, `aria-modal`, Esc, `aria-labelledby` the title, scroll-lock and focus restore were **already present** — the port built them.) |
| **`Toast.tsx`** | `focus-visible` ring on the dismiss button (+ `rounded` so the ring reads). | The corner toast's dismiss shows focus. (`role="status"` / `aria-live="polite"` were already present.) |
| **`DataTable.tsx`** | New optional `caption` prop → a visually-hidden `<caption>`. | Any table can now be *named* for a screen reader's table index — how a non-visual user tells two tables on a screen apart. `<th scope="col">`, keyboard rows, and empty/loading states were already present. |

Nothing outside `src/components/ui/*` was edited. No `shell/*` change was
required — every primitive fix was self-contained.

---

## 4. Mobile / tablet responsiveness assessment

Scan of fixed widths, responsive classes, and tap targets across the primitives
and shell.

**Strong, and deliberate.** The layer is genuinely responsive rather than a
desktop grid squeezed narrow:

- **Layout swaps at breakpoints, not overflow.** `DataTable` renders a stacked
  `MobileCard` list below 860px (via `useIsMobile`) instead of a scrolling
  table; `Modal` becomes a full-screen or bottom-sheet on phones; `FieldGrid`
  collapses `sm:grid-cols-2` → single column; the app has a separate
  `MobileShell` / `CustomerAppShell` rather than a narrowed `Topbar`/`Sidebar`.
- **RTL-safe by construction.** Spacing and insets use logical properties
  (`start`/`end`, `ps`/`pe`, `ms`/`me`) throughout, so the mobile layouts mirror
  correctly under Arabic without a second rule.
- **Motion respected.** Animated primitives carry `motion-reduce:animate-none`.

**Findings (all minor, none blocking):**

1. **Sub-44px icon-button tap targets.** Several icon-only controls are below
   the 44px comfort guideline (WCAG 2.5.5, AAA), though all meet the 24px
   **minimum** (WCAG 2.5.8, AA, 2.2):
   - `Modal` close — 28px (`h-7 w-7`)
   - `Topbar` / `PortalShell` / `CustomerAppShell` icon buttons — 32px (`h-8 w-8`)
   - `MobileShell` header buttons — 34px (`h-[34px]`)

   These pass AA but would be more comfortable on a touch screen at ≥40px. A
   larger hit area can be added with padding without changing the visual size.
   *Recommendation, not a defect.*
2. **A couple of fixed-width search inputs in the shell.** `Topbar` search is
   `w-[260px]` and `ListPage` search is `w-[220px]`. Both are gated behind
   `sm:`/desktop composition, so they don't overflow a phone — but on a narrow
   tablet in portrait they don't grow to fill the bar. Low priority.
3. **`Toast` is `min-w-[280px]`** anchored `bottom-6 end-6`. Comfortable on a
   360px+ phone; on a ~320px device the side margins tighten. Consider
   `max-w-[calc(100vw-3rem)]` if 320px is a target.
4. **Chart primitives use fixed pixel dimensions** (`Donut` 180×180,
   `min-w-[120px]` legend labels) but sit in `flex-wrap` parents, so they wrap
   rather than force horizontal scroll. Acceptable.

No horizontal-scroll-the-page issues were found in the primitives or shell; wide
content (tables) is already wrapped in `overflow-x-auto`.

---

## 5. Screen-level backlog (deliberately NOT done here)

Editing all ~106 screens is out of scope for this agent and would collide with
concurrent owners. The following are the recommended follow-ups, in priority
order, with the concrete work named so there is no silent gap:

1. **[P1] Name the two unlabelled inputs** (§2): `shell/Topbar.tsx:22` and
   `screens/workshop/CustomerApproval.tsx:229`. One `aria-label` each. These are
   the *only* two structural violations in the whole tree; clearing them lets
   the gate baseline drop from 2 → 0.
2. **[P2] Adopt `DataTable`'s new `caption` prop** on list screens with more than
   one table, or where the table's subject isn't obvious from a screen-reader's
   flat table index. Additive; no layout change. Suggested starting points: the
   accounting report screens and any detail page that stacks multiple tables.
3. **[P2] Expose meaningful status icons** now that `Icon` supports it. Audit
   screens where an icon alone conveys state (a coloured status dot, a
   pass/fail glyph with no adjacent text) and pass `aria-label`. Where the icon
   merely decorates text beside it, leave it decorative — the default is correct.
4. **[P3] Enlarge touch targets** on the icon-button family (§4.1) to ≥40px via
   padding, for the mobile shells especially.
5. **[P3] Per-screen keyboard order / landmark review.** A static scan cannot
   verify tab order, focus management on route change, or heading hierarchy
   (`h1→h2→h3`). These need the runtime axe sweep + manual keyboard passes once a
   browser is available in CI. Recommend adding an axe + Playwright job there and
   folding its findings back into this doc.

---

## The gate

`app/scripts/check-a11y.mjs` exits non-zero when the total rises above a
`BASELINE` recorded in the script (currently **2**). This fails the build on any
*new* violation while tolerating the known screen-level residue, so a new screen
cannot quietly reintroduce a pattern the primitives already solve. Ratchet
`BASELINE` **downward** as the backlog above is burned down — never up.

Add this line to `app/package.json` `"scripts"` (this agent must not edit
`package.json`):

```json
"check-a11y": "node scripts/check-a11y.mjs"
```

The six rules, their heuristics, and their documented blind spots (names
arriving through a `{...spread}`, labels wired up in a parent, wrapping-`<label>`
implicit association) are described in the header comment of the script itself.
