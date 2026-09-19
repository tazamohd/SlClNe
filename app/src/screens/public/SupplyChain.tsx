import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useT, usePreferences } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { StatBand } from './sections/StatBand'

/** PublicPortal.SupplyChain — Tier B content page.
 *
 *  Parts as a workshop actually loses margin on them: requisition to issue,
 *  the six ways into the product, and how far one tenancy reaches across
 *  branches. A light-first rewrite of the "SALIS AUTO 2030" design study's
 *  `grid` page (see `PlatformArchitecture.tsx`'s docstring for why this
 *  content is being cascaded now instead of left dark and unlinked).
 *
 *  One content change from the study, carried over from its own page: three
 *  of the six doors are real public routes (customer/technician/supplier
 *  portals) and get a real `<Link>`; the other three — procurement, kiosk,
 *  super admin — live only inside the signed-in application, so they render
 *  as informational tiles rather than a link to a route that does not exist.
 *  The order-stream table keeps the study's own "sample data" labelling —
 *  the same honesty discipline the homepage's product mockups already use
 *  (`ProductMockups.tsx`, checked by `public-pages.test.tsx`). */
type T = (source: string) => string

interface Portal {
  readonly key: string
  readonly name: string
  readonly then: string
  readonly body: string
  readonly sees: readonly string[]
  readonly to: string | null
}

function portals(t: T): readonly Portal[] {
  return [
    {
      key: 'customer', name: t('The customer door'), then: t('Customer app · تطبيق العميل'),
      body: t('One life — the vehicle’s. Bookings, the estimate waiting for a signature, the service history and the invoices, on a phone, in Arabic or English.'),
      sees: [t('Their own vehicles and no one else’s'), t('Estimates, to sign by one-time code'), t('Invoices, with the ZATCA QR')],
      to: '/public-portal/customer-portal',
    },
    {
      key: 'technician', name: t('The technician door'), then: t('Technician portal · بوابة الفني'),
      body: t('Short, unambiguous instructions on a phone, in Arabic, operable with one hand — because the other one is holding the part.'),
      sees: [t('Only jobs assigned to them'), t('Parts requested against the job'), t('No part cost, no margin, ever')],
      to: '/public-portal/technician-portal',
    },
    {
      key: 'supplier', name: t('The supplier door'), then: t('Supplier portal · بوابة المورّد'),
      body: t('Orders in, confirmations out. A supplier sees the purchase orders placed with it and the catalogue it published — nothing about the workshop beside it.'),
      sees: [t('Its own purchase orders only'), t('Its own catalogue and price list'), t('No customer data, ever')],
      to: '/public-portal/supplier-portal',
    },
    {
      key: 'procurement', name: t('The procurement door'), then: t('Procurement portal · بوابة المشتريات'),
      body: t('Requisitions from every branch in one queue, priced against the catalogues, released only within the ceiling the role carries.'),
      sees: [t('Requisitions across branches'), t('Supplier performance'), t('Never approves its own requisition')],
      to: null,
    },
    {
      key: 'kiosk', name: t('The kiosk door'), then: t('Kiosk check-in · الاستقبال الذاتي'),
      body: t('A customer who arrives before the desk is free starts their own check-in: plate, complaint, photographs.'),
      sees: [t('Plate or phone lookup'), t('Complaint and photographs'), t('No pricing, no history')],
      to: null,
    },
    {
      key: 'admin', name: t('The admin door'), then: t('Super admin · المشرف العام'),
      body: t('Tenants, branches, roles and the audit log. The most powerful door in the building and the most heavily recorded one.'),
      sees: [t('Tenants and branches'), t('The 14 × 28 permission matrix'), t('Every change and every refusal')],
      to: null,
    },
  ]
}

function orders(t: T): readonly { part: string; supplier: string; state: string; warn: boolean }[] {
  return [
    { part: t('Brake pads, front axle'), supplier: t('OEM catalogue'), state: t('Ordered'), warn: false },
    { part: t('Oil filter · service kit'), supplier: t('Consumables'), state: t('Received'), warn: false },
    { part: t('Suspension arm, front left'), supplier: t('Aftermarket'), state: t('Awaiting approval'), warn: true },
    { part: t('Timing belt and water pump'), supplier: t('OEM catalogue'), state: t('Requisition raised'), warn: false },
    { part: t('Battery 80 Ah'), supplier: t('Tyres & batteries'), state: t('Approved'), warn: false },
  ]
}

function branches(t: T): readonly { name: string; bays: string; cards: string }[] {
  return [
    { name: t('Riyadh · Main branch'), bays: '9', cards: '38' },
    { name: t('Jeddah · Branch 04'), bays: '4', cards: '17' },
    { name: t('Dammam · Branch 11'), bays: '3', cards: '12' },
    { name: t('NEOM · Branch 01'), bays: '6', cards: '21' },
    { name: t('Makkah · Branch 02'), bays: '5', cards: '26' },
    { name: t('Khobar · Branch 12'), bays: '3', cards: '14' },
  ]
}

const STEPS = [
  { n: '01', titleKey: 'Requisition', bodyKey: 'The technician needs a part; the card asks for it by name against the job. The person who raises it may never be the person who approves it — that pair is split at the server, not by office custom.' },
  { n: '02', titleKey: 'Order', bodyKey: 'Approved within the requesting role’s ceiling and sent to the supplier as a purchase order, at a price the catalogue already agreed.' },
  { n: '03', titleKey: 'Received', bodyKey: 'Goods are checked in against the order rather than against memory. Short deliveries stay open, and what does arrive is costed into stock at what was actually paid for it.' },
  { n: '04', titleKey: 'Issued', bodyKey: 'The storekeeper issues it to the job card during the repair. Stock falls because a movement says so, and the part is on the invoice before it is bolted on.' },
] as const

export function PublicSupplyChain() {
  const t = useT()
  const { language } = usePreferences()
  const rtl = language === 'ar'
  usePageMeta({
    title: t('Supply Chain — SALIS AUTO'),
    description: t(
      'How a part reaches a job card in SALIS AUTO — requisition to issue, the six ways into the product, and how far one tenancy reaches across branches.'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        eyebrow={t('Where the metal is')}
        title={t('Supply Chain')}
        subtitle={t('Parts are where a workshop quietly loses its margin. Here stock is the sum of its movements rather than a number somebody edits, and the person who raises a requisition is never the person who approves it.')}
      />
      <StatBand
        items={[
          { value: '6', label: t('Ways into the product') },
          { value: t('Derived'), label: t('Stock, not typed') },
          { value: '4', label: t('Steps, requisition to issue') },
        ]}
      />

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Requisition to issue')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">{t('Four steps, and a different pair of hands at each end of the first two.')}</p>
      <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.n} className="rounded-2xl border border-default bg-card p-5">
            <div dir="ltr" className="mb-1.5 font-mono text-xs font-semibold text-salis-blue">{step.n}</div>
            <h3 className="mb-1.5 mt-0 text-sm font-bold text-heading">{t(step.titleKey)}</h3>
            <p className="m-0 text-[13px] leading-normal text-muted">{t(step.bodyKey)}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Six doors')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">
        {t('Not everyone who touches a job card should be given the whole application. Each door carries its own permissions and sees exactly its own slice: a supplier never sees a customer, a technician never sees a margin, a customer sees one vehicle — theirs.')}
      </p>
      <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {portals(t).map((portal) => (
          <article key={portal.key} className="flex flex-col rounded-2xl border border-default bg-card p-5">
            <h3 className="mb-0.5 mt-0 text-[15px] font-bold text-heading">{portal.name}</h3>
            <p className="mb-2.5 mt-0 text-[12px] text-muted">{portal.then}</p>
            <p className="mb-3 mt-0 flex-1 text-[13px] leading-normal text-muted">{portal.body}</p>
            <ul className="m-0 mb-4 flex flex-col gap-1 ps-4 text-[12px] text-body">
              {portal.sees.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {portal.to ? (
              <Link to={portal.to} className="mt-auto inline-flex items-center gap-1 text-[13px] font-semibold text-salis-blue no-underline hover:underline">
                {t('Open this portal')}
                <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={13} />
              </Link>
            ) : (
              <p className="m-0 mt-auto text-[12px] italic text-muted">{t('Inside the signed-in application — this door has no public page.')}</p>
            )}
          </article>
        ))}
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Order stream')}</h2>
      <p className="mb-4 mt-0 text-sm text-muted">{t('Sample data, shown on this page. No network, no supplier, no order.')}</p>
      <div className="mb-12 overflow-x-auto rounded-2xl border border-default">
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-default bg-sidebar">
              <th className="p-3 text-start font-semibold text-heading">{t('Part')}</th>
              <th className="p-3 text-start font-semibold text-heading">{t('Supplier')}</th>
              <th className="p-3 text-start font-semibold text-heading">{t('State')}</th>
            </tr>
          </thead>
          <tbody>
            {orders(t).map((row) => (
              <tr key={row.part} className="border-b border-default last:border-0">
                <td className="p-3 font-medium text-heading">{row.part}</td>
                <td className="p-3 text-muted">{row.supplier}</td>
                <td className={row.warn ? 'p-3 text-salis-orange' : 'p-3 text-muted'}>{row.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Branch roll-call')}</h2>
      <p className="mb-4 mt-0 text-sm text-muted">
        {t('A sample tenant with several locations. Every branch reads its own rows and only its own, and the group’s books add up across all of them. Sample data — no tenant data reaches this page.')}
      </p>
      <div className="mb-12 overflow-x-auto rounded-2xl border border-default">
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-default bg-sidebar">
              <th className="p-3 text-start font-semibold text-heading">{t('Branch')}</th>
              <th className="p-3 text-start font-semibold text-heading">{t('Bays')}</th>
              <th className="p-3 text-start font-semibold text-heading">{t('Open cards')}</th>
            </tr>
          </thead>
          <tbody>
            {branches(t).map((row) => (
              <tr key={row.name} className="border-b border-default last:border-0">
                <td className="p-3 font-medium text-heading">{row.name}</td>
                <td dir="ltr" className="p-3 text-muted">{row.bays}</td>
                <td dir="ltr" className="p-3 text-muted">{row.cards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-default pt-8">
        <Link to="/public-portal/platform" className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-heading no-underline hover:bg-card">
          {t('See the platform architecture')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={14} />
        </Link>
        <Link to="/public-portal/pricing" className="rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-heading no-underline hover:bg-card">
          {t('View pricing')}
        </Link>
        <Link to="/public-portal/book-demo" className="rounded-lg bg-salis-gradient px-4 py-2 text-sm font-semibold text-white no-underline">
          {t('Book a demo')}
        </Link>
      </div>
    </div>
  )
}
