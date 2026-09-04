import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { StatBand } from './sections/StatBand'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'
import { CtaBanner } from './sections/CtaBanner'

/** PublicPortal.Workshop — Workshop Management product page.
 *
 *  SectionIntro, a StatBand with headline figures, then six feature cards
 *  covering the full workshop lifecycle. */

const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'LogIn',
    title: 'Check-In',
    description: 'Digital vehicle reception with photo capture and customer sign-off',
    tint: 'blue',
  },
  {
    icon: 'SearchCheck',
    title: 'Inspection',
    description: 'Multi-point inspection checklists with annotated photo evidence',
    tint: 'bright',
  },
  {
    icon: 'Calculator',
    title: 'Estimation',
    description: 'Accurate cost estimates with parts lookup and labour rates',
    tint: 'orange',
  },
  {
    icon: 'Wrench',
    title: 'Repair Tracking',
    description: 'Real-time bay status, technician assignment and progress updates',
    tint: 'navy',
  },
  {
    icon: 'ShieldCheck',
    title: 'Quality Control',
    description: 'Final QC sign-off with digital checklists before customer handover',
    tint: 'blue',
  },
  {
    icon: 'CarFront',
    title: 'Delivery',
    description: 'Seamless handover with invoice generation and feedback collection',
    tint: 'bright',
  },
]

export function PublicWorkshop() {
  const t = useT()
  // Proof points carry their baselines (press kit §6.2).
  const stats = [
    { value: '4 h', label: t('Estimate approval, down from 48 hours') },
    { value: '2 min', label: t('Invoice at the counter, down from 15 minutes') },
    { value: '+25%', label: t('Workshop throughput across deployments') },
  ]
  const audience: readonly IconCardItem[] = [
    { icon: 'BadgeCheck', title: t('Owner'), description: t('Revenue, VAT and stock reconcile without a bookkeeper redoing the month.'), tint: 'blue' },
    { icon: 'Headset', title: t('Service advisor'), description: t('Estimates the customer signs from their phone, in the language they read.'), tint: 'bright' },
    { icon: 'Wrench', title: t('Technician'), description: t('Short, unambiguous instructions on a phone, in Arabic, with one hand.'), tint: 'orange' },
  ]
  usePageMeta({
    title: t('Workshop Management — SALIS AUTO'),
    description: t('End-to-end workshop management from vehicle check-in to delivery'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Workshop Management"
        subtitle="End-to-end workshop management from vehicle check-in to delivery"
      />
      <StatBand items={stats} />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
      <div className="mt-14 md:mt-20" />
      <SectionIntro
        as="h2"
        centered
        title={t('Who it is for')}
        subtitle={t('Owner, advisor and technician work the same job card, each on their own screen.')}
      />
      <IconCardGrid items={audience} columns={3} centered iconSize={24} />
      <CtaBanner
        title={t('See the bay board on your own jobs')}
        description={t('A 20-minute demo, in Arabic or English, on a job card from your floor.')}
        primaryCta={{ label: t('Book a demo'), to: '/public-portal/book-demo' }}
        secondaryCta={{ label: t('Talk to sales'), to: '/public-portal/contact' }}
      />
    </div>
  )
}
