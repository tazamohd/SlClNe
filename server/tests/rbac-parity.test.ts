/** The client and the server must be enforcing the same matrix.
 *
 *  `app/src/data/rbac.ts` decides what a screen shows; `packages/contract`
 *  decides what the API allows. If the design bundle changes the matrix and
 *  only the client is regenerated, the API would quietly permit more than the
 *  sidebar offers — or refuse something the sidebar shows, which users
 *  experience as the product being broken. This test is what makes that a
 *  build failure instead of a support ticket.
 */
import { describe, expect, it } from 'vitest'
import { MODULE_IDS, PERMS, ROLE_IDS, ROLE_META, SOD, FIELD_RULES } from '@salis/contract'
import {
  PERMS as APP_PERMS,
  ROLES as APP_ROLES,
  SOD as APP_SOD,
  FIELD_RULES as APP_FIELD_RULES,
} from '../../app/src/data/generated/rbac'

describe('RBAC parity between the client and the server', () => {
  it('grants exactly the same actions for every module and role', () => {
    const differences: string[] = []
    for (const module of MODULE_IDS) {
      for (const role of ROLE_IDS) {
        const server = PERMS[module][role]
        const client = APP_PERMS[module]?.[role] ?? ''
        if (server !== client) {
          differences.push(`${module}/${role}: server "${server}" vs client "${client}"`)
        }
      }
    }
    expect(differences).toEqual([])
  })

  it('covers every module the client knows about', () => {
    expect([...MODULE_IDS].sort()).toEqual(Object.keys(APP_PERMS).sort())
  })

  it('agrees on data scope and approval ceiling for all 14 roles', () => {
    expect(ROLE_IDS.length).toBe(14)
    for (const role of APP_ROLES) {
      const server = ROLE_META[role.id as (typeof ROLE_IDS)[number]]
      expect(server, `role ${role.id} is missing on the server`).toBeDefined()
      expect(server.scope).toBe(role.scope)
      expect(server.limitSar).toBe(role.limit)
    }
  })

  it('carries the same segregation-of-duties pairs and field rules', () => {
    expect(SOD.map((s) => [s.a, s.b])).toEqual(APP_SOD.map((s) => [s.a, s.b]))
    expect(FIELD_RULES.map((f) => f.field)).toEqual(APP_FIELD_RULES.map((f) => f.field))
  })
})
