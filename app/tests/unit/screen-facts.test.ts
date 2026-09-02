/** The registry's tablet, Arabic and RTL detectors, pinned in both directions.
 *
 *  These three states used to be constants — `tablet` was the literal
 *  'MISSING', `arabic` and `rtl` were `built ? 'PARTIAL' : 'MISSING'` while
 *  their flags clear only on 'VERIFIED' — so TABLET_MISSING, ARABIC_MISSING and
 *  RTL_BROKEN fired on all 424 entries whatever any screen did.
 *
 *  Replacing a constant with a detector is only progress if the detector can be
 *  shown to move. RTL_BROKEN in particular now reports zero, and zero is the
 *  answer both a working detector on a clean codebase and a broken one give;
 *  the tests below are what tells them apart. Each case therefore asserts a fire
 *  and a non-fire, and the non-fire cases are the six false hazards a plain
 *  /left-|right-/ scan produced on this repo.
 */
import { describe, expect, it } from 'vitest'
import {
  arabicStateFrom,
  classNameTokens,
  layoutFacts,
} from '../../scripts/lib/screen-facts.mjs'
import { scanFile } from '../../scripts/lib/i18n-scan.mjs'

describe('classNameTokens', () => {
  it('reads the three className forms the codebase uses', () => {
    const src = `
      <a className="ms-2 gap-3" />
      <b className={\`px-4 \${x} md:flex\`} />
      <c className={'text-end'} />
    `
    expect(classNameTokens(src)).toEqual(
      expect.arrayContaining(['ms-2', 'gap-3', 'px-4', 'md:flex', 'text-end'])
    )
  })

  it('ignores prose, so a comment cannot register as layout', () => {
    const src = `/* the right-rail sits ml-4 from the border-left */ <a className="ms-4" />`
    expect(classNameTokens(src)).toEqual(['ms-4'])
  })
})

describe('the RTL hazard detector', () => {
  it.each([
    ['ml-4', 'margin-left'],
    ['pr-2', 'padding-right'],
    ['border-l', 'a bare left border'],
    ['border-r-2', 'a weighted right border'],
    ['rounded-l-xl', 'a left-rounded corner'],
    ['text-left', 'physical text alignment'],
    ['md:mr-6', 'a hazard behind a breakpoint'],
    ['lg:hover:pl-1', 'a hazard behind stacked variants'],
  ])('flags %s (%s)', (cls) => {
    expect(layoutFacts(`<a className="${cls}" />`).physical).toBe(true)
  })

  it.each([
    ['ms-2', 'the logical margin that does mirror'],
    ['pe-4', 'the logical padding that does mirror'],
    ['text-start', 'logical alignment'],
    ['text-end', 'logical alignment'],
    ['border-line', 'an English word, not a border side'],
    ['right-rail', 'an English word in a class name'],
    ['left-1/2', 'direction-neutral centring'],
    ['-translate-x-1/2', 'direction-neutral centring'],
    ['rounded-lg', 'a size, not a side — the l is "large"'],
    ['mt-4', 'a block-axis margin, which RTL does not touch'],
  ])('does not flag %s (%s)', (cls) => {
    expect(layoutFacts(`<a className="${cls}" />`).physical).toBe(false)
  })
})

describe('the tablet-breakpoint detector', () => {
  it.each(['md:grid-cols-2', 'lg:flex'])('counts %s', (cls) => {
    expect(layoutFacts(`<a className="${cls}" />`).tabletBreakpoints).toBe(true)
  })

  it.each([
    ['sm:flex', 'takes effect below 768'],
    ['xl:flex', 'takes effect above 1024'],
    ['flex', 'no breakpoint at all'],
  ])('does not count %s (%s)', (cls) => {
    expect(layoutFacts(`<a className="${cls}" />`).tabletBreakpoints).toBe(false)
  })
})

describe('the Arabic state', () => {
  const stateOf = (src: string, covered: Set<string>) => {
    const { literals, dynamic } = scanFile(src)
    return arabicStateFrom({
      translated: literals.length > 0,
      uncovered: literals.some((k) => !covered.has(k)),
      dynamic: dynamic > 0,
    })
  }

  it('certifies a screen whose every key is a literal the dictionary covers', () => {
    expect(stateOf(`<h1>{t('Dashboard')}</h1>`, new Set(['Dashboard']))).toBe('VERIFIED')
  })

  it('reports MISSING for a literal key with no Arabic', () => {
    expect(stateOf(`<h1>{t('Dashboard')}</h1>`, new Set())).toBe('MISSING')
  })

  it('reports PARTIAL when a key is built at runtime, which no static pass can prove', () => {
    expect(stateOf(`<h1>{t(title)}</h1>`, new Set())).toBe('PARTIAL')
  })

  it('does not certify a screen that has no t() at all', () => {
    // The empty set satisfies "every key is covered" vacuously. A screen with
    // no translated string renders English in Arabic mode, so VERIFIED here
    // would be the old false clear reached from the other side.
    expect(stateOf(`<h1>Dashboard</h1>`, new Set())).toBe('MISSING')
  })

  it('lets one untranslated key outweigh many covered ones', () => {
    const src = `<>{t('Dashboard')}{t('Invoices')}{t('Nope')}</>`
    expect(stateOf(src, new Set(['Dashboard', 'Invoices']))).toBe('MISSING')
  })
})
