/** Absolute paths to every evidence source the documentation generator reads.
 *
 *  Every generated document is derived from one of these files. Nothing in
 *  `docs/` marked GENERATED may be hand-edited: it is rewritten from here, and
 *  `docs:check` fails when a checked-in copy differs from a fresh run.
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

export const P = {
  root: ROOT,
  docs: join(ROOT, 'docs'),
  control: join(ROOT, 'project-control'),
  schema: join(ROOT, 'server', 'src', 'db', 'schema.ts'),
  collections: join(ROOT, 'server', 'src', 'registry.ts'),
  routesDir: join(ROOT, 'server', 'src', 'routes'),
  authRoutes: join(ROOT, 'server', 'src', 'auth', 'routes.ts'),
  serverApp: join(ROOT, 'server', 'src', 'app.ts'),
  serverTests: join(ROOT, 'server', 'tests'),
  migrations: join(ROOT, 'server', 'drizzle'),
  contractRbac: join(ROOT, 'packages', 'contract', 'src', 'rbac.ts'),
  contractRules: join(ROOT, 'packages', 'contract', 'src', 'rules'),
  contractEntities: join(ROOT, 'packages', 'contract', 'src', 'entities'),
  appMasterRegistry: join(ROOT, 'project-control', 'MASTER_REGISTRY.json'),
  appStatus: join(ROOT, 'project-control', 'STATUS.json'),
  goldenPaths: join(ROOT, 'project-control', 'GOLDEN_PATHS.json'),
  releaseGates: join(ROOT, 'project-control', 'RELEASE_GATES.json'),
  riskRegister: join(ROOT, 'project-control', 'RISK_REGISTER.json'),
  blockers: join(ROOT, 'project-control', 'BLOCKERS.json'),
  findings: join(ROOT, 'project-control', 'FINDINGS.json'),
  testStatus: join(ROOT, 'project-control', 'TEST_STATUS.json'),
  dependencies: join(ROOT, 'project-control', 'DEPENDENCIES.json'),
  ownership: join(ROOT, 'project-control', 'OWNERSHIP.json'),
  appScreens: join(ROOT, 'app', 'src', 'screens'),
  appE2e: join(ROOT, 'app', 'e2e'),
  appTests: join(ROOT, 'app', 'tests'),
  appSrc: join(ROOT, 'app', 'src'),
  endpoints: join(ROOT, 'app', 'src', 'data', 'http', 'endpoints.ts'),
}
