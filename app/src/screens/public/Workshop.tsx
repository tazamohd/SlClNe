import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { StatBand } from './sections/StatBand'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Workshop — Workshop Management product page.
 *
 *  SectionIntro, a StatBand with headline figures, then six feature cards
 *  covering the full workshop lifecycle. */
const STATS = [
  { value: '12', label: 'Job Card Stages' },
  { value: 'Real-time', label: 'Live Tracking' },
  { value: 'AI', label: 'Powered Diagnostics' },
]

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
  usePageMeta({
    title: t('Workshop Management — SALIS AUTO'),
    description: t('End-to-end workshop management from vehicle check-in to delivery'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Workshop Management"
        subtitle="End-to-end workshop management from vehicle check-in to delivery"
      />
      <StatBand items={STATS} />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
    </div>
  )
}
