import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'
import { StatBand } from './sections/StatBand'

/** PublicPortal.AI — AI & Automation product page.
 *
 *  Centred intro, three-stat band, then a six-card grid of AI-driven
 *  capabilities: diagnostics, scheduling, predictive maintenance, pricing,
 *  reports, and voice commands. */
const STATS = [
  { value: 'AI-Powered', label: 'Intelligent decision support' },
  { value: 'ML Models', label: 'Trained on automotive data' },
  { value: '24/7 Automation', label: 'Always-on background processing' },
] as const

const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'ScanSearch',
    title: 'AI Diagnostics',
    description: 'Identify faults faster with machine-learning-assisted analysis',
    tint: 'blue',
  },
  {
    icon: 'CalendarClock',
    title: 'Smart Scheduling',
    description: 'Optimise bay allocation and technician workloads automatically',
    tint: 'bright',
  },
  {
    icon: 'Activity',
    title: 'Predictive Maintenance',
    description: 'Forecast part failures before they disrupt your customers',
    tint: 'orange',
  },
  {
    icon: 'BadgeDollarSign',
    title: 'Intelligent Pricing',
    description: 'Data-driven service pricing aligned with market conditions',
    tint: 'navy',
  },
  {
    icon: 'FileBarChart',
    title: 'Automated Reports',
    description: 'Generate daily summaries and performance insights hands-free',
    tint: 'blue',
  },
  {
    icon: 'Mic',
    title: 'Voice Commands',
    description: 'Hands-free operation for technicians on the shop floor',
    tint: 'bright',
  },
]

export function PublicAI() {
  const t = useT()
  usePageMeta({
    title: t('AI & Automation — SALIS AUTO'),
    description: t('Harness artificial intelligence to run a smarter workshop'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="AI & Automation"
        subtitle="Harness artificial intelligence to run a smarter workshop"
      />
      <StatBand items={STATS} />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
    </div>
  )
}
