/** Configuration for the external integration adapters.
 *
 *  Kept beside the adapters it configures, the same way `auth/config.ts` sits
 *  beside the auth module. The rule is the same too: **no secret has a default
 *  literal**, and an integration with no credentials in this deployment reports
 *  itself unconfigured rather than pretending to work.
 *
 *  Every key here is documented in `server/.env.example` with no value beside it.
 */
import { z } from 'zod'

const schema = z.object({
  /** The OBD bridge — the on-prem service that actually talks to a scan tool in
   *  a bay. `unconfigured` (default) refuses: there is no bridge in any
   *  environment this code has run in, and a command that returned a plausible
   *  scan result would be diagnosing a car that was never read. `mock` is the
   *  development/test transport and says so on every response. There is
   *  deliberately no `live` value: a live bridge needs an adapter this repo does
   *  not ship, so even a populated URL stays unconfigured rather than faked. */
  OBD_TRANSPORT: z.enum(['unconfigured', 'mock']).default('unconfigured'),
  /** What a live bridge would need. Empty means unconfigured; the status
   *  endpoint names these as the missing keys. */
  OBD_BRIDGE_URL: z.string().default(''),
  OBD_BRIDGE_TOKEN: z.string().default(''),
})

export interface IntegrationConfig extends z.infer<typeof schema> {
  /** True only when a real bridge is wired — never true today, because no live
   *  adapter exists. Recorded so the status surface has one honest answer. */
  obdConfigured: boolean
}

export function loadIntegrationConfig(source: NodeJS.ProcessEnv = process.env): IntegrationConfig {
  const parsed = schema.safeParse(source)
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Invalid integration environment: ${detail}`)
  }
  const value = parsed.data
  return {
    ...value,
    /* A live bridge would need the URL and token *and* a live adapter. The
     * adapter does not exist, so this is false regardless — the honest state. */
    obdConfigured: false,
  }
}
