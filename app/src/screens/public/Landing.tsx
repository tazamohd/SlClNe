import { useMemo } from 'react'
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
 *  → Testimonials → Partners → FAQ → CTA.
 *
 *  Every string is wrapped in `t()` *here*, at the literal, even though each
 *  section translates its props again: the Arabic-completeness gate scans for
 *  literal `t('…')` call sites, and a string that only ever reaches `t` as a
 *  prop is invisible to it. Translating twice is harmless — a translated
 *  string is its own key. */

const PARTNERS: readonly string[] = [
  'Mada', 'HyperPay', 'Unifonic', 'ZATCA', 'Bosch', 'Denso',
  'Continental', 'Shell Lubricants',
]

export function PublicLanding() {
  const t = useT()
  usePageMeta({
    title: t('SALIS AUTO — Workshop Management. Saudi Standard.'),
    description: t(
      'One platform runs the workshop from check-in to invoice, in Arabic and English, with ZATCA e-invoicing built in.'
    ),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SALIS AUTO',
      url: 'https://salisauto.app',
      description: 'Workshop management platform built for Saudi automotive workshops: ZATCA e-invoicing, Arabic and English, one audit trail.',
      contactPoint: { '@type': 'ContactPoint', email: 'info@salisauto.app', contactType: 'sales' },
      areaServed: { '@type': 'Country', name: 'Saudi Arabia' },
    },
  })

  const features = useMemo<readonly IconCardItem[]>(
    () => [
      {
        icon: 'ClipboardList',
        title: t('Job Card Management'),
        description: t('Complete workflow from check-in to delivery with real-time tracking.'),
        tint: 'blue',
      },
      {
        icon: 'Package',
        title: t('Inventory Control'),
        description: t('Smart parts management with auto-reorder and supplier integration.'),
        tint: 'bright',
      },
      {
        icon: 'Receipt',
        title: t('ZATCA E-Invoicing'),
        description: t('Fully compliant Saudi electronic invoicing with QR codes.'),
        tint: 'orange',
      },
      {
        icon: 'Truck',
        title: t('Fleet Management'),
        description: t('Multi-vehicle accounts with contract tracking and SLA monitoring.'),
        tint: 'navy',
      },
      {
        icon: 'Sparkles',
        title: t('AI Assistant'),
        description: t('Intelligent insights, automated reports, and smart scheduling.'),
        tint: 'blue',
      },
      {
        icon: 'MapPin',
        title: t('Multi-Branch'),
        description: t('Centralized management across all your workshop locations.'),
        tint: 'bright',
      },
    ],
    [t]
  )

  const family = useMemo<readonly IconCardItem[]>(
    () => [
      {
        icon: 'Wrench',
        title: t('Garage'),
        description: t('This product. Check-in to delivery, finance, ZATCA e-invoicing, portals. What a workshop signs in to today.'),
        tint: 'blue',
        to: '/public-portal/workshop',
      },
      {
        icon: 'Package',
        title: t('Spare Parts'),
        description: t('Supplier network, price comparison, purchase orders and automatic reorder. Runs inside Garage today.'),
        tint: 'bright',
        to: '/public-portal/spare-parts',
      },
      {
        icon: 'Truck',
        title: t('Fleet'),
        description: t('Vehicles under contract, SLA tracking and cost per vehicle across branches. Runs inside Garage today.'),
        tint: 'navy',
        to: '/public-portal/fleet',
      },
      {
        icon: 'ShieldCheck',
        title: t('Insurance'),
        description: t('Claims and approvals between workshops and insurers on the records that already exist. Planned.'),
        tint: 'orange',
        to: '/public-portal/insurance',
      },
    ],
    [t]
  )

  const valueProps = useMemo<readonly ValuePropItem[]>(
    () => [
      {
        icon: 'Wrench',
        title: t('Built for Workshops'),
        description: t('Every feature is designed around how Saudi automotive workshops actually operate — not adapted from generic software.'),
      },
      {
        icon: 'Gauge',
        title: t('Real-Time Visibility'),
        description: t('See every job, every bay and every technician in one dashboard. Know where your business stands at any moment.'),
      },
      {
        icon: 'ShieldCheck',
        title: t('Saudi Compliance'),
        description: t('ZATCA e-invoicing, VAT calculations, and financial reporting built in — stay compliant without extra work.'),
      },
    ],
    [t]
  )

  const stats = useMemo<readonly StatItem[]>(
    () => [
      { value: '4 h', label: t('Estimate approval, down from 48 hours') },
      { value: '2 min', label: t('Invoice at the counter, down from 15 minutes') },
      { value: '+25%', label: t('Workshop throughput across deployments') },
    ],
    [t]
  )

  const steps = useMemo<readonly Step[]>(
    () => [
      { number: 1, title: t('Sign Up'), description: t('Create your account and configure your workshop in minutes.') },
      { number: 2, title: t('Set Up'), description: t('Import your customer and vehicle data, or start fresh.') },
      { number: 3, title: t('Go Live'), description: t('Check in your first vehicle and let SALIS AUTO handle the rest.') },
      { number: 4, title: t('Grow'), description: t('Add branches, technicians and integrations as your business scales.') },
    ],
    [t]
  )

  const testimonials = useMemo<readonly Testimonial[]>(
    () => [
      {
        quote: t('Our accountant stopped re-keying invoices. The VAT return reconciled the first month.'),
        author: t('Workshop owner'),
        role: t('Three branches'),
        company: t('Eastern Province'),
      },
      {
        quote: t('Estimates that took two days on paper are signed from the customer\'s phone the same afternoon.'),
        author: t('Operations manager'),
        role: t('Single-bay workshop'),
        company: t('Jeddah'),
      },
      {
        quote: t('Customers watch the job move from the bay to delivery. The phone rings less, and when it does, it is not about status.'),
        author: t('Service advisor'),
        role: t('Fleet accounts'),
        company: t('Riyadh'),
      },
    ],
    [t]
  )

  const faqs = useMemo<readonly FaqItem[]>(
    () => [
      {
        question: t('How long does it take to get started?'),
        answer: t('Most workshops run their first job card within a day. Onboarding imports your customers, vehicles and parts, and sets up your roles.'),
      },
      {
        question: t('Do I need to install any software?'),
        answer: t('No. SALIS AUTO runs in the browser on desktop and phone. There is nothing to install and nothing to update.'),
      },
      {
        question: t('Is my data secure?'),
        answer: t('Yes. Each workshop is isolated at the database level, access is by role, and every change records who made it and when.'),
      },
      {
        question: t('Can I try it before I commit?'),
        answer: t('Yes. Book a 20-minute demo on your own workshop\'s numbers. Plans are agreed with sales after the demo, and there is no card to enter.'),
      },
    ],
    [t]
  )

  return (
    <>
      <Hero
        badge={t('Built for Saudi workshops')}
        title={t('Workshop Management. Saudi Standard.')}
        description={t('One platform runs the workshop from check-in to invoice, in Arabic and English, with ZATCA e-invoicing built in. Every change is on the audit trail.')}
        primaryCta={{ label: t('Book a 20-minute demo'), to: '/public-portal/book-demo' }}
        secondaryCta={{ label: t('See pricing'), to: '/public-portal/pricing' }}
      />

      <TrustBand
        headline={t('Built for the Saudi market, not translated into it')}
        logos={[t('ZATCA Phase 2'), t('Arabic and English'), t('SAR to the halala'), t('One audit trail'), t('Multi-branch')]}
      />

      <ValueProposition items={valueProps} />

      <section
        aria-label={t('The SALIS family')}
        className="mx-auto max-w-[1100px] px-5 py-10 md:px-10 md:py-[60px]"
      >
        <SectionIntro
          as="h2"
          centered
          title={t('Four products, one backbone')}
          subtitle={t('Garage is what you sign in to today. Spare Parts and Fleet run inside it. Insurance is planned. All four share Arabic, ZATCA, SAR and one audit trail.')}
        />
        <IconCardGrid items={family} columns={4} centered iconSize={24} />
      </section>

      <section
        aria-label={t('Platform features')}
        className="mx-auto max-w-[1100px] px-5 py-10 md:px-10 md:py-[60px]"
      >
        <SectionIntro
          as="h2"
          centered
          title={t('Thirteen domains, one backbone')}
          subtitle={t('Workshop, parts, finance, CRM, HR and AI on one record of the job, with no seams to reconcile.')}
        />
        <IconCardGrid items={features} columns={3} />
      </section>

      <div className="mx-auto max-w-[960px] px-5 md:px-10">
        <StatBand items={stats} />
      </div>

      <HowItWorks title={t('How It Works')} steps={steps} />

      <Testimonials title={t('What workshops report')} items={testimonials} />

      <PartnerLogos
        title={t('Integrations & Partners')}
        subtitle={t('Connect with the payment, compliance and parts providers you already use')}
        partners={PARTNERS}
      />

      <section className="mx-auto max-w-[800px] px-5 py-14 md:px-10 md:py-20">
        <h2 className="mb-8 mt-0 text-center font-display text-3xl font-black text-heading md:text-[36px]">
          {t('Frequently Asked Questions')}
        </h2>
        <FaqList items={faqs} />
      </section>

      <CtaBanner
        title={t('See it on your own workshop\'s numbers')}
        description={t('A 20-minute demo, in Arabic or English, on a job card from your floor.')}
        primaryCta={{ label: t('Book a demo'), to: '/public-portal/book-demo' }}
        secondaryCta={{ label: t('Talk to sales'), to: '/public-portal/contact' }}
      />
    </>
  )
}
