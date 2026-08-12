import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { Hero } from './sections/Hero'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Landing — `project/PublicPortal.Landing.dc.html`.
 *
 *  Hero (badge, gradient headline, CTA pair) over a six-card feature grid.
 *  Composed entirely from `sections/` so Tier B pages configure the same
 *  pieces next tranche.
 *
 *  CTA destinations: the design links "Get Started" to `Register.dc.html`
 *  (→ `/register`, agent 06's screen). "Book a Demo" has no target in the
 *  design and no demo page exists until Tier C, so it goes to the Contact
 *  page — a real destination — rather than nowhere. */
const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'ClipboardList',
    title: 'Job Card Management',
    description: 'Complete workflow from check-in to delivery with real-time tracking.',
    tint: 'blue',
  },
  {
    icon: 'Package',
    title: 'Inventory Control',
    description: 'Smart parts management with auto-reorder and supplier integration.',
    tint: 'bright',
  },
  {
    icon: 'Receipt',
    title: 'ZATCA E-Invoicing',
    description: 'Fully compliant Saudi electronic invoicing with QR codes.',
    tint: 'orange',
  },
  {
    icon: 'Truck',
    title: 'Fleet Management',
    description: 'Multi-vehicle accounts with contract tracking and SLA monitoring.',
    tint: 'navy',
  },
  {
    icon: 'Sparkles',
    title: 'AI Assistant',
    description: 'Intelligent insights, automated reports, and smart scheduling.',
    tint: 'blue',
  },
  {
    icon: 'MapPin',
    title: 'Multi-Branch',
    description: 'Centralized management across all your workshop locations.',
    tint: 'bright',
  },
]

export function PublicLanding() {
  const t = useT()
  usePageMeta({
    title: t('SALIS AUTO — Workshop Management for Saudi Arabia'),
    description: t(
      'SALIS AUTO is the all-in-one garage management system built for Saudi workshops — from single bays to franchise networks.'
    ),
  })

  return (
    <>
      <Hero
        badge="Automotive ERP for Saudi Arabia"
        title="Manage Your Workshop with Confidence"
        description="SALIS AUTO is the all-in-one garage management system built for Saudi workshops — from single bays to franchise networks."
        primaryCta={{ label: 'Get Started', to: '/register' }}
        secondaryCta={{ label: 'Book a Demo', to: '/public-portal/contact' }}
      />
      <section
        aria-label={t('Platform features')}
        className="mx-auto max-w-[1100px] px-5 py-10 md:px-10 md:py-[60px]"
      >
        <IconCardGrid items={FEATURES} columns={3} />
      </section>
    </>
  )
}
