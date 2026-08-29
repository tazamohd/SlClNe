/** OBD device commands and the diagnostics integration status (§40, F-029).
 *
 *  Re-scanning a vehicle and clearing its trouble codes are commands to an
 *  external OBD bridge. The adapter is complete (`integrations/obd.ts`), the
 *  mock is explicit, and the unconfigured default refuses with a 503 naming what
 *  is missing — no handler here fabricates a scan. What *is* real is the reading
 *  a command produces: it is persisted to `obd_dtc_readings`, tenant-scoped, so
 *  a diagnostic report has a device history even while the live bridge is an
 *  EXTERNAL_DEPENDENCY.
 */
import { and, asc, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ulid } from 'ulid'
import { dtcCodes, obdDevices, obdDtcReadings } from '../db/schema'
import { writeAudit } from '../audit/audit'
import { withTenant, type Principal, type Tx } from '../db/tenant'
import { metaOf, principalOf } from '../http/context'
import { requirePermission } from '../security/permissions'
import { collectionByKey } from '../registry'
import { findOne } from '../query'
import {
  ObdBridgeUnavailable,
  obdStatus,
  type IntegrationStatus,
  type ObdBridge,
  type ObdCommand,
} from '../integrations/obd'
import type { IntegrationConfig } from '../integrations/config'
import { presentRow, type RouteDeps } from './collections'

export interface ObdRouteDeps extends RouteDeps {
  bridge: ObdBridge
  config: IntegrationConfig
}

function readingsDef() {
  const def = collectionByKey('obdReadings')
  if (!def) throw new Error('collection "obdReadings" is not registered')
  return def
}
function deviceDef() {
  const def = collectionByKey('obdDevices')
  if (!def) throw new Error('collection "obdDevices" is not registered')
  return def
}

/** 503 with the dependency named — the same envelope the auth providers use for
 *  an unconfigured integration, so a client handles one shape for all of them. */
function unavailable(reply: FastifyReply, request: FastifyRequest, error: ObdBridgeUnavailable) {
  request.log.warn({ path: request.url, requires: error.requires }, error.message)
  return reply.code(503).send({
    error: {
      code: 'external_dependency_unavailable',
      message: `${error.message} ${error.detail}`,
      requestId: request.id,
    },
  })
}

/** The DTCs the command runs against. For a re-scan, the codes a live device
 *  would read — the mock echoes these to stay deterministic; a live bridge
 *  ignores them and reads the hardware. Drawn from the KB, capped, ordered so
 *  the mock is repeatable. For a clear, the device's own uncleared readings. */
async function knownDtcs(tx: Tx, source: 'rescan' | 'clear', deviceId: string): Promise<ObdCommand['knownDtcs']> {
  if (source === 'clear') {
    const rows = await tx
      .select({ dtcCode: obdDtcReadings.dtcCode, description: obdDtcReadings.description, severity: obdDtcReadings.severity })
      .from(obdDtcReadings)
      .where(and(eq(obdDtcReadings.deviceId, deviceId), eq(obdDtcReadings.cleared, false), isNull(obdDtcReadings.deletedAt)))
    return rows.map((r) => ({ code: r.dtcCode, description: r.description ?? '', severity: r.severity ?? '' }))
  }
  const rows = await tx
    .select({ code: dtcCodes.code, description: dtcCodes.description, severity: dtcCodes.severity })
    .from(dtcCodes)
    .where(isNull(dtcCodes.deletedAt))
    .orderBy(asc(dtcCodes.code))
    .limit(3)
  return rows.map((r) => ({ code: r.code, description: r.description, severity: r.severity }))
}

async function loadDevice(tx: Tx, id: string) {
  return findOne(tx, deviceDef(), id)
}

export function registerObdRoutes(app: FastifyInstance, deps: ObdRouteDeps): void {
  /* A command changes device state, so it is gated on `jobcards:e` — edit, not
   * view. The same grant the workshop board's write actions require. */
  app.post('/diagnostics/devices/:id/rescan', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'e')
    const { id } = request.params as { id: string }

    try {
      return await withTenant(deps.db, principal, async (tx) => {
        const device = await loadDevice(tx, id)
        const deviceId = String(device.id)
        const candidates = await knownDtcs(tx, 'rescan', deviceId)
        const result = await deps.bridge.rescan({
          deviceId,
          deviceCode: String(device.code),
          knownDtcs: candidates,
        })
        return await recordReadings(tx, principal, request, {
          device,
          deviceId,
          source: 'rescan',
          result,
        })
      })
    } catch (error) {
      if (error instanceof ObdBridgeUnavailable) return unavailable(reply, request, error)
      throw error
    }
  })

  app.post('/diagnostics/devices/:id/clear-codes', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'e')
    const { id } = request.params as { id: string }

    try {
      return await withTenant(deps.db, principal, async (tx) => {
        const device = await loadDevice(tx, id)
        const deviceId = String(device.id)
        const outstanding = await knownDtcs(tx, 'clear', deviceId)
        const result = await deps.bridge.clearCodes({
          deviceId,
          deviceCode: String(device.code),
          knownDtcs: outstanding,
        })

        /* A clear closes out the device's uncleared readings — the history is
         * kept, marked cleared, rather than deleted. */
        await tx
          .update(obdDtcReadings)
          .set({ cleared: true, updatedBy: principal.userId })
          .where(and(eq(obdDtcReadings.deviceId, deviceId), eq(obdDtcReadings.cleared, false), isNull(obdDtcReadings.deletedAt)))

        await tx
          .update(obdDevices)
          .set({ dtcCount: 0, status: result.status, updatedBy: principal.userId })
          .where(eq(obdDevices.id, deviceId))

        await writeAudit(tx, {
          actor: principal,
          action: 'command',
          entity: 'obd_device',
          entityId: deviceId,
          before: { dtcCount: device.dtcCount },
          after: { command: 'clear_codes', status: result.status, cleared: outstanding.length, mock: result.mock },
          ...metaOf(request),
        })

        return { command: 'clear_codes', deviceId, status: result.status, cleared: outstanding.length, mock: result.mock }
      })
    } catch (error) {
      if (error instanceof ObdBridgeUnavailable) return unavailable(reply, request, error)
      throw error
    }
  })

  /* The device's reading history, newest first. A thin convenience over the
   * generic `diagnostics/readings?filter[deviceId]=` collection, scoped by path
   * so a screen need not know the device's ULID form. */
  app.get('/diagnostics/devices/:id/readings', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'v')
    const { id } = request.params as { id: string }
    return withTenant(deps.db, principal, async (tx) => {
      const device = await loadDevice(tx, id)
      const rows = await tx
        .select()
        .from(obdDtcReadings)
        .where(and(eq(obdDtcReadings.deviceId, String(device.id)), isNull(obdDtcReadings.deletedAt)))
        .orderBy(asc(obdDtcReadings.readAt))
      return { rows: rows.map((row) => presentRow(readingsDef(), principal, row as Record<string, unknown>)) }
    })
  })

  /* The EXTERNAL_DEPENDENCY status surface — what a deployment check and the
   * diagnostics screen read to know which integrations are live. Gated on
   * `jobcards:v`; names each dependency and the config that would enable it. It
   * reports the honest state and never claims a live integration. */
  app.get('/diagnostics/integrations', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'v')
    const otp = otpStatus(app)
    return { integrations: [obdStatus(deps.config, deps.bridge), otp] }
  })
}

/** Persists the DTCs a re-scan produced and updates the device, then audits the
 *  command. Returns the command summary. */
async function recordReadings(
  tx: Tx,
  principal: Principal,
  request: FastifyRequest,
  input: {
    device: Record<string, unknown>
    deviceId: string
    source: 'rescan'
    result: { status: string; dtcs: { code: string; description: string; severity: string }[]; readAt: string; mock: boolean }
  },
) {
  const { device, deviceId, result } = input
  if (result.dtcs.length > 0) {
    await tx.insert(obdDtcReadings).values(
      result.dtcs.map((dtc) => ({
        id: ulid(),
        orgId: principal.orgId,
        branchId: principal.branchId,
        deviceId,
        deviceCode: String(device.code),
        dtcCode: dtc.code,
        description: dtc.description,
        severity: dtc.severity,
        source: 'rescan',
        cleared: false,
        readAt: new Date(result.readAt),
        mock: result.mock,
        createdBy: principal.userId,
        updatedBy: principal.userId,
      })),
    )
  }

  await tx
    .update(obdDevices)
    .set({ dtcCount: result.dtcs.length, status: result.status, updatedBy: principal.userId })
    .where(eq(obdDevices.id, deviceId))

  await writeAudit(tx, {
    actor: principal,
    action: 'command',
    entity: 'obd_device',
    entityId: deviceId,
    before: { dtcCount: device.dtcCount },
    after: { command: 'rescan', status: result.status, found: result.dtcs.length, mock: result.mock },
    ...metaOf(request),
  })

  return {
    command: 'rescan',
    deviceId,
    status: result.status,
    found: result.dtcs.length,
    dtcs: result.dtcs,
    mock: result.mock,
  }
}

/** The OTP/SMS dependency status, read off the auth module's transport. The
 *  customer-approval OTP rides the same transport the auth codes do; an
 *  unconfigured transport is the honest default. */
function otpStatus(app: FastifyInstance): IntegrationStatus {
  const transport = app.auth.transport
  return {
    id: 'otp_sms',
    configured: transport.configured,
    requires: ['OTP_TRANSPORT', 'SMS provider credentials'],
    state: transport.configured
      ? `${transport.name} transport: codes are delivered`
      : 'unconfigured: approval OTP refuses with 503 until a messaging provider is set',
    dependency: 'SMS messaging provider',
  }
}
