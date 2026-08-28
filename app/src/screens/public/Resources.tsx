import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { TINT_CHIP, type Tint } from './sections/tints'

/** PublicPortal.Resources — Tier C content page.
 *
 *  A resources / learning hub page with manually laid out category cards,
 *  each linking to the relevant public-portal section. */
interface ResourceCategory {
  icon: string
  title: string
  description: string
  to: string
  tint: Tint
}

const CATEGORIES: readonly ResourceCategory[] = [
  {
    icon: 'BookOpen',
    title: 'Documentation',
    description: 'Platform guides and API reference to get the most out of SALIS AUTO',
    to: '/public-portal/faq',
    tint: 'blue',
  },
  {
    icon: 'FileText',
    title: 'Blog',
    description: 'Industry insights and product updates from the SALIS AUTO team',
    to: '/public-portal/blog',
    tint: 'bright',
  },
  {
    icon: 'Wrench',
    title: 'Help Center',
    description: 'Tutorials and troubleshooting guides to resolve issues quickly',
    to: '/public-portal/support',
    tint: 'orange',
  },
  {
    icon: 'Users',
    title: 'Webinars',
    description: 'Live and recorded training sessions to deepen your expertise',
    to: '/public-portal/contact',
    tint: 'navy',
  },
  {
    icon: 'Target',
    title: 'Case Studies',
    description: 'Success stories from Saudi workshops transforming operations with SALIS AUTO',
    to: '/public-portal/about',
    tint: 'blue',
  },
  {
    icon: 'Globe',
    title: 'API Reference',
    description: 'Developer documentation for building custom integrations',
    to: '/public-portal/integrations',
    tint: 'bright',
  },
]

export function PublicResources() {
  const t = useT()
  usePageMeta({
    title: t('Resources — SALIS AUTO'),
    description: t('Guides, tutorials, webinars and case studies to help you succeed with SALIS AUTO'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Resources"
        subtitle="Everything you need to learn, integrate and get the most from SALIS AUTO"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.title}
            to={cat.to}
            className={cn(
              'flex flex-col gap-2 rounded-2xl border border-default bg-card p-5 no-underline',
              'transition-all duration-200 hover:-translate-y-0.5 hover:border-salis-blue/[.3] hover:shadow-lg'
            )}
          >
            <span className={cn('inline-flex w-fit rounded-[14px] p-3', TINT_CHIP[cat.tint])}>
              <Icon name={cat.icon} size={22} />
            </span>
            <h2 className="m-0 text-[15px] font-bold text-heading">{t(cat.title)}</h2>
            <p className="m-0 text-[13px] leading-normal text-muted">{t(cat.description)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
