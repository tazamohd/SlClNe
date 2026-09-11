# SALIS AUTO — Mermaid Diagram Library

This directory holds the full set of Mermaid-based charts for SALIS AUTO, organized into four categories. Every diagram is plain GitHub-renderable Mermaid (` ```mermaid ` fences using `flowchart`, `graph`, `erDiagram`, `stateDiagram-v2`, `sequenceDiagram`, `gantt`, and `journey` syntax) and is derived from the existing documentation already in this repo — see each file for its source citations.

| Category | Contents |
|---|---|
| [`project/`](./project/README.md) | System-level charts: architecture, domain model, ER diagram, deployment, CI/CD, org chart, RBAC, job-card & purchase-order state machines, approval ladder, integrations, release roadmap, WBS |
| [`user-scenarios/`](./user-scenarios/README.md) | Per-role scenario flowcharts for all 8 personas (Owner/CEO, Branch Manager, Service Advisor, Technician, QC Inspector, Accountant, Customer, Supplier), converted from the `docs/visualizations/journey-*.html` designs |
| [`user-flows/`](./user-flows/README.md) | Step-by-step operational process flows: job lifecycle, estimate approval, invoice & payment, diagnostic report, onboarding, plus admin how-to flows |
| [`user-experience/`](./user-experience/README.md) | UX journey maps (Mermaid `journey` diagrams with 1–5 satisfaction scoring) per persona, touchpoint/pain-point tables, and a cross-role "moments of truth" handoff map |

## How this differs from `docs/visualizations/`

`docs/visualizations/` contains 26 hand-drawn, interactive SVG/HTML diagrams built for visual polish. This `docs/mermaid/` library covers the same subject matter (and extends it into user scenarios, user flows, and UX journey maps) as **plain-text Mermaid diagrams** that render natively in GitHub, most IDEs, and any Markdown viewer with Mermaid support — no browser or JS runtime required, and easy to diff/version in code review.

## Rendering

Any Markdown viewer with Mermaid support (GitHub, GitLab, VS Code with the Mermaid extension, Obsidian, etc.) renders these files directly. To render standalone images, use the [Mermaid Live Editor](https://mermaid.live) or `@mermaid-js/mermaid-cli`.
