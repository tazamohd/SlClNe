import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BackLink } from '@/components/ui/BackLink'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Money, SummaryRow } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection, type RowOf } from '@/data/useCollection'
import { StageNotice, stageBusy, stageLabel } from './StageNotice'
import { useJobStage } from './useJobStage'
import { fetchEstimateLines, RepositoryError, type EstimateLineRow } from './api'

/** The live estimate row carries the VAT split the server computed from the
 *  lines (F-029); the fixture row carries only the pre-formatted `amount`, so
 *  every added field is optional. */
type Estimate = RowOf<'estimates'> & {
  _id?: string
  totalHalalas?: number
  subtotalHalalas?: number
  taxHalalas?: number
}

/** Stage 3 — price the work found during inspection.
 *
 *  Parts and labour are the estimate's real line items (`GET
 *  /estimates/:id/lines`), matched to this job card through `estimates`'
 *  `jobCardId` filter — the same seam `EstimateDetail` reads. The summary
 *  shows the subtotal/VAT/total the server computed rather than re-summing
 *  money in the browser (§5b); a per-row total in the tables is still a
 *  display-only `qty × unit`, same as every other line-item table in the app.
 *
 *  Approval is bounded by the signed-in role's SAR limit: an advisor (5,000)
 *  can approve this estimate, a technician (0) never can, and anything above a
 *  role's ceiling routes to the Approval Inbox instead (README §4). */
export function WorkshopEstimate() {
  const { t } = usePreferences()
  const { canApprove, roleMeta } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const stage = useJobStage()

  const estimates = useCollection('estimates', { filter: { jobCardId: stage.job?._id ?? '' } })
  const estimateRows = (estimates.data ?? []) as readonly Estimate[]
  const estimate = estimateRows[0]
  const ref = estimate?._id ?? estimate?.id

  /* Line items are a sub-resource, not a collection — fetched directly, same
   * as `EstimateDetail`. In the fixture build the call throws `unsupported`;
   * the tables render that as an honest empty state rather than a fabricated
   * row. */
  const lines = useQuery<{ rows: EstimateLineRow[] }, RepositoryError>({
    queryKey: ['estimate-lines', ref],
    queryFn: () => fetchEstimateLines(ref as string),
    enabled: Boolean(ref),
    retry: false,
  })

  const lineRows = lines.data?.rows ?? []
  const parts = lineRows.filter((row) => row.kind !== 'labour')
  const labour = lineRows.filter((row) => row.kind === 'labour')

  const subtotal = estimate?.subtotalHalalas != null ? estimate.subtotalHalalas / 100 : 0
  const vat = estimate?.taxHalalas != null ? estimate.taxHalalas / 100 : 0
  const grandTotal = estimate?.totalHalalas != null ? estimate.totalHalalas / 100 : 0

  const mayApprove = canApprove(grandTotal)
  const limit = roleMeta.limit
  const linesLoading = estimates.isLoading || (Boolean(ref) && lines.isLoading)
  const lineItemsEmpty = (
    <EmptyState
      icon="ReceiptText"
      title={t('No line items to show')}
      description={
        !ref
          ? t('No estimate is linked to this job card yet.')
          : lines.isError
            ? t('Line items load from the API. Connect a live server to see them.')
            : t('This estimate has no line items yet.')
      }
    />
  )

  async function approve() {
    if (!estimate) {
      toast.show({
        title: t("Couldn't approve"),
        description: t('No estimate is linked to this job card yet.'),
        error: true,
      })
      return
    }
    if (!mayApprove) {
      toast.show({
        title: t('Above your approval limit'),
        description: t('Sent to the approval inbox for sign-off.'),
      })
      navigate('/approval-inbox')
      return
    }
    /* Approving the estimate is what releases the work, so the stage moves to
     * `repair` — not to `qc`. The rail skips no gate: whoever moves the card
     * out of repair is claiming to have done it, and that is the person the
     * quality gate must not be (F-004). */
    await stage.advance('repair', {
      reason: `estimate approved by ${roleMeta.label}`,
      then: '/workshop-qc',
    })
  }

  const partsColumns: Column<EstimateLineRow>[] = [
    { header: 'Description', cell: (row) => row.description },
    { header: 'Quantity', cell: (row) => String(row.qty) },
    { header: 'Unit Price', cell: (row) => <Money sar={row.unitPriceHalalas / 100} /> },
    { header: 'Total', cell: (row) => <Money sar={(row.qty * row.unitPriceHalalas) / 100} className="font-semibold" /> },
  ]

  const labourColumns: Column<EstimateLineRow>[] = [
    { header: 'Description', cell: (row) => row.description },
    { header: 'Hours', cell: (row) => row.qty.toFixed(1) },
    { header: 'Rate', cell: (row) => <span dir="ltr" className="font-mono">{`SAR ${(row.unitPriceHalalas / 100).toFixed(2)}/hr`}</span> },
    { header: 'Total', cell: (row) => <Money sar={(row.qty * row.unitPriceHalalas) / 100} className="font-semibold" /> },
  ]

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <BackLink to="/job-cards" label="Back to Job Cards" />

      <div className="flex items-center gap-3">
        {!isMobile && (
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="Calculator" size={28} />
            </div>
          </div>
        )}
        <div>
          <h1 className={`font-display font-black text-heading ${isMobile ? 'text-xl' : 'text-[26px]'}`}>{t('Cost Estimate')}</h1>
          <p className="mt-0.5 text-sm text-muted" dir="ltr">
            {stage.job ? `${stage.job.id} · ${stage.job.veh}` : '—'}
          </p>
        </div>
      </div>

      <WorkflowStepper current={stage.stageLabel} />

      <StageNotice stage={stage} />

      <Panel icon="Package" title={t('Parts')}>
        <DataTable
          caption="Parts line items"
          columns={partsColumns}
          rows={parts}
          rowKey={(row) => row.id}
          loading={linesLoading}
          empty={lineItemsEmpty}
          mobileCard={(row) => (
            <>
              <MobileCardHeader
                leading={<span className="text-[13px] text-body">{row.description}</span>}
                trailing={<span className="text-[13px] font-semibold text-heading"><Money sar={(row.qty * row.unitPriceHalalas) / 100} /></span>}
              />
              <MobileCardRow label={t('Quantity')} value={String(row.qty)} />
              <MobileCardRow label={t('Unit Price')}><Money sar={row.unitPriceHalalas / 100} /></MobileCardRow>
            </>
          )}
        />
      </Panel>

      <Panel icon="Wrench" title={t('Labor')}>
        <DataTable
          caption="Labour line items"
          columns={labourColumns}
          rows={labour}
          rowKey={(row) => row.id}
          loading={linesLoading}
          empty={lineItemsEmpty}
          mobileCard={(row) => (
            <>
              <MobileCardHeader
                leading={<span className="text-[13px] text-body">{row.description}</span>}
                trailing={<span className="text-[13px] font-semibold text-heading"><Money sar={(row.qty * row.unitPriceHalalas) / 100} /></span>}
              />
              <MobileCardRow label={t('Hours')} value={row.qty.toFixed(1)} />
              <MobileCardRow label={t('Rate')}><span dir="ltr">{`SAR ${(row.unitPriceHalalas / 100).toFixed(2)}/hr`}</span></MobileCardRow>
            </>
          )}
        />
      </Panel>

      <Card className={`flex flex-col gap-2.5 p-6 ${isMobile ? 'w-full' : 'self-end sm:min-w-[360px]'}`}>
        <SummaryRow label={t('Subtotal')} sar={subtotal} />
        <SummaryRow label={t('VAT (15%)')} sar={vat} />
        <div className="flex justify-between border-t border-border pt-2.5 text-lg font-extrabold text-heading">
          <span>{t('Grand Total')}</span>
          <Money sar={grandTotal} className="font-extrabold" />
        </div>
      </Card>

      <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-wrap justify-end'}`}>
        {/* Named "Preview", not "Send": nothing here delivers this to the
            customer over any channel, and this screen's estimate is not yet
            a real, savable record (§workshop-estimate — tracked separately),
            so there is no id to link even in principle. */}
        <Button variant="outline" size="lg" onClick={() => navigate('/customer-approval')} className={isMobile ? 'w-full' : ''}>
          <Icon name="ExternalLink" size={16} />
          {t('Preview Customer Approval')}
        </Button>
        <Button
          size="lg"
          onClick={() => void approve()}
          disabled={!estimate || (mayApprove && stageBusy(stage))}
          className={isMobile ? 'w-full' : ''}
        >
          <Icon name="CheckCircle" size={18} />
          {t(stageLabel(stage, 'Approve Estimate'))}
        </Button>
      </div>

      {/* Say up front where the button will actually take them. Discovering
          your ceiling only after pressing Approve is the kind of thing that
          gets worked around. */}
      {!mayApprove ? (
        <p className="flex items-center justify-end gap-1.5 text-[13px] text-muted">
          <Icon name="Info" size={14} className="text-salis-blue" />
          {limit === 0
            ? t('Your role cannot approve estimates — this will be sent for sign-off.')
            : `${t('Above your approval limit')} (${t('Limit')}: SAR ${limit?.toLocaleString('en-US')})`}
        </p>
      ) : null}
    </div>
  )
}

