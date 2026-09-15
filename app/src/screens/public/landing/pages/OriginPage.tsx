import { Link } from 'react-router-dom'
import type { T } from '../types'

/** Origin — real company facts only: the mission statement and headline
 *  numbers from `About.tsx`, the real culture cards and the real open
 *  positions from `Careers.tsx`, and two real posts from `Blog.tsx`. No
 *  founding story, no invented timeline and no fabricated vacancies — where
 *  the repo has no real content for a sub-section (a founding story), that
 *  sub-section is cut rather than invented. */

function stats(t: T): readonly { value: string; label: string }[] {
  return [
    { value: '500+', label: t('Workshops') },
    { value: '50K+', label: t('Vehicles Serviced') },
    { value: '13', label: t('Cities') },
  ]
}

function principles(t: T): readonly { title: string; body: string }[] {
  return [
    { title: t('Innovation'), body: t('Work on cutting-edge automotive technology shaping the Saudi market.') },
    { title: t('Growth'), body: t('Clear career paths with mentorship, learning budgets and internal mobility.') },
    { title: t('Impact'), body: t('Your work directly improves how thousands of workshops operate every day.') },
    { title: t('Culture'), body: t('A collaborative, diverse team that values transparency and ownership.') },
  ]
}

function positions(t: T): readonly { title: string; location: string; type: string; body: string }[] {
  return [
    { title: t('Senior Full-Stack Engineer'), location: t('Riyadh'), type: t('Full-time'), body: t('Build and scale core ERP modules powering automotive workshops across KSA.') },
    { title: t('Product Designer'), location: t('Remote'), type: t('Full-time'), body: t('Design intuitive interfaces for complex workshop management workflows.') },
    { title: t('DevOps Engineer'), location: t('Riyadh'), type: t('Full-time'), body: t('Manage cloud infrastructure, CI/CD pipelines and platform reliability.') },
    { title: t('Sales Manager'), location: t('Jeddah'), type: t('Full-time'), body: t('Drive enterprise adoption and build lasting client relationships in the Western Region.') },
  ]
}

function dispatches(t: T): readonly { title: string; body: string; category: string }[] {
  return [
    { title: t('Understanding ZATCA E-Invoicing'), category: t('Business'), body: t('Everything workshops need to know about electronic invoicing compliance.') },
    { title: t('How AI is Transforming Auto Repair'), category: t('Technology'), body: t('From diagnostics to scheduling, AI is changing how workshops operate.') },
  ]
}

export function OriginPage({ t }: { t: T }) {
  return (
    <>
      <section className="masthead" aria-labelledby="origin-hero-h">
        <div className="masthead-grid">
          <div>
            <span className="tag rise">{t('Chapter 04 — Who builds this')}</span>
            <h1 id="origin-hero-h" className="rise">{t('Origin')}</h1>
            <p className="lede rise">
              {t('SALIS AUTO is Saudi Arabia’s leading automotive workshop management platform. We empower garages of all sizes with digital tools to streamline operations, delight customers, and grow revenue.')}
            </p>
          </div>
          <div className="rise">
            <div className="stats three">
              {stats(t).map((s) => (
                <div key={s.label}>
                  <div className="k">{s.label}</div>
                  <div className="v" dir="ltr">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="origin-mission-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — Our mission')}</span>
          <h2 id="origin-mission-h">{t('Our Mission')}</h2>
        </div>
        <div className="pull rise">
          <q>{t('To digitize every automotive workshop in Saudi Arabia, enabling world-class service delivery through technology, data, and AI — aligned with Vision 2030.')}</q>
          <div className="who">
            SALIS AUTO
            <span>{t('The mission statement, stated plainly')}</span>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="origin-principles-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — Why SALIS AUTO')}</span>
          <h2 id="origin-principles-h">{t('What we hold')}</h2>
        </div>
        <div className="cards">
          {principles(t).map((p) => (
            <article className="panel card rise" key={p.title}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="origin-dispatches-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — From the blog')}</span>
          <h2 id="origin-dispatches-h">{t('Written down')}</h2>
        </div>
        <div>
          {dispatches(t).map((d) => (
            <article className="dispatch rise" key={d.title}>
              <div className="meta">{d.category}</div>
              <div>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </div>
            </article>
          ))}
        </div>
        <p style={{ marginTop: 20 }}>
          <Link className="btn ghost" to="/public-portal/blog">
            {t('Read the blog')} →
          </Link>
        </p>
      </section>

      <div className="rule" />

      <section aria-labelledby="origin-roles-h">
        <div className="sec-head rise">
          <span className="tag">{t('04 — Who we need')}</span>
          <h2 id="origin-roles-h">{t('Open Positions')}</h2>
        </div>
        <div className="roles">
          {positions(t).map((p) => (
            <div className="role rise" key={p.title}>
              <div>
                <h4>{p.title}</h4>
                <p>{p.body}</p>
              </div>
              <div className="where">
                {p.location} · {p.type}
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 20 }}>
          <Link className="btn ghost" to="/public-portal/careers">
            {t('See all open roles')} →
          </Link>
        </p>
      </section>
    </>
  )
}
