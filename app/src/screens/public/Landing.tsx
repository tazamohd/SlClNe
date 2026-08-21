import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { Hero } from './sections/Hero'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'
import { TrustBand } from './sections/TrustBand'
import { ValueProposition, type ValuePropItem } from './sections/ValueProposition'
import { StatBand, type StatItem } from './sections/StatBand'
import { HowItWorks, type Step } from './sections/HowItWorks'
import { Testimonials, type Testimonial } from './sections/Testimonials'
import { PartnerLogos } from './sections/PartnerLogos'
import { FaqList, type FaqItem } from './sections/FaqList'
import { CtaBanner } from './sections/CtaBanner'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.Landing — `project/PublicPortal.Landing.dc.html`.
 *
 *  Full marketing landing page composed from reusable sections (§32):
 *  Hero → Trust → Value Proposition → Features → Statistics → How It Works
 *  → Testimonials → Partners → FAQ → CTA. */

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

const VALUE_PROPS: readonly ValuePropItem[] = [
  {
    icon: '\u{1F6E0}',
    title: 'Built for Workshops',
    description: 'Every feature is designed around how Saudi automotive workshops actually operate — not adapted from generic software.',
  },
  {
    icon: '\u{1F4CA}',
    title: 'Real-Time Visibility',
    description: 'See every job, every bay and every technician in one dashboard. Know where your business stands at any moment.',
  },
  {
    icon: '\u{1F512}',
    title: 'Saudi Compliance',
    description: 'ZATCA e-invoicing, VAT calculations, and financial reporting built in — stay compliant without extra work.',
  },
]

const STATS: readonly StatItem[] = [
  { value: '500+', label: 'Workshops served' },
  { value: '50K+', label: 'Vehicles managed' },
  { value: '99.9%', label: 'Platform uptime' },
]

const STEPS: readonly Step[] = [
  { number: 1, title: 'Sign Up', description: 'Create your account and configure your workshop in minutes.' },
  { number: 2, title: 'Set Up', description: 'Import your customer and vehicle data, or start fresh.' },
  { number: 3, title: 'Go Live', description: 'Check in your first vehicle and let SALIS AUTO handle the rest.' },
  { number: 4, title: 'Grow', description: 'Add branches, technicians and integrations as your business scales.' },
]

const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: 'SALIS AUTO replaced three separate systems we were using. Now everything is in one place and our team actually uses it.',
    author: 'Ahmed K.',
    role: 'Workshop Owner',
    company: 'Al-Riyadh Auto Services',
  },
  {
    quote: 'The inventory alerts alone saved us from running out of brake pads twice in the first month. Worth every riyal.',
    author: 'Fahad M.',
    role: 'Operations Manager',
    company: 'Jeddah Motor Works',
  },
  {
    quote: 'Our customers love the live tracking. They can see exactly where their car is in the process — no more phone calls.',
    author: 'Saad R.',
    role: 'Service Advisor',
    company: 'Eastern Province Auto Care',
  },
]

const PARTNERS: readonly string[] = [
  'Mada', 'HyperPay', 'Unifonic', 'ZATCA', 'Bosch', 'Denso',
  'Continental', 'Shell Lubricants',
]

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'How long does it take to get started?',
    answer: 'Most workshops are up and running within a day. Our onboarding team helps you import existing data and configure your workflow.',
  },
  {
    question: 'Do I need to install any software?',
    answer: 'No. SALIS AUTO runs entirely in your browser — on desktop, tablet and phone. There is nothing to install or update.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use industry-standard encryption, role-based access control, and tenant isolation to keep your workshop data private and safe.',
  },
  {
    question: 'Can I try it for free?',
    answer: 'Absolutely. The Starter plan is free for a single branch with up to five users — no credit card required.',
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
        secondaryCta={{ label: 'Book a Demo', to: '/public-portal/book-demo' }}
      />

      <TrustBand
        headline="Trusted by leading workshops across Saudi Arabia"
        logos={['Al-Riyadh Auto', 'Jeddah Motor Works', 'Eastern Province Auto', 'Dammam Workshop Group', 'Madinah Service Center']}
      />

      <ValueProposition items={VALUE_PROPS} />

      <section
        aria-label={t('Platform features')}
        className="mx-auto max-w-[1100px] px-5 py-10 md:px-10 md:py-[60px]"
      >
        <SectionIntro
          centered
          title="Everything Your Workshop Needs"
          subtitle="A complete platform covering operations, finance, CRM, and more"
        />
        <IconCardGrid items={FEATURES} columns={3} />
      </section>

      <div className="mx-auto max-w-[960px] px-5 md:px-10">
        <StatBand items={STATS} />
      </div>

      <HowItWorks title="How It Works" steps={STEPS} />

      <Testimonials title="What Our Customers Say" items={TESTIMONIALS} />

      <PartnerLogos
        title="Integrations & Partners"
        subtitle="Connect with the payment, compliance and parts providers you already use"
        partners={PARTNERS}
      />

      <section className="mx-auto max-w-[800px] px-5 py-14 md:px-10 md:py-20">
        <h2 className="mb-8 mt-0 text-center font-display text-3xl font-black text-heading md:text-[36px]">
          {t('Frequently Asked Questions')}
        </h2>
        <FaqList items={FAQ_ITEMS} />
      </section>

      <CtaBanner
        title="Ready to Transform Your Workshop?"
        description="Join hundreds of Saudi workshops already running smarter with SALIS AUTO."
        primaryCta={{ label: 'Get Started Free', to: '/register' }}
        secondaryCta={{ label: 'Book a Demo', to: '/public-portal/book-demo' }}
      />
    </>
  )
}
