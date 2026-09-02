# SALIS AUTO -- Contributing Guide

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-DEV-003                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Branch Naming Convention

All branches follow the pattern:

```
<type>/<domain>/<short-description>
```

### Types

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New functionality | `feature/workshop/add-qc-checklist` |
| `bugfix/` | Bug fixes | `bugfix/finance/zatca-hash-chain-order` |
| `hotfix/` | Critical production fixes | `hotfix/auth/jwt-refresh-loop` |
| `docs/` | Documentation changes | `docs/developer/update-onboarding-guide` |
| `refactor/` | Code restructuring | `refactor/auth/extract-jwt-middleware` |
| `chore/` | Tooling, CI, dependencies | `chore/devops/ci-playwright-cache` |
| `test/` | Test additions or fixes | `test/rbac/permission-matrix-coverage` |
| `perf/` | Performance improvements | `perf/data/optimize-collection-queries` |

### Rules

- Use lowercase with hyphens for the description
- Keep descriptions short (3-5 words)
- Always include the domain segment when the change is domain-specific
- Branch from `main` unless working on a long-running feature branch

---

## 2. Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Examples

```
feat(workshop): add QC inspection checklist screen
fix(finance): correct ZATCA hash chain sequence order
refactor(auth): extract JWT verification to middleware
test(rbac): add permission tests for all 14 roles
chore(deps): update TanStack Query to v5.62
docs(developer): add codebase tour guide
perf(data): memoize collection filter computation
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | A new feature or screen |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Tooling, CI/CD, dependency updates |
| `docs` | Documentation only |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace (no logic change) |

### Scope

The scope should match one of the 13 domains (`workshop`, `registry`, `finance`, `accounting`, `crm`, `admin`, `auth`, `ai`, `parts`, `callcenter`, `reports`, `hr`, `portals`) or a cross-cutting concern (`data`, `rbac`, `i18n`, `deps`, `devops`, `developer`).

---

## 3. Pull Request Process

### 3.1 PR Template

Every PR must include the following sections:

```markdown
## What

Brief description of what this PR does.

## Why

The business or technical reason for this change. Link to the ticket.

## How

Key implementation decisions and approach taken.

## Testing

How was this tested? Include:
- Unit tests added/modified
- Manual testing steps performed
- Roles tested (if RBAC-relevant)
- RTL/Arabic layout verified (if UI change)

## Screenshots

Before/after screenshots for UI changes (both LTR and RTL if applicable).

## Checklist

- [ ] PR title follows conventional commit format
- [ ] TypeScript strict mode passes (`npm run typecheck`)
- [ ] Unit tests pass (`npm test`)
- [ ] No `any` types, `as unknown as`, or `@ts-ignore`
- [ ] Arabic translation keys added for new user-facing strings
- [ ] RTL layout verified for new UI components
- [ ] No `console.log` or `debugger` statements
- [ ] No hardcoded SAR amounts (use halala integers)
- [ ] `org_id` filtering applied to all new queries
- [ ] Zod schemas added for new API request/response shapes
```

### 3.2 PR Title

The PR title must follow the same format as commit messages:

```
feat(workshop): add QC inspection checklist screen
```

This title becomes the squash commit message upon merge.

---

## 4. Code Review Process

### 4.1 Who Reviews

| Change Type | Required Reviewer |
|-------------|------------------|
| Architectural changes (new provider, routing changes, schema redesign) | Tech Lead |
| Domain-specific business logic | Domain Owner |
| Cross-cutting concerns (auth, RBAC, i18n, data layer) | Tech Lead |
| UI component library changes (`components/ui/`) | Tech Lead + Design Lead |
| Backend schema or migration changes | Tech Lead |
| Documentation-only changes | Any team member |

### 4.2 Review SLA

| Priority | Review Turnaround |
|----------|------------------|
| Standard PRs | Within 1 business day |
| Hotfixes (P1/P2) | Within 2 hours |

### 4.3 Approval Requirements

- **Minimum 1 approval** required before merge
- **Architectural changes** require Tech Lead approval
- **RBAC changes** require Tech Lead approval
- **Database migration changes** require Tech Lead approval
- All review comments must be resolved before merge

---

## 5. Code Review Checklist

Reviewers evaluate PRs against these criteria:

### 5.1 Functionality

- Does the code do what the ticket describes?
- Are edge cases handled (empty states, error states, loading states)?
- Does it work for all applicable roles?

### 5.2 Security (OWASP)

- Is `org_id` filtering applied to all database queries? (Tenant isolation is non-negotiable)
- Is RBAC enforced on both client (`SCREEN_MODULE` + `canScreen()`) and server (`requirePermission()`)?
- Is all external input validated with Zod schemas at system boundaries?
- Are SQL queries parameterized? (Drizzle ORM handles this, but verify in raw queries)
- Is XSS prevented? (No `dangerouslySetInnerHTML` without sanitization)
- Are sensitive fields scrubbed from audit logs? (`password`, `token`, `secret`, `otp`)
- Are Separation of Duties (SOD) rules respected? (e.g., estimate creator cannot approve)

### 5.3 Performance

- Are unnecessary re-renders avoided? (`useMemo`/`useCallback` where appropriate)
- Are TanStack Query cache keys correct? (Incorrect keys cause stale data or cache misses)
- Are large lists paginated? (Max 200 per page on the server)
- Are heavy computations moved to hooks rather than component render bodies?

### 5.4 Accessibility

- Do interactive elements have appropriate ARIA labels?
- Is keyboard navigation supported?
- Do color contrasts meet WCAG AA standards?
- Are form fields properly labeled?

### 5.5 RTL and Internationalization

- Are all user-facing strings extracted to `t()` translation keys?
- Are Arabic translations provided in `ar.ts` or `ar-overrides.ts`?
- Are CSS logical properties used instead of directional (`margin-inline-start`, not `margin-left`)?
- Is the layout tested in both LTR (English) and RTL (Arabic)?
- Are number and date formats locale-aware?

### 5.6 RBAC Enforcement

- Is the screen mapped to a module in `SCREEN_MODULE`?
- Does the API endpoint call `requirePermission()` with the correct module and action?
- Are field-level visibility rules applied via `FIELD_RULES` where relevant?
- Do new screens appear in the correct navigation group (filtered by role)?

### 5.7 ZATCA Compliance (Invoice Changes)

- Are invoice changes validated against the ZATCA Phase 2 specification?
- Is the hash chain sequence correct?
- Are all required ZATCA fields populated?

---

## 6. Testing Requirements

### 6.1 What to Test

| Change Type | Required Tests |
|-------------|---------------|
| New utility function | Unit tests with edge cases |
| New custom hook | Unit tests for state transitions and side effects |
| New API endpoint | Integration tests with `supertest` + `vitest` |
| New Zod schema | Validation tests for valid and invalid inputs |
| Bug fix | Regression test that fails without the fix |
| RBAC changes | Permission tests for affected roles |

### 6.2 Coverage and Naming

- All new utilities, hooks, and Zod schemas should have test coverage (positive and negative cases)
- Critical business logic (invoice calculations, RBAC checks, workflow transitions) must have thorough coverage
- Test files live alongside their source: `VehicleCheckIn.tsx` -> `VehicleCheckIn.test.tsx`, `useWorkOrders.ts` -> `useWorkOrders.test.ts`
- Run tests: `cd app && npm test` (frontend), `cd server && npm test` (backend), `cd app && npx playwright test` (E2E)

---

## 7. Definition of Done

A ticket is "Done" when:

- [ ] Code is implemented and meets acceptance criteria
- [ ] All existing tests pass
- [ ] New tests are written for new functionality
- [ ] TypeScript strict mode passes with no errors
- [ ] PR is reviewed and approved
- [ ] PR is merged to `main`
- [ ] CI/CD pipeline succeeds (lint, typecheck, test, build)
- [ ] Feature is verified in the deployed environment

---

## 8. CI/CD Pipeline and Merge Strategy

### 8.1 PR Checks

Every PR runs: **ESLint** (lint) -> **tsc** (typecheck) -> **vitest** (unit tests) -> **vite build** (production build) -> **lint:css** + **lint:a11y** (style and accessibility). All checks must pass before merge.

### 8.2 Merge Strategy

We use **squash and merge** for all PRs. The PR title becomes the squash commit message, keeping `main` history clean and linear. Before merging, verify: all CI checks pass, at least 1 approval present, all review comments resolved.

### 8.3 Deployment

Automatic on push to `main`: GitHub Pages (`.github/workflows/deploy-pages.yml`), Vercel (`vercel.json`), and Netlify (`netlify.toml`) -- all build from `app/`.

---

## 10. Documentation Requirements

Update docs when you add a new screen ([Domain Reference](../domains.md)), API endpoint, environment variable ([Development Guide](../development.md)), architecture change, generated file ([Codebase Tour](./codebase-tour.md)), or RBAC change.

**Inline comments policy**: Write comments for **why**, not **what**. Add JSDoc to exported functions and interfaces used across modules. Comment non-obvious business rules (ZATCA logic, SOD enforcement). Do not restate what the code does.

---

## 11. Security Considerations

### 11.1 Never Commit Secrets

- Never commit `.env` files, API keys, JWT secrets, or database credentials
- The `.gitignore` file excludes `.env*` files -- verify before committing
- Use environment variables for all configuration that varies between environments
- If you accidentally commit a secret, rotate it immediately and notify the Tech Lead

### 11.2 RBAC Verification

Every new screen and API endpoint must enforce RBAC on both sides:

- **Frontend**: Map the screen to a module in `SCREEN_MODULE` (in `rbac.ts`); the `RequireAccess` guard checks `canScreen()` automatically; verify sidebar hides it for unauthorized roles
- **Backend**: Call `requirePermission(principal, module, action)` at the start of every handler with the correct flag (`v`/`c`/`e`/`d`/`x`/`a`); never skip permission checks

### 11.3 SQL Injection Prevention

- Use Drizzle ORM for all database queries -- it parameterizes automatically
- Never concatenate user input into raw SQL strings
- If raw SQL is unavoidable, use parameterized queries with `sql` tagged templates from Drizzle

### 11.4 XSS Prevention

- Never use `dangerouslySetInnerHTML` without sanitization
- React automatically escapes rendered content in JSX expressions
- Validate and sanitize all user input at system boundaries with Zod
- Be especially careful with user-generated content in Arabic (RTL override characters can be used for attacks)

### 11.5 Tenant Isolation

- Every database query is scoped by `org_id` via PostgreSQL RLS (`withTenant()` sets `SET LOCAL app.org_id`)
- Cross-tenant data leaks are P1 security incidents
- Missing resources return 404, never 403 (do not leak existence across tenants)

### 11.6 Audit Trail

- Every mutation is recorded in the append-only audit log (same transaction)
- Sensitive fields (`password`, `passwordHash`, `refreshToken`, `accessToken`, `token`, `secret`, `otp`) are scrubbed automatically
- Never log sensitive data to application logs

---

## 12. Coding Standards Quick Reference

For the complete set of conventions, see [Coding Standards](../system/coding-standards.md). Key points: TypeScript strict mode globally (no `any`, no `@ts-ignore`); functional components only; business logic in hooks; import order: React, third-party, internal, type-only; currency as integer halalas with `formatSAR()`; phone numbers as `+966XXXXXXXXX`; dates stored UTC, displayed AST (UTC+3); PascalCase components, camelCase hooks, snake_case SQL; pre-commit hooks run ESLint, Prettier, and `tsc --noEmit`.

---

## Related Documents

- [Onboarding Guide](./onboarding-guide.md) -- First-week checklist and setup
- [Codebase Tour](./codebase-tour.md) -- Architecture walkthrough with key directories
- [Coding Standards](../system/coding-standards.md) -- Full TypeScript conventions and review criteria
- [Frontend Architecture](../system/architecture/frontend-architecture.md) -- Provider chain, routing, state
- [Backend Architecture](../system/architecture/backend-architecture.md) -- Middleware, CRUD engine, tenant isolation
- [Data Flow](../system/architecture/data-flow.md) -- Repository seam, read/write paths
- [Domain Reference](../domains.md) -- All 13 domains and 220+ screens
