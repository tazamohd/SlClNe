import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Careers — Tier B content page.
 *
 *  Two sections: "Why SALIS AUTO?" benefit cards (IconCardGrid) and a manually
 *  laid out "Open Positions" list that links each role to the Contact page. */
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

interface Position {
  title: string
  location: string
  type: string
  description: string
}

const POSITIONS: readonly Position[] = [
  {
    title: 'Senior Full-Stack Engineer',
    location: 'Riyadh',
    type: 'Full-time',
    description: 'Build and scale core ERP modules powering automotive workshops across KSA',
  },
  {
    title: 'Product Designer',
    location: 'Remote',
    type: 'Full-time',
    description: 'Design intuitive interfaces for complex workshop management workflows',
  },
  {
    title: 'DevOps Engineer',
    location: 'Riyadh',
    type: 'Full-time',
    description: 'Manage cloud infrastructure, CI/CD pipelines and platform reliability',
  },
  {
    title: 'Sales Manager',
    location: 'Jeddah',
    type: 'Full-time',
    description: 'Drive enterprise adoption and build lasting client relationships in the Western Region',
  },
]

export function PublicCareers() {
  const t = useT()
  usePageMeta({
    title: t('Careers — SALIS AUTO'),
    description: t('Join the team building the future of automotive workshop management in Saudi Arabia'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Careers"
        subtitle="Join the team building the future of automotive workshop management"
      />

      <h2 className="mb-5 mt-0 text-xl font-bold text-heading">{t('Why SALIS AUTO?')}</h2>
      <IconCardGrid items={BENEFITS} columns={4} centered iconSize={22} />

      <h2 className="mb-5 mt-12 text-xl font-bold text-heading">{t('Open Positions')}</h2>
      <div className="flex flex-col gap-4">
        {POSITIONS.map((pos) => (
          <Link
            key={pos.title}
            to="/public-portal/contact"
            className="flex flex-col gap-2 rounded-2xl border border-default bg-card p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-salis-blue/[.3] hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="m-0 text-[15px] font-bold text-heading">{t(pos.title)}</h2>
              <p className="m-0 mt-1 text-[13px] text-muted">{t(pos.description)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[13px] text-muted">{t(pos.location)}</span>
              <span className="rounded-full bg-salis-blue/[.08] px-2.5 py-0.5 text-xs font-medium text-salis-blue">
                {t(pos.type)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
