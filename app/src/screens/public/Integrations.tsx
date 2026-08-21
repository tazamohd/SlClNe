import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Integrations — Integrations product page.
 *
 *  Centred intro over a flat eight-card grid spanning the major integration
 *  categories: payments, government, communication, cloud, and hardware. */
const INTEGRATIONS: readonly IconCardItem[] = [
  {
    icon: 'CreditCard',
    title: 'Mada Payments',
    description: 'Accept Mada debit-card payments at the counter and online',
    tint: 'blue',
  },
  {
    icon: 'Banknote',
    title: 'HyperPay',
    description: 'Process Visa, Mastercard, and Apple Pay through a single gateway',
    tint: 'bright',
  },
  {
    icon: 'Landmark',
    title: 'ZATCA',
    description: 'E-invoicing and tax compliance with the Saudi tax authority',
    tint: 'orange',
  },
  {
    icon: 'MessageSquare',
    title: 'SMS & WhatsApp',
    description: 'Automated appointment reminders and status updates via messaging',
    tint: 'navy',
  },
  {
    icon: 'Mail',
    title: 'Email',
    description: 'Transactional emails for invoices, receipts, and notifications',
    tint: 'blue',
  },
  {
    icon: 'Cloud',
    title: 'Cloud Storage',
    description: 'Secure document and media storage with automatic backups',
    tint: 'bright',
  },
  {
    icon: 'Map',
    title: 'Maps',
    description: 'Location services for fleet tracking and customer directions',
    tint: 'orange',
  },
  {
    icon: 'ScanBarcode',
    title: 'OBD-II & Barcode',
    description: 'Read vehicle diagnostics and scan parts with connected hardware',
    tint: 'navy',
  },
]

export function PublicIntegrations() {
  const t = useT()
  usePageMeta({
    title: t('Integrations — SALIS AUTO'),
    description: t('Connect SALIS AUTO with the services your workshop already uses'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Integrations"
        subtitle="Connect SALIS AUTO with the services your workshop already uses"
      />
      <IconCardGrid items={INTEGRATIONS} columns={4} centered iconSize={24} />
    </div>
  )
}
