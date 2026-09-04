import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'
import { CtaBanner } from './sections/CtaBanner'

/** PublicPortal.SpareParts — Spare Parts product page.
 *
 *  SectionIntro and six feature cards covering parts catalogue, supplier
 *  integration and inventory management. */
const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'BookOpen',
    title: 'Parts Catalog',
    description: 'Searchable catalogue with OEM cross-references and fitment data',
    tint: 'blue',
  },
  {
    icon: 'Building2',
    title: 'Supplier Network',
    description: 'Connected marketplace with verified local and international suppliers',
    tint: 'bright',
  },
  {
    icon: 'RefreshCcw',
    title: 'Auto Reorder',
    description: 'Automatic purchase orders when stock falls below reorder points',
    tint: 'orange',
  },
  {
    icon: 'Scale',
    title: 'Price Comparison',
    description: 'Side-by-side supplier pricing with delivery time and availability',
    tint: 'navy',
  },
  {
    icon: 'ScanBarcode',
    title: 'Barcode Scanning',
    description: 'Scan parts in and out of stock with mobile barcode and QR support',
    tint: 'blue',
  },
  {
    icon: 'Package',
    title: 'Inventory Tracking',
    description: 'Real-time stock levels across warehouses with movement history',
    tint: 'bright',
  },
]

export function PublicSpareParts() {
  const t = useT()
  const audience: readonly IconCardItem[] = [
    { icon: 'ClipboardList', title: t('Parts manager'), description: t('Stock under minimum drafts a purchase request against the preferred supplier and waits for approval.'), tint: 'blue' },
    { icon: 'ShoppingCart', title: t('Purchaser'), description: t('Price comparison across the supplier network before the order is placed, not after.'), tint: 'bright' },
    { icon: 'Building2', title: t('Supplier'), description: t('A portal to publish the catalogue, confirm orders and track delivery without phone calls.'), tint: 'navy' },
  ]
  usePageMeta({
    title: t('Spare Parts — SALIS AUTO'),
    description: t('Smart spare parts management with supplier network integration'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Spare Parts"
        subtitle="Smart spare parts management with supplier network integration"
      />
      <p className="mx-auto mb-8 mt-0 max-w-[640px] text-center text-sm text-muted">
        {t('Spare Parts runs inside SALIS Garage today. Access for buyers outside the workshop is planned.')}
      </p>
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
      <div className="mt-14 md:mt-20" />
      <SectionIntro
        as="h2"
        centered
        title={t('Who it is for')}
        subtitle={t('Parts, purchasing and the supplier see one order, not three copies of it.')}
      />
      <IconCardGrid items={audience} columns={3} centered iconSize={24} />
      <CtaBanner
        title={t('See reorder run on your own stock list')}
        description={t('A 20-minute demo, in Arabic or English.')}
        primaryCta={{ label: t('Book a demo'), to: '/public-portal/book-demo' }}
        secondaryCta={{ label: t('Talk to sales'), to: '/public-portal/contact' }}
      />
    </div>
  )
}
