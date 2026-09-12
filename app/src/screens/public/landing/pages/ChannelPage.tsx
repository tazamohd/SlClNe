import { Link } from 'react-router-dom'
import type { T } from '../types'

/** Channel — the real ways to get in touch, styled in the same dark HUD as
 *  the rest of this page. The "what happens next" steps are the real
 *  onboarding path from the landing page's own FAQ, not an invented
 *  handshake ritual, and the coordinates table lists the real address,
 *  phone and email `Contact.tsx` already publishes. */

function nextSteps(t: T): readonly { n: string; title: string; body: string }[] {
  return [
    { n: 'C/01', title: t('Book a 20-minute demo'), body: t('On your own workshop’s numbers — bays, job mix, parts — not a demo tenant with somebody else’s vehicles.') },
    { n: 'C/02', title: t('Onboarding imports your data'), body: t('Your customers, vehicles and parts are imported, and your roles are set up.') },
    { n: 'C/03', title: t('Your first job card, within a day'), body: t('Most workshops run their first real job card within a day of starting.') },
    { n: 'C/04', title: t('You decide, at your own pace'), body: t('Starter is free to begin with — nothing here needs to be decided in the room.') },
  ]
}

export function ChannelPage({ t }: { t: T }) {
  return (
    <>
      <section className="masthead" aria-labelledby="channel-hero-h">
        <div className="masthead-grid">
          <div>
            <span className="tag rise">{t('Chapter 05 — Say something')}</span>
            <h1 id="channel-hero-h" className="rise">
              <span className="thin">{t('Open a')}</span> {t('Channel')}
            </h1>
            <p className="lede rise">{t('Two real ways to reach us — a demo on your own numbers, or a question first.')}</p>
          </div>
          <div className="rise">
            <div className="stats two">
              <div>
                <div className="k">{t('Demo answered within')}</div>
                <div className="v" dir="ltr">
                  1<em>{t('working day')}</em>
                </div>
              </div>
              <div>
                <div className="k">{t('Support hours')}</div>
                <div className="v">{t('Business hours')}</div>
              </div>
              <div>
                <div className="k">{t('Home')}</div>
                <div className="v" dir="ltr">RUH</div>
              </div>
              <div>
                <div className="k">{t('Cost to ask')}</div>
                <div className="v" dir="ltr">0<em>SAR</em></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="channel-open-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — Get in touch')}</span>
          <h2 id="channel-open-h">{t('Two real channels')}</h2>
        </div>
        <div className="cards wide rise">
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('Book a 20-minute demo')}</h3>
            <p>{t('On your own workshop’s numbers, in Arabic or English.')}</p>
            <p style={{ marginTop: 16 }}>
              <Link className="btn" to="/public-portal/book-demo">
                <i aria-hidden="true">◈</i> {t('Book a demo')}
              </Link>
            </p>
          </article>
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('Ask a question first')}</h3>
            <p>{t('Not ready for a demo yet? Send a question and we will answer it directly.')}</p>
            <p style={{ marginTop: 16 }}>
              <Link className="btn ghost" to="/public-portal/contact">
                {t('Contact SALIS AUTO')}
              </Link>
            </p>
          </article>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="channel-next-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — After you book')}</span>
          <h2 id="channel-next-h">{t('What happens next')}</h2>
        </div>
        <div className="steps rise">
          {nextSteps(t).map((step) => (
            <div key={step.n}>
              <div className="n" dir="ltr">{step.n}</div>
              <h4>{step.title}</h4>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="channel-coords-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — Fixed points')}</span>
          <h2 id="channel-coords-h">{t('Coordinates')}</h2>
        </div>
        <div className="matrix-wrap rise">
          <table className="matrix">
            <thead>
              <tr>
                <th>{t('Channel')}</th>
                <th>{t('Address')}</th>
                <th>{t('Answers within')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>{t('Contact page')}</th>
                <td style={{ textAlign: 'start' }}>
                  <Link className="coords-real" to="/public-portal/contact">
                    /public-portal/contact
                  </Link>
                </td>
                <td>{t('Business hours')}</td>
              </tr>
              <tr>
                <th>{t('Book a demo')}</th>
                <td style={{ textAlign: 'start' }}>
                  <Link className="coords-real" to="/public-portal/book-demo">
                    /public-portal/book-demo
                  </Link>
                </td>
                <td>{t('One working day')}</td>
              </tr>
              <tr>
                <th>{t('Phone')}</th>
                <td dir="ltr" style={{ textAlign: 'start' }}>
                  <a className="coords-real" href="tel:+966112345678">
                    +966 11 234 5678
                  </a>
                </td>
                <td>{t('Business hours')}</td>
              </tr>
              <tr>
                <th>{t('Email')}</th>
                <td dir="ltr" style={{ textAlign: 'start' }}>
                  <a className="coords-real" href="mailto:info@salisauto.sa">
                    info@salisauto.sa
                  </a>
                </td>
                <td>{t('One working day')}</td>
              </tr>
              <tr>
                <th>{t('Head office')}</th>
                <td style={{ textAlign: 'start' }}>{t('Al-Olaya District, Riyadh, KSA')}</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
