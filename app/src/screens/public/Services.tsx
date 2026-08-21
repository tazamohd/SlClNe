import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Services — `project/PublicPortal.Services.dc.html`.
 *
 *  Centred intro over a four-column grid of the eight service categories.
 *  The design paints `cursor:pointer` on the cards but gives them no
 *  destination and no service-detail page exists, so the cards render as
 *  informational articles — not dead links. */
const SERVICES: readonly IconCardItem[] = [
  {
    icon: 'Wrench',
    title: 'Maintenance',
    description: 'Scheduled servicing and oil changes',
    tint: 'blue',
  },
  {
    icon: 'Cog',
    title: 'Repair',
    description: 'Engine, transmission & general repair',
    tint: 'bright',
  },
  {
    icon: 'SearchCheck',
    title: 'Diagnostics',
    description: 'Computer diagnostics & troubleshooting',
    tint: 'orange',
  },
  {
    icon: 'ClipboardCheck',
    title: 'Inspection',
    description: 'Multi-point vehicle inspections',
    tint: 'navy',
  },
  {
    icon: 'CircleDot',
    title: 'Tire Service',
    description: 'Tire change, rotation & alignment',
    tint: 'blue',
  },
  {
    icon: 'Car',
    title: 'Body & Paint',
    description: 'Collision repair and repainting',
    tint: 'bright',
  },
  {
    icon: 'Wind',
    title: 'AC Service',
    description: 'AC repair, regas & maintenance',
    tint: 'orange',
  },
  {
    icon: 'Droplets',
    title: 'Oil Change',
    description: 'Full synthetic & conventional oil',
    tint: 'navy',
  },
]

export function PublicServices() {
  const t = useT()
  usePageMeta({
    title: t('Services — SALIS AUTO'),
    description: t('Everything your workshop needs to deliver exceptional service'),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AutoRepair',
      name: 'SALIS AUTO',
      url: 'https://salisauto.sa/public-portal/services',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Workshop Services',
        itemListElement: SERVICES.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.title, description: s.description },
        })),
      },
    },
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Our Services"
        subtitle="Everything your workshop needs to deliver exceptional service"
      />
      <IconCardGrid items={SERVICES} columns={4} centered iconSize={24} />
    </div>
  )
}
