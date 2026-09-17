import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search } from '@/components/ui/Search'
import { Badge } from '@/components/ui/Badge'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

type Procedure = RowOf<'kbProcedures'> & { _id?: string }

const CATEGORY_ICON: Record<string, string> = {
  Brakes: 'Disc3',
  Engine: 'Cog',
  HVAC: 'Wind',
  Electrical: 'Zap',
  Drivetrain: 'Settings2',
  'EV / Hybrid': 'BatteryCharging',
}

/** Category tiles, computed from the real procedures rather than a fixed list
 *  — the AI portal's knowledge base shares the technician `kbProcedures` table
 *  (torque specs, service bulletins) with `TechnicianKB`, so the categories
 *  shown here are whichever systems the connected server actually has
 *  procedures for. */
function categoriesOf(rows: readonly Procedure[]) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    if (!row.cat) continue
    counts.set(row.cat, (counts.get(row.cat) ?? 0) + 1)
  }
  return [...counts.entries()].map(([name, count]) => ({
    name,
    count: String(count),
    icon: CATEGORY_ICON[name] ?? 'Wrench',
  }))
}

export function KnowledgeBase() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const procedures = useCollection('kbProcedures')

  const [search, setSearch] = useState('')

  const rows = (procedures.data ?? []) as readonly Procedure[]
  const categories = useMemo(() => categoriesOf(rows), [rows])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (a) => a.title.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q)
    )
  }, [rows, search])

  const addArticle = (
    <Button size={isMobile ? 'sm' : 'sm'} disabled={!isLive}
      onClick={() => toast.show({ title: t('Connect the API') })}>
      <Icon name="Plus" size={isMobile ? 14 : 16} />
      {t('Add Article')}
    </Button>
  )

  const listState = procedures.isError ? (
    <Card className="p-6">
      <ErrorState
        title={t("Couldn't load this")}
        description={procedures.error?.message}
        onRetry={() => void procedures.refetch()}
      />
    </Card>
  ) : procedures.isLoading ? (
    <Card className="p-6">
      <Loading label={t('Loading articles...')} />
    </Card>
  ) : filtered.length === 0 ? (
    <Card className="p-6">
      <EmptyState
        icon="SearchX"
        title={t('Nothing matches')}
        description={t('Try a different search term.')}
      />
    </Card>
  ) : null

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
          {addArticle}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((cc) => (
            <MobileCard key={cc.name}>
              <span className="flex rounded-[10px] p-2 bg-tint-blue text-salis-blue">
                <Icon name={cc.icon} size={16} />
              </span>
              <h2 className="mt-2 text-[13px] font-semibold text-heading">{cc.name}</h2>
              <p className="text-xs text-muted">{cc.count} {t('procedures')}</p>
            </MobileCard>
          ))}
        </div>

        <h2 className="text-base font-bold text-heading">{t('Recent Articles')}</h2>
        {listState ?? (
          <div className="flex flex-col gap-3">
            {filtered.map((a) => (
              <MobileCard key={a._id ?? a.id}>
                <MobileCardHeader
                  leading={
                    <div className="flex items-center gap-2.5">
                      <span className="flex rounded-[10px] p-2 bg-tint-blue text-salis-blue">
                        <Icon name="FileText" size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[13px] font-semibold text-heading">{a.title}</h3>
                        <p className="mt-0.5 text-xs text-muted">{a.cat}{a.make ? ` · ${a.make}` : ''}</p>
                      </div>
                    </div>
                  }
                />
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                    <Icon name="Eye" size={11} />
                    {(a.views ?? 0).toLocaleString('en-US')}
                  </span>
                  {a.tsb ? (
                    <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">TSB</Badge>
                  ) : null}
                </div>
              </MobileCard>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader icon="Library" title={t('Knowledge Base')} subtitle={t('AI Platform')} />
        <div className="flex gap-2.5">
          <Search value={search} onChange={setSearch} placeholder={t('Search articles...')} className="w-full sm:w-[260px]" compact />
          {addArticle}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {categories.map((cc) => (
          <Card
            key={cc.name}
            className="cursor-pointer rounded-xl p-4 shadow-sm transition-all hover:border-salis-blue/[.3] hover:shadow-lg"
          >
            <span className="flex rounded-[10px] p-2 bg-tint-blue text-salis-blue">
              <Icon name={cc.icon} size={18} />
            </span>
            <h2 className="mt-2.5 text-sm font-semibold text-heading">{cc.name}</h2>
            <p className="mt-1 text-xs text-muted">{cc.count} {t('procedures')}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-heading">{t('Recent Articles')}</h2>
        {listState ?? filtered.map((a) => (
          <Card
            key={a._id ?? a.id}
            className="flex cursor-pointer items-center gap-3.5 rounded-[14px] p-4 shadow-sm transition-all hover:border-salis-blue/[.2]"
          >
            <span className="flex rounded-[10px] p-2 bg-tint-blue text-salis-blue">
              <Icon name="FileText" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-heading">{a.title}</h3>
              <p className="mt-0.5 text-xs text-muted">{a.cat}{a.make ? ` · ${a.make}` : ''}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <Icon name="Eye" size={11} />
                {(a.views ?? 0).toLocaleString('en-US')}
              </span>
              {a.tsb ? (
                <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">TSB</Badge>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
