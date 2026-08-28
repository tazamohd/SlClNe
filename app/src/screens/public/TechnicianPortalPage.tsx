import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.TechnicianPortal — Technician Portal product page.
 *
 *  File named TechnicianPortalPage.tsx to avoid conflict with the authenticated
 *  technician screen. Centred intro over a six-card grid of tools that help
 *  technicians work faster and smarter on the shop floor. */
const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'ListChecks',
    title: 'Job Queue',
    description: 'Prioritised work orders assigned by bay and skill level',
    tint: 'blue',
  },
  {
    icon: 'Clock',
    title: 'Time Clock',
    description: 'Clock in, track labour hours, and log breaks per job',
    tint: 'bright',
  },
  {
    icon: 'Search',
    title: 'Parts Lookup',
    description: 'Search inventory and request parts without leaving the bay',
    tint: 'orange',
  },
  {
    icon: 'BookOpenCheck',
    title: 'Documentation',
    description: 'Access OEM manuals, wiring diagrams, and torque specs instantly',
    tint: 'navy',
  },
  {
    icon: 'Gauge',
    title: 'Performance Dashboard',
    description: 'Track jobs completed, efficiency scores, and earnings in real time',
    tint: 'blue',
  },
  {
    icon: 'GraduationCap',
    title: 'Knowledge Base',
    description: 'Searchable library of repair tips, TSBs, and best practices',
    tint: 'bright',
  },
]

export function PublicTechnicianPortal() {
  const t = useT()
  usePageMeta({
    title: t('Technician Portal — SALIS AUTO'),
    description: t('Shop-floor tools that help technicians work faster and smarter'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Technician Portal"
        subtitle="Shop-floor tools that help technicians work faster and smarter"
      />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
    </div>
  )
}
