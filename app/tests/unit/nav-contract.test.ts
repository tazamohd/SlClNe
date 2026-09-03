/** The sidebar's load-bearing facts, pinned.
 *
 *  Two suites read the sidebar's text to prove RBAC: `e2e/navigation.spec.ts`
 *  and the smoke runner both require an owner to see WORKSHOP and ACCOUNTING
 *  and a technician to see no ACCOUNTING at all. The journey regrouping moved
 *  every item; this is what keeps those contracts from being satisfied by
 *  accident (the old nav had no "Workshop" group — the word came from the
 *  item "Workshop Reports"). It also checks what `check-i18n` cannot: the
 *  group labels are rendered through `t(group.label)` dynamically, so an
 *  untranslated one would slip past the gate. */
import { describe, expect, it } from 'vitest'
import { NAV } from '@/data/generated/nav'
import { AR } from '@/data/generated/ar'
import { AR_OVERRIDES } from '@/data/ar-overrides'
import { JOURNEY_GROUPS, journeyNav } from '@/data/nav-journey'
import { navFor } from '@/data/rbac'

const dictionary = new Set([...Object.keys(AR), ...Object.keys(AR_OVERRIDES)])
const text = (role: string) =>
  navFor(role)
    .flatMap((group) => [group.label, ...group.items.map((item) => item.label)])
    .join(' ')
    .toUpperCase()

describe('journey nav', () => {
  it('places every generated item exactly once', () => {
    const generated = NAV.flatMap((g) => g.items.map((i) => i.key)).filter(Boolean)
    const placed = journeyNav(NAV).flatMap((g) => g.items.map((i) => i.key)).filter(Boolean)
    expect([...placed].sort()).toEqual([...generated].sort())
    expect(new Set(placed).size).toBe(placed.length)
  })

  it('names no key the generated nav lacks (a stale journey would hide nothing, but should not lie)', () => {
    const generated = new Set(NAV.flatMap((g) => g.items.map((i) => i.key)))
    const stale = JOURNEY_GROUPS.flatMap((g) => g.keys).filter((k) => !generated.has(k))
    expect(stale).toEqual([])
  })

  it('keeps an item whose key the journey does not know, in its generated group', () => {
    const extra = [
      ...NAV,
      { label: 'Future', icon: 'Zap', items: [{ label: 'New Thing', key: 'new-thing', screen: null, route: '/new-thing' }] },
    ]
    const groups = journeyNav(extra)
    const future = groups.find((g) => g.label === 'Future')
    expect(future?.items.map((i) => i.key)).toEqual(['new-thing'])
    expect(groups[groups.length - 1].label).toBe('Future')
  })

  it('translates every group and item label', () => {
    const untranslated = journeyNav(NAV)
      .flatMap((g) => [g.label, ...g.items.map((i) => i.label)])
      .filter((label) => !dictionary.has(label))
    expect(untranslated).toEqual([])
  })
})

describe('RBAC contracts the e2e suites read from the sidebar text', () => {
  it('owner sees WORKSHOP and ACCOUNTING', () => {
    const owner = text('owner')
    expect(owner).toContain('WORKSHOP')
    expect(owner).toContain('ACCOUNTING')
  })

  it('technician never sees ACCOUNTING', () => {
    expect(text('technician')).not.toContain('ACCOUNTING')
  })

  it('has a group literally named Workshop, so the contract no longer rides on one item label', () => {
    expect(navFor('owner').some((g) => g.label === 'Workshop')).toBe(true)
  })
})
