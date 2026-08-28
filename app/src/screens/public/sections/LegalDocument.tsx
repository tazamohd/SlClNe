import { useT } from '@/providers/PreferencesProvider'

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
 *  heading hierarchy the public-pages test enforces never skips a level. */
export interface LegalClause {
  heading: string
  /** Each string is one paragraph under the clause heading. */
  paragraphs: readonly string[]
}

export interface LegalDocumentProps {
  title: string
  /** Human-readable effective date, e.g. "16 August 2026". */
  updated: string
  /** The lede paragraph under the title, before the first clause. */
  intro: string
  clauses: readonly LegalClause[]
}

export function LegalDocument({ title, updated, intro, clauses }: LegalDocumentProps) {
  const t = useT()
  return (
    <div className="mx-auto max-w-[800px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <h1 className="mb-2 mt-0 font-display text-3xl font-black text-heading md:text-[40px]">
        {t(title)}
      </h1>
      <p className="mb-6 mt-0 text-[13px] text-muted">
        {t('Last updated')}: <span dir="ltr">{updated}</span>
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
          <section key={clause.heading}>
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
    </div>
  )
}
