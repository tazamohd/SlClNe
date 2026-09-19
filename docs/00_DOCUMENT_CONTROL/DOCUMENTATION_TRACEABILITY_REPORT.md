<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/requirements.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts + server/src/routes/*.ts (functional behaviour)
       - packages/contract/src/rules/*.ts (business rules)
       - packages/contract/src/rbac.ts (security requirements)
       - server/src/db/schema.ts (data requirements)
       - server/drizzle/*.sql (isolation requirements)
       - project-control/MASTER_REGISTRY.json (interface requirements)
-->

# Documentation traceability report

**Status:** GENERATED · **Sources as of:** 2026-09-18

Whether the traceability chain actually resolves, measured rather than asserted. The chain itself and the full matrix are in [the requirements traceability matrix](../09_SYSTEM_ANALYSIS/REQUIREMENTS_TRACEABILITY_MATRIX.md); this is the summary a reader needs before deciding how much to trust the set.

## Chain integrity

| Link | Resolved | Of | How the link is made |
| --- | --- | --- | --- |
| Objective → capability | 18 | 18 | Declared in `tools/docs/lib/model.mjs` — the only hand-asserted link |
| Capability → requirement | 18 | 18 | One functional requirement generated per capability |
| Capability → endpoint | 440 | 440 | Permission module |
| Capability → screen | 430 | 430 | Permission module, or screen domain where the screen has none |
| Endpoint → entity | 289 | 440 | Table name via the collection definition |
| Endpoint → permission | 413 | 440 | `requirePermission` call in the handler |
| Entity → relationship | 72 | 76 | Column name resolving to a table name |
| Rule → enforcing function | 30 | 30 | The exported function itself |
| Endpoint → test | 118 | 440 | Path string appearing in a spec file |

## Where it is intact

Every screen and every endpoint maps to a capability — 430 and 440 respectively, with no orphans. That is enforced: `docs:check` fails when a screen or an endpoint maps to nothing, so a new endpoint with an unmapped permission module breaks the build on the day it is added rather than becoming an untraced orphan found during an audit.

Every business rule names the function that enforces it, every entity is catalogued from the schema, and every permission cell is read from the matrix the server enforces with.

## Where it is weak

**The top link is asserted, not derived.** Objectives and their mapping to capabilities are declared by a human; everything below is parsed from code. There is no elicited requirements baseline in this workspace to derive the top link from, so the chain has no business-need anchor. This is the largest structural gap in the documentation.

**Endpoint-to-test matching is by path string.** 322 of 440 endpoints have no spec file naming their path. A test reaching an endpoint through a helper or a golden path does not match, so this over-reports — and it is still the right number to drive down.

**2 rule guard(s) have no test naming them**, and 5 capabilities have no linked test suite.

## Answering the reverse question

Given any artefact, the registries say why it exists:

| Start from | Read | Get |
| --- | --- | --- |
| A table | `project-control/ENTITY_REGISTRY.json` | Endpoints, relationships, RLS status, tests |
| An endpoint | `project-control/API_REGISTRY.json` | Capability, permission, scope, entity, tests |
| A permission cell | `project-control/PERMISSION_REGISTRY.json` | Role, action, data scope, approval ceiling |
| A screen | `project-control/MASTER_REGISTRY.json` | Route, module, states, data backing, coverage |
| A rule | `project-control/BUSINESS_RULES.json` | Enforcing function, file, user-facing message |
| A test | `project-control/TEST_REGISTRY.json` | Suite, kind, paths and roles exercised |
