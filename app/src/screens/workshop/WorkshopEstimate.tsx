import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Money } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { StageNotice, stageBusy, stageLabel } from './StageNotice'
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
  const { t, rtl } = usePreferences()
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


  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <div>
        <Link
          to="/job-cards"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Back to Job Cards')}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
          <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Calculator" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[26px] font-black text-heading">{t('Cost Estimate')}</h1>
          <p className="mt-0.5 text-sm text-muted" dir="ltr">
            {stage.job ? `${stage.job.id} · ${stage.job.veh}` : '—'}
          </p>
        </div>
      </div>

      <WorkflowStepper current={stage.stageLabel} />

      <StageNotice stage={stage} />

      <Panel icon="Package" title={t('Parts')}>
        <LineTable
          headers={[t('Description'), t('Quantity'), t('Unit Price'), t('Total')]}
          rows={PARTS.map((row) => ({
            key: row.desc,
            cells: [
              t(row.desc),
              String(row.qty),
              <Money key="unit" sar={row.unit} />,
              <Money key="total" sar={row.qty * row.unit} className="font-semibold" />,
            ],
          }))}
        />
      </Panel>

      <Panel icon="Wrench" title={t('Labor')}>
        <LineTable
          headers={[t('Description'), t('Hours'), t('Rate'), t('Total')]}
          rows={LABOUR.map((row) => ({
            key: row.desc,
            cells: [
              t(row.desc),
              row.hours.toFixed(1),
              <span key="rate" dir="ltr" className="font-mono">
                {`SAR ${row.rate}/hr`}
              </span>,
              <Money key="total" sar={row.hours * row.rate} className="font-semibold" />,
            ],
          }))}
        />
      </Panel>

      <Card className="flex flex-col gap-2.5 self-end p-6 sm:min-w-[360px]">
        <TotalRow label={t('Subtotal')} sar={subtotal} />
        <TotalRow label={t('VAT (15%)')} sar={vat} />
        <div className="flex justify-between border-t border-border pt-2.5 text-lg font-extrabold text-heading">
          <span>{t('Grand Total')}</span>
          <Money sar={grandTotal} className="font-extrabold" />
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" size="lg" onClick={() => navigate('/customer-approval')}>
          <Icon name="Send" size={16} />
          {t('Send to Customer')}
        </Button>
        <Button
          size="lg"
          onClick={() => void approve()}
          disabled={mayApprove && stageBusy(stage)}
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

function TotalRow({ label, sar }: { label: string; sar: number }) {
  return (
    <div className="flex justify-between text-sm text-body">
      <span>{label}</span>
      <Money sar={sar} className="font-semibold" />
    </div>
  )
}

function LineTable({
  headers,
  rows,
}: {
  headers: readonly string[]
  rows: readonly { key: string; cells: readonly React.ReactNode[] }[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm text-heading">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={header}
                scope="col"
                className={
                  'h-9 whitespace-nowrap border-b border-border text-xs font-semibold uppercase tracking-[.05em] text-muted ' +
                  (index === 0 ? 'text-start' : 'text-end')
                }
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, index) => (
                <td
                  key={index}
                  className={
                    'border-b border-border py-2.5 align-middle last:border-b-0 ' +
                    (index === 0 ? 'text-start text-body' : 'text-end')
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
