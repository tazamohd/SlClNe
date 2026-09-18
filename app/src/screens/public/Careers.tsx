import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Careers — Tier B content page.
 *
 *  Two sections: "Why SALIS AUTO?" benefit cards (IconCardGrid, generic
 *  culture copy, left as is) and "Open Positions". The latter previously
 *  listed four fabricated roles ("Senior Full-Stack Engineer — Riyadh —
 *  Full-time") as if currently open. There is no careers/positions
 *  collection anywhere in Repository or API_REGISTRY.json — the internal
 *  `employees`/`jobs` collections are unrelated workshop HR/repair-job
 *  entities, not public job postings. Rather than invent openings, this is
 *  an honest state, following DealsOffers.tsx's pattern for this site. */
const BENEFITS: readonly IconCardItem[] = [
  {
    icon: 'Lightbulb',
    title: 'Innovation',
    description: 'Work on cutting-edge automotive technology shaping the Saudi market',
    tint: 'blue',
  },
  {
    icon: 'TrendingUp',
    title: 'Growth',
    description: 'Clear career paths with mentorship, learning budgets and internal mobility',
    tint: 'bright',
  },
  {
    icon: 'Target',
    title: 'Impact',
    description: 'Your work directly improves how thousands of workshops operate every day',
    tint: 'orange',
  },
  {
    icon: 'Heart',
    title: 'Culture',
    description: 'A collaborative, diverse team that values transparency and ownership',
    tint: 'navy',
  },
]

export function PublicCareers() {
  const t = useT()
  usePageMeta({
    title: t('Careers — SALIS AUTO'),
    description: t('Join the team building the future of automotive workshop management in Saudi Arabia'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Careers"
        subtitle="Join the team building the future of automotive workshop management"
      />

      <h2 className="mb-5 mt-0 text-xl font-bold text-heading">{t('Why SALIS AUTO?')}</h2>
      <IconCardGrid items={BENEFITS} columns={4} centered iconSize={22} />

      <h2 className="mb-5 mt-12 text-xl font-bold text-heading">{t('Open Positions')}</h2>
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-3 rounded-2xl border border-default bg-card p-8 text-center">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white">
          <Icon name="Briefcase" size={22} />
        </span>
        <h3 className="m-0 text-[15px] font-bold text-heading">{t('No open positions listed right now')}</h3>
        <p className="m-0 text-[13px] leading-normal text-muted">
          {t('Think you would be a good fit anyway? ')}
          <Link to="/public-portal/contact" className="text-salis-blue">
            {t('Get in touch')}
          </Link>
          {t(' and tell us about yourself.')}
        </p>
      </div>
    </div>
  )
}
