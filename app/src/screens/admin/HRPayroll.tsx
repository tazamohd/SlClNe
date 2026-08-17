import { useMemo, useState } from 'react'
import { FeatureHeader, Section, StatRow, TabBar } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, TableFooter, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** HR & Payroll: employee directory, run-payroll and attendance tabs.
 *
 *  The design's own `employees` fixture is the source for all three tabs —
 *  "Attendance" reuses the directory table verbatim (`showEmployees` covers
 *  both), and payroll rows are the same salaries with allowances (+15%) and
 *  deductions (-9%) applied, exactly as the reference script derives them.
 *
 *  Salary is the one RBAC-redacted field on this screen (`FIELD_RULES`,
 *  "Employee salary"): roles it hides for lose the Salary column, the Total
 *  Payroll stat, and the Payroll tab's figures entirely — hidden, not merely
 *  disabled, per the redaction contract in `data/rbac.ts`. */

interface Employee {
  name: string
  initial: string
  phone: string
  dept: string
  position: string
  status: 'present' | 'on_leave'
  salary: number
}

const EMPLOYEES: readonly Employee[] = [
  { name: 'Yousef Al-Otaibi', initial: 'Y', phone: '+966 55 440 1122', dept: 'Workshop', position: 'Technician', status: 'present', salary: 6500 },
  { name: 'Bandar Al-Qahtani', initial: 'B', phone: '+966 50 331 2244', dept: 'Workshop', position: 'Technician', status: 'present', salary: 6200 },
  { name: 'Faisal Al-Harbi', initial: 'F', phone: '+966 54 220 5533', dept: 'Workshop', position: 'Technician', status: 'on_leave', salary: 5800 },
  { name: 'Nasser Al-Dosari', initial: 'N', phone: '+966 56 110 7788', dept: 'Workshop', position: 'Technician', status: 'present', salary: 5500 },
  { name: 'Khalid Al-Amri', initial: 'K', phone: '+966 55 123 4567', dept: 'Administration', position: 'Manager', status: 'present', salary: 12000 },
  { name: 'Layla Al-Sulaiman', initial: 'L', phone: '+966 50 998 3344', dept: 'Accounting', position: 'Service Advisor', status: 'on_leave', salary: 7500 },
]

const ALLOWANCE_RATE = 0.15
const DEDUCTION_RATE = 0.09

const STATUS_TONE: Record<Employee['status'], readonly [string, string]> = {
  present: ['rgba(10,94,215,.1)', '#0A5ED7'],
  on_leave: ['rgba(11,179,255,.1)', '#0BB3FF'],
}

function EmployeeStatus({ status }: { status: Employee['status'] }) {
  const { t } = usePreferences()
  const [bg, fg] = STATUS_TONE[status]
  return (
    <Badge background={bg} color={fg}>
      {t(status === 'present' ? 'Present' : 'On Leave')}
    </Badge>
  )
}

const TABS = [
  { id: 'employees', label: 'Employee Directory', icon: 'Users' },
  { id: 'payroll', label: 'Payroll', icon: 'CreditCard' },
  { id: 'attendance', label: 'Attendance', icon: 'Clock' },
] as const

type TabId = (typeof TABS)[number]['id']

export function HRPayroll() {
  const { t } = usePreferences()
  const { can, fieldHidden } = useSession()
  const [tab, setTab] = useState<TabId>('employees')
  const hideSalary = fieldHidden('Employee salary')

  const present = EMPLOYEES.filter((e) => e.status === 'present').length
  const onLeave = EMPLOYEES.filter((e) => e.status === 'on_leave').length
  const totalBaseSalary = useMemo(
    () => EMPLOYEES.reduce((sum, e) => sum + e.salary, 0),
    []
  )

  const payrollRows = useMemo(
    () =>
      EMPLOYEES.map((e) => {
        const allowance = Math.round(e.salary * ALLOWANCE_RATE)
        const deduction = Math.round(e.salary * DEDUCTION_RATE)
        return { name: e.name, base: e.salary, allowance, deduction, net: e.salary + allowance - deduction }
      }),
    []
  )
  const totalNetPayroll = useMemo(
    () => payrollRows.reduce((sum, row) => sum + row.net, 0),
    [payrollRows]
  )

  const stats = [
    { label: 'Total Staff', value: EMPLOYEES.length, caption: 'Active roster', icon: 'Users', highlight: true },
    { label: 'Present', value: present, caption: 'On shift today', icon: 'UserCheck', tone: 'info' as const },
    { label: 'On Leave', value: onLeave, caption: 'Away today', icon: 'Clock', tone: 'warning' as const },
    ...(hideSalary
      ? []
      : [{ label: 'Total Payroll', value: formatSar(totalBaseSalary), caption: 'Base salaries', icon: 'DollarSign' }]),
  ]

  const employeeColumns: Column<Employee>[] = [
    {
      header: 'Name',
      cell: (e) => (
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[11px] font-bold text-white">
            {e.initial}
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-heading">{e.name}</span>
            <span className="block font-mono text-[11px] text-muted" dir="ltr">
              {e.phone}
            </span>
          </span>
        </span>
      ),
    },
    { header: 'Department', cell: (e) => t(e.dept) },
    { header: 'Position', cell: (e) => t(e.position) },
    { header: 'Status', cell: (e) => <EmployeeStatus status={e.status} /> },
    ...(hideSalary
      ? []
      : [{ header: 'Salary', cell: (e: Employee) => <Money sar={e.salary} className="font-semibold" /> }]),
  ]

  const payrollColumns: Column<(typeof payrollRows)[number]>[] = [
    { header: 'Name', cell: (row) => row.name },
    { header: 'Base Salary', cell: (row) => <Money sar={row.base} /> },
    {
      header: 'Allowances',
      cell: (row) => (
        <span className="font-mono text-[13px] text-salis-blue" dir="ltr">
          +{formatSar(row.allowance)}
        </span>
      ),
    },
    {
      header: 'Deductions',
      cell: (row) => (
        <span className="font-mono text-[13px] text-salis-orange" dir="ltr">
          -{formatSar(row.deduction)}
        </span>
      ),
    },
    { header: 'Net Pay', cell: (row) => <Money sar={row.net} className="font-bold" /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Users"
        title={t('HR & Payroll')}
        subtitle={t('Employee Directory')}
        actions={
          can('hr', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Employee')}
            </Button>
          ) : null
        }
      />

      <TabBar tabs={TABS} value={tab} onChange={(id) => setTab(id as TabId)} />
      <StatRow stats={stats} />

      {tab === 'employees' || tab === 'attendance' ? (
        <DataTable
          columns={employeeColumns}
          rows={EMPLOYEES}
          rowKey={(e) => e.name}
          mobileCard={(e) => (
            <>
              <MobileCardHeader title={e.name} trailing={<EmployeeStatus status={e.status} />} />
              <MobileCardRow label={t('Phone')}>
                <span className="font-mono" dir="ltr">
                  {e.phone}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Department')}>{t(e.dept)}</MobileCardRow>
              <MobileCardRow label={t('Position')}>{t(e.position)}</MobileCardRow>
              {hideSalary ? null : (
                <MobileCardRow label={t('Salary')}>
                  <Money sar={e.salary} className="font-semibold text-heading" />
                </MobileCardRow>
              )}
            </>
          )}
          empty={<EmptyState icon="Users" title={t('No employees yet')} />}
        />
      ) : null}

      {tab === 'payroll' ? (
        hideSalary ? (
          <EmptyState
            icon="Lock"
            title={t('Salary details are restricted for your role')}
          />
        ) : (
          <Section
            title={t('Payroll')}
            subtitle="Jul 2026"
            toolbar={
              <Button size="md">
                <Icon name="Play" size={14} />
                {t('Run Payroll')}
              </Button>
            }
          >
            <DataTable
              className="border-0 shadow-none"
              columns={payrollColumns}
              rows={payrollRows}
              rowKey={(row) => row.name}
              mobileCard={(row) => (
                <>
                  <MobileCardHeader title={row.name} />
                  <MobileCardRow label={t('Base Salary')}>
                    <Money sar={row.base} className="text-heading" />
                  </MobileCardRow>
                  <MobileCardRow label={t('Allowances')}>
                    <span className="font-mono text-salis-blue" dir="ltr">
                      +{formatSar(row.allowance)}
                    </span>
                  </MobileCardRow>
                  <MobileCardRow label={t('Deductions')}>
                    <span className="font-mono text-salis-orange" dir="ltr">
                      -{formatSar(row.deduction)}
                    </span>
                  </MobileCardRow>
                  <MobileCardRow label={t('Net Pay')}>
                    <Money sar={row.net} className="font-bold text-heading" />
                  </MobileCardRow>
                </>
              )}
              footer={
                <TableFooter
                  summary={
                    <span className="font-semibold text-heading">
                      {t('Total Payroll')}: <Money sar={totalNetPayroll} className="font-bold" />
                    </span>
                  }
                />
              }
              empty={<EmptyState icon="CreditCard" title={t('No payroll run yet')} />}
            />
          </Section>
        )
      ) : null}
    </>
  )
}
