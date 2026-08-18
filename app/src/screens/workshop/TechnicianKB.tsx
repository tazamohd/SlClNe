import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** Technician knowledge base: repair procedures, torque specs and TSBs.
 *
 *  Search and the category pills both filter the `kbProcedures` collection
 *  client-side, exactly as the prototype's DCLogic did. The cards themselves
 *  are not clickable — the design gave them `cursor:pointer` but no
 *  destination, and no KB-detail screen exists in SCREEN_MAP, so pretending
 *  otherwise would be a dead control. */

type Procedure = RowOf<'kbProcedures'>

/** System → lucide glyph, straight from the design's ICON table. */
const CATEGORY_ICON: Record<string, string> = {
  Brakes: 'Disc3',
  Engine: 'Cog',
  HVAC: 'Wind',
  Electrical: 'Zap',
  Drivetrain: 'Settings2',
  'EV / Hybrid': 'BatteryCharging',
}

const ALL = 'All'

export function TechnicianKB() {
  const { t, rtl } = usePreferences()
  const { data: procedures = [], isLoading } = useCollection('kbProcedures')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)

  const categories = useMemo(
    () => [ALL, ...new Set(procedures.map((p) => p.cat))],
    [procedures]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return procedures.filter((p) => {
      if (category !== ALL && p.cat !== category) return false
      if (!q) return true
      // Match against both languages plus id/make/system, as the design did,
      // so a tech can search in either script.
      return `${p.ar} ${p.title} ${p.id} ${p.make} ${p.cat}`.toLowerCase().includes(q)
    })
  }, [procedures, query, category])

  const bulletinCount = useMemo(() => procedures.filter((p) => p.tsb).length, [procedures])
  const totalViews = useMemo(() => procedures.reduce((sum, p) => sum + p.views, 0), [procedures])

  const clearFilters = () => {
    setQuery('')
    setCategory(ALL)
  }

  return (
    <div className="flex max-w-[1180px] flex-col gap-4">
      <div>
        <Link
          to="/technician-portal"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Technician Portal')}
        </Link>
      </div>

      <div>
        <h1 className="font-display text-3xl font-black text-heading">
          {t('Technician Knowledge Base')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t('Procedures, torque specs and service bulletins')}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Search by procedure, code, or vehicle...')}
          aria-label={t('Search by procedure, code, or vehicle...')}
          icon={<Icon name="Search" size={17} />}
          inputSize="lg"
        />

        <div role="radiogroup" aria-label={t('Category')} className="flex gap-2 overflow-x-auto pb-0.5">
          {categories.map((option) => {
            const on = category === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setCategory(option)}
                className={cn(
                  'h-8 flex-shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5',
                  'font-action text-xs font-semibold transition-all duration-150',
                  on
                    ? 'border-none bg-salis-gradient text-white'
                    : 'border border-border bg-card text-body hover:border-border-strong'
                )}
              >
                {t(option)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
        <StatCard icon="BookOpen" tint="#0A5ED7" value={procedures.length} label={t('Procedures')} />
        <StatCard icon="ShieldAlert" tint="#F97316" value={bulletinCount} label={t('Service bulletins')} />
        <StatCard icon="Layers" tint="#0BB3FF" value={categories.length - 1} label={t('Systems')} />
        <StatCard icon="Eye" tint="#0A5ED7" value={totalViews.toLocaleString('en-US')} label={t('Total views')} />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">{t('Loading...')}</p>
      ) : filtered.length > 0 ? (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))]">
          {filtered.map((procedure) => (
            <ProcedureCard key={procedure.id} procedure={procedure} />
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <EmptyState
            icon="SearchX"
            title={t('Nothing matches')}
            description={t('Try a shorter term, a different category, or search by vehicle.')}
            action={
              <Button size="md" onClick={clearFilters}>
                {t('Clear filters')}
              </Button>
            }
          />
        </Card>
      )}
    </div>
  )
}

/** Compact stat: icon chip beside the figure, per the design's four-up row. */
function StatCard({
  icon,
  tint,
  value,
  label,
}: {
  icon: string
  /** Chip colour — blue, orange or bright blue only (README §7). */
  tint: string
  value: string | number
  label: string
}) {
  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <span
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${tint} 12%, transparent)`, color: tint }}
      >
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <p
          className="font-display text-[19px] font-black leading-[1.1] text-heading [font-variant-numeric:tabular-nums]"
          dir="ltr"
        >
          {value}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted">{label}</p>
      </div>
    </Card>
  )
}

function ProcedureCard({ procedure }: { procedure: Procedure }) {
  const { t, rtl } = usePreferences()

  return (
    <Card className="flex flex-col gap-3 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(10,94,215,.35)] hover:shadow-lg">
      <div className="flex items-start gap-3">
        <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-[rgba(10,94,215,.1)] text-salis-blue">
          <Icon name={CATEGORY_ICON[procedure.cat] ?? 'Wrench'} size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10.5px] font-bold text-muted" dir="ltr">
              {procedure.id}
            </span>
            {procedure.tsb ? (
              <span
                className="rounded-full bg-[rgba(249,115,22,.13)] px-1.5 py-px font-action text-[9.5px] font-bold tracking-[.04em] text-salis-orange"
                dir="ltr"
              >
                TSB
              </span>
            ) : null}
          </div>
          <h3 className="text-[13.5px] font-bold leading-[1.35] text-heading">
            {rtl ? procedure.ar : procedure.title}
          </h3>
          {/* Make/model ranges are Latin — pinned LTR so Arabic pages keep
              "2018-2024" in order. */}
          <p className="mt-0.5 truncate text-[11.5px] text-muted" dir="ltr">
            {procedure.make}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[rgba(11,179,255,.12)] px-2 py-0.5 font-action text-[10.5px] font-semibold text-[#0BB3FF]">
          {t(procedure.cat)}
        </span>
        <MetaPill icon="Clock" label={`${procedure.mins} ${t('min')}`} />
        <MetaPill icon="ListOrdered" label={`${procedure.steps} ${t('steps')}`} />
      </div>

      <div className="rounded-lg border-s-2 border-salis-blue bg-[rgba(10,94,215,.05)] px-3 py-2">
        <p className="font-action text-[9.5px] font-bold uppercase tracking-[.05em] text-salis-blue">
          {t('Torque specification')}
        </p>
        <p className="mt-1 font-mono text-[11.5px] leading-[1.45] text-body">
          {rtl ? procedure.ar_torque : procedure.torque}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <Icon name="Eye" size={11} />
          <span dir="ltr">{procedure.views.toLocaleString('en-US')}</span>
        </span>
        <span className="inline-flex items-center gap-1 font-action text-[11.5px] font-semibold text-salis-blue">
          {t('Open')}
          <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={12} />
        </span>
      </div>
    </Card>
  )
}

/** Neutral pill with a leading glyph — duration and step count. */
function MetaPill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-inset px-2 py-0.5 font-action text-[10.5px] font-semibold text-body">
      <Icon name={icon} size={10} />
      {label}
    </span>
  )
}
