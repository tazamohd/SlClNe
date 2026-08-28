import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.SupplierPortal — Supplier Portal product page.
 *
 *  File named SupplierPortalPage.tsx to avoid conflict with the authenticated
 *  supplier screen. Centred intro over a six-card grid of capabilities that
 *  streamline the workshop-supplier relationship. */
const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'ClipboardList',
    title: 'Order Management',
    description: 'Receive, confirm, and fulfil purchase orders in one place',
    tint: 'blue',
  },
  {
    icon: 'MessageSquareText',
    title: 'Quote Requests',
    description: 'Respond to RFQs quickly with structured pricing templates',
    tint: 'bright',
  },
  {
    icon: 'Truck',
    title: 'Delivery Tracking',
    description: 'Update shipment status so workshops know exactly when parts arrive',
    tint: 'orange',
  },
  {
    icon: 'FileUp',
    title: 'Invoice Submission',
    description: 'Submit invoices digitally and track payment status in real time',
    tint: 'navy',
  },
  {
    icon: 'Package',
    title: 'Product Catalog',
    description: 'List your parts inventory with specs, pricing, and availability',
    tint: 'blue',
  },
  {
    icon: 'TrendingUp',
    title: 'Analytics',
    description: 'Sales trends, order volume, and performance metrics at a glance',
    tint: 'bright',
  },
]

export function PublicSupplierPortal() {
  const t = useT()
  usePageMeta({
    title: t('Supplier Portal — SALIS AUTO'),
    description: t('Streamline your partnership with automotive workshops'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Supplier Portal"
        subtitle="Streamline your partnership with automotive workshops"
      />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
    </div>
  )
}
