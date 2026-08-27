import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
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

/** The technician knowledge base — procedures, torque specs and service
 *  bulletins, searchable and filterable by system.
 *
 *  Everything on it is real `kbProcedures` data: the title, the category, the
 *  torque spec, the step count and the view count all come from the row. A card
 *  opens a modal that shows the full procedure rather than routing to a detail
 *  screen that does not exist — the data to render it is already loaded. */
export function TechnicianKB() {
  const { t, rtl } = usePreferences()
  const procedures = useCollection('kbProcedures')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [open, setOpen] = useState<Procedure | null>(null)

  const rows = (procedures.data ?? []) as readonly Procedure[]

  const categories = useMemo(() => ['All', ...new Set(rows.map((p) => p.cat).filter(Boolean))], [rows])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((p) => {
      if (category !== 'All' && p.cat !== category) return false
      if (!needle) return true
      return [p.title, p.ar, p.id, p.make, p.cat]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle))
    })
  }, [rows, query, category])

  const stats = useMemo(
    () => [
      { n: String(rows.length), label: t('Procedures'), icon: 'BookOpen' },
      { n: String(rows.filter((p) => p.tsb).length), label: t('Service bulletins'), icon: 'AlertTriangle' },
      { n: String(new Set(rows.map((p) => p.cat).filter(Boolean)).size), label: t('Systems'), icon: 'Layers' },
      {
        n: rows.reduce((sum, p) => sum + (p.views ?? 0), 0).toLocaleString('en-US'),
        label: t('Total views'),
        icon: 'Eye',
      },
    ],
    [rows, t]
  )

  return (
    <div className="flex max-w-[1180px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div>
        <h1 className="font-display text-2xl font-black text-heading">
          {t('Technician Knowledge Base')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t('Procedures, torque specs and service bulletins')}
        </p>
      </div>

      <label className="block">
        <span className="sr-only">{t('Search by procedure, code, or vehicle...')}</span>
        <Input
          icon={<Icon name="Search" size={17} />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('Search by procedure, code, or vehicle...')}
          inputSize="md"
        />
      </label>

      <ChipGroup label={t('Category')}>
        {categories.map((cat) => (
          <Chip key={cat} label={t(cat)} selected={category === cat} onToggle={() => setCategory(cat)} />
        ))}
      </ChipGroup>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 rounded-xl p-3.5">
            <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.1)] p-2.5 text-salis-blue">
              <Icon name={s.icon} size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-black leading-tight text-heading">{s.n}</p>
              <p className="truncate text-[11px] text-muted">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {procedures.isError ? (
        <ErrorState
          title={t("Couldn't load this")}
          description={procedures.error?.message}
          onRetry={() => void procedures.refetch()}
        />
      ) : procedures.isLoading ? (
        <Card className="p-6">
          <Loading label="Loading procedures..." />
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon="SearchX"
            title={t('Nothing matches')}
            description={t('Try a shorter term, a different category, or search by vehicle.')}
            action={
              <Button
                size="sm"
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                }}
              >
                {t('Clear filters')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
          {filtered.map((p) => (
            <button
              key={p._id ?? p.id}
              type="button"
              onClick={() => setOpen(p)}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-start transition-all hover:-translate-y-0.5 hover:border-salis-blue hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue motion-reduce:hover:translate-y-0"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(10,94,215,.1)] text-salis-blue">
                  <Icon name={CATEGORY_ICON[p.cat] ?? 'Wrench'} size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-muted" dir="ltr">
                      {p.id}
                    </span>
                    {p.tsb ? (
                      <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">
                        TSB
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-[13px] font-bold leading-snug text-heading">
                    {rtl ? p.ar || p.title : p.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted">{p.make}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge background="rgba(11,179,255,.12)" color="var(--salis-blue-bright)">
                  {t(p.cat)}
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-full bg-inset px-2 py-0.5 font-action text-[10px] font-semibold text-body">
                  <Icon name="Clock" size={10} />
                  {p.mins} {t('min')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-inset px-2 py-0.5 font-action text-[10px] font-semibold text-body">
                  <Icon name="ListOrdered" size={10} />
                  {p.steps} {t('steps')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                  <Icon name="Eye" size={11} />
                  {(p.views ?? 0).toLocaleString('en-US')}
                </span>
                <span className="inline-flex items-center gap-1.5 font-action text-[11px] font-semibold text-salis-blue">
                  {t('Open')}
                  <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={12} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? (rtl ? open.ar || open.title : open.title) : ''}
        icon={open ? CATEGORY_ICON[open.cat] ?? 'Wrench' : 'Wrench'}
        variant="data"
        meta={open ? <span className="font-mono text-[12px] text-muted" dir="ltr">{open.id}</span> : undefined}
      >
        {open ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              <Badge background="rgba(11,179,255,.12)" color="var(--salis-blue-bright)">
                {t(open.cat)}
              </Badge>
              {open.tsb ? (
                <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">
                  TSB
                </Badge>
              ) : null}
              <span className="text-[12px] text-muted">{open.make}</span>
            </div>
            <div className="rounded-lg border-s-2 border-salis-blue bg-[rgba(10,94,215,.05)] p-3">
              <p className="font-action text-[10px] font-bold uppercase tracking-wide text-salis-blue">
                {t('Torque specification')}
              </p>
              <p className="mt-1 font-mono text-[12px] leading-relaxed text-body">
                {rtl ? open.ar_torque || open.torque : open.torque}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: t('Duration'), value: `${open.mins} ${t('min')}`, icon: 'Clock' },
                { label: t('Steps'), value: String(open.steps), icon: 'ListOrdered' },
                { label: t('Views'), value: (open.views ?? 0).toLocaleString('en-US'), icon: 'Eye' },
              ].map((cell) => (
                <div key={cell.label} className="rounded-lg bg-inset p-3 text-center">
                  <Icon name={cell.icon} size={15} className="mx-auto text-salis-blue" />
                  <p className="mt-1 text-sm font-bold text-heading">{cell.value}</p>
                  <p className="text-[10px] text-muted">{cell.label}</p>
                </div>
              ))}
            </div>
            {/* The seed carries the step count and torque spec, but not the
                per-step body — that is a document store the KB does not expose
                yet, so it is named honestly rather than faked. */}
            <p className="rounded-lg bg-inset p-3 text-[12px] leading-relaxed text-muted">
              {t('The full step-by-step body loads from the document store, which is not connected yet.')}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
