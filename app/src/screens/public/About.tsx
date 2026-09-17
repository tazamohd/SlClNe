import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { StatBand } from './sections/StatBand'
import { CornerBrackets } from './sections/CornerBrackets'

/** PublicPortal.About — `project/PublicPortal.About.dc.html`.
 *
 *  Start-aligned heading, lede paragraph, three headline stats, then the
 *  mission statement. The heading block is bespoke rather than `SectionIntro`
 *  because the About design flows its paragraph as a lede (larger line height,
 *  no subtitle style). The mono eyebrow above the heading, and the corner
 *  brackets framing the stat band, are the one visual borrowing from the
 *  "SALIS AUTO 2030" design study — its instrument-panel framing, kept in
 *  the site's own light palette, not that study's fictional 2030 copy.
 *
 *  The stat band shows product facts we can point to in this codebase —
 *  domain count, role count, permission-module count, lifecycle stages — not
 *  market-scale numbers (customer counts, city counts) we have no source for.
 *  See LEGAL_REVIEW_REQUIRED.md for the rule this follows. */
const STATS = [
  { value: '13', label: 'Functional domains' },
  { value: '14', label: 'Operational roles' },
  { value: '28', label: 'Permission modules' },
] as const

export function PublicAbout() {
  const t = useT()
  usePageMeta({
    title: t('About — SALIS AUTO'),
    description: t(
      'SALIS AUTO is a workshop management platform built for the Saudi automotive market — a six-stage job-card lifecycle, ZATCA-ready invoicing and multi-branch, bilingual operations in one system.'
    ),
  })

  return (
    <div className="mx-auto max-w-[800px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <p className="mb-2 mt-0 font-mono text-[11px] font-semibold uppercase tracking-[.28em] text-salis-blue">
        {t('Where it started')}
      </p>
      <h1 className="mb-4 mt-0 font-display text-3xl font-black text-heading md:text-[40px]">
        {t('About SALIS AUTO')}
      </h1>
      <p className="mb-8 mt-0 text-base leading-[1.7] text-muted">
        {t(
          'SALIS AUTO is a workshop management platform built for the Saudi automotive market. It carries every job from check-in to inspection, approved estimate, repair, quality control, delivery and ZATCA invoice — on one controlled operational record, in Arabic and English.'
        )}
      </p>
      <div className="relative">
        <CornerBrackets />
        <StatBand items={STATS} />
      </div>
      <h2 className="mb-4 mt-0 text-2xl font-bold text-heading">{t('Our Mission')}</h2>
      <p className="m-0 text-[15px] leading-[1.7] text-body">
        {t(
          'To give every automotive workshop in Saudi Arabia a single, controlled operational record — from check-in to ZATCA invoice — instead of scattered spreadsheets, paper job cards and disconnected tools.'
        )}
      </p>
    </div>
  )
}
