import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.Blog — `project/PublicPortal.Blog.dc.html`.
 *
 *  Previously showed six fabricated posts ("5 Signs Your Brakes Need
 *  Attention", dated "Jul 20, 2026", "4 min read") presented as real
 *  published articles. There is no blog/article collection anywhere in
 *  Repository or API_REGISTRY.json to back a real post list, and the
 *  registry has no public article route to link to even if there were.
 *  Rather than invent posts, this is an honest state — no articles
 *  published yet — following DealsOffers.tsx's pattern for this site: say
 *  plainly what isn't here yet and route to a real channel (Contact) for
 *  anyone who wants updates. */
export function PublicBlog() {
  const t = useT()
  usePageMeta({
    title: t('Blog — SALIS AUTO'),
    description: t('Latest news and automotive insights'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro centered title="Blog" subtitle="Latest news and automotive insights" />
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-3 rounded-2xl border border-default bg-card p-8 text-center">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white">
          <Icon name="FileText" size={22} />
        </span>
        <h2 className="m-0 text-[15px] font-bold text-heading">{t('No posts published yet')}</h2>
        <p className="m-0 text-[13px] leading-normal text-muted">
          {t(
            "We haven't published any articles here yet. For product updates and workshop insights in the meantime, "
          )}
          <Link to="/public-portal/contact" className="text-salis-blue">
            {t('contact us')}
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
