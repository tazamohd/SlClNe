import { useT } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'

/** Page title + subtitle, the opening block every PublicPortal page shares.
 *
 *  Services/Marketplace/Blog/FAQ/Support centre it; About/Insurance/Loans/
 *  Contact keep it start-aligned — hence the `centered` switch. Always exactly
 *  one `<h1>` per page, which is why this owns the tag. */
export interface SectionIntroProps {
  title: string
  subtitle: string
  centered?: boolean
}

export function SectionIntro({ title, subtitle, centered = false }: SectionIntroProps) {
  const t = useT()
  return (
    <div className={cn(centered && 'text-center')}>
      <h1 className="mb-2 mt-0 font-display text-3xl font-black text-heading md:text-[40px]">
        {t(title)}
      </h1>
      <p className="mb-8 mt-0 text-base text-muted md:mb-10">{t(subtitle)}</p>
    </div>
  )
}
