import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { ConnectApi, ProvenanceNote } from './bits'

/** The two HR feature-map screens the backend does not serve yet.
 *
 *  `Staff-Scheduling` and `Staff-Performance-Review` appear on the feature map,
 *  but the HR backend landed employees, payroll, timesheets and leave — there is
 *  no `staffSchedules` or `performanceReviews` collection behind them. Rather than
 *  invent rows (the fake-completion this project gates against) or leave a blank
 *  placeholder route, each is an honest shell that names the missing collection
 *  and points at the screens that *are* built. The `GAP:` test pins the missing
 *  source so this cannot quietly graduate to fake data.
 *
 *  Provenance: feature-map spec + screenshot, no `.dc.html` and no backend.
 */

function GapShell({
  icon,
  title,
  subtitle,
  description,
  collection,
}: {
  icon: string
  title: string
  subtitle: string
  description: string
  collection: string
}) {
  const { t } = usePreferences()
  return (
    <div className="flex max-w-[860px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name={icon} size={24} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-black text-heading">{t(title)}</h1>
          <p className="mt-1 text-sm text-muted">{t(subtitle)}</p>
        </div>
      </div>
      <ProvenanceNote />
      <ConnectApi icon={icon} title={`${title} has no data source yet`} description={description} collection={collection} />
    </div>
  )
}

/** `Staff-Scheduling` — no backend collection exists (GAP: staffSchedules). */
export function StaffScheduling() {
  return (
    <GapShell
      icon="Calendar"
      title="Staff Scheduling"
      subtitle="Shift and roster planning"
      description="Staff scheduling needs a shifts/roster collection the HR backend does not serve yet. The employees it would schedule live in the Staff Directory; the schedule itself has no data source, so no roster is shown rather than an invented one."
      collection="staffSchedules"
    />
  )
}

/** `Staff-Performance-Review` — no backend collection (GAP: performanceReviews). */
export function StaffPerformanceReview() {
  return (
    <GapShell
      icon="Award"
      title="Staff Performance Review"
      subtitle="Reviews, ratings and goals"
      description="Performance reviews need a reviews collection the HR backend does not serve yet. Employees live in the Staff Directory; a review record has no data source, so none is shown rather than a fabricated rating."
      collection="performanceReviews"
    />
  )
}
