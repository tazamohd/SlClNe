# Configuration Reference

Complete reference for all configuration settings in SALIS AUTO: server environment variables, frontend environment variables, localStorage keys, build configuration, and deployment settings.

---

## Server Environment Variables

These variables configure the Express/Fastify backend server.

| Variable | Required | Type | Default | Description |
|----------|----------|------|---------|-------------|
| `PORT` | No | integer | `4000` | Server listen port. The server binds to this port. |
| `CORS_ORIGIN` | No | string | `http://localhost:5173` | Allowed CORS origins. Comma-separated list or `*` for open access. |
| `JWT_SECRET` | **Yes** (prod) | string | `dev-only-change-me` | HMAC secret for signing JWT access tokens with HS256. Must be changed in production. |
| `ACCESS_TOKEN_TTL` | No | integer (seconds) | `900` | Access token lifetime. 900 seconds = 15 minutes. |
| `REFRESH_TOKEN_TTL` | No | integer (seconds) | `1209600` | Refresh token lifetime. 1,209,600 seconds = 14 days. |
| `DEMO_PASSWORD` | No | string | `salis1234` | Shared password for all demo/seed accounts. Only for development. |
| `DATABASE_URL` | No | string | — | PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/salis`). Omit for PGlite (zero-setup local development). |

### JWT_SECRET Security

- **Development**: The default `dev-only-change-me` is acceptable for local development.
- **Production**: Must be a cryptographically random string of at least 32 characters.
- **Rotation**: Changing the secret invalidates all existing access tokens. Users must re-authenticate.
- **Algorithm**: HS256 (HMAC-SHA256) via the `jsonwebtoken` library.

### Token TTL Tuning

| Setting | Conservative | Default | Relaxed |
|---------|-------------|---------|---------|
| Access Token | 300s (5 min) | 900s (15 min) | 1800s (30 min) |
| Refresh Token | 604800s (7 days) | 1209600s (14 days) | 2592000s (30 days) |

Shorter access token TTLs reduce the window if a token is compromised. Longer refresh token TTLs reduce re-authentication frequency.

### DATABASE_URL

| Mode | Configuration | Use Case |
|------|---------------|----------|
| PGlite | Omit `DATABASE_URL` | Local development, zero setup. In-process SQLite-compatible PostgreSQL. |
| PostgreSQL | Set to full connection string | Production, staging, shared development. |

PostgreSQL connection string format:
```
postgresql://username:password@hostname:5432/database_name?sslmode=require
```

---

## Frontend Environment Variables

These variables are set at build time via Vite's `import.meta.env` and must be prefixed with `VITE_`.

| Variable | Required | Type | Default | Description |
|----------|----------|------|---------|-------------|
| `VITE_API_BASE_URL` | No | string | — | API server URL (e.g., `http://localhost:4000`). When omitted, the app uses mock mode (fixture data from `generated/tables.ts`). |
| `VITE_BASE_PATH` | No | string | `/` | Base path for the SPA. Set when deploying under a subpath (e.g., `/app/`). |

### Mock vs HTTP Mode

The `repository.ts` seam selects the data source based on `VITE_API_BASE_URL`:

| `VITE_API_BASE_URL` | Mode | Data Source | Data Persistence |
|---------------------|------|-------------|-----------------|
| Not set | Mock | `fixtureRepository` (generated/tables.ts) | No — resets on page reload |
| Set | HTTP | `httpRepository` (real API calls) | Yes — persisted in PostgreSQL |

---

## localStorage Keys

The frontend stores user preferences and session state in the browser's localStorage.

| Key | Purpose | Format | Default |
|-----|---------|--------|---------|
| `salis-theme` | UI theme preference | `"dark"` or `"light"` | `"dark"` (dark mode is default) |
| `salis-lang` | Language preference | `"en"` or `"ar"` | `"en"` |
| `salis-role` | Selected role (for demo role switching) | Role ID string (e.g., `"manager"`) | — |
| `salis-notif` | Notification preferences/state | JSON object | `{}` |
| `salis-region` | Selected region | Region identifier string | — |
| `salis-token` | Authentication token data | JSON with `accessToken` and `refreshToken` | — |

### Clearing localStorage

To reset all client-side state:
```javascript
// Clear all SALIS AUTO keys
['salis-theme', 'salis-lang', 'salis-role', 'salis-notif', 'salis-region', 'salis-token'].forEach(key => localStorage.removeItem(key))
```

Or clear everything: `localStorage.clear()` (affects all sites on the same origin).

---

## Build Configuration

### Vite Configuration (`vite.config.ts`)

Key settings:

| Setting | Value | Purpose |
|---------|-------|---------|
| `server.port` | `5173` | Dev server port |
| `build.target` | `es2020` | Browser target for output |
| `base` | Value of `VITE_BASE_PATH` | Base path for assets |
| `resolve.alias` | `@` maps to `./src` | Path alias for imports |

### TypeScript Configuration (`tsconfig.json`)

| Setting | Value | Purpose |
|---------|-------|---------|
| `target` | `ES2020` | Output target |
| `module` | `ESNext` | Module system |
| `strict` | `true` | Strict type checking |
| `jsx` | `react-jsx` | JSX transform |
| `paths` | `{ "@/*": ["./src/*"] }` | Path alias |

### Tailwind Configuration (`tailwind.config.ts`)

| Setting | Value | Purpose |
|---------|-------|---------|
| `darkMode` | `"class"` | Dark mode via `.dark` class on `<html>` |
| `content` | `["./src/**/*.{ts,tsx}"]` | Template scanning paths |
| Custom colors | Blue, Orange, Light Blue, Navy, Slate | Brand palette tokens |
| Custom fonts | `font-ui`, `font-display`, `font-action`, `font-mono` | Typography tokens |

---

## Deployment Configuration

### Vercel (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

SPA fallback: All routes are rewritten to `index.html` for client-side routing.

### Netlify (`netlify.toml`)

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Same SPA fallback pattern.

### GitHub Actions

Typical CI/CD workflow steps:

1. **Install**: `npm ci`
2. **Lint**: `npm run lint`
3. **Type check**: `npx tsc --noEmit`
4. **Test**: `npm test`
5. **Build**: `npm run build`
6. **Deploy**: Push to hosting platform

### Docker

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Server stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY package*.json ./
RUN npm ci --production
EXPOSE 4000
CMD ["node", "server/dist/index.js"]
```

---

## Environment Variable Validation

### Server-Side Validation

| Variable | Validation | Error on Failure |
|----------|-----------|-----------------|
| `PORT` | Must be integer 1-65535 | Falls back to 4000 |
| `JWT_SECRET` | Must be at least 1 character | Fatal error on startup |
| `ACCESS_TOKEN_TTL` | Must be positive integer | Falls back to 900 |
| `REFRESH_TOKEN_TTL` | Must be positive integer | Falls back to 1209600 |
| `DATABASE_URL` | Must be valid PostgreSQL URL if set | Falls back to PGlite |
| `CORS_ORIGIN` | Comma-separated URLs or `*` | Falls back to localhost |

### Frontend Validation

Vite environment variables are string-typed at runtime. No runtime validation occurs — invalid values cause runtime errors in the application.

---

## Security Checklist

Before deploying to production:

| Check | Status |
|-------|--------|
| `JWT_SECRET` changed from default | Required |
| `DEMO_PASSWORD` disabled or changed | Recommended |
| `CORS_ORIGIN` set to specific domains (not `*`) | Required |
| `DATABASE_URL` uses SSL (`?sslmode=require`) | Required |
| `salis-token` localStorage is cleared on logout | Implemented |
| Access token TTL set to 15 minutes or less | Recommended |
| HTTPS enforced on all endpoints | Required |

---

## See Also

- [Error Codes](../troubleshooting/error-codes.md) — API error reference
- [Common Issues](../troubleshooting/common-issues.md) — Configuration-related troubleshooting
- [API Cookbook](./api-cookbook.md) — API usage with these settings
