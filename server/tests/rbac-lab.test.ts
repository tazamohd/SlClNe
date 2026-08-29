/** The RBAC persona lab, run as a CI regression gate.
 *
 *  `scripts/rbac-lab.ts` is the diagnostic a human reads; this is the assertion
 *  a pipeline trips over. It boots the same harness the script does, runs the
 *  exact same sweep — every permission-gated surface, all fourteen roles, plus
 *  the tenant-isolation / IDOR pass — and fails if the server ever disagrees
 *  with the shared RBAC matrix or leaks across a tenant boundary.
 *
 *  It asserts against the *live* result rather than a golden file: the oracle is
 *  `granted()` reading `@salis/contract`, so the day the matrix changes, the lab
 *  re-derives what to expect and this test keeps meaning the same thing. What it
 *  pins instead is the *shape* of the run — that a meaningful number of cells and
 *  every isolation check actually executed — so a lab that silently probed
 *  nothing cannot pass by vacuously finding zero disagreements.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { runRbacLab, startLabHarness, type LabReport } from '../scripts/rbac-lab'
import type { Harness } from './harness'

let harness: Harness
let report: LabReport

beforeAll(async () => {
  harness = await startLabHarness()
  report = await runRbacLab(harness)
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

describe('RBAC persona lab (§50)', () => {
  it('probed a real, non-trivial matrix of surfaces', () => {
    // Guards against a vacuous pass: if enumeration broke and nothing ran, the
    // zero-UNEXPECTED assertion below would be meaningless.
    expect(report.surfaces.length).toBeGreaterThan(50)
    expect(report.cells.length).toBe(report.surfaces.length * 14)
    expect(report.counts.allowed).toBeGreaterThan(0)
    expect(report.counts.denied).toBeGreaterThan(0)
  })

  it('finds no cell where the server disagrees with the matrix', () => {
    // The whole point. If this fails, the failure message names every offending
    // (role, module, action) and the HTTP status the server actually returned.
    const offenders = report.unexpected.map(
      (c) =>
        `${c.role} ${c.surface.module}:${c.surface.action} — ${c.surface.label} → ${c.status}` +
        (c.code ? ` (${c.code})` : '') +
        (c.expected ? ' [matrix grants, server refused]' : ' [matrix withholds, server allowed]'),
    )
    expect(offenders).toEqual([])
    expect(report.counts.unexpected).toBe(0)
  })

  it('ran every tenant-isolation / IDOR check and none leaked', () => {
    // At least the by-id read, edit, delete, cross-role and cross-tenant-write
    // checks — a shrunken isolation pass must not slip through as "no breaches".
    expect(report.isolation.length).toBeGreaterThanOrEqual(8)
    const breaches = report.isolationBreaches.map((c) => `${c.name}: ${c.detail}`)
    expect(breaches).toEqual([])
  })
})
