import type { T } from '../types'
import { SectionIntro } from '../../sections/SectionIntro'

/** "See it running" — three clearly-labeled product-UI mockups replacing the
 *  HUD tour's bay board / diagnostic panel / holographic invoice: a job-card
 *  kanban, a ZATCA Phase 2 invoice, and a permission ceiling table. Each is
 *  CSS/markup only (no binary assets, no WebGL — see the plan's
 *  Future-Investment Spec for what a commissioned Phase 2 would add here)
 *  and each carries the same "sample data" disclosure the honest tour
 *  content already uses, so nothing here reads as live telemetry. */
export function ProductMockups({ t }: { t: T }) {
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-14 md:px-10 md:py-20">
      <SectionIntro
        as="h2"
        eyebrow="See it running"
        title="What the floor actually looks at"
        subtitle="Three screens from the product, shown with sample data — not a live tenant."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <KanbanMock t={t} />
        <InvoiceMock t={t} />
        <PermissionsMock t={t} />
      </div>
    </section>
  )
}

const STAGES = [
  { key: 'checkin', label: 'Check-in', jobs: ['RUH 4821 · Camry'] },
  { key: 'inspection', label: 'Inspection', jobs: ['JED 9930 · Patrol'] },
  { key: 'repair', label: 'Repair', jobs: ['RUH 0071 · Hilux', 'RUH 6612 · Explorer'] },
  { key: 'delivery', label: 'Delivery', jobs: ['JED 3390 · Lexus LX'] },
] as const

function KanbanMock({ t }: { t: T }) {
  return (
    <div className="salis-home-mockup rise">
      <div className="salis-home-mockup-bar">
        <i />
        <i />
        <i />
        <span>{t('JOB CARDS · SAMPLE DATA')}</span>
      </div>
      <div
        className="salis-home-mockup-body overflow-x-auto"
        role="group"
        aria-label={t('Job card stages')}
        // A horizontal scroller has to be reachable from the keyboard.
        tabIndex={0}
      >
        <div className="flex gap-3">
          {STAGES.map((stage) => (
            <div key={stage.key} className="w-[128px] shrink-0">
              <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
                {t(stage.label)}
              </p>
              <div className="flex flex-col gap-2">
                {stage.jobs.map((job) => (
                  <div key={job} className="rounded-lg border border-border bg-inset p-2 text-[11px] text-body" dir="ltr">
                    {job}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="salis-home-mockup-caption">{t('The six-stage job card, held in order by the server')}</p>
    </div>
  )
}

function InvoiceMock({ t }: { t: T }) {
  const lines = [
    { d: t('Diagnostic read & inspection'), v: '180.00' },
    { d: t('Labour — 2.4 h'), v: '720.00' },
    { d: t('Front brake discs & pads'), v: '1,430.00' },
    { d: t('VAT 15%'), v: '349.50' },
  ]
  return (
    <div className="salis-home-mockup rise">
      <div className="salis-home-mockup-bar">
        <i />
        <i />
        <i />
        <span>{t('INVOICE · SAMPLE DATA')}</span>
      </div>
      <div className="salis-home-mockup-body">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
            {t('ZATCA Phase 2')}
          </span>
          <span dir="ltr" className="font-mono text-[11px] text-muted">
            SAR 2,679.50
          </span>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-border pt-2">
          {lines.map((line) => (
            <div key={line.d} className="flex items-center justify-between text-[12px] text-body">
              <span>{line.d}</span>
              <span dir="ltr" className="font-mono text-muted">
                {line.v}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-2 text-[10px] text-faint">
          <span className="inline-block h-6 w-6 shrink-0 rounded border border-border bg-inset" aria-hidden="true" />
          <span dir="ltr">{t('Hash 7F2A·C41E·9B03 · verifiable')}</span>
        </div>
      </div>
      <p className="salis-home-mockup-caption">{t('UBL 2.1, TLV QR, X.509 — cleared through Fatoora')}</p>
    </div>
  )
}

function PermissionsMock({ t }: { t: T }) {
  const rows = [
    { role: t('Branch Manager'), ceiling: 'SAR 50,000' },
    { role: t('Accountant'), ceiling: 'SAR 25,000' },
    { role: t('Service Advisor'), ceiling: 'SAR 5,000' },
    { role: t('Technician'), ceiling: t('Approves nothing') },
  ]
  return (
    <div className="salis-home-mockup rise">
      <div className="salis-home-mockup-bar">
        <i />
        <i />
        <i />
        <span>{t('APPROVAL CEILINGS · SAMPLE DATA')}</span>
      </div>
      <div className="salis-home-mockup-body">
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <div key={row.role} className="flex items-center justify-between rounded-lg border border-border bg-inset px-2.5 py-2 text-[12px]">
              <span className="text-body">{row.role}</span>
              <span dir="ltr" className="font-mono text-[11px] text-muted">
                {row.ceiling}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="salis-home-mockup-caption">{t('14 roles, each with a ceiling it cannot cross')}</p>
    </div>
  )
}
