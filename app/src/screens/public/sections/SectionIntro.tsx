import { useT } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'

/** Page title + subtitle, the opening block every PublicPortal page shares.
 *
 *  Services/Marketplace/Blog/FAQ/Support centre it; About/Insurance/Loans/
 *  Contact keep it start-aligned — hence the `centered` switch. On a page whose
 *  own hero is already an `<h1>` (the Landing page), call with `as="h2"` so
 *  the section intro is a sub-heading. Otherwise it is the page's `<h1>`. */
export interface SectionIntroProps {
  title: string
  subtitle: string
  centered?: boolean
  as?: 'h1' | 'h2'
  /** A small mono, uppercase, letter-spaced label above the heading — the
   *  "signal tag" read borrowed from the SALIS AUTO 2060 design study's
   *  section headers (`.tag`). Optional: most pages don't carry one. It is
   *  not a heading, so it never affects the page's heading hierarchy. */
  eyebrow?: string
}

export function SectionIntro({
  title,
  subtitle,
  centered = false,
  as = 'h1',
  eyebrow,
}: SectionIntroProps) {
  const t = useT()
  const Heading = as as 'h1' | 'h2'
  return (
    <div className={cn(centered && 'text-center')}>
      {eyebrow ? (
        <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[.28em] text-salis-blue">
          {t(eyebrow)}
        </p>
      ) : null}
      <Heading className="mb-2 mt-0 font-display text-3xl font-black text-heading md:text-[40px]">
        {t(title)}
      </Heading>
      <p className="mb-8 mt-0 text-base text-muted md:mb-10">{t(subtitle)}</p>
    </div>
  )
}
