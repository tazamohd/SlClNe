import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Products — product suite overview.
 *
 *  Eight cards in a four-column grid linking to individual product pages. */
const PRODUCTS: readonly IconCardItem[] = [
  {
    icon: 'LayoutDashboard',
    title: 'Mini ERP',
    description: 'All-in-one invoicing, payments and inventory for small workshops',
    tint: 'blue',
    to: '/public-portal/mini-erp',
  },
  {
    icon: 'Wrench',
    title: 'Workshop Manager',
    description: 'Complete job card lifecycle and bay management',
    tint: 'bright',
    to: '/public-portal/workshop',
  },
  {
    icon: 'Package',
    title: 'Parts Network',
    description: 'Supplier marketplace with price comparison and auto reorder',
    tint: 'orange',
    to: '/public-portal/spare-parts',
  },
  {
    icon: 'Users',
    title: 'Customer Portal',
    description: 'Self-service booking, approvals and vehicle history for customers',
    tint: 'navy',
    to: '/public-portal/crm',
  },
  {
    icon: 'Smartphone',
    title: 'Technician App',
    description: 'Mobile-first inspections, time tracking and job updates',
    tint: 'blue',
    to: '/public-portal/features',
  },
  {
    icon: 'Building2',
    title: 'Supplier Portal',
    description: 'Order management, catalogue publishing and delivery tracking',
    tint: 'bright',
    to: '/public-portal/spare-parts',
  },
  {
    icon: 'Brain',
    title: 'AI Assistant',
    description: 'Intelligent diagnostics, predictions and natural-language queries',
    tint: 'orange',
    to: '/public-portal/solutions',
  },
  {
    icon: 'BarChart3',
    title: 'Analytics Dashboard',
    description: 'Real-time KPIs, revenue trends and operational insights',
    tint: 'navy',
    to: '/public-portal/features',
  },
]

export function PublicProducts() {
  const t = useT()
  usePageMeta({
    title: t('Products — SALIS AUTO'),
    description: t('The complete product suite powering Saudi automotive workshops'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Our Products"
        subtitle="The complete product suite powering Saudi automotive workshops"
      />
      <IconCardGrid items={PRODUCTS} columns={4} centered iconSize={24} />
    </div>
  )
}
