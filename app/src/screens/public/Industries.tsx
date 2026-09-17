import { Link } from 'react-router-dom'
import { useT, usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.Industries — Tier B content page, expanded for the
 *  truth-and-conversion overhaul (2026-09).
 *
 *  Nine segments, each with a real operational problem, the modules that
 *  address it, one example workflow, and the business value — no invented
 *  result or metric (the brief is explicit: "Do not invent results"). Each
 *  card ends in its own Request a Demo link so the CTA never depends on
 *  reaching the bottom of the page. */
interface Industry {
  icon: string
  title: string
  problem: string
  modules: string
  workflow: string
  value: string
}

const INDUSTRIES: readonly Industry[] = [
  {
    icon: 'Wrench',
    title: 'Independent workshops',
    problem:
      'Paper job cards and spreadsheets make it hard to track a vehicle’s status or bill accurately.',
    modules: 'Job cards, estimates, invoicing, customer records',
    workflow:
      'A vehicle checks in, gets a job card, moves through repair and quality control, and leaves with a ZATCA-ready invoice.',
    value: 'One controlled record replaces scattered paper and spreadsheets for a single-location shop.',
  },
  {
    icon: 'GitBranch',
    title: 'Multi-branch service centers',
    problem:
      'Each branch keeps its own records, so management has no unified view of performance or inventory.',
    modules: 'Multi-branch job cards, centralized reporting, inventory transfers, branch-scoped permissions',
    workflow:
      'A regional manager reviews job-card volume and technician workload across every branch from one place.',
    value: 'Centralized visibility without losing branch-level control over day-to-day work.',
  },
  {
    icon: 'Boxes',
    title: 'Spare-parts retailers',
    problem:
      'Tracking stock across counter sales and workshop consumption in separate systems causes stockouts and mismatched counts.',
    modules: 'Inventory management, parts catalogue, counter sales',
    workflow:
      'A counter sale and a workshop’s parts consumption draw from the same stock record, so the count never diverges.',
    value: 'One inventory record for both counter sales and internal workshop use.',
  },
  {
    icon: 'Truck',
    title: 'Parts distributors',
    problem:
      'Coordinating purchase orders, supplier lead times and multi-branch stock transfers by phone and spreadsheet is slow and error-prone.',
    modules: 'Procurement, purchase orders, supplier directory, stock transfers',
    workflow:
      'A requisition is raised, submitted for approval, converted to a purchase order, and received into the right branch’s stock.',
    value: 'A structured procurement chain instead of ad hoc ordering by phone.',
  },
  {
    icon: 'Building2',
    title: 'Corporate fleets',
    problem:
      'Scheduling preventive maintenance and tracking cost per vehicle across many units is hard without a central system.',
    modules: 'Fleet management, preventive maintenance scheduling, cost-per-vehicle reporting',
    workflow:
      'A fleet coordinator schedules maintenance windows and reviews cost trends per vehicle over time.',
    value: 'Maintenance scheduled ahead of a breakdown, with cost tracked per vehicle.',
  },
  {
    icon: 'RefreshCw',
    title: 'Rental and leasing operations',
    problem:
      'Vehicles rotate between customers and maintenance cycles; service history needs to travel with the vehicle, not the customer.',
    modules: 'Vehicle service history, job cards, multi-branch scheduling',
    workflow:
      'A returned rental vehicle’s service history is reviewed before it is scheduled for its next rental cycle.',
    value: 'A vehicle’s full service history stays with it across renters.',
  },
  {
    icon: 'Zap',
    title: 'Logistics and delivery fleets',
    problem:
      'Downtime on a delivery vehicle has an immediate cost, so maintenance needs to be scheduled around delivery routes.',
    modules: 'Fleet maintenance scheduling, technician workload, bay availability',
    workflow:
      'Maintenance is scheduled in the window between delivery routes, tracked against bay and technician availability.',
    value: 'Maintenance planned around uptime requirements, not just a calendar date.',
  },
  {
    icon: 'Star',
    title: 'Dealerships',
    problem:
      'Warranty work, OEM parts and customer-pay service need to be tracked and invoiced differently, often in the same visit.',
    modules: 'Warranty tracking, OEM parts management, service scheduling, invoicing',
    workflow:
      'A vehicle in for warranty and customer-pay work in the same visit is invoiced correctly for each line.',
    value: 'Warranty and customer-pay work tracked and invoiced correctly in one job card.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Insurance and supporting services',
    problem:
      'Coordinating an insurance claim, approval and repair timeline across a workshop and an insurer is manual and slow.',
    modules: 'Insurance claims, approval workflows, audit trail',
    workflow:
      'A claim is logged against a job card, tracked through approval, and the repair proceeds once approved.',
    value: 'A documented, auditable trail from claim to repair completion.',
  },
]

export function PublicIndustries() {
  const t = useT()
  const { language } = usePreferences()
  const rtl = language === 'ar'
  usePageMeta({
    title: t('Industries — SALIS AUTO'),
    description: t(
      'Nine automotive industry segments SALIS AUTO is built for — the operational problem, relevant modules and example workflow for each.'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Industries We Serve"
        subtitle="Purpose-built for every segment of the Saudi automotive aftermarket — the operational problem, the modules that address it, and one example workflow"
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {INDUSTRIES.map((industry) => (
          <article
            key={industry.title}
            className="flex flex-col rounded-2xl border border-default bg-card p-6"
          >
            <span className="mb-3 inline-flex w-fit rounded-[14px] bg-tint-blue p-2.5 text-salis-blue">
              <Icon name={industry.icon} size={22} />
            </span>
            <h2 className="mb-3 mt-0 text-base font-bold text-heading">{t(industry.title)}</h2>
            <dl className="m-0 flex flex-col gap-2.5 text-[13px] leading-normal">
              <div>
                <dt className="font-semibold text-heading">{t('The problem')}</dt>
                <dd className="m-0 text-muted">{t(industry.problem)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-heading">{t('Relevant modules')}</dt>
                <dd className="m-0 text-muted">{t(industry.modules)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-heading">{t('Example workflow')}</dt>
                <dd className="m-0 text-muted">{t(industry.workflow)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-heading">{t('Business value')}</dt>
                <dd className="m-0 text-muted">{t(industry.value)}</dd>
              </div>
            </dl>
            <Link
              to="/public-portal/request-demo"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-salis-blue no-underline hover:underline"
            >
              {t('Request a Demo for this segment')}
              <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={14} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
