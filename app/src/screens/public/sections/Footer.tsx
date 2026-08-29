import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useT } from '@/providers/PreferencesProvider'

interface FooterLink {
  label: string
  to: string
}

interface FooterGroup {
  heading: string
  links: readonly FooterLink[]
}

const GROUPS: readonly FooterGroup[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', to: '/public-portal/features' },
      { label: 'Solutions', to: '/public-portal/solutions' },
      { label: 'Pricing', to: '/public-portal/pricing' },
      { label: 'Marketplace', to: '/public-portal/marketplace' },
      { label: 'Integrations', to: '/public-portal/integrations' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/public-portal/about' },
      { label: 'Careers', to: '/public-portal/careers' },
      { label: 'Blog', to: '/public-portal/blog' },
      { label: 'Contact', to: '/public-portal/contact' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center', to: '/public-portal/support' },
      { label: 'FAQ', to: '/public-portal/faq' },
      { label: 'Request Demo', to: '/public-portal/request-demo' },
      { label: 'Resources', to: '/public-portal/resources' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms-conditions' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
    ],
  },
]

export function Footer() {
  const t = useT()
  return (
    <footer className="flex flex-wrap gap-10 border-t border-border bg-sidebar p-6 md:gap-[60px] md:p-10">
      <div className="min-w-[200px]">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-salis-gradient text-white">
            <Icon name="Car" size={14} />
          </span>
          <span dir="ltr" className="font-display text-sm font-extrabold text-heading">
            SALIS AUTO
          </span>
        </div>
        <p className="m-0 max-w-[240px] text-xs text-muted">
          {t('Integrated automotive workshop management system for Saudi Arabia.')}
        </p>
      </div>
      {GROUPS.map((group) => (
        <nav key={group.heading} aria-label={t(group.heading)}>
          <p className="mb-2.5 mt-0 text-xs font-semibold uppercase tracking-[.05em] text-muted">
            {t(group.heading)}
          </p>
          <div className="flex flex-col gap-1.5">
            {group.links.map((link) => (
              <Link key={link.to + link.label} to={link.to} className="text-[13px] text-body">
                {t(link.label)}
              </Link>
            ))}
          </div>
        </nav>
      ))}
    </footer>
  )
}
