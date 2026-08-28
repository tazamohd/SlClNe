import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Controls shared by every reporting surface — the date range, the export and
 *  print actions, and the notice that stands in for a total the server does not
 *  yet expose. Kept in one place so a report and a tax screen filter, export and
 *  disclose the same way. */

/* --------------------------------------------------------------- date range */

export function DateRangeFilter({
  from,
  to,
  onFrom,
  onTo,
}: {
  from: string
  to: string
  onFrom: (value: string) => void
  onTo: (value: string) => void
}) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted">{t('From')}</span>
        <Input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onFrom(event.target.value)}
          aria-label={t('From date')}
          inputSize="sm"
          dir="ltr"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted">{t('To')}</span>
        <Input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onTo(event.target.value)}
          aria-label={t('To date')}
          inputSize="sm"
          dir="ltr"
        />
      </label>
      {from || to ? (
        <Button
          variant="subtle"
          size="md"
          onClick={() => {
            onFrom('')
            onTo('')
          }}
        >
          <Icon name="X" size={14} />
          {t('Clear dates')}
        </Button>
      ) : null}
    </div>
  )
}

/* --------------------------------------------------------- export and print */

export function ExportPrintActions({
  onExport,
  exportDisabled,
}: {
  /** Omit for a surface that has nothing meaningful to export — only Print shows. */
  onExport?: () => void
  exportDisabled?: boolean
}) {
  const { t } = usePreferences()
  return (
    <>
      {onExport ? (
        <Button variant="subtle" size="md" onClick={onExport} disabled={exportDisabled}>
          <Icon name="FileDown" size={15} />
          {t('Export CSV')}
        </Button>
      ) : null}
      <Button variant="subtle" size="md" onClick={() => window.print()}>
        <Icon name="Printer" size={15} />
        {t('Print')}
      </Button>
    </>
  )
}

/* ----------------------------------------------------------- aggregate gap */

/** The honest stand-in for a period total. A report screen wants to print
 *  "revenue this quarter"; the server owns that sum and exposes no endpoint for
 *  it, and a browser adding up the rows it holds would be adding up one page.
 *  So the figure is named as absent, with the endpoint that would provide it,
 *  rather than faked. Blue and informational — this is a known boundary, not an
 *  error. */
export function AggregateGapNotice({ endpoint }: { endpoint: string }) {
  const { t } = usePreferences()
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-[rgba(10,94,215,.05)] px-4 py-3">
      <span className="flex flex-shrink-0 rounded-lg bg-tint-blue p-2 text-salis-blue">
        <Icon name="Info" size={16} />
      </span>
      <div className="min-w-0 text-[13px]">
        <p className="font-semibold text-heading">{t('Period totals are computed by the server')}</p>
        <p className="mt-0.5 text-muted">
          {t(
            'Each figure below is a value the API computed for one record. A cross-record total for the selected range needs a server aggregate that does not exist yet:',
          )}{' '}
          <span dir="ltr" className="font-mono text-[11px] text-body">
            {endpoint}
          </span>
          {'. '}
          {t('The rows here are exact and exportable; sum them in your ledger, not the browser.')}
        </p>
      </div>
    </div>
  )
}

/** The live counterpart to `AggregateGapNotice`: the server aggregate is now
 *  connected, so this confirms the totals beside it were summed server-side over
 *  the selected range — not in the browser — and names the endpoint that did it.
 *  Blue and informational, the same tone as the gap it replaces. */
export function ServerTotalsNote({ endpoint }: { endpoint: string }) {
  const { t } = usePreferences()
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-[rgba(10,94,215,.05)] px-4 py-3">
      <span className="flex flex-shrink-0 rounded-lg bg-tint-blue p-2 text-salis-blue">
        <Icon name="Calculator" size={16} />
      </span>
      <div className="min-w-0 text-[13px]">
        <p className="font-semibold text-heading">{t('Totals computed by the server')}</p>
        <p className="mt-0.5 text-muted">
          {t(
            'Each total below is summed by the server over your whole organization for the selected range, not from the page of rows shown here:',
          )}{' '}
          <span dir="ltr" className="font-mono text-[11px] text-body">
            {endpoint}
          </span>
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- server scope */

/** Branch and organization scoping is applied on the server by row-level
 *  security, not by a client dropdown — the presented rows carry no branch id to
 *  filter on, and offering a control that cannot filter would be a dead one.
 *  This states where the scope lives instead. */
export function ServerScopeNote() {
  const { t } = usePreferences()
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-muted">
      <Icon name="ShieldCheck" size={12} className="flex-shrink-0 text-salis-blue" />
      {t('Scoped to your organization and branch on the server.')}
    </p>
  )
}
