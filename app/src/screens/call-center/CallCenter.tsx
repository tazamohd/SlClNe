import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/* ---------- component ----------
 *
 * This screen was MOCK_ONLY (D-CallCenter, BLK-004): every KPI, the live
 * queue, the active call banner, "Customer Context", "Open Items" and
 * "Recent Calls" were hardcoded fixture rows keyed to a fictional caller
 * ("Ahmed Al-Rashid") and a fictional in-progress call.
 *
 * There is no real data to wire them to. `Repository` (app/src/data/
 * repository.ts) and `project-control/API_REGISTRY.json` have no
 * `calls` / `callQueue` / `callLogs` collection or endpoint at all — not
 * even a `null`-when-not-`isLive` seam like `financeReports` or `history`
 * get. Live call state, queue wait times, handle-time/service-level
 * metrics and call dispositions are recorded by a telephony/CTI system
 * this API does not model, so connecting a live API would not change
 * this screen. Rather than invent a queue, a caller or a call log (the
 * fake-completion this project gates against), the whole console below
 * the header is an honest GAP state, following the same pattern as
 * `app/src/screens/hr/StaffGap.tsx`. The one part of the original screen
 * that named a real destination — "Book Appointment" / "New Job Card" —
 * is kept as real navigation to the screens that *are* wired
 * (`appointments`, `jobs`), same as `AppointmentCalendar` and
 * `JobCards`.
 */
export function CallCenter() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  return (
    <div className="flex animate-fade-up flex-col gap-5 motion-reduce:animate-none">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_16px_22px_-6px_rgba(10,94,215,.25)]">
            <Icon name="Headphones" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Agent Console')}</h1>
            <p className="mt-0.5 text-sm text-muted">{t('Queue, active call and customer context')}</p>
          </div>
        </div>
      </div>

      {/* Console — honest GAP state. No telephony backend exists to show a
       *  real queue, active call, handle-time metrics or call log against
       *  (see the comment above the component). */}
      <Card className="p-4">
        <EmptyState
          icon="PhoneOff"
          title={t('Call-center console has no data source yet')}
          description={t(
            'Live queue, active-call state, call metrics and call logs are recorded by a telephony system this API does not expose. Nothing is shown here rather than an invented caller or queue.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">calls / callQueue / callLogs</span>
        </p>
      </Card>

      {/* Quick actions — real navigation to the screens that are wired. */}
      <Card className={isMobile ? 'p-4' : 'p-5'}>
        <h2 className="mb-3 text-sm font-bold text-heading">{t('Quick Actions')}</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/appointment-calendar')}>
            <Icon name="CalendarPlus" size={15} />
            {t('Book Appointment')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/job-cards')}>
            <Icon name="ClipboardPlus" size={15} />
            {t('New Job Card')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
