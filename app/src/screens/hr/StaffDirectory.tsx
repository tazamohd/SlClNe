import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { parseSar } from '@/components/ui/Money'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, usePagedCollection, useCreate, queryKeys } from '@/data/useCollection'
import { can } from '@/data/rbac'
import { isLive, type EmployeeRow } from '@/data/repository'
import type { RowOf } from '@/data/useCollection'
import { actionFailureMessage } from './api'
import { Avatar, ConnectApi, Pay, ProvenanceNote, StatCard, StatusPill } from './bits'

/** The staff directory / HR management workspace.
 *
 *  Registered under both `Staff-Directory` and `HR-Management` — the feature map
 *  lists them as separate screens, but the backend serves one `employees`
 *  collection and the reference screenshots show the same directory, so one
 *  honest component answers both rather than two that would drift.
 *
 *  Salary is sensitive: it arrives `null` for a role the `Employee salary` field
 *  rule hides pay from (the server nulls it on the wire), and a null renders as a
 *  locked placeholder through `Pay` — never a zero, never reconstructed from
 *  another field. The `hr` module gates the collection server-side; the create
 *  gate below is UX the server re-checks.
 *
 *  Provenance: feature-map spec + screenshot, no `.dc.html` — design-system
 *  layout, borrowing the pixel-designed `HRPayroll` directory table. See `./bits`.
 */

const STATUSES: readonly EmployeeRow['status'][] = ['active', 'on_leave', 'terminated']

type Dept = RowOf<'departments'> & { _id?: string }

export function StaffDirectory() {
  const { t } = usePreferences()
  const { role } = useSession()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | EmployeeRow['status']>('all')
  const [selected, setSelected] = useState<EmployeeRow | null>(null)
  const [creating, setCreating] = useState(false)

  const query = useMemo(
    () => ({
      sort: 'employeeNumber:asc',
      ...(q.trim() ? { q: q.trim() } : {}),
      ...(filter === 'all' ? {} : { filter: { status: filter } }),
    }),
    [q, filter],
  )

  const employees = usePagedCollection('employees', query)
  const departments = useCollection('departments')
  const deptName = useMemo(() => {
    const map = new Map<string, string>()
    for (const d of (departments.data ?? []) as Dept[]) {
      if (d._id) map.set(d._id, d.name)
    }
    return map
  }, [departments.data])

  const rows = (employees.data?.rows ?? []) as readonly EmployeeRow[]
  const total = employees.data?.page.total ?? 0
  const canCreate = can('hr', 'c', role)

  const columns: Column<EmployeeRow>[] = [
    { header: 'Number', cell: (e) => e.employeeNumber, code: true },
    { header: 'Name', cell: (e) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={e.name} />
        <span className="text-[13px] font-semibold text-heading">{e.name}</span>
      </div>
    ) },
    { header: 'Title', cell: (e) => e.title || '—' },
    { header: 'Department', cell: (e) => (e.departmentId && deptName.get(e.departmentId)) || '—' },
    { header: 'Status', cell: (e) => <StatusPill value={e.status} /> },
    { header: 'Salary', cell: (e) => <Pay halalas={e.salaryHalalas} bare />, code: true },
  ]

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Users" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Staff Directory')}</h1>
            <p className="mt-1 text-sm text-muted">{t('Employees, departments and status')}</p>
          </div>
        </div>
        <Button
          onClick={() => setCreating(true)}
          disabled={!canCreate || !isLive}
          title={
            !isLive
              ? t('Connect a live API to add an employee')
              : canCreate
                ? undefined
                : t('Your role cannot add employees')
          }
        >
          <Icon name="Plus" size={16} />
          {t('Add employee')}
        </Button>
      </div>
      <ProvenanceNote />

      {!isLive ? (
        <ConnectApi
          icon="Users"
          title="No employees to show"
          description="The staff directory lives on the server, gated on HR. The fixture build has none, and an employee record cannot be invented — connect a live API to see the directory."
          collection="employees"
        />
      ) : employees.isLoading ? (
        <Loading label="Loading employees..." />
      ) : employees.isError ? (
        <ErrorState
          description={employees.error?.message}
          onRetry={() => void employees.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <StatCard icon="Users" value={String(total)} label="Headcount" />
            <StatCard
              icon="UserCheck"
              value={String(rows.filter((r) => r.status === 'active').length)}
              label="Active (this page)"
            />
            <StatCard
              icon="Clock"
              value={String(rows.filter((r) => r.status === 'on_leave').length)}
              label="On leave (this page)"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <ChipGroup label={t('Filter by status')}>
              {(['all', ...STATUSES] as const).map((key) => (
                <Chip key={key} label={key === 'all' ? t('All') : t(key.replace(/_/g, ' '))} selected={filter === key} onToggle={() => setFilter(key)} />
              ))}
            </ChipGroup>
            <Input
              icon="Search"
              inputSize="sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('Search name or number')}
              className="w-full sm:w-64"
              aria-label={t('Search employees')}
            />
          </div>

          <DataTable
            caption="Staff directory"
            columns={columns}
            rows={[...rows]}
            rowKey={(e, index) => e._id ?? `${e.employeeNumber}-${index}`}
            onRowClick={(e) => setSelected(e)}
            empty={
              <EmptyState
                icon="Users"
                title={t('No employees here')}
                description={
                  q.trim() || filter !== 'all'
                    ? t('No employees match the current search and filter.')
                    : t('No employees have been added yet.')
                }
              />
            }
            mobileCard={(e) => (
              <>
                <MobileCardHeader
                  leading={
                    <div className="flex items-center gap-2.5">
                      <Avatar name={e.name} />
                      <div className="min-w-0">
                        <span className="text-[13px] font-semibold text-heading">{e.name}</span>
                        <span className="block font-mono text-[11px] text-muted" dir="ltr">
                          {e.employeeNumber}
                        </span>
                      </div>
                    </div>
                  }
                  trailing={<StatusPill value={e.status} />}
                />
                {e.title ? <MobileCardRow label={t('Title')} value={e.title} /> : null}
                <MobileCardRow
                  label={t('Department')}
                  value={(e.departmentId && deptName.get(e.departmentId)) || '—'}
                />
                <MobileCardRow
                  label={t('Salary')}
                  value={<Pay halalas={e.salaryHalalas} bare />}
                />
              </>
            )}
          />
        </>
      )}

      {selected ? (
        <EmployeeDetail
          employee={selected}
          department={(selected.departmentId && deptName.get(selected.departmentId)) || null}
          onClose={() => setSelected(null)}
        />
      ) : null}
      {creating ? <CreateEmployee onClose={() => setCreating(false)} /> : null}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { t } = usePreferences()
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
        {t(label)}
      </span>
      <span className="min-w-0 text-end text-[13px] text-heading">{children}</span>
    </div>
  )
}

function EmployeeDetail({
  employee,
  department,
  onClose,
}: {
  employee: EmployeeRow
  department: string | null
  onClose: () => void
}) {
  return (
    <Modal
      open
      onClose={onClose}
      variant="data"
      icon="User"
      title={employee.name}
      meta={<StatusPill value={employee.status} />}
    >
      <div className="flex flex-col divide-y divide-border">
        <div className="pb-1">
          <Row label="Employee number">
            <span className="font-mono" dir="ltr">
              {employee.employeeNumber}
            </span>
          </Row>
          {employee.nameAr ? (
            <Row label="Name (Arabic)">
              <span dir="rtl">{employee.nameAr}</span>
            </Row>
          ) : null}
          <Row label="Title">{employee.title || '—'}</Row>
          <Row label="Department">{department || '—'}</Row>
          <Row label="Hire date">
            <span dir="ltr">{employee.hireDate || '—'}</span>
          </Row>
          <Row label="Salary">
            <Pay halalas={employee.salaryHalalas} className="font-bold" />
          </Row>
        </div>
      </div>
    </Modal>
  )
}

function CreateEmployee({ onClose }: { onClose: () => void }) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const create = useCreate('employees')
  const departments = useCollection('departments')

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [salary, setSalary] = useState('')
  const [busy, setBusy] = useState(false)

  const deptRows = (departments.data ?? []) as Dept[]
  const salaryHalalas = Math.round(parseSar(salary) * 100)
  const valid = name.trim().length > 0 && salaryHalalas >= 0 && salary.trim().length > 0

  async function submit() {
    if (!valid) return
    setBusy(true)
    try {
      const row = await create.mutateAsync({
        input: {
          name: name.trim(),
          ...(title.trim() ? { title: title.trim() } : {}),
          ...(departmentId ? { departmentId } : {}),
          salaryHalalas,
        } as Partial<EmployeeRow>,
      })
      void client.invalidateQueries({ queryKey: queryKeys.all('employees') })
      toast.show({ title: t('Employee added'), description: row.name })
      onClose()
    } catch (cause) {
      toast.show({
        title: t('Could not add the employee'),
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
      title={t('Add employee')}
      dismissible={!busy}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={busy}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => void submit()} disabled={!valid || busy}>
            {t(busy ? 'Adding...' : 'Add employee')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="emp-name" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Name')}
        </label>
        <Input id="emp-name" inputSize="md" value={name} disabled={busy} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="emp-title" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Title')}
        </label>
        <Input id="emp-title" inputSize="md" value={title} disabled={busy} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="emp-dept" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Department')}
        </label>
        <Select
          id="emp-dept"
          value={departmentId}
          disabled={busy}
          onChange={(e) => setDepartmentId(e.target.value)}
          aria-label={t('Department')}
          className="h-11 w-full bg-inset px-3.5 font-action text-sm transition-all duration-200 focus:bg-card disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{t('Unassigned')}</option>
          {deptRows.map((d) => (
            <option key={d._id ?? d.name} value={d._id ?? ''}>
              {d.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="emp-salary" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
          {t('Monthly salary (SAR)')}
        </label>
        <Input
          id="emp-salary"
          inputSize="md"
          inputMode="decimal"
          dir="ltr"
          value={salary}
          disabled={busy}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="0.00"
        />
      </div>
    </Modal>
  )
}
