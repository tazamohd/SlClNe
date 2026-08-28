import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { StatBand } from './sections/StatBand'

/** PublicPortal.About — `project/PublicPortal.About.dc.html`.
 *
 *  Start-aligned heading, lede paragraph, three headline stats, then the
 *  mission statement. The heading block is bespoke rather than `SectionIntro`
 *  because the About design flows its paragraph as a lede (larger line height,
 *  no subtitle style). */
const STATS = [
  { value: '500+', label: 'Workshops' },
  { value: '50K+', label: 'Vehicles Serviced' },
  { value: '13', label: 'Cities' },
] as const

export function PublicAbout() {
  const t = useT()
  usePageMeta({
    title: t('About — SALIS AUTO'),
    description: t(
      "SALIS AUTO is Saudi Arabia's leading automotive workshop management platform. We empower garages of all sizes with powerful digital tools to streamline operations, delight customers, and grow revenue."
    ),
  })

  return (
    <div className="mx-auto max-w-[800px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <h1 className="mb-4 mt-0 font-display text-3xl font-black text-heading md:text-[40px]">
        {t('About SALIS AUTO')}
      </h1>
      <p className="mb-8 mt-0 text-base leading-[1.7] text-muted">
        {t(
          "SALIS AUTO is Saudi Arabia's leading automotive workshop management platform. We empower garages of all sizes with powerful digital tools to streamline operations, delight customers, and grow revenue."
        )}
      </p>
      <StatBand items={STATS} />
      <h2 className="mb-4 mt-0 text-2xl font-bold text-heading">{t('Our Mission')}</h2>
      <p className="m-0 text-[15px] leading-[1.7] text-body">
        {t(
          'To digitize every automotive workshop in Saudi Arabia, enabling world-class service delivery through technology, data, and AI — aligned with Vision 2030.'
        )}
      </p>
    </div>
  )
}
