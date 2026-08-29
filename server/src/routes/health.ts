/** Liveness and readiness.
 *
 *  `/health` answers "is this process running" and must never touch the
 *  database — otherwise a database blip restarts every healthy container.
 *  `/ready` answers "can it serve traffic", which does depend on the database.
 *  Both are unauthenticated, and both disclose nothing beyond that.
 */
import { sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { Database } from '../db/client'

export function registerHealthRoutes(app: FastifyInstance, deps: { db: Database }): void {
  app.get('/health', async () => ({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) }))

  app.get('/ready', async (_request, reply) => {
    try {
      await deps.db.execute(sql`select 1`)
      return { status: 'ready' }
    } catch (error) {
      app.log.error({ err: error }, 'readiness probe failed')
      reply.code(503)
      return { status: 'unavailable' }
    }
  })
}
