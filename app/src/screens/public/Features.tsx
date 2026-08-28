import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.Features — features overview grouped into three sections.
 *
 *  Operations, Business and Technology — each with four cards in a four-column
 *  grid. Section headings use h2 via a non-centered SectionIntro. */
const OPERATIONS: readonly IconCardItem[] = [
  { icon: 'ClipboardList', title: 'Job Card Management', description: 'Create, assign and track job cards through every repair stage', tint: 'blue' },
  { icon: 'CalendarDays', title: 'Scheduling & Calendar', description: 'Bay allocation, technician scheduling and appointment booking', tint: 'bright' },
  { icon: 'SearchCheck', title: 'Inspection & QC', description: 'Multi-point inspections with photo evidence and digital checklists', tint: 'orange' },
  { icon: 'PackageSearch', title: 'Parts Procurement', description: 'Purchase orders, supplier quotes and automated reorder points', tint: 'navy' },
]

const BUSINESS: readonly IconCardItem[] = [
  { icon: 'FileText', title: 'ZATCA e-Invoicing', description: 'Phase-2 compliant electronic invoicing with QR code generation', tint: 'blue' },
  { icon: 'BarChart3', title: 'Financial Reports', description: 'Profit & loss, balance sheet and cash flow at your fingertips', tint: 'bright' },
  { icon: 'Users', title: 'CRM Pipeline', description: 'Lead tracking, follow-ups and customer lifecycle management', tint: 'orange' },
  { icon: 'BadgeDollarSign', title: 'HR & Payroll', description: 'Employee records, attendance tracking and salary processing', tint: 'navy' },
]

const TECHNOLOGY: readonly IconCardItem[] = [
  { icon: 'Brain', title: 'AI Diagnostics', description: 'Fault prediction and repair recommendations powered by AI', tint: 'blue' },
  { icon: 'Activity', title: 'Real-time Dashboard', description: 'Live workshop KPIs, bay status and revenue metrics', tint: 'bright' },
  { icon: 'Smartphone', title: 'Mobile Apps', description: 'Native technician and customer apps for iOS and Android', tint: 'orange' },
  { icon: 'Building2', title: 'Multi-branch', description: 'Centralised oversight across all your workshop locations', tint: 'navy' },
]

export function PublicFeatures() {
  const t = useT()
  usePageMeta({
    title: t('Features — SALIS AUTO'),
    description: t('Explore the full feature set of the SALIS AUTO platform'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Platform Features"
        subtitle="Explore the full feature set of the SALIS AUTO platform"
      />

      <h2 className="mb-4 mt-2 font-display text-xl font-bold text-heading">{t('Operations')}</h2>
      <div className="mb-10">
        <IconCardGrid items={OPERATIONS} columns={4} iconSize={24} />
      </div>

      <h2 className="mb-4 mt-2 font-display text-xl font-bold text-heading">{t('Business')}</h2>
      <div className="mb-10">
        <IconCardGrid items={BUSINESS} columns={4} iconSize={24} />
      </div>

      <h2 className="mb-4 mt-2 font-display text-xl font-bold text-heading">{t('Technology')}</h2>
      <div>
        <IconCardGrid items={TECHNOLOGY} columns={4} iconSize={24} />
      </div>
    </div>
  )
}
