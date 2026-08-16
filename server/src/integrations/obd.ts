/** The OBD bridge — adapter interface, an honest mock, and nothing that fakes a
 *  live device (§40, F-029).
 *
 *  Re-scanning a vehicle and clearing its trouble codes are commands to a
 *  physical scan tool, reached through an on-prem bridge. There is no bridge in
 *  any environment this code has run in. Two ways to ship that:
 *
 *   - a handler that returns a plausible scan result, which is how a workshop
 *     app reaches production telling a technician a car is clear when nothing
 *     read it; or
 *   - this: the adapter interface is defined, the mock is explicit and labels
 *     every response as a mock, and the unconfigured default *refuses* with a
 *     503 naming the credentials that are missing.
 *
 *  `status()` is what a deployment check and the diagnostics screen read, so
 *  "is the bridge live" has an answer instead of being discovered when a
 *  technician trusts a fabricated clear.
 */
import type { IntegrationConfig } from './config'

/** A command's outcome, whichever command it was. */
export interface ObdResult {
  deviceId: string
  /** The device status after the command (`ready`, `scanning`, `clear`). */
  status: string
  /** DTCs the device reports after the command — empty after a successful
   *  clear, populated after a re-scan that found faults. */
  dtcs: { code: string; description: string; severity: string }[]
  readAt: string
  /** True when the result came from the mock, never a real device. A consumer
   *  that shows the reading must be able to say it was not a live scan. */
  mock: boolean
}

export interface ObdCommand {
  deviceId: string
  deviceCode: string
  /** Codes currently on the device, so the mock can echo or clear them
   *  deterministically rather than inventing new ones. */
  knownDtcs: { code: string; description: string; severity: string }[]
}

/** The adapter every OBD transport implements. A live implementation would POST
 *  to the bridge; the shape is fixed here so the route never changes when one
 *  arrives. */
export interface ObdBridge {
  readonly name: string
  readonly configured: boolean
  rescan(command: ObdCommand): Promise<ObdResult>
  clearCodes(command: ObdCommand): Promise<ObdResult>
}

export class ObdBridgeUnavailable extends Error {
  readonly requires: readonly string[]
  readonly detail: string
  constructor(requires: readonly string[]) {
    super('The OBD bridge is not configured in this deployment.')
    this.name = 'ObdBridgeUnavailable'
    this.requires = requires
    this.detail =
      `Set ${requires.join(', ')} and deploy a bridge adapter, then set OBD_TRANSPORT. ` +
      'Until then no device is commanded and no reading is recorded.'
  }
}

const REQUIRES = ['OBD_BRIDGE_URL', 'OBD_BRIDGE_TOKEN'] as const

/** The default. Refuses rather than pretending a car was scanned. */
export const unconfiguredObdBridge: ObdBridge = {
  name: 'unconfigured',
  configured: false,
  async rescan() {
    throw new ObdBridgeUnavailable(REQUIRES)
  },
  async clearCodes() {
    throw new ObdBridgeUnavailable(REQUIRES)
  },
}

/** Development / test transport. Deterministic, and every response is flagged
 *  `mock: true`. A re-scan echoes the codes already known to the device (a real
 *  scan would re-read them); a clear returns an empty set and a `clear` status.
 *  It talks to no hardware and says so. */
export const mockObdBridge: ObdBridge = {
  name: 'mock',
  configured: false,
  async rescan(command) {
    return {
      deviceId: command.deviceId,
      status: command.knownDtcs.length > 0 ? 'faults_found' : 'ready',
      dtcs: command.knownDtcs,
      readAt: new Date().toISOString(),
      mock: true,
    }
  },
  async clearCodes(command) {
    return {
      deviceId: command.deviceId,
      status: 'clear',
      dtcs: [],
      readAt: new Date().toISOString(),
      mock: true,
    }
  },
}

export function obdBridgeFor(config: IntegrationConfig): ObdBridge {
  switch (config.OBD_TRANSPORT) {
    case 'mock':
      return mockObdBridge
    default:
      return unconfiguredObdBridge
  }
}

export interface IntegrationStatus {
  id: string
  configured: boolean
  /** The environment keys that would make it configured. */
  requires: readonly string[]
  /** What a caller gets today, in words. */
  state: string
  /** The dependency named, so a status reader knows what is missing. */
  dependency: string
}

export function obdStatus(config: IntegrationConfig, bridge: ObdBridge): IntegrationStatus {
  return {
    id: 'obd',
    configured: config.obdConfigured,
    requires: REQUIRES,
    state:
      bridge.name === 'mock'
        ? 'mock transport: deterministic responses flagged mock, no hardware is touched'
        : 'unconfigured: device commands refuse with 503 until a bridge is deployed',
    dependency: 'on-prem OBD bridge service',
  }
}
