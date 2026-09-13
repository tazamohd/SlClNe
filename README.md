# SALIS AUTO

Multi-tenant workshop management for the Saudi automotive aftermarket.

**Start with [`docs/00_DOCUMENT_CONTROL/DOCS_INDEX.md`](docs/00_DOCUMENT_CONTROL/DOCS_INDEX.md).** It points at the nine documents that between them explain what this system is, what state it is in, and what still blocks a release.

| If you want | Read |
|---|---|
| What it is and why | [Executive summary](docs/01_EXECUTIVE_STRATEGY/EXECUTIVE_SUMMARY.md) |
| What is missing or unverified | [Gap report](docs/00_DOCUMENT_CONTROL/DOCUMENTATION_GAP_REPORT.md) — read this before trusting anything else |
| How it is built | [Master architecture](docs/14_SOLUTION_ARCHITECTURE/MASTER_ARCHITECTURE.md) |
| The API | [API overview](docs/17_API_INTEGRATION/API_OVERVIEW.md) |
| Who may do what | [RBAC matrix](docs/19_SECURITY/RBAC_MATRIX.md) |

Every factual document under `docs/` is generated from the implementation — the Drizzle schema, the route files, the shared contract, the migrations, the spec files — and regenerated with `npm run docs:generate`. `npm run docs:check` fails when the committed documentation differs from a fresh generation, so it cannot drift from the code without breaking the build. The rules those documents are held to are in [the documentation standards](docs/00_DOCUMENT_CONTROL/DOCUMENTATION_STANDARDS.md).

Layout: `app/` is the React SPA (packaged for iOS and Android with Capacitor), `server/` the Fastify API and PostgreSQL migrations, `packages/contract/` the schemas, permission matrix and business rules both sides share, `project-control/` the machine-readable registries, and `tools/docs/` the documentation toolchain.

---

## Historical: the original design handoff

The text below is the README of the Claude Design bundle this repository started from. It is kept for provenance. It is **not** current instructions — the product described in it has been built, and `project/` now holds the design sources that the screen registry traces against rather than work waiting to be done.

# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 8 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/SALIS AUTO - Language Selection.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `Continuing previous work` project files (HTML prototypes, assets, components)
