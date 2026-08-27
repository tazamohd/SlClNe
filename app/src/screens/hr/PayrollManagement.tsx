import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { parseSar } from '@/components/ui/Money'
import { EmptyState, ErrorState, Loading, ReadOnlyNotice } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, useCreate, queryKeys } from '@/data/useCollection'
import { can } from '@/data/rbac'
import { isLive, type EmployeeRow, type PayrollLineRow, type PayrollRunRow } from '@/data/repository'
import { actionFailureMessage, isRefusal, postPayrollRun } from './api'
import { ConnectApi, Pay, ProvenanceNote, StatusPill } from './bits'

/** Payroll Management (`Payroll-Management`, `/payroll-management`).
 *
 *  Runs list → open a run to see its per-employee lines (gross / allowances /
 *  deductions / net, every figure the server's, redaction-aware). A draft run
 *  can gain lines and then be **posted** — `POST /payroll/runs/:id/post` freezes
 *  the totals from the lines. Posting encodes the §5b invariant: **a posted run
 *  cannot be reopened or edited**, so once `status === 'posted'` every edit
 *  affordance (add line, post) is gone and a read-only notice takes its place.
 *  The server is the boundary — a second post 409s regardless of the UI.
 *
 *  Net pay is never computed here: it is `gross + allowances − deductions` on the
 *  server, and the client only displays it. Create/edit are gated on `hr:c`/`hr:e`
 *  as UX the server re-checks.
 *
 *  Provenance: feature-map spec + screenshot, no `.dc.html` — design-system
 *  layout, borrowing the pixel-designed `HRPayroll` payroll table. See `./bits`.
 */

export function PayrollManagement() {
  const { t } = usePreferences()
  const { role } = useSession()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const runs = useCollection('payrollRuns', { sort: 'period:desc' })
  const rows = (runs.data ?? []) as readonly PayrollRunRow[]
  const canCreate = can('hr', 'c', role)

  const selected = rows.find((r) => (r._id ?? r.period) === selectedId) ?? null

  return (
    <div className="flex max-w-[1100px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="CreditCard" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Payroll Management')}</h1>
            <p className="mt-1 text-sm text-muted">{t('Monthly payroll runs and their lines')}</p>
          </div>
        </div>
        <Button
          onClick={() => setCreating(true)}
          disabled={!canCreate || !isLive}
          title={
            !isLive
              ? t('Connect a live API to create a run')
              : canCreate
                ? undefined
                : t('Your role cannot create a payroll run')
          }
        >
          <Icon name="Plus" size={16} />
          {t('New draft run')}
        </Button>
      </div>
      <ProvenanceNote />

      {!isLive ? (
        <ConnectApi
          icon="CreditCard"
          title="No payroll runs to show"
          description="Payroll runs and their frozen totals live on the server — a total is summed in SQL over the tenant and cannot be faked here. Connect a live API to create, line up and post a run."
          collection="payrollRuns"
        />
      ) : runs.isLoading ? (
        <Loading label="Loading payroll runs..." />
      ) : runs.isError ? (
        <ErrorState description={runs.error?.message} onRetry={() => void runs.refetch()} />
      ) : rows.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="CreditCard"
            title={t('No payroll runs yet')}
            description={t('Create a draft run for a month, add its lines, then post it.')}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="m-0 flex list-none flex-col p-0">
            {rows.map((run, index) => (
              <li
                key={run._id ?? run.period}
                className={
                  'flex flex-wrap items-center gap-3 p-3.5 sm:flex-nowrap ' +
                  (index ? 'border-0 border-t border-solid border-border' : '')
                }
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(10,94,215,.1)] text-salis-blue">
                  <Icon name="Calendar" size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-heading" dir="ltr">
                      {run.period}
                    </span>
                    <StatusPill value={run.status} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {run.status === 'posted' && run.postedAt
                      ? `${t('Posted')} ${run.postedAt.slice(0, 10)}`
                      : t('Draft — not yet posted')}
                  </p>
                </div>
                <div className="min-w-[120px] flex-shrink-0 text-end">
                  <Pay halalas={run.netPayHalalas} className="text-sm font-extrabold text-heading" />
                  <p className="mt-0.5 text-[11px] text-muted">{t('Net pay')}</p>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  <Button variant="outline" size="sm" onClick={() => setSelectedId(run._id ?? run.period)}>
                    {t('Open')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {selected ? <RunDetail run={selected} onClose={() => setSelectedId(null)} /> : null}
      {creating ? <CreateRun onClose={() => setCreating(false)} /> : null}
    </div>
  )
}

// ── Run detail: lines, add-line, post ────────────────────────────────────────

function RunDetail({ run, onClose }: { run: PayrollRunRow; onClose: () => void }) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { role } = useSession()
  const toast = useToast()
  const client = useQueryClient()
  const runRef = run._id ?? run.period

  const lines = useCollection('payrollLines', { filter: { payrollRunId: run._id ?? '' } })
  const lineRows = (lines.data ?? []) as readonly PayrollLineRow[]

  const posted = run.status === 'posted'
  const canEdit = can('hr', 'e', role)
  const canPost = canEdit
  const [adding, setAdding] = useState(false)
  const [posting, setPosting] = useState(false)

  async function post() {
    setPosting(true)
    try {
      await postPayrollRun(runRef)
      void client.invalidateQueries({ queryKey: queryKeys.all('payrollRuns') })
      void client.invalidateQueries({ queryKey: queryKeys.all('payrollLines') })
      toast.show({ title: t('Payroll run posted'), description: run.period })
      onClose()
    } catch (cause) {
      toast.show({
        title: isRefusal(cause) ? t('Cannot post this run') : t('Posting failed'),
        description: actionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    } finally {
      setPosting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="lifecycle"
      icon="CreditCard"
      title={`${t('Payroll')} ${run.period}`}
      meta={<StatusPill value={run.status} />}
      dismissible={!posting}
    >
      <div className="flex flex-col gap-3">
        {posted ? (
          <ReadOnlyNotice
            message={t('This run is posted. Its totals are frozen and it cannot be reopened or edited.')}
          />
        ) : null}

        {lines.isLoading ? (
          <Loading label="Loading lines..." />
        ) : lines.isError ? (
          <ErrorState description={lines.error?.message} onRetry={() => void lines.refetch()} />
        ) : lineRows.length === 0 ? (
          <Card className="p-4">
            <EmptyState
              icon="Users"
              title={t('No lines on this run')}
              description={posted ? t('This run was posted with no lines.') : t('Add a line per employee, then post.')}
            />
          </Card>
        ) : isMobile ? (
            <div className="divide-y divide-border">
              {lineRows.map((line, index) => (
                <div key={line._id ?? `${line.employeeId}-${index}`} className="px-3 py-2.5">
                  <MobileCardHeader
                    leading={<span className="text-[13px] font-medium text-body">{line.employeeName}</span>}
                    trailing={
                      <span className="font-mono text-[13px] font-bold text-heading">
                        <Pay halalas={line.netPayHalalas} bare />
                      </span>
                    }
                  />
                  <MobileCardRow
                    label={t('Gross')}
                    value={<span className="font-mono"><Pay halalas={line.grossPayHalalas} bare /></span>}
                  />
                  <MobileCardRow
                    label={t('Allowances')}
                    value={<span className="font-mono text-salis-blue"><Pay halalas={line.allowancesHalalas} bare /></span>}
                  />
                  <MobileCardRow
                    label={t('Deductions')}
                    value={<span className="font-mono text-salis-orange"><Pay halalas={line.deductionsHalalas} bare /></span>}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Employee', 'Gross', 'Allowances', 'Deductions', 'Net'].map((h) => (
                      <th
                        key={h}
                        className={
                          'whitespace-nowrap border-0 border-b border-solid border-border px-3 py-2 font-action text-[11px] font-semibold uppercase text-muted ' +
                          (h === 'Employee' ? 'text-start' : 'text-end')
                        }
                      >
                        {t(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineRows.map((line, index) => (
                    <tr
                      key={line._id ?? `${line.employeeId}-${index}`}
                      className={index ? 'border-0 border-t border-solid border-border' : ''}
                    >
                      <td className="px-3 py-2 text-[13px] font-medium text-body">{line.employeeName}</td>
                      <td className="px-3 py-2 text-end font-mono text-[12px] text-body">
                        <Pay halalas={line.grossPayHalalas} bare />
                      </td>
                      <td className="px-3 py-2 text-end font-mono text-[12px] text-salis-blue">
                        <Pay halalas={line.allowancesHalalas} bare />
                      </td>
                      <td className="px-3 py-2 text-end font-mono text-[12px] text-salis-orange">
                        <Pay halalas={line.deductionsHalalas} bare />
                      </td>
                      <td className="px-3 py-2 text-end font-mono text-[13px] font-bold text-heading">
                        <Pay halalas={line.netPayHalalas} bare />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        {/* Frozen run totals — the server's figures, shown after posting. */}
        {posted ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-inset px-3.5 py-2.5">
            <span className="text-[13px] font-bold text-heading">{t('Total net pay')}</span>
            <Pay halalas={run.netPayHalalas} className="text-sm font-extrabold text-heading" />
          </div>
        ) : null}

        {/* Edit affordances only while draft — the invariant, in the UI. */}
        {!posted ? (
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdding(true)}
              disabled={!canEdit}
              title={canEdit ? undefined : t('Your role cannot edit a payroll run')}
            >
              <Icon name="Plus" size={13} />
              {t('Add line')}
            </Button>
            <Button
              size="sm"
              onClick={() => void post()}
              disabled={posting || !canPost || lineRows.length === 0}
              title={
                !canPost
                  ? t('Your role cannot post a payroll run')
                  : lineRows.length === 0
                    ? t('Add at least one line before posting')
                    : undefined
              }
            >
              <Icon name="CheckCircle" size={13} />
              {t(posting ? 'Posting...' : 'Post run')}
            </Button>
          </div>
        ) : null}
      </div>

      {adding && !posted ? (
        <AddLine runId={run._id ?? ''} onClose={() => setAdding(false)} />
      ) : null}
    </Modal>
  )
}

function AddLine({ runId, onClose }: { runId: string; onClose: () => void }) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const create = useCreate('payrollLines')
  const employees = useCollection('employees', { sort: 'name:asc' })
  const empRows = (employees.data ?? []) as readonly EmployeeRow[]

  const [employeeId, setEmployeeId] = useState('')
  const [gross, setGross] = useState('')
  const [allowances, setAllowances] = useState('')
  const [deductions, setDeductions] = useState('')
  const [busy, setBusy] = useState(false)

  const grossHalalas = Math.round(parseSar(gross) * 100)
  const valid = Boolean(runId) && Boolean(employeeId) && gross.trim().length > 0 && grossHalalas >= 0

  async function submit() {
    if (!valid) return
    setBusy(true)
    try {
      // The create body is the contract's `payrollLineCreate`: run, employee and
      // the raw halalas inputs `grossHalalas` / `allowancesHalalas` /
      // `deductionsHalalas`. The presented row exposes them as `grossPayHalalas`
      // etc., but the server reads the contract's names, so send those — the net
      // is computed server-side and never sent.
      const input = {
        payrollRunId: runId,
        employeeId,
        grossHalalas,
        ...(allowances.trim() ? { allowancesHalalas: Math.round(parseSar(allowances) * 100) } : {}),
        ...(deductions.trim() ? { deductionsHalalas: Math.round(parseSar(deductions) * 100) } : {}),
      }
      await create.mutateAsync({ input: input as unknown as Partial<PayrollLineRow> })
      void client.invalidateQueries({ queryKey: queryKeys.all('payrollLines') })
      toast.show({ title: t('Line added') })
      onClose()
    } catch (cause) {
      toast.show({
        title: t('Could not add the line'),
        description: actionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="crud"
      icon="UserPlus"
      title="Add payroll line"
      dismissible={!busy}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={busy}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => void submit()} disabled={!valid || busy}>
            {t(busy ? 'Adding...' : 'Add line')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="line-emp" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Employee')}
        </label>
        <select
          id="line-emp"
          value={employeeId}
          disabled={busy || empRows.length === 0}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="h-11 w-full rounded border border-border bg-inset px-3.5 font-action text-sm text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{t('Select an employee')}</option>
          {empRows.map((e) => (
            <option key={e._id ?? e.employeeNumber} value={e._id ?? ''}>
              {e.employeeNumber} — {e.name}
            </option>
          ))}
        </select>
        {empRows.length === 0 ? (
          <span className="text-[11px] text-muted">{t('No employees are loaded to line up.')}</span>
        ) : null}
      </div>

      {(
        [
          ['line-gross', 'Gross pay (SAR)', gross, setGross],
          ['line-allow', 'Allowances (SAR)', allowances, setAllowances],
          ['line-deduct', 'Deductions (SAR)', deductions, setDeductions],
        ] as const
      ).map(([id, label, value, set]) => (
        <div key={id} className="flex flex-col gap-1.5">
          <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
            {t(label)}
          </label>
          <Input
            id={id}
            inputSize="md"
            inputMode="decimal"
            dir="ltr"
            value={value}
            disabled={busy}
            onChange={(e) => set(e.target.value)}
            placeholder="0.00"
          />
        </div>
      ))}
      <p className="text-[11px] text-muted">
        {t('Net pay is computed on the server as gross + allowances − deductions.')}
      </p>
    </Modal>
  )
}

function CreateRun({ onClose }: { onClose: () => void }) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const create = useCreate('payrollRuns')

  const [period, setPeriod] = useState('')
  const [busy, setBusy] = useState(false)
  const valid = /^\d{4}-\d{2}$/.test(period)

  async function submit() {
    if (!valid) return
    setBusy(true)
    try {
      const row = await create.mutateAsync({ input: { period } as Partial<PayrollRunRow> })
      void client.invalidateQueries({ queryKey: queryKeys.all('payrollRuns') })
      toast.show({ title: t('Draft run created'), description: row.period })
      onClose()
    } catch (cause) {
      toast.show({
        title: t('Could not create the run'),
        description: actionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="crud"
      icon="CalendarPlus"
      title="New payroll run"
      dismissible={!busy}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={busy}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => void submit()} disabled={!valid || busy}>
            {t(busy ? 'Creating...' : 'Create draft')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="run-period" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Period (YYYY-MM)')}
        </label>
        <Input
          id="run-period"
          inputSize="md"
          dir="ltr"
          value={period}
          invalid={period.length > 0 && !valid}
          disabled={busy}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder="2026-08"
        />
        {period.length > 0 && !valid ? (
          <span className="text-[11px] text-salis-orange">{t('Use the calendar-month form YYYY-MM.')}</span>
        ) : null}
      </div>
    </Modal>
  )
}
