import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'

/* ---------- component ----------
 *
 * This screen was MOCK_ONLY (D-CallCenter.Logs, BLK-004): the KPI row, every
 * call log row (customer, phone, disposition, agent, duration, recording)
 * and the "Showing 1-8 of 186" pager were hardcoded fixture data for eight
 * fictional calls.
 *
 * Same finding as its sibling `CallCenter.tsx`: `Repository`
 * (app/src/data/repository.ts) and `project-control/API_REGISTRY.json` have
 * no `calls` / `callQueue` / `callLogs` collection or endpoint at all. Call
 * dispositions, durations and recordings are recorded by a telephony/CTI
 * system this API does not model, so there is nothing to wire this screen
 * to. Rather than invent call history (the fake-completion this project
 * gates against), the whole log view is an honest GAP state, following the
 * same pattern as `app/src/screens/hr/StaffGap.tsx` and `CallCenter.tsx`.
 */
export function CallCenterLogs() {
  const { t } = usePreferences()

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-5 motion-reduce:animate-none">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_16px_22px_-6px_rgba(10,94,215,.25)]">
            <Icon name="List" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Call Logs')}</h1>
            <p className="mt-0.5 text-sm text-muted">{t('Every inbound and outbound call with disposition and recording')}</p>
          </div>
        </div>
      </div>

      {/* Log view — honest GAP state. No telephony backend exists to show a
       *  real call history against (see the comment above the component). */}
      <Card className="p-4">
        <EmptyState
          icon="PhoneOff"
          title={t('Call logs have no data source yet')}
          description={t(
            'Call history, dispositions, durations and recordings are recorded by a telephony system this API does not expose. Nothing is shown here rather than invented calls.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">calls / callQueue / callLogs</span>
        </p>
      </Card>
    </div>
  )
}
