import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Support — `project/PublicPortal.Support.dc.html`.
 *
 *  Three channel cards, each a real action: Call Us dials, Email opens a
 *  draft, and Live Chat — which has no public chat service behind it yet —
 *  routes to the Contact page rather than dangling. When the support chat
 *  service exists, only that card's destination changes. */
const CHANNELS: readonly IconCardItem[] = [
  {
    icon: 'MessageCircle',
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    tint: 'blue',
    to: '/public-portal/contact',
  },
  {
    icon: 'Phone',
    title: 'Call Us',
    description: 'Speak to a specialist directly',
    tint: 'bright',
    href: 'tel:+966112345678',
  },
  {
    icon: 'Mail',
    title: 'Email',
    description: 'Send us a detailed message',
    tint: 'orange',
    href: 'mailto:info@salisauto.sa',
  },
]

export function PublicSupport() {
  const t = useT()
  usePageMeta({
    title: t('Help & Support — SALIS AUTO'),
    description: t("We're here to help"),
  })

  return (
    <div className="mx-auto max-w-[800px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro centered title="Help & Support" subtitle="We're here to help" />
      <IconCardGrid items={CHANNELS} columns={3} centered iconSize={24} ariaLabel="Support channels" />
    </div>
  )
}
