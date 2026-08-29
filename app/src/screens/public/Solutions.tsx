import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Solutions — overview of SALIS AUTO's solution areas.
 *
 *  Six cards in a three-column grid, each representing a core platform domain.
 *  Cards are informational — no destination pages exist yet. */
const SOLUTIONS: readonly IconCardItem[] = [
  {
    icon: 'Wrench',
    title: 'Workshop Management',
    description: 'End-to-end job card lifecycle from check-in to delivery',
    tint: 'blue',
  },
  {
    icon: 'Package',
    title: 'Inventory & Parts',
    description: 'Real-time stock control with supplier network integration',
    tint: 'bright',
  },
  {
    icon: 'Users',
    title: 'CRM & Marketing',
    description: 'Customer relationships, campaigns and retention tools',
    tint: 'orange',
  },
  {
    icon: 'BarChart3',
    title: 'Accounting & Finance',
    description: 'ZATCA-compliant invoicing, payments and financial reports',
    tint: 'navy',
  },
  {
    icon: 'Truck',
    title: 'Fleet Management',
    description: 'Vehicle tracking, maintenance schedules and fleet analytics',
    tint: 'blue',
  },
  {
    icon: 'Brain',
    title: 'AI & Automation',
    description: 'Intelligent diagnostics, predictions and workflow automation',
    tint: 'bright',
  },
]

export function PublicSolutions() {
  const t = useT()
  usePageMeta({
    title: t('Solutions — SALIS AUTO'),
    description: t('Comprehensive automotive solutions for workshops across Saudi Arabia'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Our Solutions"
        subtitle="Comprehensive automotive solutions for workshops across Saudi Arabia"
      />
      <IconCardGrid items={SOLUTIONS} columns={3} centered iconSize={24} />
    </div>
  )
}
