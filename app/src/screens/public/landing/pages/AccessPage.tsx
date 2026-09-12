import { Link } from 'react-router-dom'
import type { T } from '../types'

/** Access — the three real pricing plans (`Pricing.tsx`'s `PLANS`, verbatim),
 *  a comparison built only from their own stated features, three facts that
 *  hold across every plan, and the real FAQ from the landing page. No
 *  invented strata, no fictional billing cycle, no printing licences. */

interface Plan {
  readonly name: string
  readonly price: string
  readonly period: string
  readonly features: readonly string[]
  readonly cta: string
  readonly to: string
  readonly feature: boolean
}

function plans(t: T): readonly Plan[] {
  return [
    {
      name: t('Starter'), price: t('Free'), period: '', feature: false,
      features: [
        t('1 branch location'), t('Up to 5 users'), t('Basic job card management'),
        t('Customer database'), t('Standard invoicing'), t('Email support'),
      ],
      cta: t('Get Started'), to: '/register',
    },
    {
      name: t('Professional'), price: 'SAR 499', period: t('/mo'), feature: true,
      features: [
        t('Up to 3 branches'), t('Up to 25 users'), t('Full ERP modules'),
        t('Inventory management'), t('Financial reporting'), t('CRM and marketing tools'),
        t('API access'), t('Priority support'),
      ],
      cta: t('Request Demo'), to: '/public-portal/request-demo',
    },
    {
      name: t('Enterprise'), price: t('Contact Sales'), period: '', feature: false,
      features: [
        t('Unlimited branches'), t('Unlimited users'), t('Dedicated account manager'),
        t('Custom integrations'), t('Advanced analytics'), t('SLA guarantees'),
        t('On-site training'), t('White-label options'),
      ],
      cta: t('Contact Sales'), to: '/public-portal/request-demo',
    },
  ]
}

function faqs(t: T): readonly { q: string; a: string }[] {
  return [
    { q: t('How long does it take to get started?'), a: t('Most workshops run their first job card within a day. Onboarding imports your customers, vehicles and parts, and sets up your roles.') },
    { q: t('Do I need to install anything?'), a: t('No. SALIS AUTO runs in the browser on desktop and phone. There is nothing to install and nothing to update.') },
    { q: t('Is my data isolated from other workshops?'), a: t('Yes. Each workshop is isolated at the database level, access is by role, and every change records who made it and when.') },
    { q: t('Is the e-invoicing really ZATCA Phase 2?'), a: t('Yes. Every issued invoice carries the TLV QR, the hash chain to its predecessor, the UBL 2.1 XML and the seller and buyer VAT numbers, and is immutable after issue. Reporting to the Fatoora platform is configured for each workshop at deployment.') },
    { q: t('Can I try it before I commit?'), a: t('Book a 20-minute demo on your own workshop’s numbers. Plans start at one branch and five users on Starter, free.') },
  ]
}

export function AccessPage({ t }: { t: T }) {
  const planList = plans(t)

  return (
    <>
      <section className="masthead" aria-labelledby="access-hero-h">
        <div className="masthead-grid">
          <div>
            <span className="tag rise">{t('Chapter 03 — What it costs')}</span>
            <h1 id="access-hero-h" className="rise">{t('Access')}</h1>
            <p className="lede rise">
              {t('Three real plans, the ones on the real pricing page. Start free on Starter, scale to Professional, or talk to us about Enterprise.')}
            </p>
            <div className="hero-actions rise" style={{ marginTop: 28 }}>
              <Link className="btn" to="/public-portal/pricing">
                <i aria-hidden="true">◈</i> {t('See the full pricing page')}
              </Link>
              <Link className="btn ghost" to="/public-portal/book-demo">
                {t('Book a 20-minute demo')}
              </Link>
            </div>
          </div>
          <div className="rise">
            <div className="stats two">
              <div>
                <div className="k">{t('Plans')}</div>
                <div className="v" dir="ltr">3</div>
              </div>
              <div>
                <div className="k">{t('Starts at')}</div>
                <div className="v">{t('Free')}</div>
              </div>
              <div>
                <div className="k">{t('Contract')}</div>
                <div className="v">{t('No lock-in')}</div>
              </div>
              <div>
                <div className="k">{t('Setup')}</div>
                <div className="v" dir="ltr">
                  1<em>{t('day')}</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="access-plans-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — Pick a plan')}</span>
          <h2 id="access-plans-h">{t('Three plans')}</h2>
          <p>{t('Flexible plans that grow with your workshop — start free, scale when ready.')}</p>
        </div>
        <div className="strata">
          {planList.map((plan) => (
            <article className={plan.feature ? 'panel stratum rise feature' : 'panel stratum rise'} key={plan.name}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <div className="name">{plan.name}</div>
              <div className="price" dir="ltr">
                {plan.price}
                {plan.period ? <span style={{ fontSize: 14, color: 'var(--dim)' }}> {plan.period}</span> : null}
              </div>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link className={plan.feature ? 'btn' : 'btn ghost'} to={plan.to}>
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="access-matrix-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — Side by side')}</span>
          <h2 id="access-matrix-h">{t('What each plan includes')}</h2>
          <p>{t('Only what the plans themselves state — nothing added for effect.')}</p>
        </div>
        <div className="matrix-wrap rise">
          <table className="matrix">
            <thead>
              <tr>
                <th>{t('Capability')}</th>
                <th>{t('Starter')}</th>
                <th>{t('Professional')}</th>
                <th>{t('Enterprise')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>{t('Branches')}</th>
                <td>{t('1 branch location')}</td>
                <td>{t('Up to 3 branches')}</td>
                <td>{t('Unlimited branches')}</td>
              </tr>
              <tr>
                <th>{t('Users')}</th>
                <td>{t('Up to 5 users')}</td>
                <td>{t('Up to 25 users')}</td>
                <td>{t('Unlimited users')}</td>
              </tr>
              <tr>
                <th>{t('Modules')}</th>
                <td>{t('Basic job card management')}</td>
                <td>{t('Full ERP modules')}</td>
                <td>{t('Full ERP modules')}</td>
              </tr>
              <tr>
                <th>{t('Support')}</th>
                <td>{t('Email support')}</td>
                <td>{t('Priority support')}</td>
                <td>{t('Dedicated account manager')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="access-included-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — On every plan')}</span>
          <h2 id="access-included-h">{t('What never changes')}</h2>
          <p>{t('Three things that are not a tier — they are the product.')}</p>
        </div>
        <div className="cards rise">
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('ZATCA Phase 2, built in')}</h3>
            <p>{t('E-invoicing compliance is not an add-on tier — every invoice on every plan carries the same QR and hash chain.')}</p>
          </article>
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('Arabic and English, right to left')}</h3>
            <p>{t('Both languages are first-class on every plan, from Starter to Enterprise.')}</p>
          </article>
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('One audit trail')}</h3>
            <p>{t('Every change is recorded — who, when, from what, to what — regardless of which plan wrote it.')}</p>
          </article>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="access-faq-h">
        <div className="sec-head rise">
          <span className="tag">{t('04 — Asked before every demo')}</span>
          <h2 id="access-faq-h">{t('Questions')}</h2>
        </div>
        <div className="qa rise">
          {faqs(t).map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <div className="a">{f.a}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
