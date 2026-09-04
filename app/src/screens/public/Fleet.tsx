import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'
import { CtaBanner } from './sections/CtaBanner'

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
  const audience: readonly IconCardItem[] = [
    { icon: 'Truck', title: t('Fleet manager'), description: t('Utilisation and cost per vehicle across branches, without a spreadsheet export.'), tint: 'blue' },
    { icon: 'MapPin', title: t('Branch manager'), description: t('Which contract vehicles are due, in the bay, or overdue, on one board.'), tint: 'bright' },
    { icon: 'Receipt', title: t('Finance'), description: t('Contract invoices with the same ZATCA e-invoice and audit trail as every other sale.'), tint: 'navy' },
  ]
  usePageMeta({
    title: t('Fleet Management — SALIS AUTO'),
    description: t('End-to-end fleet operations from contracts to compliance'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Fleet Management"
        subtitle="End-to-end fleet operations from contracts to compliance"
      />
      <p className="mx-auto mb-8 mt-0 max-w-[640px] text-center text-sm text-muted">
        {t('Fleet runs inside SALIS Garage today. A fleet-manager product of its own is planned.')}
      </p>
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
      <div className="mt-14 md:mt-20" />
      <SectionIntro
        as="h2"
        centered
        title={t('Who it is for')}
        subtitle={t('Fleet, branch and finance read the same contract, vehicle and invoice.')}
      />
      <IconCardGrid items={audience} columns={3} centered iconSize={24} />
      <CtaBanner
        title={t('See your contract vehicles on one board')}
        description={t('A 20-minute demo, in Arabic or English.')}
        primaryCta={{ label: t('Book a demo'), to: '/public-portal/book-demo' }}
        secondaryCta={{ label: t('Talk to sales'), to: '/public-portal/contact' }}
      />
    </div>
  )
}
