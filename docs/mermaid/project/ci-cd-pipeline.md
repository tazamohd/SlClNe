# CI/CD Pipeline

The three real GitHub Actions workflows in `.github/workflows/`: continuous integration (`ci.yml`), GitHub Pages deployment (`deploy-pages.yml`), and an automated PR test-report comment (`pr-report.yml`).

```mermaid
flowchart TB
    PUSH["push to any branch\nor pull_request\nor workflow_dispatch"] --> CI

    subgraph CI["CI workflow (ci.yml) — concurrency: cancel in-progress per ref"]
        BUILD["build\nTypecheck, build and gates\n(app/, Node 22)"]
        E2E["e2e\nRoute, behaviour and brand checks\n(needs: build)"]
        GOLDEN["golden\nGolden paths — 702 tests,\nratcheted against baseline\n(needs: build)"]
        A11Y["a11y\nAccessibility (axe)\n(needs: build)"]
        STYPE["server-typecheck\n(server/, packages/contract/)"]
        STEST["server-test\nvitest against real Postgres 16\n(RLS-scoped salis_app role)"]
        SEC["security\nGitleaks secret scan +\nnpm audit (app, server, contract)"]

        BUILD --> E2E
        BUILD --> GOLDEN
        BUILD --> A11Y
    end

    BUILD -.steps.-> B1["npm ci"]
    B1 --> B2["npm run typecheck"]
    B2 --> B3["npm run test --if-present"]
    B3 --> B4["npm run build"]
    B4 --> B5["Registry is current\n(npm run registry, diff-checked)"]
    B5 --> B6["No placeholders / fake completion\n(check-no-fake)"]
    B6 --> B7["Design tokens & brand palette\n(check-tokens)"]
    B7 --> B8["Upload gap report artifact"]

    MAIN["push to main\nor workflow_dispatch"] --> DEPLOY

    subgraph DEPLOY["Deploy to GitHub Pages (deploy-pages.yml) — concurrency group: pages"]
        DBUILD["build\nnpm ci, npm run build\nVITE_BASE_PATH=/{repo}/"]
        UPLOAD["Upload Pages artifact\n(app/dist)"]
        PDEPLOY["deploy\nactions/deploy-pages@v4"]
        DBUILD --> UPLOAD --> PDEPLOY
    end

    PR["pull_request to main"] --> REPORT

    subgraph REPORT["PR Test Report (pr-report.yml)"]
        R1["App typecheck, unit tests, build\nServer typecheck, unit tests\n(each continue-on-error)"]
        R2["Post/update PR comment\nwith pass/fail table + failure logs"]
        R1 --> R2
    end

    classDef gate fill:#eef6ee,stroke:#5a9;
    class BUILD,E2E,GOLDEN,A11Y,STYPE,STEST,SEC gate;
```

## Job summary (`ci.yml`)

| Job | Runs against | Key checks |
|---|---|---|
| `build` | `app/`, Node 22 | typecheck, tests, build, registry freshness, no-fake-completion guard, design token guard |
| `e2e` | `app/` (needs `build`) | Playwright smoke suite — routes, behaviour, mobile, brand guard |
| `golden` | `app/` (needs `build`) | 702 golden-path tests over two viewports, ratcheted against a baseline (not required to be all-green yet) |
| `a11y` | `app/` (needs `build`) | axe-core sweep per shell family/viewport; contrast findings ratcheted, other serious/critical findings fail outright |
| `server-typecheck` | `server/`, `packages/contract/` | TypeScript typecheck |
| `server-test` | `server/` + Postgres 16 service container | vitest, with RLS enforced via a non-superuser `salis_app` DB role distinct from the migration-owner role |
| `security` | all three lockfiles | Gitleaks secret scan, `npm audit --audit-level=high` per workspace (app, server, packages/contract) |

## Notes

- The CI pipeline deliberately **omits suites that don't exist yet** (unit, component, API, mobile, RTL, a11y-full, visual, golden-full) rather than stubbing them green — see the header comment in `ci.yml`.
- `deploy-pages.yml` triggers only on push to `main` or manual dispatch, builds with `VITE_BASE_PATH` set to the repo name, and deploys via `actions/deploy-pages@v4`; the `pages` concurrency group with `cancel-in-progress: true` means a new push cancels any in-flight deployment.
- `pr-report.yml` runs app + server typecheck/test/build independently (`continue-on-error: true` per step) and posts a single consolidated pass/fail comment on the PR, updating it in place on re-runs.
