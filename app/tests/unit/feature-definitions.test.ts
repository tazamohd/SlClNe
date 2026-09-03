/** The feature kit's per-route layout choices, pinned.
 *
 *  `layouts.ts` is data, and data drifts: a quick link to a route that was
 *  renamed, a collection key that no longer exists, two primary actions on
 *  one screen. Each is a broken screen the type checker cannot see. */
import { describe, expect, it } from 'vitest'
import { FEATURE_DEFS } from '@/screens/feature/definitions'
import { FEATURE_LAYOUTS, withLayout } from '@/screens/feature/layouts'
import { SCREENS } from '@/data/generated/screens'
import { SPEC_SCREENS } from '@/data/generated/spec-screens'
import { mockRepository } from '@/data/repository'

const routes = new Set([...SCREENS.map((s) => s.route), ...SPEC_SCREENS.map((s) => s.route)])
const defRoutes = new Set(FEATURE_DEFS.map((d) => d.route))

describe('feature layouts', () => {
  it('only name routes the kit renders', () => {
    const stale = Object.keys(FEATURE_LAYOUTS).filter((route) => !defRoutes.has(route))
    expect(stale).toEqual([])
  })

  it('link only to routes that exist', () => {
    const broken = FEATURE_DEFS.flatMap((def) =>
      (withLayout(def).quickLinks ?? []).filter((link) => !routes.has(link.to)).map((link) => `${def.route} → ${link.to}`)
    )
    expect(broken).toEqual([])
  })

  it('bind only to collections the repository has', () => {
    const missing = FEATURE_DEFS.filter((def) => {
      const binding = withLayout(def).collection
      return binding && !(binding.key in mockRepository)
    }).map((def) => def.route)
    expect(missing).toEqual([])
  })

  it('carry at most one primary action per screen', () => {
    const doubled = FEATURE_DEFS.filter((def) => {
      const primaries = (withLayout(def).actions ?? []).filter((a) => a.intent === 'primary')
      return primaries.length > 1
    }).map((def) => def.route)
    expect(doubled).toEqual([])
  })

  it('give every layout the block it renders from', () => {
    const incomplete = FEATURE_DEFS.map(withLayout)
      .filter((def) => (def.layout === 'board' && !def.board) || (def.layout === 'monitor' && !def.monitor) || (def.layout === 'wizard' && !def.wizard))
      .map((def) => def.route)
    expect(incomplete).toEqual([])
  })

  it('open a wizard only from a wizard action', () => {
    const orphan = FEATURE_DEFS.map(withLayout)
      .filter((def) => (def.actions ?? []).some((a) => a.kind === 'wizard') && !def.wizard)
      .map((def) => def.route)
    expect(orphan).toEqual([])
  })

  it('give the sameness review something to show: fewer than half the screens stay plain lists', () => {
    const shaped = FEATURE_DEFS.map(withLayout).filter((def) => (def.layout && def.layout !== 'list') || def.collection || def.hero)
    expect(shaped.length).toBeGreaterThan(FEATURE_DEFS.length / 2)
  })
})
