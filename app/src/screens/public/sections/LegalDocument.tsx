import { useT } from '@/providers/PreferencesProvider'
import { useDateFormat } from '@/lib/formatDate'

/** The shared layout for the Tier C legal pages — Privacy Policy and Terms.
 *
 *  These are **design-system pages**: no `PublicPortal.*.dc.html` exists for
 *  them, so they are composed from the approved public section system, not
 *  presented as design-authoritative (§A25 provenance). Each carries a plain
 *  legal-scaffold body and an explicit banner saying it is a template that has
 *  not been reviewed by counsel — honest about what it is, not passed off as
 *  binding legal text.
 *
 *  One `<h1>` (the document title) owned here; every clause is an `<h2>`, so the
 *  heading hierarchy the public-pages test enforces never skips a level. From
 *  `lg` a sticky table of contents sits at the inline start and links to each
 *  clause; the "Last updated" date is formatted for the reader's language. */
export interface LegalClause {
  heading: string
  /** Each string is one paragraph under the clause heading. */
  paragraphs: readonly string[]
}

export interface LegalDocumentProps {
  title: string
  /** Effective date as an ISO string, e.g. "2026-08-16". */
  updated: string
  /** The lede paragraph under the title, before the first clause. */
  intro: string
  clauses: readonly LegalClause[]
}

function clauseId(index: number): string {
  return `clause-${index + 1}`
}

export function LegalDocument({ title, updated, intro, clauses }: LegalDocumentProps) {
  const t = useT()
  const { date } = useDateFormat()
  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:items-start">
        <nav
          aria-label={t('On this page')}
          className="hidden lg:sticky lg:top-24 lg:block"
        >
          <p className="mb-3 mt-0 font-action text-xs font-semibold uppercase tracking-[.06em] text-muted">
            {t('On this page')}
          </p>
          <ol className="m-0 flex list-none flex-col gap-1 p-0">
            {clauses.map((clause, index) => (
              <li key={clause.heading}>
                <a
                  href={`#${clauseId(index)}`}
                  className="flex min-h-[36px] items-start gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug text-body no-underline transition-colors hover:bg-inset hover:text-salis-blue hover:no-underline"
                >
                  <span dir="ltr" className="font-mono text-[12px] tabular-nums text-muted">
                    {index + 1}.
                  </span>
                  {t(clause.heading)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 max-w-[800px]">
          <h1 className="mb-2 mt-0 font-display text-3xl font-black text-heading md:text-[40px]">
            {t(title)}
          </h1>
          <p className="mb-6 mt-0 text-[13px] text-muted">
            {t('Last updated')}:{' '}
            <time dateTime={updated}>{date(updated, 'medium')}</time>
          </p>

          {/* Not a heading, not styled as an error — an honest note about status.
              Blue (informational/active), never a warning hue. */}
          <p className="mb-8 mt-0 rounded-[14px] border border-salis-blue bg-salis-blue/[.06] p-4 text-[13px] leading-relaxed text-heading">
            {t(
              'This is a plain-language template provided for transparency while the platform is being built. It has not been reviewed by legal counsel and is not a substitute for professional legal advice.'
            )}
          </p>

          <p className="mb-8 mt-0 text-[15px] leading-[1.7] text-body">{t(intro)}</p>

          <div className="flex flex-col gap-7">
            {clauses.map((clause, index) => (
              <section key={clause.heading} id={clauseId(index)} className="scroll-mt-24">
                <h2 className="mb-2.5 mt-0 text-xl font-bold text-heading">
                  <span dir="ltr" className="text-muted">
                    {index + 1}.
                  </span>{' '}
                  {t(clause.heading)}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {clause.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="m-0 text-[15px] leading-[1.7] text-body">
                      {t(paragraph)}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
