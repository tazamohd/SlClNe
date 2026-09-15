# Documentation standards

**Status:** NORMATIVE · **Owner:** Documentation architect · **Applies to:** everything under `docs/`

This document is the rule set the rest of the documentation is held to. It is short on purpose: a standards document nobody finishes reading is a standards document nobody follows.

## 1. Three classes of document, and one rule each

Every document is exactly one of these. The class decides who may change it and what "correct" means.

| Class | What it is | Rule |
|---|---|---|
| **NORMATIVE** | States a rule, a decision or an intent: architecture principles, the definition of done, a security policy, an ADR. | Changed by a human with authority over that domain. Never machine-generated. |
| **GENERATED** | Reports what the implementation currently is: entity catalogue, API reference, RBAC matrix, test catalogue, ERDs. | Never hand-edited. Edit the source and run `node tools/docs/generate.mjs`. |
| **HISTORICAL** | A previous state, retained for reference. Lives in `99_ARCHIVE/`. | Never cited as current truth, by anyone, for any reason. |

A generated document carries a banner naming its generator and its sources. `docs:check` fails if a document claims `GENERATED` without one, so the class cannot be faked.

## 2. Never state a fact you have not derived

The failure this whole system exists to prevent is a documentation set that reads as authoritative and is quietly wrong. It is worse than no documentation, because it is acted on.

Concretely:

- **Never invent an endpoint, a column, a business rule, a permission or a relationship.** If it is not in the source, it does not go in the document.
- **Never state a count in prose.** `"the 68 tables"` written by hand is wrong the next time a table is added and nobody notices for a year. Generated documents interpolate counts from the model; authored documents link to the registry instead of repeating the number.
- **Never present an intended design in the present tense.** Target-state material is labelled `TARGET` and kept in its own section. A reader who plans against a component that does not exist has been misled by the document, not by their own carelessness.
- **Never claim a test passes.** Cataloguing that a suite exists is a parse. Claiming it passes requires a run, on a date, recorded as evidence.

## 3. Mark what you do not know

Three markers, used literally:

| Marker | Means | Use when |
|---|---|---|
| `RESEARCH_REQUIRED` | A business fact with no evidence in this workspace. | Market size, competitor claims, pricing benchmarks, customer counts. |
| `LEGAL_REVIEW_REQUIRED` | A question of legal sufficiency, not of system behaviour. | Whether ZATCA output satisfies an obligation; whether a retention period is lawful. |
| `UNVERIFIED` | Stated from a source that has not been confirmed against the implementation. | An inherited document being carried forward before review. |

A marked gap is useful. An unmarked guess is a liability.

## 4. VERIFIED means a person checked it

`VERIFIED` requires two lines in the document:

```
Verified by: <name or role>
Verified on: <ISO date>
```

`docs:check` fails a document that claims `VERIFIED` without both.

Being machine-generated does **not** make a document verified. Generation proves a document was *derived* from source; whether the derivation captures what the source *means* is a human judgement. Nothing in this set is currently marked `VERIFIED`, and the gap report says so.

## 5. One canonical copy of every fact

There is exactly one register of risks, one of blockers, one permission matrix, one entity catalogue. PRINCE2, ITIL, the project dashboard and SAHEL each get a *view* over the canonical register — never their own copy.

The reason is not tidiness. Two copies of a risk register do not stay equal; they diverge, and then a status meeting is run off one while a release decision is made off the other. The canonical registers are the JSON files in `project-control/`; the Markdown under `docs/` reads them.

## 6. Structure

- **Sections are numbered** (`00_` … `99_`) so the reading order is the directory order, and so a new section has an obvious place.
- **Documents are `SCREAMING_SNAKE_CASE.md`** in the numbered sections, matching the registry keys.
- **Every document opens with a status line**: class, owner or source of truth, and generation date for generated documents.
- **Diagrams are version-controlled source** — Mermaid, PlantUML, Structurizr DSL — never an image alone. An image cannot be diffed and goes stale invisibly.
- **Internal links are relative** and are checked; a broken one fails `docs:check`.

## 7. Write for the reader who will act on it

- Lead with what the reader needs to decide or do. Background second.
- Prefer a table to a list of paragraphs when the content is comparable rows.
- State the consequence of a fact, not just the fact. "103 relationships have no foreign key" is data; "…so an orphaned reference is possible and the database will not refuse it" is what the reader needed.
- Say the uncomfortable thing plainly. A gap report that reads as reassuring has failed at its only job.

## 8. Keeping it true

| Command | Does |
|---|---|
| `node tools/docs/generate.mjs` | Regenerates every derived document and registry from source. |
| `node tools/docs/check.mjs` | Fails on drift, missing required documents, broken links, unfounded `VERIFIED` claims, unmapped screens or endpoints, and tenant tables without row-level security. |

Run `docs:generate` after any change to the schema, the routers, the permission matrix, the rule functions or the spec files. `docs:check` runs the same code and compares, so forgetting is caught at review rather than discovered by a reader months later.
