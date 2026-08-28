import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Stage = RowOf<'diagStages'> & { _id?: string }
type Finding = RowOf<'diagFindings'> & { _id?: string }
type Part = RowOf<'diagParts'> & { _id?: string }
type Labour = RowOf<'diagLabour'> & { _id?: string }
type Copy = RowOf<'diagCopies'> & { _id?: string }

const SEVERITY_TINT: Record<string, { bg: string; fg: string; icon: string; label: string }> = {
  critical: { bg: 'rgba(249,115,22,.13)', fg: 'var(--salis-orange)', icon: 'AlertTriangle', label: 'Critical' },
  due: { bg: 'rgba(11,179,255,.12)', fg: 'var(--salis-blue-bright)', icon: 'AlertCircle', label: 'Due now' },
  advisory: { bg: 'rgba(100,116,139,.13)', fg: 'var(--text-muted)', icon: 'Info', label: 'Advisory' },
}

/** The diagnostic report — the routing chain, findings, parts, labour and
 *  distribution, read from the five `diag*` collections.
 *
 *  Every section is real data. What is deliberately absent is the cost
 *  build-up: the design totals parts, labour, a handling fee and VAT in the
 *  browser, which Part 5b forbids outright ("the server computes, the client
 *  displays; VAT never client-side"). The report exposes no server total, so
 *  the line figures are shown — unit price, quantity, hours, rate, all stored —
 *  and the grand total is named as a gap rather than fabricated. The desk
 *  routing is shown as recorded; advancing a stage is a server action with no
 *  endpoint yet. Both gaps are pinned in `workshop-approval-gaps.test.ts`. */
export function DiagnosticReport() {
  const { t, rtl } = usePreferences()
  const stages = useCollection('diagStages')
  const findings = useCollection('diagFindings')
  const parts = useCollection('diagParts')
  const labour = useCollection('diagLabour')
  const copies = useCollection('diagCopies')

  const anyError =
    stages.isError || findings.isError || parts.isError || labour.isError || copies.isError
  const anyLoading =
    stages.isLoading || findings.isLoading || parts.isLoading || labour.isLoading || copies.isLoading

  if (anyError) {
    return (
      <ErrorState
        title={t("Couldn't load this")}
        description={stages.error?.message}
        onRetry={() => {
          void stages.refetch()
          void findings.refetch()
          void parts.refetch()
          void labour.refetch()
          void copies.refetch()
        }}
      />
    )
  }
  if (anyLoading) {
    return <Loading label="Loading diagnostic report..." />
  }

  const stageRows = (stages.data ?? []) as readonly Stage[]
  const findingRows = (findings.data ?? []) as readonly Finding[]
  const partRows = (parts.data ?? []) as readonly Part[]
  const labourRows = (labour.data ?? []) as readonly Labour[]
  const copyRows = (copies.data ?? []) as readonly Copy[]

  const criticalCount = findingRows.filter((f) => f.severity === 'critical').length

  const partsColumns: Column<Part>[] = [
    {
      header: 'Part',
      cell: (part) => (
        <div>
          <p className="text-[12.5px] font-semibold text-heading">{rtl ? part.ar || part.desc : part.desc}</p>
          <p className="mt-px font-mono text-[10.5px] text-muted" dir="ltr">{part.part}</p>
        </div>
      ),
    },
    {
      header: 'Stock',
      cell: (part) => (
        <Badge
          background={part.stock === 'order' ? 'rgba(249,115,22,.13)' : 'rgba(10,94,215,.11)'}
          color={part.stock === 'order' ? 'var(--salis-orange)' : 'var(--salis-blue)'}
        >
          {part.stock === 'order' ? t('On order') : t('In stock')}
        </Badge>
      ),
    },
    { header: 'Qty', cell: (part) => <span className="font-mono">{part.qty}</span> },
    { header: 'Unit price', cell: (part) => <Money sar={part.price} className="text-[12.5px] text-heading" /> },
  ]

  return (
    <div className="flex max-w-[1300px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
          <Icon name="Stethoscope" size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-black text-heading">{t('Diagnostic Report')}</h1>
          <p className="mt-0.5 text-sm text-muted">{t('From OBD scan to customer approval')}</p>
        </div>
      </div>

      {/* Routing chain — recorded desks, read-only. */}
      <Card className="p-4">
        <p className="mb-3 font-action text-[10.5px] font-bold uppercase tracking-wide text-muted">
          {t('Routing chain')}
        </p>
        {stageRows.length === 0 ? (
          <p className="text-[13px] text-muted">{t('No routing recorded.')}</p>
        ) : (
          <ol className="m-0 flex list-none flex-wrap gap-2.5 p-0">
            {stageRows.map((stage, index) => (
              <li
                key={stage._id ?? stage.id}
                className="flex min-w-[158px] flex-1 flex-col gap-1.5 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-salis-gradient text-[10.5px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold text-heading">
                      {rtl ? stage.ar || stage.label : stage.label}
                    </span>
                    <span className="block truncate text-[10.5px] text-muted">
                      {rtl ? stage.ar_owner || stage.owner : stage.owner}
                    </span>
                  </span>
                </div>
                <span className="block truncate font-mono text-[10px] text-muted" dir="ltr">
                  {stage.at || '—'}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(280px,320px)]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Findings */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between gap-2.5 border-0 border-b border-solid border-border p-3.5">
              <div>
                <p className="font-display text-[14.5px] font-bold text-heading">
                  {t('Diagnostic findings')}
                </p>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  {t('Recorded by the technician from the OBD scan and visual inspection')}
                </p>
              </div>
              {criticalCount > 0 ? (
                <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">
                  {criticalCount} {t('critical')}
                </Badge>
              ) : null}
            </div>
            {findingRows.length === 0 ? (
              <div className="p-4">
                <EmptyState icon="SearchCheck" title={t('No findings recorded')} />
              </div>
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {findingRows.map((finding, index) => {
                  const sev = SEVERITY_TINT[finding.severity] ?? SEVERITY_TINT.advisory
                  return (
                    <li
                      key={finding._id ?? `${finding.finding}-${index}`}
                      className={
                        'flex items-start gap-3 p-3.5 ' +
                        (index ? 'border-0 border-t border-solid border-border' : '')
                      }
                    >
                      <span
                        className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ background: sev.bg, color: sev.fg }}
                      >
                        <Icon name={sev.icon} size={13} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {finding.dtc && finding.dtc !== '—' ? (
                            <span className="font-mono text-[11.5px] font-extrabold text-salis-blue">
                              {finding.dtc}
                            </span>
                          ) : null}
                          <span className="rounded-full bg-inset px-1.5 py-0.5 font-action text-[10px] font-semibold text-muted">
                            {rtl ? finding.ar_system || finding.system : finding.system}
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] text-body">
                          {rtl ? finding.ar || finding.finding : finding.finding}
                        </p>
                      </div>
                      <Badge background={sev.bg} color={sev.fg}>
                        {t(sev.label)}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* Parts */}
          <DataTable
            caption="Parts required"
            columns={partsColumns}
            rows={partRows as Part[]}
            rowKey={(part, index) => part._id ?? `${part.part}-${index}`}
            empty={<EmptyState icon="Package" title={t('No parts listed')} />}
            mobileCard={(part) => (
              <>
                <MobileCardHeader
                  leading={
                    <div className="min-w-0">
                      <span className="text-[12.5px] font-semibold text-heading">
                        {rtl ? part.ar || part.desc : part.desc}
                      </span>
                      <span className="block font-mono text-[10.5px] text-muted" dir="ltr">
                        {part.part}
                      </span>
                    </div>
                  }
                  trailing={
                    <Badge
                      background={part.stock === 'order' ? 'rgba(249,115,22,.13)' : 'rgba(10,94,215,.11)'}
                      color={part.stock === 'order' ? 'var(--salis-orange)' : 'var(--salis-blue)'}
                    >
                      {part.stock === 'order' ? t('On order') : t('In stock')}
                    </Badge>
                  }
                />
                <MobileCardRow label={t('Qty')} value={<span className="font-mono">{part.qty}</span>} />
                <MobileCardRow
                  label={t('Unit price')}
                  value={<Money sar={part.price} className="text-[12.5px] text-heading" />}
                />
              </>
            )}
          />

          {/* Labour */}
          <Card className="overflow-hidden p-0">
            <div className="border-0 border-b border-solid border-border p-3.5">
              <p className="font-display text-[14.5px] font-bold text-heading">
                {t('Labour & time')}
              </p>
            </div>
            {labourRows.length === 0 ? (
              <div className="p-4">
                <EmptyState icon="Clock" title={t('No labour lines yet')} />
              </div>
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {labourRows.map((line, index) => (
                  <li
                    key={line._id ?? `${line.task}-${index}`}
                    className={
                      'flex items-center gap-3 p-3.5 ' +
                      (index ? 'border-0 border-t border-solid border-border' : '')
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-heading">
                        {rtl ? line.ar || line.task : line.task}
                      </p>
                      <p className="mt-px text-[11px] text-muted">
                        {line.hrs} {t('hr')} × <Money sar={line.rate} bare className="text-muted" />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          {/* Cost build-up — the honest gap. */}
          <Card className="p-4">
            <p className="mb-3 font-display text-sm font-bold text-heading">{t('Cost build-up')}</p>
            <p className="rounded-lg bg-inset p-3 text-[11.5px] leading-relaxed text-muted">
              {t(
                'The priced total, handling fee and VAT are computed and issued by the estimate the server generates from this report — never in the browser. This report exposes the line figures above; it does not expose a total.'
              )}
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[rgba(10,94,215,.06)] p-2.5 text-[11.5px] text-body">
              <Icon name="FileCheck" size={14} className="flex-shrink-0 text-salis-blue" />
              {t('Totals live on the estimate, not this report.')}
            </div>
          </Card>

          {/* Distribution */}
          <Card className="p-4">
            <p className="mb-1 font-display text-[13.5px] font-bold text-heading">{t('Distribution')}</p>
            <p className="mb-3 text-[11.5px] leading-snug text-muted">
              {t('Every desk that holds a copy of this report.')}
            </p>
            {copyRows.length === 0 ? (
              <p className="text-[12px] text-muted">{t('No copies distributed yet.')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {copyRows.map((copy, index) => (
                  <div key={copy._id ?? `${copy.to}-${index}`} className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--tint-blue)] text-salis-blue">
                      <Icon name={copy.icon || 'Bell'} size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-heading">
                        {rtl ? copy.ar || copy.to : copy.to}
                      </p>
                      <p className="truncate font-mono text-[10.5px] text-muted" dir="ltr">
                        {copy.at}
                      </p>
                    </div>
                    <Badge
                      background={copy.state === 'saved' ? 'rgba(11,179,255,.12)' : 'rgba(10,94,215,.11)'}
                      color={copy.state === 'saved' ? 'var(--salis-blue-bright)' : 'var(--salis-blue)'}
                    >
                      {t(copy.state === 'saved' ? 'Saved' : 'Sent')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
