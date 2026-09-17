import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { AGGREGATE_GAP } from './reporting'
import { ReportGap } from './ReportControls'

/** Cash Flow Statement — a genuine gap, live or not.
 *
 *  A cash-flow statement groups movements into operating, investing and
 *  financing activities. Nothing in this system classifies a movement that
 *  way: `journal_entries` (`server/src/db/schema.ts`) carries a debit, a
 *  credit and an optional `source`/`sourceId` back to the business event that
 *  produced it, but no activity category, and no endpoint derives one. The
 *  previous version of this screen invented nine operating/investing/
 *  financing line items and an opening balance out of nothing — plausible
 *  numbers with no record behind any of them, which is worse than an empty
 *  screen because a fabricated statement reads as a real one. This names the
 *  gap instead, the same way `InsuranceReports` and `LoanReports` did before
 *  their schema landed (F-035) — and unlike those, connecting the API alone
 *  will not fill this one in; the activity classification would have to be
 *  built first. */
export function CashFlowStatement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      {isMobile ? (
        <MobilePageHeader icon="ArrowUpDown" title={t('Cash Flow Statement')} subtitle={t('Accounting')} />
      ) : (
        <FeatureHeader icon="ArrowUpDown" title={t('Cash Flow Statement')} subtitle={t('Operating, investing and financing activity')} />
      )}
      <ReportGap
        icon="ArrowUpDown"
        title={t('Cash Flow Statement')}
        collection={AGGREGATE_GAP.cashFlow}
        detail={t(
          'No journal entry in this system is classified as operating, investing or financing activity, so there is nothing to group into a cash-flow statement yet — no figures are estimated here.',
        )}
      />
    </div>
  )
}
