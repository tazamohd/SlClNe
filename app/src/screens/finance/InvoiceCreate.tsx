import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { Panel, FieldGrid, ReadField } from '@/components/ui/FieldGrid'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'

const VAT_RATE = 0.15

interface Line {
  id: number
  desc: string
  qty: number
  unit: number
}

/** Line items carried over from the completed job card. */
const INITIAL_LINES: Line[] = [
  { id: 1, desc: 'Brake Pads (Front) — Repair', qty: 1, unit: 310 },
  { id: 2, desc: 'Oil Filter (Toyota) — Maintenance', qty: 2, unit: 45 },
  { id: 3, desc: 'Air Filter (Universal)', qty: 1, unit: 95 },
  { id: 4, desc: 'Diagnostics — 1.5h', qty: 1, unit: 225 },
  { id: 5, desc: 'Brake Repair — 2h Labor', qty: 1, unit: 360 },
  { id: 6, desc: 'Multi-Point Inspection', qty: 1, unit: 170 },
  { id: 7, desc: 'Maintenance — Oil Change', qty: 1, unit: 590 },
]

/** Raise a ZATCA tax invoice.
 *
 *  The design's "Add Line" button was decorative and the totals were fixed
 *  strings. Here lines are editable and removable and the summary recomputes,
 *  which is the whole point of a create screen — otherwise it can only ever
 *  produce the one invoice it was mocked with. */
export function InvoiceCreate() {
  const { t, rtl } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const [lines, setLines] = useState<Line[]>(INITIAL_LINES)
  const [notes, setNotes] = useState('')

  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unit, 0)
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat

  function updateLine(id: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      { id: Math.max(0, ...prev.map((line) => line.id)) + 1, desc: '', qty: 1, unit: 0 },
    ])
  }

  function send() {
    if (!lines.length || subtotal <= 0) {
      toast.show({
        title: t('Error'),
        description: t('Add at least one line item before sending.'),
        error: true,
      })
      return
    }
    toast.show({ title: t('Invoice sent'), description: t('Sent to the customer for payment.') })
    setTimeout(() => navigate('/invoices'), 700)
  }

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <div>
        <Link
          to="/invoices"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Invoices')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="FilePlus" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading">
              {t('Create Invoice')}
            </h1>
            <p className="mt-0.5 font-mono text-sm text-muted" dir="ltr">
              INV-2026-0143
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-[rgba(10,94,215,.2)] bg-[rgba(10,94,215,.08)] px-3 py-1.5">
          <Icon name="ShieldCheck" size={14} className="text-salis-blue" />
          <span className="font-action text-xs font-semibold text-salis-blue">
            {t('ZATCA Ready')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <Panel icon="User" title={t('Bill To')}>
            <FieldGrid>
              <ReadField label={t('Customer')} value="Ahmed Al-Rashid" emphasis />
              <ReadField label={t('VAT Registration')} value="310456789012345" code />
              <ReadField label={t('Issue Date')} value="Jul 22, 2026" />
              <ReadField label={t('Payment Terms')} value={t('Net 30')} />
            </FieldGrid>
          </Panel>

          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Icon name="List" size={16} className="text-salis-blue" />
                <h3 className="text-sm font-bold text-heading">{t('Line Items')}</h3>
              </div>
              <Button variant="outline" size="sm" onClick={addLine}>
                <Icon name="Plus" size={12} />
                {t('Add Line')}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="border-b border-border px-5 py-2.5 text-start font-action text-[11px] font-semibold uppercase tracking-[.03em] text-muted"
                    >
                      {t('Description')}
                    </th>
                    <th
                      scope="col"
                      className="w-[70px] border-b border-border px-3 py-2.5 text-center font-action text-[11px] font-semibold uppercase tracking-[.03em] text-muted"
                    >
                      {t('Qty')}
                    </th>
                    <th
                      scope="col"
                      className="w-[110px] border-b border-border px-3 py-2.5 text-end font-action text-[11px] font-semibold uppercase tracking-[.03em] text-muted"
                    >
                      {t('Unit Price')}
                    </th>
                    <th
                      scope="col"
                      className="w-[110px] border-b border-border px-3 py-2.5 text-end font-action text-[11px] font-semibold uppercase tracking-[.03em] text-muted"
                    >
                      {t('Total')}
                    </th>
                    <th scope="col" className="w-10 border-b border-border">
                      <span className="sr-only">{t('Remove')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id}>
                      <td className="border-b border-border px-5 py-2">
                        <input
                          value={t(line.desc)}
                          onChange={(e) => updateLine(line.id, { desc: e.target.value })}
                          aria-label={t('Description')}
                          placeholder={t('Description')}
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-[13px] text-body outline-none focus:border-border focus:bg-inset"
                        />
                      </td>
                      <td className="border-b border-border px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={line.qty}
                          onChange={(e) =>
                            updateLine(line.id, { qty: Math.max(0, Number(e.target.value) || 0) })
                          }
                          aria-label={t('Qty')}
                          dir="ltr"
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-center font-mono text-[13px] text-body outline-none focus:border-border focus:bg-inset"
                        />
                      </td>
                      <td className="border-b border-border px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.unit}
                          onChange={(e) =>
                            updateLine(line.id, { unit: Math.max(0, Number(e.target.value) || 0) })
                          }
                          aria-label={t('Unit Price')}
                          dir="ltr"
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-end font-mono text-[13px] text-body outline-none focus:border-border focus:bg-inset"
                        />
                      </td>
                      <td className="border-b border-border px-3 py-2 text-end">
                        <Money sar={line.qty * line.unit} className="font-semibold text-heading" />
                      </td>
                      <td className="border-b border-border px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setLines((prev) => prev.filter((entry) => entry.id !== line.id))
                          }
                          aria-label={`${t('Remove')}: ${t(line.desc)}`}
                          className="flex cursor-pointer items-center justify-center rounded border-none bg-transparent p-1 text-muted transition-colors hover:text-salis-orange"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-col gap-1">
            <label htmlFor="notes" className="font-action text-[11px] font-medium text-heading">
              {t('Notes')}
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('Payment instructions, warranty terms...')}
              className="box-border w-full resize-none rounded border border-border bg-inset px-3 py-2.5 font-ui text-[13px] text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-2.5 p-5">
            <h3 className="text-sm font-bold text-heading">{t('Invoice Summary')}</h3>
            <div className="flex justify-between text-sm text-body">
              <span>{t('Subtotal')}</span>
              <Money sar={subtotal} className="font-semibold" />
            </div>
            <div className="flex justify-between text-sm text-body">
              <span>{t('VAT (15%)')}</span>
              <Money sar={vat} className="font-semibold" />
            </div>
            <div className="flex justify-between border-t border-border pt-2.5 text-xl font-extrabold text-heading">
              <span>{t('Total')}</span>
              <Money sar={total} className="font-extrabold" />
            </div>
          </Card>

          <div className="flex flex-col gap-2.5">
            <Button variant="outline" className="h-11 w-full border-border-strong text-body">
              <Icon name="Save" size={14} />
              {t('Save Draft')}
            </Button>
            <Button className="h-11 w-full" onClick={send}>
              <Icon name="Send" size={14} />
              {t('Send Invoice')}
            </Button>
          </div>

          <Card className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <Icon name="ShieldCheck" size={14} className="text-salis-blue" />
              <p className="font-action text-xs font-bold text-heading">{t('Tax Invoice')}</p>
            </div>
            <p className="text-[11px] leading-[1.5] text-muted">
              {t('ZATCA-compliant e-invoice. Scan the QR to verify with the tax authority.')}
            </p>
            <div className="mt-1 flex flex-col gap-1 border-t border-border pt-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted">{t('Seller')}</span>
                <span className="text-body">SALIS AUTO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t('VAT Registration')}</span>
                <span className="font-mono text-body" dir="ltr">
                  300123456700003
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
