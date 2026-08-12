import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { TINT_PILL, TINT_WASH, type Tint } from './sections/tints'

/** PublicPortal.Blog — `project/PublicPortal.Blog.dc.html`.
 *
 *  Three-column post grid: gradient header, category pill, title, excerpt,
 *  date and read time. The registry has no public article route, so the cards
 *  are articles, not links — the design's `cursor:pointer` pointed at pages
 *  that do not exist. Dates and read times are Latin runs, pinned LTR. */
interface Post {
  title: string
  excerpt: string
  category: string
  tint: Tint
  date: string
  readTime: string
}

const POSTS: readonly Post[] = [
  {
    title: '5 Signs Your Brakes Need Attention',
    excerpt: "Don't ignore these warning signs that could save your life on the road.",
    category: 'Safety',
    tint: 'orange',
    date: 'Jul 20, 2026',
    readTime: '4 min read',
  },
  {
    title: 'Summer Car Care Tips for Saudi Heat',
    excerpt: 'How to protect your vehicle during extreme temperatures.',
    category: 'Tips',
    tint: 'blue',
    date: 'Jul 15, 2026',
    readTime: '5 min read',
  },
  {
    title: 'Understanding ZATCA E-Invoicing',
    excerpt: 'Everything workshops need to know about electronic invoicing compliance.',
    category: 'Business',
    tint: 'bright',
    date: 'Jul 10, 2026',
    readTime: '6 min read',
  },
  {
    title: 'The Future of EV Servicing in KSA',
    excerpt: 'How electric vehicles are changing the workshop landscape.',
    category: 'Industry',
    tint: 'navy',
    date: 'Jul 5, 2026',
    readTime: '7 min read',
  },
  {
    title: 'How AI is Transforming Auto Repair',
    excerpt: 'From diagnostics to scheduling, AI is revolutionizing workshop operations.',
    category: 'Technology',
    tint: 'blue',
    date: 'Jun 28, 2026',
    readTime: '5 min read',
  },
  {
    title: 'Choosing the Right Oil for Your Car',
    excerpt: 'A guide to synthetic, semi-synthetic, and conventional oils.',
    category: 'Tips',
    tint: 'bright',
    date: 'Jun 20, 2026',
    readTime: '4 min read',
  },
]

export function PublicBlog() {
  const t = useT()
  usePageMeta({
    title: t('Blog — SALIS AUTO'),
    description: t('Latest news and automotive insights'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro centered title="Blog" subtitle="Latest news and automotive insights" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <article
            key={post.title}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div aria-hidden className="h-[160px]" style={{ background: TINT_WASH[post.tint] }} />
            <div className="p-4">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TINT_PILL[post.tint]}`}
              >
                {t(post.category)}
              </span>
              <h2 className="mb-1.5 mt-2 text-base font-bold text-heading">{t(post.title)}</h2>
              <p className="mb-2.5 mt-0 text-xs leading-normal text-muted">{t(post.excerpt)}</p>
              <span dir="ltr" className="text-[11px] text-faint">
                {post.date} · {t(post.readTime)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
