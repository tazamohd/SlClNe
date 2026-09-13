# Traceability model

**Status:** NORMATIVE · **Owner:** Documentation architect

Traceability is not a diagram of a chain. It is the ability to answer two questions about any artefact in the system, on demand, from data rather than from memory.

## The two questions

**Forward.** *Given a business objective, what was built for it and what proves it works?*

**Reverse.** *Given a database column, an endpoint, a permission cell, a screen or a test — why does it exist, what depends on it, and who may use it?*

A model that answers only the first is a project-reporting artefact. The second is what an engineer, an auditor and an incident responder actually need, and it is the harder one to keep true.

## The chain

```
STRATEGIC OBJECTIVE
  └── BUSINESS CAPABILITY          modules + screen domains
        └── REQUIREMENT            FR / NFR / DR / SR
              ├── BUSINESS RULE    a guard function in packages/contract/src/rules
              ├── ENTITY           a table in server/src/db/schema.ts
              │     └── RELATIONSHIP
              ├── API ENDPOINT     a route, with its guard
              │     ├── PERMISSION module × role × action
              │     └── DATA SCOPE enforced by RLS, not by the grant
              ├── SCREEN           a row in MASTER_REGISTRY.json
              │     └── STATE      loading / error / empty / permission
              └── TEST             a case in a spec file
                    └── GOLDEN PATH
```

## How each link is made

Every link is derived from a **real shared identifier** — never from resemblance, and never from a human filling in a mapping table that then goes stale.

| Link | Joined on | Source |
|---|---|---|
| Objective → capability | Declared in `tools/docs/lib/model.mjs` | The only hand-declared link in the chain |
| Capability → endpoint | Permission module | `server/src/registry.ts`, the route guards |
| Capability → screen | Permission module, or screen domain where the screen has none | `project-control/MASTER_REGISTRY.json` |
| Endpoint → entity | Table name, via the collection definition | `server/src/registry.ts` |
| Endpoint → permission | The `requirePermission` call in the handler | The route files |
| Permission → data scope | Role metadata | `packages/contract/src/rbac.ts` |
| Entity → relationship | Column name resolving to a table name | `server/src/db/schema.ts` |
| Rule → enforcement | The exported function itself | `packages/contract/src/rules/*.ts` |
| Endpoint → test | Path string appearing in a spec file | The spec files |
| Screen → test | The screen's e2e coverage flag | `project-control/MASTER_REGISTRY.json` |

Only the objective-to-capability link is asserted by a human. Everything below it is parsed, which means **a blank cell is evidence that no link exists in the source** — not evidence that the generator failed to look.

## Where the model is deliberately weak, and why

**The top link is the weak one.** Objectives and their mapping to capabilities are declared, not derived, because there is no elicited requirements baseline in this workspace to derive them from. Every row below that link is parsed from code; the top row is an informed assertion. That is stated here rather than hidden behind a diagram that looks uniformly solid.

**Endpoint-to-test matching is by path string.** A test that reaches an endpoint through a helper, a fixture or a golden path does not match, so the "untested endpoints" figure over-reports. It is still the right number to drive down — a path with no test naming it is a path nobody is protecting on purpose.

**Screen-to-requirement is via capability, not directly.** There is no per-screen requirement, because there is no per-screen requirement in the source. Inventing one for each of 424 screens would produce a matrix that is complete and meaningless.

## Using it

| To answer | Read |
|---|---|
| What was built for this objective, and what proves it | `09_SYSTEM_ANALYSIS/REQUIREMENTS_TRACEABILITY_MATRIX.md` |
| Why does this table exist, what reads it, is it isolated | `project-control/ENTITY_REGISTRY.json` |
| What guards this endpoint, which capability is it for | `project-control/API_REGISTRY.json` |
| May this role do this, and to which rows | `project-control/PERMISSION_REGISTRY.json` |
| What enforces this business rule, and what message does a user see | `project-control/BUSINESS_RULES.json` |
| Where is this screen, what data backs it, is it covered | `project-control/MASTER_REGISTRY.json` |
| Where is the chain broken | The "Where the chain breaks" section of the traceability matrix |

## Keeping it true

`npm run docs:check` fails when a screen or an endpoint maps to no capability. That single check is what keeps the model from decaying: a new endpoint with a permission module nobody has mapped breaks the build on the day it is added, rather than becoming an untraced orphan discovered during an audit.
