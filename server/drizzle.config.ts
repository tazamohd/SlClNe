import { defineConfig } from 'drizzle-kit'

/** Drizzle Kit config. Dialect is Postgres for both drivers (PGlite is
 *  Postgres-in-WASM, real Postgres via node-postgres). Migrations are generated
 *  into ./drizzle and applied by src/db/migrate.ts / at server start. */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
})
