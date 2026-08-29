import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public marketing site — Blog. Standalone page (its own header/nav/footer,
 *  no AppShell) listing news and automotive-insight posts as a card grid,
 *  each tagged with a category pill. Content is static demo copy, ported
 *  1:1 from the design's `posts` fixture. */

interface Post {
  title: string
  excerpt: string
  category: string
  categoryColor: string
  categoryBg: string
  date: string
  readTime: string
  gradient: string
}

const POSTS: Post[] = [
  {
    title: '5 Signs Your Brakes Need Attention',
    excerpt: "Don't ignore these warning signs that could save your life on the road.",
    category: 'Safety',
    categoryColor: '#F97316',
    categoryBg: 'rgba(249,115,22,.1)',
    date: 'Jul 20, 2026',
    readTime: '4 min read',
    gradient: 'linear-gradient(135deg,rgba(249,115,22,.08),rgba(10,94,215,.06))',
  },
  {
    title: 'Summer Car Care Tips for Saudi Heat',
    excerpt: 'How to protect your vehicle during extreme temperatures.',
    category: 'Tips',
    categoryColor: '#0A5ED7',
    categoryBg: 'rgba(10,94,215,.1)',
    date: 'Jul 15, 2026',
    readTime: '5 min read',
    gradient: 'linear-gradient(135deg,rgba(10,94,215,.08),rgba(11,179,255,.06))',
  },
  {
    title: 'Understanding ZATCA E-Invoicing',
    excerpt: 'Everything workshops need to know about electronic invoicing compliance.',
    category: 'Business',
    categoryColor: '#0BB3FF',
    categoryBg: 'rgba(11,179,255,.1)',
    date: 'Jul 10, 2026',
    readTime: '6 min read',
    gradient: 'linear-gradient(135deg,rgba(11,179,255,.08),rgba(10,94,215,.06))',
  },
  {
    title: 'The Future of EV Servicing in KSA',
    excerpt: 'How electric vehicles are changing the workshop landscape.',
    category: 'Industry',
    categoryColor: '#0B1F3B',
    categoryBg: 'rgba(11,31,59,.1)',
    date: 'Jul 5, 2026',
    readTime: '7 min read',
    gradient: 'linear-gradient(135deg,rgba(11,31,59,.08),rgba(10,94,215,.04))',
  },
  {
    title: 'How AI is Transforming Auto Repair',
    excerpt: 'From diagnostics to scheduling, AI is revolutionizing workshop operations.',
    category: 'Technology',
    categoryColor: '#0A5ED7',
    categoryBg: 'rgba(10,94,215,.1)',
    date: 'Jun 28, 2026',
    readTime: '5 min read',
    gradient: 'linear-gradient(135deg,rgba(10,94,215,.08),rgba(249,115,22,.04))',
  },
  {
    title: 'Choosing the Right Oil for Your Car',
    excerpt: 'A guide to synthetic, semi-synthetic, and conventional oils.',
    category: 'Tips',
    categoryColor: '#0A5ED7',
    categoryBg: 'rgba(10,94,215,.1)',
    date: 'Jun 20, 2026',
    readTime: '4 min read',
    gradient: 'linear-gradient(135deg,rgba(11,179,255,.08),rgba(11,31,59,.04))',
  },
]

const NAV_LINKS = [
  { label: 'Home', to: '/public-portal/landing' },
  { label: 'About', to: '/public-portal/about' },
  { label: 'Services', to: '/public-portal/services' },
  { label: 'Marketplace', to: '/public-portal/marketplace' },
  { label: 'Contact', to: '/public-portal/contact' },
  { label: 'Blog', to: '/public-portal/blog' },
]

export function PublicPortalBlog() {
  const { t, rtl, theme, toggleTheme } = usePreferences()
  const dark = theme === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-page font-ui">
      <header className="sticky top-0 z-10 border-b border-border bg-sidebar">
        <div className="flex h-16 items-center gap-4 px-6 sm:px-10">
          <Link to="/public-portal/landing" className="flex items-center gap-2 no-underline">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-salis-gradient">
              <Icon name="Car" size={16} className="text-white" />
            </div>
            <span className="font-display text-base font-extrabold text-heading">
              {t('SALIS AUTO')}
            </span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
            {NAV_LINKS.map((nl) => (
              <Link
                key={nl.label}
                to={nl.to}
                className="text-[13px] font-medium text-body no-underline transition-colors hover:text-salis-blue"
              >
                {t(nl.label)}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2 md:ms-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t('Toggle theme')}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted"
            >
              <Icon name={dark ? 'Sun' : 'Moon'} size={16} />
            </button>
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-lg bg-salis-gradient px-4 font-action text-[13px] font-semibold text-white no-underline hover:text-white hover:no-underline"
            >
              {t('Sign In')}
            </Link>
            <button
              type="button"
              aria-label={t('Menu')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent text-heading md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Icon name="Menu" size={18} />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="flex flex-col gap-1 border-t border-border bg-sidebar p-4 md:hidden" dir={rtl ? 'rtl' : 'ltr'}>
            {NAV_LINKS.map((nl) => (
              <Link
                key={nl.label}
                to={nl.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-body no-underline transition-colors hover:bg-[rgba(10,94,215,.04)]"
              >
                {t(nl.label)}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-6 py-10 sm:px-10 sm:py-[60px]">
          <h1 className="m-0 mb-2 text-center font-display text-[32px] font-black text-heading sm:text-[40px]">
            {t('Blog')}
          </h1>
          <p className="m-0 mb-8 text-center text-base text-muted">
            {t('Latest news and automotive insights')}
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post) => (
              <article
                key={post.title}
                className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-200 ease-salis hover:shadow-lg"
              >
                <div className="h-40" style={{ background: post.gradient }} />
                <div className="p-4">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ background: post.categoryBg, color: post.categoryColor }}
                  >
                    {t(post.category)}
                  </span>
                  <h3 className="m-0 mb-1.5 mt-2 text-base font-bold text-heading">
                    {t(post.title)}
                  </h3>
                  <p className="m-0 mb-2.5 text-xs leading-relaxed text-muted">
                    {t(post.excerpt)}
                  </p>
                  <span className="text-[11px] text-faint">
                    <span dir="ltr">{post.date}</span> · {t(post.readTime)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <footer className="flex flex-wrap gap-10 border-t border-border bg-sidebar p-6 sm:gap-[60px] sm:p-10">
        <div className="min-w-[200px]">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-salis-gradient">
              <Icon name="Car" size={14} className="text-white" />
            </div>
            <span className="font-display text-sm font-extrabold text-heading">
              {t('SALIS AUTO')}
            </span>
          </div>
          <p className="m-0 max-w-[240px] text-xs text-muted">
            {t('Integrated automotive workshop management system for Saudi Arabia.')}
          </p>
        </div>
        <div>
          <p className="m-0 mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('Product')}
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-body">{t('Features')}</span>
            <span className="text-[13px] text-body">{t('Pricing')}</span>
            <Link to="/public-portal/marketplace" className="text-[13px] text-body no-underline">
              {t('Marketplace')}
            </Link>
          </div>
        </div>
        <div>
          <p className="m-0 mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('Company')}
          </p>
          <div className="flex flex-col gap-1.5">
            <Link to="/public-portal/about" className="text-[13px] text-body no-underline">
              {t('About')}
            </Link>
            <Link to="/public-portal/contact" className="text-[13px] text-body no-underline">
              {t('Contact')}
            </Link>
            <Link to="/public-portal/blog" className="text-[13px] text-body no-underline">
              {t('Blog')}
            </Link>
          </div>
        </div>
        <div>
          <p className="m-0 mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('Support')}
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-body">{t('Help Center')}</span>
            <Link to="/public-portal/faq" className="text-[13px] text-body no-underline">
              {t('FAQ')}
            </Link>
            <span className="text-[13px] text-body">{t('Terms')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
