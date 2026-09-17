import { Link } from 'react-router-dom'
import type { T } from '../types'

/** The homepage hero — outcome-first, built from facts already used
 *  elsewhere in the approved copy (the six-stage job card, the ZATCA
 *  Phase 2 pipeline, Arabic-first bilingual support), not new claims.
 *  Replaces the "2030" tour's sci-fi HUD hero: a `<HeroStage>`-shaped slot
 *  (see the doc comment below) instead of a canvas/WebGL scene, static now,
 *  the same shape a commissioned scene could fill later. */
export function Hero({ t }: { t: T }) {
  return (
    <section className="salis-home-hero" aria-labelledby="home-hero-h">
      <div className="salis-home-hero-inner">
        <div>
          <p className="salis-home-hero-eyebrow rise">{t('SALIS AUTO · Workshop management, Saudi standard')}</p>
          <h1 id="home-hero-h" className="rise">
            {t('One number, entered once,')} <em>{t('carried everywhere.')}</em>
          </h1>
          <p className="salis-home-hero-lede rise">
            {t('SALIS AUTO runs the workshop from check-in to a ZATCA Phase 2-cleared invoice — one job card, one audit trail, in Arabic and English on the same day. Thirteen domains, fourteen roles, one tenancy.')}
          </p>
          <div className="salis-home-hero-actions rise">
            <Link
              to="/public-portal/request-demo"
              className="inline-flex h-11 items-center rounded-lg bg-salis-gradient px-6 text-sm font-semibold text-white no-underline hover:no-underline"
            >
              {t('Request a Demo')}
            </Link>
            <a
              href="#home-proof"
              className="inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm font-semibold text-heading no-underline hover:no-underline"
            >
              {t('See how it works')}
            </a>
          </div>
        </div>
        <HeroStage t={t} />
      </div>
    </section>
  )
}

/** The one signature visual moment Phase 1 builds as static SVG: the
 *  six-stage job card, drawn as a connected flow that line-draws in on
 *  scroll (see `.salis-home-flow-path` in `homepage.css`). Named and shaped
 *  so a commissioned WebGL scene can later replace only this component's
 *  insides — see the Future-Investment Spec in the plan — without touching
 *  `Hero`'s layout. */
function HeroStage({ t }: { t: T }) {
  const stages = [
    t('Check-in'),
    t('Inspection'),
    t('Estimate'),
    t('Repair'),
    t('Quality check'),
    t('Delivery'),
  ]
  return (
    <div className="salis-home-mockup rise" aria-hidden="true">
      <div className="salis-home-mockup-bar">
        <i />
        <i />
        <i />
        <span>{t('JOB CARD · SIX STAGES')}</span>
      </div>
      <div className="salis-home-mockup-body">
        <svg viewBox="0 0 360 200" role="img" aria-label={t('The six-stage job card, check-in through delivery')}>
          <path
            className="salis-home-flow-path"
            d="M20 100 C 80 40, 100 160, 160 100 S 260 40, 300 100"
            fill="none"
            stroke="var(--salis-blue-bright)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {[
            { x: 20, y: 100 },
            { x: 76, y: 62 },
            { x: 132, y: 132 },
            { x: 188, y: 100 },
            { x: 244, y: 68 },
            { x: 300, y: 100 },
          ].map((p, i) => (
            <circle key={p.x} cx={p.x} cy={p.y} r="5" fill={i === 5 ? 'var(--salis-orange)' : 'var(--salis-blue)'} />
          ))}
        </svg>
        <ol className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1.5 p-0 text-[11px] text-muted">
          {stages.map((stage, i) => (
            <li key={stage} className="list-none">
              <span dir="ltr" className="font-mono text-[10px] text-faint">
                {String(i + 1).padStart(2, '0')}
              </span>{' '}
              {stage}
            </li>
          ))}
        </ol>
      </div>
      <p className="salis-home-mockup-caption">{t('Illustrative — the shape of the flow, not a live board')}</p>
    </div>
  )
}
