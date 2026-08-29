import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'
import { StatBand } from './sections/StatBand'

/** PublicPortal.Accounting — Accounting product page.
 *
 *  Centred intro, three-stat highlight band, then a six-card grid covering the
 *  core accounting capabilities: chart of accounts through multi-currency. */
const STATS = [
  { value: 'ZATCA Compliant', label: 'E-invoicing & tax reporting' },
  { value: 'Real-time Ledger', label: 'Instant financial visibility' },
  { value: 'Auto VAT', label: 'Automated tax calculation' },
] as const

const FEATURES: readonly IconCardItem[] = [
  {
    icon: 'BookOpen',
    title: 'Chart of Accounts',
    description: 'Structured account hierarchy tailored for automotive businesses',
    tint: 'blue',
  },
  {
    icon: 'FileText',
    title: 'Journal Entries',
    description: 'Double-entry bookkeeping with automated posting rules',
    tint: 'bright',
  },
  {
    icon: 'Building2',
    title: 'Bank Reconciliation',
    description: 'Match transactions automatically and resolve discrepancies fast',
    tint: 'orange',
  },
  {
    icon: 'Receipt',
    title: 'Tax Management',
    description: 'ZATCA-compliant VAT handling with e-invoicing support',
    tint: 'navy',
  },
  {
    icon: 'BarChart3',
    title: 'Financial Reports',
    description: 'Balance sheets, income statements, and cash-flow reports on demand',
    tint: 'blue',
  },
  {
    icon: 'Coins',
    title: 'Multi-currency',
    description: 'Transact in SAR, USD, EUR and more with real-time conversion',
    tint: 'bright',
  },
]

export function PublicAccounting() {
  const t = useT()
  usePageMeta({
    title: t('Accounting — SALIS AUTO'),
    description: t('Complete automotive accounting built for Saudi regulations'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Accounting"
        subtitle="Complete automotive accounting built for Saudi regulations"
      />
      <StatBand items={STATS} />
      <IconCardGrid items={FEATURES} columns={3} centered iconSize={24} />
    </div>
  )
}
