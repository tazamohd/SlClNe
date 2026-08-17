import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/DataTable'
import { FeatureHeader, SearchField } from '@/components/shell/FeatureScreen'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** Knowledge base: category tiles + recent procedure/article list.
 *
 *  Articles come from `kbProcedures` (workshop TSBs and step-by-step
 *  procedures); category tiles are the design's static counts — there is no
 *  categories collection yet, so they stay local demo data (README §7: no
 *  green/red/yellow, blue = normal, orange = warning — TSBs get the orange
 *  chip since they flag a manufacturer bulletin, not a status). */

type Procedure = RowOf<'kbProcedures'>

const CATEGORIES = [
  { name: 'Workshop Procedures', icon: 'Wrench', count: 24, bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  { name: 'Customer Service', icon: 'Headphones', count: 18, bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
  { name: 'Parts & Inventory', icon: 'Package', count: 12, bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  { name: 'Policies & Compliance', icon: 'Shield', count: 8, bg: 'rgba(11,31,59,.1)', fg: '#0B1F3B' },
] as const

const MEDIA_ICON: Record<string, string> = {
  diagram: 'Image',
  video: 'Video',
  wiring: 'GitBranch',
  safety: 'ShieldAlert',
}

const ARTICLE_TONE = {
  tsb: ['rgba(249,115,22,.1)', '#F97316'] as const,
  procedure: ['rgba(10,94,215,.1)', '#0A5ED7'] as const,
}

export function KnowledgeBase() {
  const { t, rtl } = usePreferences()
  const { data: procedures = [], isLoading } = useCollection('kbProcedures')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return procedures
    return procedures.filter(
      (article) =>
        article.title.toLowerCase().includes(q) || article.cat.toLowerCase().includes(q)
    )
  }, [procedures, query])

  return (
    <div className="flex flex-col gap-6">
      <FeatureHeader
        icon="Library"
        title={t('Knowledge Base')}
        subtitle={t('AI Platform')}
        actions={
          <>
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder={t('Search articles...')}
              className="w-full sm:w-[240px]"
            />
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Article')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {CATEGORIES.map((category) => (
          <Card
            key={category.name}
            className="flex cursor-pointer flex-col gap-2.5 rounded-xl p-4 transition-all duration-200 hover:border-salis-blue/30 hover:shadow-lg"
          >
            <span
              className="flex w-fit rounded-[10px] p-2"
              style={{ background: category.bg, color: category.fg }}
            >
              <Icon name={category.icon} size={18} />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-heading">{t(category.name)}</h4>
              <p className="text-xs text-muted">
                <span dir="ltr">{category.count}</span> {t('articles')}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-heading">{t('Recent Articles')}</h3>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Card key={index} className="h-[70px] animate-pulse rounded-[14px] bg-inset" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon="Library"
              title={t('No articles found')}
              description={t('Try a different search term.')}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((article) => (
              <ArticleRow key={article.id} article={article} rtl={rtl} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ArticleRow({ article, rtl }: { article: Procedure; rtl: boolean }) {
  const { t } = usePreferences()
  const [bg, fg] = article.tsb ? ARTICLE_TONE.tsb : ARTICLE_TONE.procedure

  return (
    <Card className="flex cursor-pointer items-center gap-3.5 rounded-[14px] p-4 transition-colors duration-150 hover:border-salis-blue/20">
      <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(10,94,215,.06)] p-2 text-salis-blue">
        <Icon name="FileText" size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-heading">
          {rtl ? article.ar : article.title}
        </h4>
        <p className="mt-0.5 text-xs text-muted">
          {t(article.cat)} ·{' '}
          <span dir="ltr" className="font-mono">
            {article.make}
          </span>
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1">
          <Icon name="Eye" size={11} />
          <span dir="ltr">{article.views}</span>
        </span>
        <Icon name={MEDIA_ICON[article.media] ?? 'FileText'} size={13} />
        <Badge background={bg} color={fg}>
          {t(article.tsb ? 'TSB' : 'Procedure')}
        </Badge>
      </div>
    </Card>
  )
}
