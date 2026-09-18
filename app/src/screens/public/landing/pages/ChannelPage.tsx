import { Link } from 'react-router-dom'
import type { T } from '../types'

/** Channel — the "SALIS AUTO 2030" artifact's `channel` page: the handshake,
 *  what happens next, and the coordinates table.
 *
 *  One deliberate departure, and it is the whole point of the section. The
 *  artifact's handshake is a local form that reads your text back and throws
 *  it away — honest inside a standalone design document with no network, and a
 *  dead end inside the real application, where a visitor who fills in a
 *  contact form expects somebody to read it. So the form is dropped and the
 *  section keeps its shape with the two real channels the product already
 *  publishes: book a demo, or ask a question. The artifact's "carrier signal"
 *  canvas and its `0 bytes` stat go with it, since both existed only to say
 *  "this form sends nothing".
 *
 *  Everything else — the lede, the four steps, the coordinates and their
 *  response times — is the artifact's, with the first two coordinate rows
 *  wired to the routes that really exist. */

function nextSteps(t: T): readonly { n: string; title: string; body: string }[] {
  return [
    {
      n: 'C/01',
      title: t('A call, in your language'),
      body: t('Thirty minutes on how your floor runs now: who opens the card, who prices it, where the estimate waits, and what the month-end actually costs you in hours.'),
    },
    {
      n: 'C/02',
      title: t('Your tenant, your data'),
      body: t('A branch is set up with your services, your labour rates and a sample of your own customers and vehicles — not a demo tenant full of somebody else’s cars.'),
    },
    {
      n: 'C/03',
      title: t('One branch, in parallel'),
      body: t('A pilot on one floor, running beside what you use today, until a full week of job cards has gone from check-in to a cleared invoice without anyone re-typing anything.'),
    },
    {
      n: 'C/04',
      title: t('You decide, slowly'),
      body: t('Nothing starts until you say so, and nothing is locked in afterwards — the export takes everything, at any time, whether or not the last invoice is paid.'),
    },
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
            <p className="lede rise">
              {t('Tell us how your floor runs and we will show you the six stages mapped onto it, with your own job mix rather than a demo tenant full of somebody else’s vehicles.')}{' '}
              <b>{t('Thirty minutes, in Arabic or English.')}</b>
            </p>
          </div>
          <div className="rise">
            <div className="stats two">
              <div>
                <div className="k">{t('Demo length')}</div>
                <div className="v" dir="ltr">
                  30<em>{t('min')}</em>
                </div>
              </div>
              <div>
                <div className="k">{t('Languages')}</div>
                <div className="v" dir="ltr">
                  AR<em>/EN</em>
                </div>
              </div>
              <div>
                <div className="k">{t('Based in')}</div>
                <div className="v" dir="ltr">RUH</div>
              </div>
              <div>
                <div className="k">{t('Cost to ask')}</div>
                <div className="v" dir="ltr">
                  0<em>SAR</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="channel-open" aria-labelledby="channel-open-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — The handshake')}</span>
          <h2 id="channel-open-h">{t('Handshake')}</h2>
          <p>{t('Two ways to start, and a person at the end of both of them.')}</p>
        </div>
        <div className="cards wide rise">
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <div className="idx">
              <span dir="ltr">01 / 02</span>
              <b>{t('DEMO')}</b>
            </div>
            <h3>{t('Book a demo')}</h3>
            <p>
              {t('Thirty minutes on your own workshop’s numbers — bays, job mix, parts — in Arabic or English, with the six stages mapped onto how your floor actually runs.')}
            </p>
            <p style={{ marginTop: 16 }}>
              <Link className="btn" to="/public-portal/book-demo">
                <i aria-hidden="true">◈</i> {t('Book a demo')}
              </Link>
            </p>
          </article>
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <div className="idx">
              <span dir="ltr">02 / 02</span>
              <b>{t('QUESTION')}</b>
            </div>
            <h3>{t('Ask a question first')}</h3>
            <p>
              {t('Not ready for a demo yet? Send the question — about ZATCA, about migrating off what you run now, about anything on these six pages — and a person answers it.')}
            </p>
            <p style={{ marginTop: 16 }}>
              <Link className="btn ghost" to="/public-portal/contact">
                {t('Contact SALIS AUTO')}
              </Link>
            </p>
          </article>
        </div>
      </section>

      <div className="rule" />

      <section id="channel-next" aria-labelledby="channel-next-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — After the handshake')}</span>
          <h2 id="channel-next-h">{t('What happens next')}</h2>
          <p>{t('How an onboarding actually runs, from the first call to the decision.')}</p>
        </div>
        <div className="steps rise">
          {nextSteps(t).map((step) => (
            <div key={step.n}>
              <div className="n" dir="ltr">
                {step.n}
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="channel-coords" aria-labelledby="channel-coords-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — Fixed points')}</span>
          <h2 id="channel-coords-h">{t('Coordinates')}</h2>
          <p>{t('Where to find a human, and how long each one takes to answer.')}</p>
        </div>
        <div className="matrix-wrap rise">
          <table className="matrix">
            <thead>
              <tr>
                <th>{t('Channel')}</th>
                <th>{t('Where')}</th>
                <th>{t('Answers within')}</th>
                <th>{t('Language')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>{t('Contact page')}</th>
                <td style={{ textAlign: 'start' }}>
                  <Link className="coords-real" dir="ltr" to="/public-portal/contact">
                    /public-portal/contact
                  </Link>
                </td>
                <td>{t('Business hours')}</td>
                <td dir="ltr">AR / EN</td>
              </tr>
              <tr>
                <th>{t('Book a demo')}</th>
                <td style={{ textAlign: 'start' }}>
                  <Link className="coords-real" dir="ltr" to="/public-portal/book-demo">
                    /public-portal/book-demo
                  </Link>
                </td>
                <td>{t('One working day')}</td>
                <td dir="ltr">AR / EN</td>
              </tr>
              <tr>
                <th>{t('Support · Starter')}</th>
                <td style={{ textAlign: 'start' }}>{t('Email')}</td>
                <td>{t('24 hours')}</td>
                <td dir="ltr">AR / EN</td>
              </tr>
              <tr>
                <th>{t('Support · Professional')}</th>
                <td style={{ textAlign: 'start' }}>{t('Email and phone')}</td>
                <td>{t('4 hours')}</td>
                <td dir="ltr">AR / EN</td>
              </tr>
              <tr>
                <th>{t('Support · Enterprise')}</th>
                <td style={{ textAlign: 'start' }}>{t('Named contact')}</td>
                <td className="em">{t('1 hour')}</td>
                <td dir="ltr">AR / EN</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
