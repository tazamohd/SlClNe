import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.CRM — CRM product page.
 *
 *  SectionIntro and six feature cards covering the customer relationship
 *  management capabilities of the platform. */
const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'Filter',
    title: 'Lead Pipeline',
    description: 'Visual kanban pipeline to track leads from enquiry to conversion',
    tint: 'blue',
  },
  {
    icon: 'Target',
    title: 'Opportunity Tracking',
    description: 'Monitor deal stages, expected revenue and close probability',
    tint: 'bright',
  },
  {
    icon: 'Megaphone',
    title: 'Campaign Management',
    description: 'Plan, execute and measure marketing campaigns across channels',
    tint: 'orange',
  },
  {
    icon: 'Users',
    title: 'Customer Segments',
    description: 'Dynamic segmentation by vehicle type, spend history and visit frequency',
    tint: 'navy',
  },
  {
    icon: 'Mail',
    title: 'Email Marketing',
    description: 'Automated service reminders, promotions and follow-up sequences',
    tint: 'blue',
  },
  {
    icon: 'BarChart3',
    title: 'Analytics',
    description: 'Conversion rates, customer lifetime value and campaign ROI reports',
    tint: 'bright',
  },
]

export function PublicCRM() {
  const t = useT()
  usePageMeta({
    title: t('CRM — SALIS AUTO'),
    description: t('Customer relationship management built for automotive workshops'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Customer Relationship Management"
        subtitle="Customer relationship management built for automotive workshops"
      />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
    </div>
  )
}
