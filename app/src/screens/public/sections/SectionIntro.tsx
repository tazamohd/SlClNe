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
}

export function SectionIntro({ title, subtitle, centered = false, as = 'h1' }: SectionIntroProps) {
  const t = useT()
  const Heading = as as 'h1' | 'h2'
  return (
    <div className={cn(centered && 'text-center')}>
      <Heading className="mb-2 mt-0 font-display text-3xl font-black text-heading md:text-[40px]">
        {t(title)}
      </Heading>
      <p className="mb-8 mt-0 text-base text-muted md:mb-10">{t(subtitle)}</p>
    </div>
  )
}
