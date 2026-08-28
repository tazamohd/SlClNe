import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'
import { PageHeader } from '@/components/ui/PageHeader'

interface CategoryCard {
  icon: string
  name: string
  count: string
  iconBg: string
  iconFg: string
}

interface Article {
  id: number
  title: string
  category: string
  date: string
  views: string
  status: string
  statusBg: string
  statusFg: string
  iconBg: string
  iconFg: string
}

function useCategories(t: (s: string) => string): CategoryCard[] {
  return useMemo(() => [
    { icon: 'Wrench', name: t('Workshop Procedures'), count: '24', iconBg: 'var(--tint-blue)', iconFg: 'var(--salis-blue)' },
    { icon: 'Headphones', name: t('Customer Service'), count: '18', iconBg: 'var(--tint-bright)', iconFg: 'var(--salis-blue-bright, #0BB3FF)' },
    { icon: 'Package', name: t('Parts & Inventory'), count: '12', iconBg: 'var(--tint-orange)', iconFg: 'var(--salis-orange)' },
    { icon: 'Shield', name: t('Policies & Compliance'), count: '8', iconBg: 'var(--tint-navy)', iconFg: 'var(--text-heading)' },
  ], [t])
}

function useArticles(t: (s: string) => string): Article[] {
  return useMemo(() => [
    { id: 1, title: t('How to Process a Vehicle Check-In'), category: t('Workshop'), date: 'Jul 20, 2026', views: '342', status: t('Published'), statusBg: 'var(--tint-blue)', statusFg: 'var(--salis-blue)', iconBg: 'rgba(10,94,215,.06)', iconFg: 'var(--salis-blue)' },
    { id: 2, title: t('ZATCA E-Invoice Requirements'), category: t('Compliance'), date: 'Jul 18, 2026', views: '256', status: t('Published'), statusBg: 'var(--tint-blue)', statusFg: 'var(--salis-blue)', iconBg: 'rgba(249,115,22,.06)', iconFg: 'var(--salis-orange)' },
    { id: 3, title: t('Parts Return Policy'), category: t('Inventory'), date: 'Jul 15, 2026', views: '128', status: t('Draft'), statusBg: 'var(--tint-orange)', statusFg: 'var(--salis-orange)', iconBg: 'rgba(11,179,255,.06)', iconFg: 'var(--salis-blue-bright, #0BB3FF)' },
    { id: 4, title: t('Customer Complaint Handling'), category: t('Customer Service'), date: 'Jul 12, 2026', views: '189', status: t('Published'), statusBg: 'var(--tint-blue)', statusFg: 'var(--salis-blue)', iconBg: 'rgba(11,31,59,.06)', iconFg: 'var(--text-heading)' },
    { id: 5, title: t('Quality Control Checklist'), category: t('Workshop'), date: 'Jul 10, 2026', views: '412', status: t('Published'), statusBg: 'var(--tint-blue)', statusFg: 'var(--salis-blue)', iconBg: 'rgba(10,94,215,.06)', iconFg: 'var(--salis-blue)' },
  ], [t])
}

export function KnowledgeBase() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const categories = useCategories(t)
  const allArticles = useArticles(t)

  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return allArticles
    const q = search.toLowerCase()
    return allArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    )
  }, [allArticles, search])

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Library"
          title={t('Knowledge Base')}
          subtitle={t('AI Platform')}
        />

        <div className="flex gap-2">
          <Input
            inputSize="sm"
            placeholder={t('Search articles...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" disabled={!isLive}
            onClick={() => toast.show({ title: t('Connect the API') })}>
            <Icon name="Plus" size={14} />
            {t('Add Article')}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((cc) => (
            <MobileCard key={cc.name}>
              <span className="flex rounded-[10px] p-2" style={{ background: cc.iconBg, color: cc.iconFg }}>
                <Icon name={cc.icon} size={16} />
              </span>
              <h4 className="mt-2 text-[13px] font-semibold text-heading">{cc.name}</h4>
              <p className="text-xs text-muted">{cc.count} {t('articles')}</p>
            </MobileCard>
          ))}
        </div>

        <h3 className="text-base font-bold text-heading">{t('Recent Articles')}</h3>
        <div className="flex flex-col gap-3">
          {filtered.map((a) => (
            <MobileCard key={a.id}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2.5">
                    <span className="flex rounded-[10px] p-2" style={{ background: a.iconBg, color: a.iconFg }}>
                      <Icon name="FileText" size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[13px] font-semibold text-heading">{a.title}</h4>
                      <p className="mt-0.5 text-xs text-muted">{a.category} · {a.date}</p>
                    </div>
                  </div>
                }
              />
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                  <Icon name="Eye" size={11} />
                  {a.views}
                </span>
                <Badge background={a.statusBg} color={a.statusFg}>{a.status}</Badge>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader icon="Library" title={t('Knowledge Base')} subtitle={t('AI Platform')} />
        <div className="flex gap-2.5">
          <div className="relative flex items-center">
            <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
            <Input
              inputSize="sm"
              placeholder={t('Search articles...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[260px] !ps-8"
            />
          </div>
          <Button size="sm" disabled={!isLive}
            onClick={() => toast.show({ title: t('Connect the API') })}>
            <Icon name="Plus" size={16} />
            {t('Add Article')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {categories.map((cc) => (
          <Card
            key={cc.name}
            className="cursor-pointer rounded-xl p-4 shadow-sm transition-all hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
          >
            <span className="flex rounded-[10px] p-2" style={{ background: cc.iconBg, color: cc.iconFg }}>
              <Icon name={cc.icon} size={18} />
            </span>
            <h4 className="mt-2.5 text-sm font-semibold text-heading">{cc.name}</h4>
            <p className="mt-1 text-xs text-muted">{cc.count} {t('articles')}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-heading">{t('Recent Articles')}</h3>
        {filtered.map((a) => (
          <Card
            key={a.id}
            className="flex cursor-pointer items-center gap-3.5 rounded-[14px] p-4 shadow-sm transition-all hover:border-[rgba(10,94,215,.2)]"
          >
            <span className="flex rounded-[10px] p-2" style={{ background: a.iconBg, color: a.iconFg }}>
              <Icon name="FileText" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-heading">{a.title}</h4>
              <p className="mt-0.5 text-xs text-muted">{a.category} · {a.date}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <Icon name="Eye" size={11} />
                {a.views}
              </span>
              <Badge background={a.statusBg} color={a.statusFg}>{a.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
