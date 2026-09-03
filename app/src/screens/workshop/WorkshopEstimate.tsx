import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Money, SummaryRow } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { StageFrame } from './StageFrame'
import { stageBusy } from './StageNotice'
import { useJobStage } from './useJobStage'

/** VAT rate for KSA (ZATCA). */
const VAT_RATE = 0.15

const PARTS = [
  { desc: 'Oil Filter (Toyota)', qty: 1, unit: 45 },
  { desc: 'Brake Pads (Front)', qty: 1, unit: 310 },
  { desc: 'Air Filter (Universal)', qty: 1, unit: 95 },
  { desc: 'Spark Plug Set', qty: 1, unit: 140 },
]

const LABOUR = [
  { desc: 'Maintenance: Diagnostics', hours: 1.5, rate: 150 },
  { desc: 'Repair: Brakes & Suspension', hours: 2.0, rate: 180 },
  { desc: 'Inspection: Multi-Point Inspection', hours: 1.0, rate: 170 },
]

/** Stage 3 — price the work found during inspection.
 *
 *  Totals are computed from the line items rather than hardcoded, so editing a
 *  line can't leave the footer disagreeing with the table. The design's fixed
 *  figures (1,345 / 201.75 / 1,546.75) fall out of the same arithmetic.
 *
 *  Approval is bounded by the signed-in role's SAR limit: an advisor (5,000)
 *  can approve this estimate, a technician (0) never can, and anything above a
 *  role's ceiling routes to the Approval Inbox instead (README §4). */
export function WorkshopEstimate() {
  const { t } = usePreferences()
  const { canApprove, roleMeta } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const stage = useJobStage()

  const partsTotal = PARTS.reduce((sum, row) => sum + row.qty * row.unit, 0)
  const labourTotal = LABOUR.reduce((sum, row) => sum + row.hours * row.rate, 0)
  const subtotal = partsTotal + labourTotal
  const vat = subtotal * VAT_RATE
  const grandTotal = subtotal + vat

  const mayApprove = canApprove(grandTotal)
  const limit = roleMeta.limit

  async function approve() {
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

  const partsColumns: Column<(typeof PARTS)[number]>[] = [
    { header: 'Description', cell: (row) => t(row.desc) },
    { header: 'Quantity', cell: (row) => String(row.qty), numeric: true },
    { header: 'Unit Price', cell: (row) => <Money sar={row.unit} />, numeric: true },
    { header: 'Total', cell: (row) => <Money sar={row.qty * row.unit} className="font-semibold" />, numeric: true },
  ]

  const labourColumns: Column<(typeof LABOUR)[number]>[] = [
    { header: 'Description', cell: (row) => t(row.desc) },
    { header: 'Hours', cell: (row) => row.hours.toFixed(1), numeric: true },
    { header: 'Rate', cell: (row) => <span dir="ltr" className="font-mono">{`SAR ${row.rate}/hr`}</span>, numeric: true },
    { header: 'Total', cell: (row) => <Money sar={row.hours * row.rate} className="font-semibold" />, numeric: true },
  ]

  return (
    <StageFrame
      icon="Calculator"
      title="Cost Estimate"
      stage={stage}
      subtitle={<span dir="ltr">{stage.job ? `${stage.job.id} · ${stage.job.veh}` : '—'}</span>}
      actions={
        <>
          <Button variant="outline" size="lg" icon="Send" onClick={() => navigate('/customer-approval')}>
            {t('Send to Customer')}
          </Button>
          <Button
            size="lg"
            icon="CheckCircle"
            loading={stage.status === 'saving'}
            loadingLabel="Saving..."
            onClick={() => void approve()}
            disabled={mayApprove && stageBusy(stage)}
          >
            {t('Approve Estimate')}
          </Button>
        </>
      }
    >
      <Panel icon="Package" title={t('Parts')}>
        <DataTable
          caption="Parts line items"
          columns={partsColumns}
          rows={PARTS}
          rowKey={(row) => row.desc}
          pageSize={false}
          mobileCard={(row) => (
            <>
              <MobileCardHeader
                leading={<span className="text-[13px] text-body">{t(row.desc)}</span>}
                trailing={<span className="text-[13px] font-semibold text-heading"><Money sar={row.qty * row.unit} /></span>}
              />
              <MobileCardRow label={t('Quantity')} value={String(row.qty)} />
              <MobileCardRow label={t('Unit Price')}><Money sar={row.unit} /></MobileCardRow>
            </>
          )}
        />
      </Panel>

      <Panel icon="Wrench" title={t('Labor')}>
        <DataTable
          caption="Labour line items"
          columns={labourColumns}
          rows={LABOUR}
          rowKey={(row) => row.desc}
          pageSize={false}
          mobileCard={(row) => (
            <>
              <MobileCardHeader
                leading={<span className="text-[13px] text-body">{t(row.desc)}</span>}
                trailing={<span className="text-[13px] font-semibold text-heading"><Money sar={row.hours * row.rate} /></span>}
              />
              <MobileCardRow label={t('Hours')} value={row.hours.toFixed(1)} />
              <MobileCardRow label={t('Rate')}><span dir="ltr">{`SAR ${row.rate}/hr`}</span></MobileCardRow>
            </>
          )}
        />
      </Panel>

      <Card className="flex w-full flex-col gap-2.5 p-6 sm:w-[360px] sm:self-end">
        <SummaryRow label={t('Subtotal')} sar={subtotal} />
        <SummaryRow label={t('VAT (15%)')} sar={vat} />
        <div className="flex justify-between border-t border-border pt-2.5 text-lg font-extrabold text-heading">
          <span>{t('Grand Total')}</span>
          <Money sar={grandTotal} className="font-extrabold" />
        </div>
      </Card>

      {/* Say up front where the button will actually take them. Discovering
          your ceiling only after pressing Approve is the kind of thing that
          gets worked around. */}
      {!mayApprove ? (
        <p className="flex items-center gap-1.5 text-[13px] text-muted sm:justify-end">
          <Icon name="Info" size={14} className="text-salis-blue" />
          {limit === 0
            ? t('Your role cannot approve estimates — this will be sent for sign-off.')
            : `${t('Above your approval limit')} (${t('Limit')}: SAR ${limit?.toLocaleString('en-US')})`}
        </p>
      ) : null}
    </StageFrame>
  )
}
