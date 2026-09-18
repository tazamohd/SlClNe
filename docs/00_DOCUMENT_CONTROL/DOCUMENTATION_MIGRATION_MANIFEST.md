# Documentation migration manifest

**Status:** NORMATIVE · **Owner:** Documentation architect

296 documents existed under `docs/` before the numbered architecture was introduced. This manifest classifies all of them and records where each folder is going.

## The decision that shapes this manifest

**Nothing has been bulk-moved or deleted.** The numbered sections were added alongside the existing tree, not on top of it.

That is a deliberate choice with a cost. For now two structures coexist, which is exactly the duplication this system is supposed to eliminate, and the documentation index says so plainly. The alternative was worse: a single commit moving 296 files is a commit nobody can review. Every move would land unexamined, a stale document would be relocated rather than corrected, and the one accurate record of a decision would be indistinguishable from the eleven copies of it.

So the migration is staged, one section per change, each reviewable. This manifest is the plan and the record.

## Classification

| Action | Meaning |
|---|---|
| `KEEP` | Accurate and correctly placed. Stays where it is; linked from the new index. |
| `MOVE` | Accurate, wrong place. Relocate into a numbered section unchanged. |
| `MERGE` | Overlaps another document. Fold the accurate content into the survivor; archive the rest. |
| `SPLIT` | Covers several sections' worth of material. Divide along the section boundaries. |
| `REGENERATE` | States implementation facts that a generator now derives. The hand-written copy is superseded. |
| `UPDATE` | Right place, stale content. Rewrite against the current implementation. |
| `ARCHIVE` | Historical value only. Move to `99_ARCHIVE/`; never cite as current. |
| `DELETE_DUPLICATE` | Byte-equal or near-equal copy of a surviving document. |

## Folder-level plan

### Superseded by generated documents — `REGENERATE`

These stated implementation facts by hand. Generated equivalents now derive the same facts from source and are diffed by `docs:check`, so the hand-written copies cannot be kept in step and must not be relied on.

| Current | Documents | Superseded by | Action |
|---|---|---|---|
| `docs/api.md` | 1 | `17_API_INTEGRATION/API_OVERVIEW.md` + `endpoints/*.md` | `REGENERATE` → archive |
| `docs/MASTER_RBAC_MATRIX.md`, `knowledge-base/reference/rbac-matrix.md` | 2 | `19_SECURITY/RBAC_MATRIX.md` | `REGENERATE` → archive both |
| `knowledge-base/reference/data-dictionary.md` | 1 | `13_DATA_MODELING/DATA_DICTIONARY.md` | `REGENERATE` → archive |
| `knowledge-base/reference/screen-catalog.md` | 1 | `20_UI_UX_EXPERIENCE/SCREEN_REGISTRY.md` | `REGENERATE` → archive |
| `docs/MASTER_BUSINESS_RULES.md` | 1 | `project-control/BUSINESS_RULES.json` | `SPLIT` — the rule statements regenerate; the rationale prose is normative and moves to `07_BUSINESS_ANALYSIS/` |
| `docs/system/architecture/database-design.md` | 1 | `18_DATABASE/DATABASE_DESIGN.md` | `MERGE` — keep the design rationale, drop the transcribed schema |
| `docs/certification-report.md`, `docs/registry-audit.md` | 2 | `30_RELEASE_CERTIFICATION/` | `ARCHIVE` — point-in-time reports; historical by nature |

`MASTER_BUSINESS_RULES.md` is the interesting case. The rule *statements* are now generated from the functions that enforce them, but the document also explains **why** each rule exists — which no generator can derive and which is the more valuable half. Splitting rather than archiving is the point of having a classification at all.

### Accurate and staying — `KEEP`, linked from the new index

| Current | Documents | Why it stays |
|---|---|---|
| `docs/system/adr/` | 8 | ADRs are immutable by convention. They will be indexed from `31_ARCHITECTURE_DECISIONS/`, never rewritten. |
| `docs/system/runbooks/` | 6 | Operational procedures, currently accurate. Indexed from `29_OPERATIONS_DEVOPS/RUNBOOK_INDEX.md`. |
| `docs/system/operations/` | 4 | Environment, monitoring, backup and recovery. Indexed from `29_OPERATIONS_DEVOPS/`. |
| `docs/legal/` | 6 | Policies and agreements. Legal ownership, not documentation ownership — moving them needs the owner's agreement. |
| `docs/training/` | 14 | A coherent, self-contained course set. Indexed from `23_BUSINESS_OPERATIONS/`. |
| `docs/user-documentation/` | 14 | End-user guides. A different audience from this set; they should not be interleaved with architecture. |
| `docs/knowledge-base/` (less the two above) | 32 | Support and how-to material for operators. |
| `docs/customer/`, `docs/departments/`, `docs/developer/` | 16 | Audience-specific and currently accurate. |

### Correct content, wrong place — `MOVE`

| Current | Documents | Target |
|---|---|---|
| `docs/requirements/functional/`, `non-functional/`, `prd.md`, `srs.md` | 18 | `09_SYSTEM_ANALYSIS/` and `08_PRODUCT/`, cross-linked from the generated requirements catalogue |
| `docs/project-management/prince2/` | 5 | `03_PRINCE2_GOVERNANCE/` |
| `docs/project-management/pmp/`, `agile/`, `planning/` | 20 | `04_PROJECT_MANAGEMENT/`, `06_AGILE_DELIVERY/`, `05_PLANNING/` |
| `docs/management/` | 13 | `01_EXECUTIVE_STRATEGY/` and `23_BUSINESS_OPERATIONS/` |
| `docs/marketing/` | 11 | `25_SALES_MARKETING_CUSTOMER_SUCCESS/` and `02_MARKET_BUSINESS_RESEARCH/` |
| `docs/testing/` | 4 | `27_TESTING_VALIDATION/` |
| `docs/system/security/` | 4 | `19_SECURITY/` |
| `docs/system/integration/` | 3 | `17_API_INTEGRATION/` |
| `docs/mermaid/**` | 46 | `33_MASTER_DIAGRAM_LIBRARY/`, sorted by diagram type |
| `docs/visualizations/` | 27 | `33_MASTER_DIAGRAM_LIBRARY/`, with the caveat below |

### Needs review before moving — `UPDATE`

| Current | Documents | Concern |
|---|---|---|
| `docs/MASTER_SRS.md` (33 kB) | 1 | The largest inherited document. Predates several migrations; needs checking against the generated requirements catalogue before it is treated as current. |
| `docs/architecture.md`, `docs/MASTER_ARCHITECTURE.md` | 2 | Two architecture documents with overlapping scope. `MERGE` into `14_SOLUTION_ARCHITECTURE/MASTER_ARCHITECTURE.md`, archive the loser. |
| `docs/MASTER_GAP_REPORT.md` | 1 | Superseded by the generated gap report, but may contain gaps the generator cannot see. Review, then archive. |
| `docs/domains.md`, `docs/components.md` | 2 | Overlap the generated capability map and screen registry. Review for rationale worth keeping. |
| `docs/pr48-reconciliation.md`, `docs/release-blockers.md`, `docs/A11Y_AUDIT.md`, `docs/performance-report.md`, `docs/security-report.md` | 5 | Point-in-time reports. Almost certainly `ARCHIVE`; confirm nothing live depends on them first. |
| `docs/documentation-index.md` | 1 | Superseded by `00_DOCUMENT_CONTROL/DOCS_INDEX.md`. `ARCHIVE` once every inbound link is repointed. |

### The visualizations caveat

`docs/visualizations/` holds 27 hand-authored HTML pages (755 kB — the largest single folder). They render well and they are **image-equivalent**: not diffable, not regenerable, and stale the moment the schema changes, with nothing to signal it.

They are retained and indexed rather than deleted, because several have no Mermaid equivalent. But `docs/visualizations/database-er-diagram.html` and `domain-model.html` are now superseded by generated ERDs, and should be archived once the generated versions are reviewed. New diagrams go in as Mermaid source; no new HTML diagram should be added.

## Order of work

Each step is its own commit, reviewable on its own.

1. **Repoint inbound links** to the new index, so nothing breaks when files move.
2. **Archive the point-in-time reports** — the clearest cut, no judgement needed.
3. **Archive documents superseded by generated equivalents**, one at a time, confirming the generated version covers the same ground.
4. **Split `MASTER_BUSINESS_RULES.md`**, keeping the rationale.
5. **Merge the two architecture documents.**
6. **Move the project-management and requirements trees** into their numbered sections.
7. **Move the diagram sources** into the diagram library.
8. **Review `MASTER_SRS.md`** last — the largest and the one most likely to contain something the generators cannot see.

## What must not happen

- **Nothing is deleted outright.** Superseded material goes to `99_ARCHIVE/` and stays reachable.
- **No document is moved without its inbound links being repointed.** `docs:check` fails on a broken link, which is the mechanism that enforces this.
- **No archived document is cited as current truth**, by a person or by an agent.
- **The generated documents are never hand-edited during migration.** If a generated document is wrong, the source is wrong or the generator is; fix that.
