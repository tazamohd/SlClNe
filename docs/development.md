# SALIS AUTO — Development Guide

## Prerequisites

- Node.js (18+)
- npm
- Git

No external database is required for local development — the server uses PGlite (in-process PostgreSQL) when `DATABASE_URL` is not set.

---

## Local Development Setup

### Frontend (SPA)

```bash
cd app
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173`. Hot module replacement (HMR) is enabled.

### Backend (API Server)

```bash
cd server
npm install
npm run dev
```

The Express server starts at `http://localhost:4000` using `tsx watch` for auto-reload on changes.

### Connecting Frontend to Backend

Set the environment variable before starting the frontend:

```bash
VITE_API_BASE_URL=http://localhost:4000 npm run dev
```

Without this variable, the frontend uses the `mockRepository` (in-memory fixture data from the design bundle). With it, the `RepositoryProvider` dynamically imports the HTTP client and switches to `httpRepository`.

---

## Available Scripts

### Frontend (`app/package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `tsc -b && vite build` | Type-check and build for production |
| `typecheck` | `tsc -b` | Type-check only |
| `port-design` | `node scripts/port-design-data.mjs` | Regenerate `data/generated/` from design bundle |
| `smoke` | `node scripts/smoke-test.mjs` | Quick smoke test of generated data |
| `test` | `vitest` | Run unit tests |
| `lint:css` | CSS linting | Lint stylesheets |
| `lint:a11y` | Accessibility linting | Check accessibility |

### Backend (`server/package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `tsx watch src/index.ts` | Start dev server with auto-reload |
| `start` | `node dist/index.js` | Start production server |
| `build` | `tsc` | Compile TypeScript |
| `typecheck` | `tsc --noEmit` | Type-check only |
| `test` | `vitest` | Run API tests (supertest + vitest) |
| `db:generate` | `drizzle-kit generate` | Generate migration files |
| `db:migrate` | `drizzle-kit migrate` | Apply migrations |

---

## Project Structure Conventions

### Adding a New Screen

1. **Define the screen** in `project/gms-data.js` and run `npm run port-design` to regenerate `app/src/data/generated/screens.ts`, `nav.ts`, and related files.

2. **Create the component** in the appropriate domain folder under `app/src/screens/`. Follow the naming convention: `ScreenName.tsx` with a named export matching the component name.

3. **Register the route** in `app/src/routes/index.tsx`:
   - Add a lazy import at the top of the file
   - Add the route-to-component mapping in the appropriate map (`APP_SCREENS`, `PUBLIC_SCREENS`, or `CUSTOMER_APP_SCREENS`)

4. **RBAC mapping** (for app screens): The screen must be mapped to a permission module in `SCREEN_MODULE` (`app/src/data/generated/rbac.ts`). The `RequireAccess` guard uses this to check `canScreen()`.

**Alternatively, for data-driven screens:** Add a `FeatureDef` entry in `app/src/screens/feature/definitions.ts` with stats, tabs, and table sections. The `FeatureScreenView` component renders it automatically — no custom component needed.

### Adding a New API Endpoint (Collection)

1. **Define the Drizzle table** in `server/src/db/schema.ts`. Include a `pk` serial column (never exposed to API) and all contract columns.

2. **Generate and run migration:**
   ```bash
   cd server
   npm run db:generate
   npm run db:migrate
   ```

3. **Add a `CollectionDef`** entry in `server/src/routes/collections.ts`:
   ```ts
   {
     path: '/your-endpoint',
     module: 'rbac_module_name',
     table: schema.yourTable,
     columns: ['col1', 'col2', ...],
     searchable: ['col1'],
     idField: 'col1'  // optional, enables GET /:id detail route
   }
   ```

4. **Map the frontend endpoint** in `app/src/data/http/endpoints.ts`:
   ```ts
   yourCollection: '/your-endpoint',
   ```

5. **Add the collection type** to the `Repository` interface in `app/src/data/repository.ts` and add fixture data in `app/src/data/generated/tables.ts`.

### Adding a New Role

1. Add the role definition in `project/gms-data.js` with id, label, Arabic name, icon, scope, and financial limit.
2. Add permission entries for the new role across all 28 modules in the permission matrix.
3. Run `npm run port-design` to regenerate RBAC data.
4. Add seed user credentials in the server's seed data.

### Adding Translations

1. **Generated translations** come from `project/gms-data.js` → `app/src/data/generated/ar.ts` (via `npm run port-design`).
2. **Manual overrides** go in `app/src/data/ar-overrides.ts`. Overrides take precedence over generated translations.
3. The `t()` function checks: override dictionary → generated dictionary → returns the English source string.

---

## Data Layer Architecture

### Repository Seam Pattern

```
Screen component
  → useCollection('collectionKey')
    → RepositoryProvider
      → Repository.collection.list()
        ├── mockRepository (fixture data from generated tables)
        └── httpRepository (ApiClient → Express server → Drizzle → PostgreSQL)
```

Screens never know which data source is active. The seam switches automatically based on `VITE_API_BASE_URL`.

### React Query Configuration

- **Stale time:** 60 seconds
- **Cache key:** `[collectionKey, repoId]` — the WeakMap-based `repoId` ensures the cache invalidates when the repository implementation changes (e.g., mock → HTTP swap).

### Mock Data

Fixture data in `app/src/data/generated/tables.ts` uses Saudi-specific context: SAR currency, Saudi license plates, +966 phone numbers, Saudi city names (Riyadh, Jeddah, Dammam). This data is the source of truth for the mock repository and serves as demo data.

---

## Authentication Flow (Development)

### Demo Login

The seed database includes demo accounts for all 14 roles. Each uses the `DEMO_PASSWORD` (default: `salis1234`).

### Mock Mode (Frontend Only)

When running without `VITE_API_BASE_URL`, the frontend reads the role from `localStorage` key `salis-role`. The login screen sets this value, enabling role switching without a backend.

### Full Auth Flow

1. Frontend sends `POST /auth/login` with email + password
2. Server returns `{ accessToken, refreshToken, user }`
3. Frontend stores `accessToken` as `salis-token` in localStorage
4. All API requests include `Authorization: Bearer <token>`
5. Token refresh: `POST /auth/refresh` with the refresh token
6. Logout: `POST /auth/logout` revokes the refresh token

---

## Testing

### Unit Tests (Vitest)

```bash
# Frontend
cd app && npm test

# Backend
cd server && npm test
```

Backend tests use `supertest` for HTTP assertions against the Express app.

### E2E Tests (Playwright)

```bash
cd app && npx playwright test
```

Playwright is configured for browser automation. Chromium is available for E2E testing.

### Type Checking

```bash
# Frontend
cd app && npm run typecheck

# Backend
cd server && npm run typecheck
```

Both projects use TypeScript with strict mode.

---

## Design Data Pipeline

The `project/` directory contains the design bundle: HTML/CSS/JS prototypes (`.dc.html` files) and `gms-data.js` as the source of truth.

The build script `app/scripts/port-design-data.mjs` extracts structured data from `gms-data.js` into:

| Generated File | Content |
|----------------|---------|
| `screens.ts` | 191 screen definitions with routes and purposes |
| `nav.ts` | 14 sidebar navigation groups |
| `tables.ts` | Fixture data for all 31 collections |
| `rbac.ts` | Roles, permission matrix, field rules, separation of duties |
| `badges.ts` | Status badge color palettes |
| `ar.ts` | ~2122 Arabic translation entries |

To regenerate after design changes:

```bash
cd app && npm run port-design
```

---

## Deployment

### GitHub Pages

Automatic deployment on push to `main` via `.github/workflows/deploy-pages.yml`.

- Sets `VITE_BASE_PATH` to the repository name
- Builds from `app/` directory
- Deploys via `actions/deploy-pages@v4`

### Vercel

Configuration in `vercel.json`:

- Build command: `cd app && npm install && npm run build`
- Output directory: `app/dist`
- SPA fallback: all routes rewrite to `/index.html`
- Framework: Vite

### Netlify

Configuration in `netlify.toml`:

- Build base: `app/`
- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback: `/* → /index.html` (200 redirect)

### Production Considerations

- Set `JWT_SECRET` to a strong random value (never use the default)
- Set `DATABASE_URL` to a PostgreSQL connection string
- Configure `CORS_ORIGIN` to the frontend's domain
- Adjust `ACCESS_TOKEN_TTL` and `REFRESH_TOKEN_TTL` as needed

---

## Code Conventions

### File Organization

- **Screens:** Grouped by domain under `app/src/screens/<domain>/`
- **Components:** UI primitives in `app/src/components/ui/`, shell components in `app/src/components/shell/`
- **Data layer:** Generated files in `app/src/data/generated/`, HTTP client in `app/src/data/http/`
- **Providers:** Context providers in `app/src/providers/`
- **Server routes:** Route modules in `server/src/routes/`

### Naming

- Components: PascalCase (e.g., `JobCards.tsx`, `DataTable.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useCollection.ts`, `useMediaQuery.ts`)
- Generated files: lowercase (e.g., `screens.ts`, `nav.ts`, `rbac.ts`)
- Server tables: camelCase in code, snake_case in SQL

### RTL Support

All components use CSS logical properties for bidirectional layout. The `PreferencesProvider` sets `<html dir="rtl">` when Arabic is selected. Components use `start-`/`end-` instead of `left-`/`right-`.

### LocalStorage Keys

| Key | Purpose |
|-----|---------|
| `salis-theme` | Theme preference (dark/light) |
| `salis-lang` | Language (en/ar) |
| `salis-role` | Demo role selection |
| `salis-notif` | Notification preferences |
| `salis-region` | Region setting |
| `salis-token` | JWT access token (HTTP mode) |
