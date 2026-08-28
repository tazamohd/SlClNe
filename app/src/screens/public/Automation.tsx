import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Automation — Tier B content page.
 *
 *  Automation & workflow features presented as a 6-card IconCardGrid. */
const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'Settings',
    title: 'Automated Job Routing',
    description: 'Auto-assign jobs to available technicians based on skill set and workload',
    tint: 'blue',
  },
  {
    icon: 'Clock',
    title: 'Smart Scheduling',
    description: 'AI-powered appointment optimization that reduces wait times and maximizes throughput',
    tint: 'bright',
  },
  {
    icon: 'Package',
    title: 'Inventory Alerts',
    description: 'Automatic reorder notifications when stock falls below configurable thresholds',
    tint: 'orange',
  },
  {
    icon: 'FileText',
    title: 'Invoice Generation',
    description: 'Auto-generate invoices from completed job cards with accurate parts and labour totals',
    tint: 'navy',
  },
  {
    icon: 'Zap',
    title: 'Customer Notifications',
    description: 'Automated SMS and email updates keeping customers informed on service progress',
    tint: 'blue',
  },
  {
    icon: 'BarChart2',
    title: 'Report Scheduling',
    description: 'Scheduled report generation and delivery so stakeholders stay informed automatically',
    tint: 'bright',
  },
]

export function PublicAutomation() {
  const t = useT()
  usePageMeta({
    title: t('Automation — SALIS AUTO'),
    description: t('Streamline your workshop with powerful workflow automation and smart scheduling'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Automation & Workflows"
        subtitle="Eliminate manual tasks and let intelligent automation keep your workshop running at peak efficiency"
      />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={22} />
    </div>
  )
}
