import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.GettingStarted — Tier B content page.
 *
 *  How an onboarding actually runs, from the first call to the decision —
 *  the part `Contact.tsx` and `BookDemo.tsx` don't cover because they are
 *  the entry points themselves, not the walkthrough of what comes after. A
 *  light-first rewrite of the "SALIS AUTO 2030" design study's `channel`
 *  page (see `PlatformArchitecture.tsx`'s docstring for why this content is
 *  being cascaded now).
 *
 *  Two things dropped from the study's own page, both already resolved by
 *  its own text or by this site's other pages: its local-only "handshake"
 *  form (the study's own docstring called it "a dead end inside the real
 *  application" and replaced it with the two real channels this page also
 *  links to), and its per-support-tier response-time table — no page
 *  anywhere else in this codebase publishes a specific response-time
 *  commitment (`Contact.tsx`/`Support.tsx` make none), so this page doesn't
 *  originate one either. */
const STEPS = [
  { n: '01', titleKey: 'A call, in your language', bodyKey: 'Time on how your floor runs now: who opens the card, who prices it, where the estimate waits, and what month-end actually costs you in hours.' },
  { n: '02', titleKey: 'Your tenant, your data', bodyKey: 'A branch is set up with your services, your labour rates and a sample of your own customers and vehicles — not a demo tenant full of somebody else’s cars.' },
  { n: '03', titleKey: 'One branch, in parallel', bodyKey: 'A pilot on one floor, running beside what you use today, until a full week of job cards has gone from check-in to a cleared invoice without anyone re-typing anything.' },
  { n: '04', titleKey: 'You decide, slowly', bodyKey: 'Nothing starts until you say so, and nothing is locked in afterwards.' },
] as const

const COORDS: readonly { channel: string; where: string; to?: string; href?: string; language: string }[] = [
  { channel: 'Book a demo', where: '/public-portal/book-demo', to: '/public-portal/book-demo', language: 'AR / EN' },
  { channel: 'Contact page', where: '/public-portal/contact', to: '/public-portal/contact', language: 'AR / EN' },
  { channel: 'Help centre', where: '/public-portal/support', to: '/public-portal/support', language: 'AR / EN' },
]

export function PublicGettingStarted() {
  const t = useT()
  usePageMeta({
    title: t('Getting Started — SALIS AUTO'),
    description: t(
      'How a SALIS AUTO onboarding actually runs, from the first call to a pilot branch running in parallel — with a person at the end of it.'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        eyebrow={t('Say something')}
        title={t('Getting Started')}
        subtitle={t('Tell us how your floor runs and we will show you the six stages mapped onto it, with your own job mix rather than a demo tenant full of somebody else’s vehicles.')}
      />

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('The handshake')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">{t('Two ways to start, and a person at the end of both of them.')}</p>
      <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <article className="rounded-2xl border border-default bg-card p-6">
          <h3 className="mb-1.5 mt-0 text-base font-bold text-heading">{t('Book a demo')}</h3>
          <p className="mb-4 mt-0 text-sm leading-normal text-muted">
            {t('On your own workshop’s numbers — bays, job mix, parts — in Arabic or English, with the six stages mapped onto how your floor actually runs.')}
          </p>
          <Link to="/public-portal/book-demo" className="inline-flex rounded-lg bg-salis-gradient px-4 py-2 text-sm font-semibold text-white no-underline">
            {t('Book a demo')}
          </Link>
        </article>
        <article className="rounded-2xl border border-default bg-card p-6">
          <h3 className="mb-1.5 mt-0 text-base font-bold text-heading">{t('Ask a question first')}</h3>
          <p className="mb-4 mt-0 text-sm leading-normal text-muted">
            {t('Not ready for a demo yet? Send the question — about ZATCA, about migrating off what you run now, about anything on this site — and a person answers it.')}
          </p>
          <Link to="/public-portal/contact" className="inline-flex rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-heading no-underline hover:bg-card">
            {t('Contact SALIS AUTO')}
          </Link>
        </article>
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('What happens next')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">{t('How an onboarding actually runs, from the first call to the decision.')}</p>
      <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.n} className="rounded-2xl border border-default bg-card p-5">
            <div dir="ltr" className="mb-1.5 font-mono text-xs font-semibold text-salis-blue">{step.n}</div>
            <h3 className="mb-1.5 mt-0 text-sm font-bold text-heading">{t(step.titleKey)}</h3>
            <p className="m-0 text-[13px] leading-normal text-muted">{t(step.bodyKey)}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Coordinates')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">{t('Where to find a human.')}</p>
      <nav aria-label={t('Getting-started channels')} className="mb-12 overflow-x-auto rounded-2xl border border-default">
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-default bg-sidebar">
              <th className="p-3 text-start font-semibold text-heading">{t('Channel')}</th>
              <th className="p-3 text-start font-semibold text-heading">{t('Where')}</th>
              <th className="p-3 text-start font-semibold text-heading">{t('Language')}</th>
            </tr>
          </thead>
          <tbody>
            {COORDS.map((row) => (
              <tr key={row.channel} className="border-b border-default last:border-0">
                <td className="p-3 font-medium text-heading">{t(row.channel)}</td>
                <td className="p-3">
                  <Link to={row.to ?? row.href ?? '/public-portal/contact'} dir="ltr" className="text-salis-blue no-underline hover:underline">
                    {row.where}
                  </Link>
                </td>
                <td dir="ltr" className="p-3 text-muted">{row.language}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </nav>
    </div>
  )
}
