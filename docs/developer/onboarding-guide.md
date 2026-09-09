# SALIS AUTO -- New Developer Onboarding Guide

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-DEV-001                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Welcome

Welcome to the SALIS AUTO engineering team. SALIS AUTO is a multi-tenant automotive workshop management SaaS platform built for the Saudi Arabian market. The system manages the full vehicle service lifecycle -- from check-in through inspection, estimation, repair, quality control, and delivery -- alongside CRM, finance, accounting, HR, inventory, and AI-assisted operations.

The platform serves 220+ screens across 13 business domains, supports bilingual English/Arabic with full RTL layout, and enforces role-based access control with 14 distinct roles and 28 permission modules.

### 1.1 Team Structure

- **Frontend Team** -- React 18 SPA development, component library, screen implementation
- **Backend Team** -- Fastify REST API, Drizzle ORM, PostgreSQL, authentication, RBAC enforcement
- **Design Team** -- UI/UX prototypes (`.dc.html` files), design data pipeline
- **QA Team** -- Vitest unit tests, Playwright E2E tests, accessibility and RTL validation
- **DevOps** -- CI/CD pipelines, GitHub Pages / Vercel / Netlify deployment

---

## 2. Required Tools

Install the following before your first day of coding:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ (LTS recommended) | Runtime for frontend and backend |
| **npm** | Bundled with Node.js | Package management |
| **Git** | Latest stable | Version control |
| **VS Code** | Latest stable | Recommended editor (see extensions below) |
| **PostgreSQL** | 15+ | Production database (optional for local dev -- PGlite is the default) |

### 2.1 Recommended VS Code Extensions

- ESLint -- Linting integration
- Prettier -- Code formatting
- Tailwind CSS IntelliSense -- Tailwind class autocomplete
- TypeScript Importer -- Auto-import suggestions
- Drizzle ORM -- Schema highlighting (backend work)
- vscode-styled-components -- Tagged template highlighting if needed

### 2.2 PGlite vs. PostgreSQL

**You do not need PostgreSQL installed for local development.** When `DATABASE_URL` is not set, the backend automatically uses PGlite, an in-process PostgreSQL implementation. This means zero database setup to start contributing. Install PostgreSQL only when you need to test against a production-like environment.

---

## 3. Access Setup

Request the following access on your first day through your team lead:

| System | What You Need | Who to Ask |
|--------|---------------|------------|
| **GitHub** | Repository access to the SALIS AUTO monorepo | Team Lead |
| **Project Management** | Board access for sprint planning and task tracking | Project Manager |
| **Communication** | Team channels for engineering discussions | Team Lead |
| **Design Assets** | Access to `.dc.html` prototype files in `project/` | Design Lead |
| **CI/CD** | Ability to view pipeline runs and deployment logs | DevOps Lead |

---

## 4. Environment Setup

### 4.1 Clone the Repository

```bash
git clone <repository-url>
cd salis-auto
```

### 4.2 Install Dependencies

```bash
# Frontend
cd app
npm install

# Backend
cd ../server
npm install
```

### 4.3 Configure Environment Variables

**Frontend** -- No `.env` file is required for mock mode. To connect to a local backend:

```bash
# Create app/.env.local
VITE_API_BASE_URL=http://localhost:4000
```

**Backend** -- No `.env` file is required for PGlite mode. For PostgreSQL:

```bash
# Create server/.env
DATABASE_URL=postgresql://user:password@localhost:5432/salis_auto
JWT_SECRET=your-dev-secret-here
CORS_ORIGINS=http://localhost:5173
RATE_LIMIT_MAX=200
DEMO_PASSWORD=salis1234
```

### 4.4 Start Development Servers

```bash
# Terminal 1: Frontend (starts at http://localhost:5173)
cd app && npm run dev

# Terminal 2: Backend (starts at http://localhost:4000)
cd server && npm run dev
```

### 4.5 Verify Setup

1. Open `http://localhost:5173` in your browser
2. Log in with any of the 14 demo roles (password: `salis1234`)
3. Navigate through the sidebar -- you should see screens filtered by your selected role
4. Toggle language to Arabic and verify RTL layout switches correctly

---

## 5. First-Week Checklist

Complete these tasks during your first week:

### Day 1-2: Read and Orient

- [ ] Read the [Codebase Tour](./codebase-tour.md) -- understand directory structure, key files, and patterns
- [ ] Read the [Contributing Guide](./contributing-guide.md) -- learn branch naming, PR process, and review criteria
- [ ] Read the [Coding Standards](../system/coding-standards.md) -- TypeScript conventions, component patterns, Saudi-specific rules
- [ ] Read the [Frontend Architecture](../system/architecture/frontend-architecture.md) -- provider chain, routing, state management
- [ ] Read the [Backend Architecture](../system/architecture/backend-architecture.md) -- middleware pipeline, collection engine, tenant isolation

### Day 3-4: Run and Explore

- [ ] Run the frontend in mock mode and navigate all 13 domains
- [ ] Run the backend with PGlite and hit an API endpoint with `curl`
- [ ] Connect frontend to backend (`VITE_API_BASE_URL`) and verify the full stack
- [ ] Switch between the 14 roles and observe how RBAC filters the sidebar and screens
- [ ] Toggle EN/AR and inspect how RTL affects layout
- [ ] Run `npm run port-design` in `app/` and examine the generated files in `app/src/data/generated/`

### Day 5: Code Walkthrough and First PR

- [ ] Complete a code walkthrough with your assigned mentor
- [ ] Pick a starter ticket from the backlog
- [ ] Create a feature branch, make your change, and submit your first PR
- [ ] Request a review and address feedback

---

## 6. Key Contacts

| Role | Responsibility |
|------|---------------|
| **Tech Lead** | Architecture decisions, PR reviews for structural changes |
| **Domain Owner** | Domain-specific PR reviews, business logic questions |
| **Design Lead** | UI/UX questions, design prototype access, `.dc.html` file walkthroughs |
| **DevOps Lead** | CI/CD pipeline issues, deployment questions |
| **Project Manager** | Sprint planning, task prioritization, access requests |

---

## 7. Development Workflow Overview

Every code change follows this flow:

```
1. Pick a ticket       -- Grab a task from the sprint board
2. Create a branch     -- feature/<domain>/<short-description>
3. Write code          -- Follow coding standards, add tests
4. Run checks locally  -- npm run typecheck && npm test && npm run lint:css
5. Commit              -- Conventional Commits format
6. Push and open PR    -- Fill out the PR template
7. Code review         -- Address reviewer feedback
8. Merge               -- Squash and merge to main
9. Deploy              -- CI/CD handles deployment automatically
```

See the [Contributing Guide](./contributing-guide.md) for detailed branch naming, commit format, and PR requirements.

---

## 8. Important Documentation

Read these documents in this order for the most effective onboarding:

| Priority | Document | What You Learn |
|----------|----------|---------------|
| 1 | [Codebase Tour](./codebase-tour.md) | Directory structure, key files, "where to find things" |
| 2 | [Contributing Guide](./contributing-guide.md) | PR process, review criteria, merge strategy |
| 3 | [Coding Standards](../system/coding-standards.md) | TypeScript conventions, component patterns, naming |
| 4 | [Frontend Architecture](../system/architecture/frontend-architecture.md) | Provider chain, routing, state management |
| 5 | [Backend Architecture](../system/architecture/backend-architecture.md) | Middleware pipeline, CRUD engine, tenant isolation |
| 6 | [Data Flow](../system/architecture/data-flow.md) | Repository seam, read/write paths, cache strategy |
| 7 | [Domain Reference](../domains.md) | All 13 domains, 220+ screens, RBAC module mapping |

---

## 9. Common Gotchas for New Developers

### 9.1 PGlite vs. PostgreSQL

PGlite is the default local database. It runs in-process with no external dependencies. However:

- PGlite resets on server restart (data is ephemeral unless configured otherwise)
- Some PostgreSQL-specific features (e.g., advanced RLS testing) require a real PostgreSQL instance
- Always test against PostgreSQL before submitting PRs that touch database schema or migrations

### 9.2 Mock vs. HTTP Repositories

The frontend has two data backends that swap transparently:

- **Without `VITE_API_BASE_URL`**: Uses `mockRepository` with in-memory fixture data. Great for UI development.
- **With `VITE_API_BASE_URL`**: Uses `httpRepository` with real API calls. Required for testing auth flows, backend logic, and end-to-end behavior.

Screens must never import mock tables or HTTP clients directly. Always use `useCollection`, `useEntity`, and the mutation hooks from the repository layer.

### 9.3 Bilingual Considerations

- Every user-facing string must go through the `t()` translation function
- Arabic translations are generated from `project/gms-data.js` into `app/src/data/generated/ar.ts`
- Manual overrides go in `app/src/data/ar-overrides.ts` (takes precedence over generated)
- CSS must use logical properties (`margin-inline-start`, not `margin-left`)
- Test both LTR and RTL layouts before submitting UI changes

### 9.4 Generated Code

Files in `app/src/data/generated/` are auto-generated by `npm run port-design`. Never edit them directly -- your changes will be overwritten. Modify the source in `project/gms-data.js` instead.

### 9.5 Currency Handling

All monetary values are stored as **integer halalas** (1 SAR = 100 halalas). Never use floating-point arithmetic for currency. Use the `formatSAR()` utility for display formatting.

### 9.6 Multi-Tenancy

Every database query is scoped by `org_id` through PostgreSQL RLS. Forgetting tenant isolation in a new query is a critical security issue. The `withTenant()` wrapper handles this automatically, but always verify in code review.

### 9.7 RBAC Enforcement

RBAC is enforced on both client and server. Adding a new screen requires mapping it to a permission module in `SCREEN_MODULE` (in `rbac.ts`), and every API endpoint checks permissions via `requirePermission()`. Missing either side is a review blocker.

---

## 10. Available NPM Scripts Quick Reference

### Frontend (`app/`)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `tsc -b && vite build` | Type-check and production build |
| `typecheck` | `tsc -b` | Type-check only |
| `test` | `vitest` | Run unit tests |
| `port-design` | `node scripts/port-design-data.mjs` | Regenerate `data/generated/` |
| `smoke` | `node scripts/smoke-test.mjs` | Quick smoke test |

### Backend (`server/`)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `tsx watch src/index.ts` | Start dev server with auto-reload |
| `build` | `tsc` | Compile TypeScript |
| `typecheck` | `tsc --noEmit` | Type-check only |
| `test` | `vitest` | Run API tests |
| `db:generate` | `drizzle-kit generate` | Generate migration files |
| `db:migrate` | `drizzle-kit migrate` | Apply migrations |

---

## Related Documents

- [Codebase Tour](./codebase-tour.md) -- Architecture walkthrough with key directories
- [Contributing Guide](./contributing-guide.md) -- PR process and code review guidelines
- [Coding Standards](../system/coding-standards.md) -- TypeScript conventions and review criteria
- [Development Guide](../development.md) -- Full development setup reference
- [Domain Reference](../domains.md) -- All 13 domains and 220+ screens
