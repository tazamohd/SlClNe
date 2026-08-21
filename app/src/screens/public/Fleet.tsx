import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Fleet — Fleet Management product page.
 *
 *  Centred intro over a six-card grid covering fleet operations: contracts,
 *  tracking, maintenance, drivers, fuel, and compliance. */
const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'FileSignature',
    title: 'Contract Management',
    description: 'Lease and service contracts with automated renewal alerts',
    tint: 'blue',
  },
  {
    icon: 'MapPin',
    title: 'Vehicle Tracking',
    description: 'Real-time GPS location and trip history for every asset',
    tint: 'bright',
  },
  {
    icon: 'CalendarCheck',
    title: 'Maintenance Scheduling',
    description: 'Preventive maintenance plans based on mileage and time intervals',
    tint: 'orange',
  },
  {
    icon: 'Users',
    title: 'Driver Management',
    description: 'License tracking, assignments, and driver performance scoring',
    tint: 'navy',
  },
  {
    icon: 'Fuel',
    title: 'Fuel Monitoring',
    description: 'Track consumption per vehicle and flag abnormal usage patterns',
    tint: 'blue',
  },
  {
    icon: 'ShieldCheck',
    title: 'Compliance',
    description: 'Stay ahead of inspections, insurance renewals, and regulations',
    tint: 'bright',
  },
]

export function PublicFleet() {
  const t = useT()
  usePageMeta({
    title: t('Fleet Management — SALIS AUTO'),
    description: t('End-to-end fleet operations from contracts to compliance'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Fleet Management"
        subtitle="End-to-end fleet operations from contracts to compliance"
      />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
    </div>
  )
}
