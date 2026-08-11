/** Process entry point. */
import { assertNotSuperuser, createDb } from './db/client'
import { env } from './env'
import { buildApp } from './app'

async function main(): Promise<void> {
  const config = env()
  const handle = createDb(config.DATABASE_URL, config.DATABASE_POOL_MAX)
  await assertNotSuperuser(handle.db)

  const app = await buildApp({ db: handle.db, env: config })

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'shutting down')
    await app.close()
    await handle.close()
    process.exit(0)
  }
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))

  await app.listen({ port: config.PORT, host: config.HOST })
}

main().catch((error) => {
  process.stderr.write(`${(error as Error).stack ?? String(error)}\n`)
  process.exit(1)
})
