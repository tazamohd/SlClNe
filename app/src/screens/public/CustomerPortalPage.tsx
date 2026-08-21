import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.CustomerPortal — Customer Portal product page.
 *
 *  File named CustomerPortalPage.tsx to avoid conflict with the authenticated
 *  customer portal screen. Centred intro over a six-card grid of self-service
 *  capabilities available to vehicle owners. */
const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'CalendarPlus',
    title: 'Service Booking',
    description: 'Book appointments online and choose your preferred time slot',
    tint: 'blue',
  },
  {
    icon: 'Radio',
    title: 'Live Tracking',
    description: 'Follow your vehicle repair status in real time from any device',
    tint: 'bright',
  },
  {
    icon: 'ReceiptText',
    title: 'Invoice History',
    description: 'Access and download every invoice from a single timeline',
    tint: 'orange',
  },
  {
    icon: 'Car',
    title: 'Vehicle Registry',
    description: 'Manage all your vehicles with full service history per asset',
    tint: 'navy',
  },
  {
    icon: 'Wallet',
    title: 'Digital Wallet',
    description: 'Prepay for services and track loyalty points in one place',
    tint: 'blue',
  },
  {
    icon: 'Star',
    title: 'Service Ratings',
    description: 'Rate completed jobs and help workshops maintain quality',
    tint: 'bright',
  },
]

export function PublicCustomerPortal() {
  const t = useT()
  usePageMeta({
    title: t('Customer Portal — SALIS AUTO'),
    description: t('Self-service tools that put vehicle owners in control'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Customer Portal"
        subtitle="Self-service tools that put vehicle owners in control"
      />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
    </div>
  )
}
