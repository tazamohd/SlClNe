# SALIS AUTO — Brand Guidelines

| Field          | Value                                                    |
|----------------|----------------------------------------------------------|
| Document ID    | SA-BRD-001                                               |
| Version        | 1.0                                                      |
| Date           | 2026-09-03                                               |
| Status         | Draft — Sections 2 and 3 require Marketing Director sign-off |
| Supersedes     | Nothing. Complements `docs/marketing/press-kit.md` (SA-MKT-011) |
| Companion      | `docs/brand-social-kit.html` (SA-BRD-002) — social identity kit; PNG exports in `docs/social-kit/` |
| Source of truth| `app/src/styles/tokens/*.css` for every visual value      |

> **How to read this.** Section 4 (Visual Identity) *documents* what ships today —
> it is descriptive, verified against the code, and authoritative. Sections 2 and 3
> (Voice, Messaging) are *proposals*: no voice framework existed before this
> document, so these codify the tone already present in the product's microcopy
> rather than inventing a new one. Section 5 records where the approved press kit
> and the shipping product disagree, and that conflict is unresolved.

## Quick Reference

| Element        | Value                                                    |
|----------------|----------------------------------------------------------|
| Primary Color  | #0A5ED7 (SALIS Blue)                                     |
| Accent Color   | #F97316 (SALIS Orange)                                   |
| Primary Font   | Inter                                                    |
| Arabic Font    | Noto Sans Arabic                                         |
| Voice          | Precise, Accountable, Plain, Respectful                  |
| Primary Tagline| "Workshop Management. Saudi Standard."                   |

---

## 1. Brand Foundation

### Core Attributes

| Attribute | What it means in practice |
|-----------|---------------------------|
| **Saudi-native** | ZATCA, SAR and Arabic are not localisation features bolted on late. They are the assumptions the product is built from. |
| **Operational** | The product is used on a workshop floor by people with dirty hands and a queue behind them. Every screen is judged on whether it survives that. |
| **Accountable** | Every mutation writes an audit row in the same transaction. The brand's promise of traceability is enforced by the database, not by marketing copy. |
| **Complete** | Thirteen domains in one platform. The value is the absence of seams between them, not the count of features. |

### Positioning

For Saudi automotive workshops — from a single-bay independent to a multi-branch
fleet operation — SALIS AUTO is the workshop management platform that is
compliant, bilingual and auditable on day one, because it was built for this
market rather than translated into it.

### Audiences

| Audience | What they need from the brand |
|----------|-------------------------------|
| Workshop owner / GM | Confidence that revenue, VAT and stock reconcile without a bookkeeper's rework. |
| Service advisor | Speed at the counter, and language that a customer can be shown directly. |
| Technician | Short, unambiguous instructions on a phone, in Arabic, with one hand. |
| Finance / accountant | ZATCA correctness, and an audit trail that answers "who changed this". |
| Fleet manager | Utilisation and cost per vehicle across branches, without a spreadsheet export. |

---

## 2. Verbal Identity — Voice

### Brand Personality

| Trait | Description |
|-------|-------------|
| **Precise** | Name the exact thing. The field, the amount, the id. "That phone is already in use" beats "Duplicate record detected". |
| **Accountable** | Say what happened and what the reader can do next. When the system fails, it hands over a request id rather than an apology. |
| **Plain** | Short sentences. Contractions are fine. No ceremony, no exclamation marks. |
| **Respectful** | The reader is a professional under time pressure. Never scold, never congratulate, never explain their own job to them. |

### Tone by Context

Voice is constant; tone shifts with the stakes.

| Context | Tone | Example that ships today |
|---------|------|--------------------------|
| Empty state | Matter-of-fact, offers the next action | "Couldn't load this" |
| Field help | Precise about when it applies | "Optional. Required only for VAT-registered customers." |
| Validation error | Names the field, not the user | "That employee does not exist." |
| Permission denial | States the boundary, does not apologise | "You don't have permission to access this page." |
| Escalation (over ceiling) | Points to the route forward, not a wall | "That amount is above this role's approval ceiling." |
| Rule violation | Names the rule and the record | "A posted payroll run cannot be edited." |
| System failure | Accountable, hands over a handle | "Something went wrong. Quote the request id when reporting this." |
| Marketing | Confident, specific, evidence-led | "Estimate approval cycle reduced from 48 hours to 4 hours." |

### Voice Principles

**Lead with the object, not the apology.**
- Write: `That plate is already in use.`
- Not: `Sorry! It looks like that plate might already be taken.`

**Give the reader the next move.**
- Write: `Stock movements require an Idempotency-Key header of 8–128 characters.`
- Not: `Invalid request.`

**Never blame the reader.**
- Write: `That reference does not exist.`
- Not: `You entered an invalid reference.`

**Never leak the implementation.**
- Write: `That value is already in use.`
- Not: `duplicate key value violates unique constraint "customers_org_phone_idx"`

**State a limit as a fact, not a failure.**
- Write: `Showing the first 50,000 rows. Narrow the filter to export the rest.`
- Not: `Export failed — too many rows!`

**Use the customer's units.** Currency is SAR, always two decimals, comma
thousands, in `font-mono` so columns align. Times are workshop times ("Bay 3,
09:40"), not timestamps.

### Prohibited Language

| Avoid | Why |
|-------|-----|
| Exclamation marks in product UI | The floor is loud enough. Emphasis comes from hierarchy, not punctuation. |
| "Oops", "Whoops", "Uh-oh" | Reads as unserious next to a VAT figure. |
| "Simply", "just", "easy" | Tells the reader their difficulty is their fault. |
| "Please note", "Kindly" | Filler. Delete and the sentence improves. |
| Emoji in product UI | Not in the icon system, does not survive RTL or print, and reads as informal on a fiscal document. |
| Raw error codes shown to users | `23505`, `ZodError`, stack frames. Codes belong in logs and in the request id. |
| Untranslated English marketing terms inside Arabic UI | Product names, plates and SKUs stay Latin; explanatory prose does not. |
| Feature counts as a headline benefit | "191+ screens" is a proof point in a body paragraph, never the promise. |

### Microcopy Patterns

| Pattern | Rule |
|---------|------|
| Buttons | Verb + object, sentence case. "Post run", "Approve estimate". Never "Submit", never "OK". |
| Destructive confirms | Name the record and the consequence. "Delete job card 4F2A? The audit trail is kept." |
| Toasts | State the completed fact. "Invoice issued." Not "Success!" |
| Field labels | Noun, sentence case, no colon. "Chassis number", not "Chassis Number:". |
| Placeholders | Never a substitute for a label. Show format only: "5 or 10 digits". |
| Dates | `DD MMM YYYY` in UI. Never a bare numeric format that reads differently in the two locales. |

### Bilingual Rules (Arabic / English)

These are enforced constraints, not preferences. They come from
`app/README.md` §7 and are checked in CI.

| Rule | Reason |
|------|--------|
| Never `left` / `right` in CSS — use `start` / `end` logical utilities | RTL works without a second stylesheet. |
| Latin content inside Arabic text — plates, SKUs, invoice ids, VINs — must carry `dir="ltr"` | The bidi algorithm otherwise reorders the digits. |
| Arabic is a first-class rendering, not a translation layer | Copy is written for Arabic, not translated into it. Length differences are a layout problem to solve, not a reason to abbreviate Arabic. |
| Compliance terms (ZATCA, VAT, e-invoice) keep their official Arabic forms | Never machine-translate a regulator's vocabulary. |
| Currency is SAR with comma thousands and 2 decimals, in `font-mono` | Column alignment, and no ambiguity about halalas. |

---

## 3. Messaging

Approved messaging lives in `docs/marketing/press-kit.md` §5–6 and is reproduced here
only in summary. That document remains the source of truth for external copy.

### Taglines

| Tagline | Use |
|---------|-----|
| Workshop Management. Saudi Standard. | Primary |
| Every bay. Every branch. Every riyal. | Multi-branch messaging |
| ZATCA-compliant from day one. | Compliance-led messaging |
| Built for Saudi workshops. | Market positioning |
| From paper to platform. | Digital transformation |

### Message Pillars

| Pillar | Claim |
|--------|-------|
| Saudi-Built | Native Arabic, ZATCA and SAR — not a localised import. |
| Complete Platform | Thirteen domains, one backbone, no seams to reconcile. |
| Auditable | Every change carries actor, before, after and request id, written in the same transaction as the change. |
| Proven | Cycle-time evidence, quoted with the baseline, never as a bare percentage. |

### Evidence Rules

A number in SALIS AUTO copy carries its baseline or it does not ship.
Write "estimate approval cut from 48 hours to 4"; never "10x faster approvals".

---

## 4. Visual Identity

Every value below is read from `app/src/styles/tokens/`. Those files are the
source of truth; `app/tailwind.config.js` only exposes them as utilities. If this
section and the code ever disagree, the code is right and this section is stale.

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| SALIS Blue | #0A5ED7 | rgb(10,94,215) | Primary actions, active state, success, progress |
| SALIS Blue Hover | #0952C0 | rgb(9,82,192) | Hover on primary |
| SALIS Blue Bright | #0BB3FF | rgb(11,179,255) | Information, dark-mode success, focus ring |
| SALIS Navy | #0B1F3B | rgb(11,31,59) | Sidebar, dark surfaces, formal print |
| SALIS Orange | #F97316 | rgb(249,115,22) | Warnings and critical CTAs only |
| SALIS Orange Hover | #EA580C | rgb(234,88,12) | Hover on orange |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Blue Bright Hover | #0AA3EE | rgb(10,163,238) | Hover on informational surfaces |
| Navy Dark | #1E3A5F | rgb(30,58,95) | Raised navy surfaces |
| Orange Light | #FB923C | rgb(251,146,60) | Orange tint fills |
| Ring Light | #D7E5FA | rgb(215,229,250) | Focus ring, light mode |
| Ring Dark | #173963 | rgb(23,57,99) | Focus ring, dark mode |

### Neutral Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Neutral 300 | #CBD5E1 | rgb(203,213,225) | Dividers |
| Neutral 400 | #94A3B8 | rgb(148,163,184) | Muted text, light mode |
| Page (dark) | #0E1117 | rgb(14,17,23) | Page background, dark mode |
| Card (dark) | #151A23 | rgb(21,26,35) | Card surface, dark mode |
| Border (dark) | #232A36 | rgb(35,42,54) | Borders, dark mode |
| Body (dark) | #E6EAF0 | rgb(230,234,240) | Body text, dark mode |
| Muted (dark) | #9BA4B0 | rgb(155,164,176) | Muted text, dark mode |
| White | #FFFFFF | rgb(255,255,255) | Page background, light mode |

### Semantic Colors

| State | Light | Dark | Notes |
|-------|-------|------|-------|
| Success | #0A5ED7 | #0BB3FF | Blue, not green. Deliberate. |
| Info | #0BB3FF | #0A5ED7 | The two swap between modes for contrast. |
| Warning | #F97316 | #F97316 | Orange. |
| Destructive | #F97316 | #F97316 | Orange — **currently identical to Warning.** See §5.2. |

### The Color Law

From `app/README.md` §7, enforced by a smoke check that walks computed styles and
fails the build on dominant green or purple:

> **Never** green, red, yellow, purple, pink or teal. Blue is
> success / active / progress; orange is warnings and critical CTAs only.

This is the single most distinctive thing about the SALIS AUTO interface and the
easiest to break. A screen rebuilt from a screenshot is the common way it gets
broken — reproduce structure and content, never the source's palette.

### Font Stack

```css
--font-heading: 'Montserrat', 'Noto Sans Arabic', 'Inter', system-ui, sans-serif;
--font-body: 'Inter', 'Noto Sans Arabic', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-action: 'Poppins', 'Noto Sans Arabic', 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

Four roles, not four decorations: Inter carries all UI text, Poppins carries
navigation and buttons, Montserrat carries display headings, JetBrains Mono
carries every number that has to align — currency, plates, VINs, invoice ids.
Noto Sans Arabic sits second in each stack so an English session never fetches it.

### Type Scale

| Element | Size | Weight | Tracking | Leading |
|---------|------|--------|----------|---------|
| Display L | 32px | 700 | -0.03em | — |
| Display M | 24px | 600 | -0.02em | — |
| Display S | 20px | 500 | -0.02em | — |
| H1 | 30px | 700 | -0.03em | 1.2 |
| H2 | 22px | 500 | -0.02em | 1.3 |
| H3 | 17px | 500 | -0.02em | 1.4 |
| Headline | 20px | 600 | -0.02em | — |
| Body | 14px | 400 | — | 1.5 |
| Label | 12px | 500 | 0.025em | — |
| Caption | 11px | — | — | — |

Body is 14px, not 16px. This is a dense operational product; the scale is tuned
for tables, and raising it breaks row rhythm.

### Layout Constants

| Token | Value | Applies to |
|-------|-------|------------|
| `--row-comfortable` | 44px | Default table row |
| `--row-compact` | 36px | Dense table row |
| `--h-topbar` | see `spacing.css` | Application top bar |
| `--w-sidebar` | see `spacing.css` | Navigation rail |
| `--z-sticky` / `drawer` / `palette` / `toast` | 5 / 50 / 95 / 100 | Stacking order — do not invent new z-indexes |

### Iconography

Lucide only. 24×24, 2px stroke, round caps and joins. No second icon set, no
emoji, no filled variants.

### Motion

| Rule | Reason |
|------|--------|
| `fadeUp` animates transform only, never opacity | Animating opacity risked invisible content on throttled tabs. |
| Easing comes from `--ease` | One curve across the product. |
| Reduced motion is honoured | Operational software must not force animation on anyone. |

### Logo Usage

Logo rules are held in `docs/marketing/press-kit.md` §2 and are unchanged by this
document: minimum 120px digital / 30mm print, clear space of one icon height,
no rotation, no effects, no recolouring outside the palette, no separation of
elements. Variations available: full colour, reversed white, monochrome navy,
icon only, Arabic.

Masters live in `app/public/assets/`: `logo-full-colour.svg`, `logo-reversed-white.svg`,
`logo-mono-navy.svg`, `logo-mono-white.svg`, and the Arabic draft `logo-arabic-*.svg`
(traced from the raster on 2026-09-04 and recoloured to the tokens; the Arabic wordmark
سلس اوتو is set in Noto Sans Arabic Bold and awaits a type designer's pass). PNG copies
sit beside them for tools that cannot take SVG.

---

## 5. Consistency Audit

Run 2026-09-03 against `docs/marketing/press-kit.md` v1.0 (Approved) and the shipped
token files. **These conflicts are unresolved and need a decision.**

### 5.1 Press kit and product disagree on the palette

| Token | Press kit §3 | Ships in code | Severity |
|-------|--------------|---------------|----------|
| SALIS Blue | #1B4F9C | #0A5ED7 | High — different hue and lightness, not a rounding difference |
| SALIS Navy | #0D2137 | #0B1F3B | Medium |
| SALIS Orange | #E67E22 | #F97316 | High |
| Success | #27AE60 (green) | #0A5ED7 (blue) | **Critical — the press kit specifies a colour the build fails on** |
| Warning | #F39C12 (amber) | #F97316 (orange) | Medium |
| Error | #E74C3C (red) | #F97316 (orange) | **Critical — same as above** |
| Arabic font | IBM Plex Sans Arabic | Noto Sans Arabic | High — two different licences and metrics |
| Display font | Inter only | Montserrat / Poppins / Inter | High — the press kit does not know two of the three shipped faces exist |
| Body size | 16px | 14px | Medium |
| Alignment rule | "Left-align English, right-align Arabic" | `start` / `end` logical properties | Medium — the press kit rule breaks RTL if followed literally |

**Recommendation.** The code wins and the press kit should be reissued against
it. Three reasons: the palette is shipping and CI-enforced; the no-green/no-red
rule is a deliberate semantic decision that the press kit's secondary palette
directly contradicts; and print materials built on #1B4F9C will not match a
screenshot of the product placed beside them. This is a Marketing Director
decision, not an engineering one — but until it is made, every deck and every
printed invoice template is a coin flip.

### 5.2 Warning and Destructive are the same colour

`--warning` and `--destructive` both resolve to `--salis-orange` in light mode,
and neither is overridden in `.dark`. A destructive action and a caution are
pixel-identical in both themes, so the token split currently buys nothing.

Given that red is forbidden, this may be intentional. If so, collapse the two
tokens and stop implying a distinction. If not, differentiate destructive by
weight, border or icon rather than hue — the constraint is the palette, not the
ability to signal severity.

### 5.3 Voice was undocumented until this file

Product microcopy is already consistent — the samples quoted in §2 were written
by different agents across different domains and still agree on tone. That
consistency was unwritten and therefore fragile. Section 2 records it so it
survives the next contributor.

---

## 6. Governance

| Change | Owner | Route |
|--------|-------|-------|
| Any value in §4 | Engineering | Edit `app/src/styles/tokens/*.css`, then update §4 to match |
| Voice and microcopy (§2) | Marketing Director + Design | Amend this file |
| External messaging (§3) | Marketing Director | Amend `docs/marketing/press-kit.md`, then re-summarise here |
| Resolving §5 conflicts | Marketing Director | Decision required; see recommendation |

**Do not** create a second token file to satisfy tooling. If a script needs
`design-tokens.json`, generate it from `app/src/styles/tokens/` rather than
hand-maintaining a parallel copy — a second source of truth is how §5.1 happened.
