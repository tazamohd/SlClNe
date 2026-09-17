import type { T } from '../types'
import type { EraRow } from '../landingData'
import { SectionIntro } from '../../sections/SectionIntro'

/** The release rail — the same version-numbered history already told on the
 *  HUD tour's `IndexPage` (`0.1.0` → `2.0.0`), restyled onto the
 *  `.salis-home-timeline`/`.era` light-theme pattern in `homepage.css`
 *  instead of that page's void/cyan rail. Real version numbers instead of a
 *  vague roadmap, same as the source. */
function releases(t: T): readonly EraRow[] {
  return [
    {
      year: '0.1.0',
      status: t('Alpha'),
      headline: t('Foundations'),
      body: t('Authentication, the fourteen roles and the twenty-eight permission modules, and the Arabic and English language packs with right-to-left layout built in rather than bolted on.'),
    },
    {
      year: '0.4.0',
      status: t('Alpha'),
      headline: t('Finance, and the first cleared invoice'),
      body: t('Invoices, payments and receipts stored in halalas, VAT computed on the server at the ZATCA rate, and the e-invoicing pipeline proven against the ZATCA sandbox.'),
    },
    {
      year: '0.8.0',
      status: t('Beta'),
      headline: t('Certification'),
      body: t('The full ZATCA Phase 2 pipeline — UBL 2.1, TLV QR, hash chain, X.509 signature, Fatoora clearance — certified against production rather than sandbox.'),
    },
    {
      year: '1.0.0',
      status: t('You are here'),
      headline: t('Thirteen domains, one platform'),
      body: t('Workshop, registry, finance, accounting, CRM, administration, authentication, AI, parts, call centre, reports, team and portals — one tenancy, two languages, one audit trail.'),
    },
    {
      year: '2.0.0',
      status: t('Next'),
      headline: t('Phase two'),
      body: t('Native mobile applications, offline mode for a workshop floor with no signal in the pit, and multi-currency for operators working outside the Kingdom.'),
    },
  ]
}

/** The current release — compared on the untranslated version number rather
 *  than re-translating the "You are here" literal and matching it against
 *  the already-translated status, which only worked by relying on `t()`
 *  being a pure, referentially-stable lookup for the same input. */
const CURRENT_VERSION = '1.0.0'

export function ReleaseTimeline({ t }: { t: T }) {
  const rows = releases(t)
  return (
    <section className="mx-auto max-w-[900px] px-5 py-14 md:px-10 md:py-20">
      <SectionIntro
        as="h2"
        eyebrow="Where it stands"
        title="A version number, not a promise"
        subtitle="Real releases, in order — including the one still ahead."
      />
      <div className="salis-home-timeline">
        {rows.map((row) => (
          <div key={row.year} className={row.year === CURRENT_VERSION ? 'era now rise' : 'era rise'}>
            <div className="yr" dir="ltr">
              {row.year}
              <small>{row.status}</small>
            </div>
            <div>
              <h3>{row.headline}</h3>
              <p>{row.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
