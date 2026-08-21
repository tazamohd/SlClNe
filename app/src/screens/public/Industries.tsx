import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Industries — Tier B content page.
 *
 *  Six cards in a three-column grid, each representing an industry segment
 *  SALIS AUTO serves across the Saudi automotive market. */
const INDUSTRIES: readonly IconCardItem[] = [
  {
    icon: 'Wrench',
    title: 'Independent Workshops',
    description:
      'Full job-card management and parts sourcing for single-location repair shops',
    tint: 'blue',
  },
  {
    icon: 'Building2',
    title: 'Dealerships',
    description:
      'Integrated service, warranty tracking and OEM parts management for authorised dealers',
    tint: 'bright',
  },
  {
    icon: 'Truck',
    title: 'Fleet Operators',
    description:
      'Preventive maintenance scheduling and cost-per-vehicle analytics for large fleets',
    tint: 'orange',
  },
  {
    icon: 'GitBranch',
    title: 'Multi-branch Chains',
    description:
      'Centralised reporting, inventory transfers and unified customer records across locations',
    tint: 'navy',
  },
  {
    icon: 'Zap',
    title: 'Quick Service Centers',
    description:
      'Fast check-in workflows and streamlined invoicing for oil-change and tyre shops',
    tint: 'blue',
  },
  {
    icon: 'Star',
    title: 'Specialty Shops',
    description:
      'Custom job templates and specialised parts catalogues for bodywork, tuning and detailing',
    tint: 'bright',
  },
]

export function PublicIndustries() {
  const t = useT()
  usePageMeta({
    title: t('Industries — SALIS AUTO'),
    description: t(
      'Automotive industry segments served by the SALIS AUTO workshop management platform'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Industries We Serve"
        subtitle="Purpose-built solutions for every segment of the Saudi automotive aftermarket"
      />
      <IconCardGrid items={INDUSTRIES} columns={3} centered iconSize={24} />
    </div>
  )
}
