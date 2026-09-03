import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { useCommand, type Command } from '@/components/shell/commands'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { ExportCenter, type ExportColumn } from '@/components/ui/ExportCenter'
import { ImportCenter, type ImportField } from '@/components/ui/ImportCenter'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, useUndoableDelete, type RowOf } from '@/data/useCollection'
import { CustomerFormModal } from './CustomerForm'
import { Consequence, DeleteRecordModal } from './DeleteRecordModal'
import { NoMatches, OverflowItem, RowActions, useSearch } from './registryShared'
import { derived, rowId } from './writes'

/** The customer registry — the front desk's list.
 *
 *  One header for both layouts (`PageHeader` draws the phone version itself),
 *  a debounced search, chip filters over what the record actually carries, and
 *  the export and import tools behind the overflow menu rather than as two
 *  toggle panels fighting the primary button for the header. Below 860px the
 *  table becomes the designed card list, actions and all. */
type Customer = RowOf<'customers'> & { email?: string | null; type?: string }

const CUSTOMER_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'vehicles', label: 'Vehicles Count' },
  { key: 'spent', label: 'Total Spent' },
  { key: 'last', label: 'Last Visit' },
]

const CUSTOMER_IMPORT_FIELDS: ImportField[] = [
  { name: 'Name', required: true, example: 'Ahmed Al-Rashid' },
  { name: 'Phone', required: true, example: '+966 50 123 4567' },
  { name: 'Email', required: false, example: 'ahmed@example.com' },
  { name: 'Type', required: false, example: 'individual' },
]

const TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'individual', label: 'Individual' },
  { id: 'fleet', label: 'Fleet Account' },
] as const

const VISIT_FILTERS = [
  { id: 'any', label: 'Any time' },
  { id: 'recent', label: 'Visited recently' },
  { id: 'older', label: 'Not recently' },
] as const

/** The registry stores the last visit as the relative label the design drew
 *  ("2 weeks ago"), not a date. "Recently" is anything inside a month, read off
 *  that label — the honest reading of the only value the row carries. */
function visitedRecently(last: string | null | undefined): boolean {
  if (!last) return false
  return /\b(hour|today|yesterday|day|week)/i.test(last)
}

export function Customers() {
  const { t } = usePreferences()
  const { can, fieldHidden } = useSession()
  const navigate = useNavigate()
  const customersQuery = useCollection('customers')
  const { data: vehicles = [] } = useCollection('vehicles')
  const customers = (customersQuery.data ?? []) as readonly Customer[]
  const { query, setQuery, filtered: searched, searching } = useSearch(customers, (c) => [c.name, c.phone, c.email])
  const { remove: removeCustomer, pending: removing } = useUndoableDelete('customers', 'Customer')

  /** `undefined` is closed, `null` is "create", a row is "edit that row". The
   *  three-way state is what lets one modal serve both, mounted only while it
   *  is open so a second open starts from the record's values rather than from
   *  whatever the last edit left behind. */
  const [form, setForm] = useState<Customer | null | undefined>(undefined)
  const [doomed, setDoomed] = useState<Customer | undefined>(undefined)
  const [panel, setPanel] = useState<'export' | 'import' | null>(null)
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]['id']>('all')
  const [visit, setVisit] = useState<(typeof VISIT_FILTERS)[number]['id']>('any')
  const [inServiceOnly, setInServiceOnly] = useState(false)

  // Technicians, QC and suppliers may not see customer contact details.
  const hideContact = fieldHidden('Customer contact details')
  const mayCreate = can('customers', 'c')
  const mayEdit = can('customers', 'e')
  const mayDelete = can('customers', 'd')

  /** Owners with a vehicle in the workshop right now, joined by the owner
   *  name the vehicle row carries. */
  const ownersInService = useMemo(
    () => new Set(vehicles.filter((v) => v.status === 'service').map((v) => v.owner)),
    [vehicles]
  )

  const filtered = useMemo(
    () =>
      searched.filter((c) => {
        if (type !== 'all' && (c.type ?? 'individual') !== type) return false
        if (inServiceOnly && !ownersInService.has(c.name)) return false
        if (visit === 'recent' && !visitedRecently(c.last)) return false
        if (visit === 'older' && visitedRecently(c.last)) return false
        return true
      }),
    [searched, type, inServiceOnly, ownersInService, visit]
  )
  const filtering = searching || type !== 'all' || inServiceOnly || visit !== 'any'

  const commands = useMemo<Command[]>(
    () =>
      mayCreate
        ? [
            {
              id: 'customers:add',
              label: 'Add Customer',
              icon: 'UserPlus',
              group: 'create',
              keywords: ['customer', 'client', 'create', 'new'],
              shortcut: 'N',
              run: () => setForm(null),
            },
          ]
        : [],
    [mayCreate]
  )
  useCommand(commands)

  const columns: Column<Customer>[] = [
    { header: 'Name', cell: (c) => c.name, sortValue: (c) => c.name },
    ...(hideContact
      ? []
      : [{ header: 'Phone', cell: (c: Customer) => c.phone, code: true, sortValue: (c: Customer) => c.phone }]),
    {
      header: 'Vehicles Count',
      cell: (c) => derived(c.vehicles),
      numeric: true,
      sortValue: (c) => Number(c.vehicles ?? 0),
    },
    {
      header: 'Total Spent',
      cell: (c) => <Money sar={parseSar(c.spent ?? '')} className="font-semibold" />,
      numeric: true,
      sortValue: (c) => parseSar(c.spent ?? ''),
    },
    { header: 'Last Visit', cell: (c) => derived(c.last && t(c.last)), sortValue: (c) => c.last ?? '' },
    ...(mayEdit || mayDelete
      ? [
          {
            header: 'Actions',
            className: 'text-end',
            cell: (c: Customer) => (
              <RowActions
                label={c.name}
                onEdit={mayEdit ? () => setForm(c) : undefined}
                onDelete={mayDelete ? () => setDoomed(c) : undefined}
              />
            ),
          },
        ]
      : []),
  ]

  const addButton = mayCreate ? (
    <Button size="md" icon="Plus" onClick={() => setForm(null)}>
      {t('Add Customer')}
    </Button>
  ) : null

  const filters = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <ChipGroup label={t('Customer type')}>
        {TYPE_FILTERS.map((option) => (
          <Chip
            key={option.id}
            label={t(option.label)}
            selected={type === option.id}
            onToggle={() => setType(option.id)}
          />
        ))}
      </ChipGroup>
      <ChipGroup label={t('Workshop')} multi>
        <Chip
          multi
          label={t('Vehicle in service')}
          selected={inServiceOnly}
          onToggle={() => setInServiceOnly((current) => !current)}
        />
      </ChipGroup>
      <ChipGroup label={t('Last visit')}>
        {VISIT_FILTERS.map((option) => (
          <Chip
            key={option.id}
            label={t(option.label)}
            selected={visit === option.id}
            onToggle={() => setVisit(option.id)}
          />
        ))}
      </ChipGroup>
    </div>
  )

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t('Front Desk')}
        title={t('Customers')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search customers...') }}
        actions={addButton}
        overflow={
          <>
            <OverflowItem icon="Download" label="Export" onClick={() => setPanel(panel === 'export' ? null : 'export')} />
            <OverflowItem icon="Upload" label="Import" onClick={() => setPanel(panel === 'import' ? null : 'import')} />
          </>
        }
        query={customersQuery}
        skeleton="table"
        toolbar={filters}
        notice={
          panel === 'export' ? (
            <ExportCenter
              title="Export Customers"
              description="Export customer records to a file"
              columns={CUSTOMER_EXPORT_COLUMNS}
              totalRows={filtered.length}
              onExport={async () => { /* server-side export */ }}
            />
          ) : panel === 'import' ? (
            <ImportCenter
              title="Import Customers"
              description="Import customer records from a CSV or Excel file"
              fields={CUSTOMER_IMPORT_FIELDS}
              onImport={async () => ({ total: 0, imported: 0, skipped: 0, errors: [] })}
            />
          ) : null
        }
      >
        <DataTable
          caption="Customer records"
          columns={columns}
          rows={filtered}
          rowKey={(c) => rowId(c) ?? c.name}
          defaultSort={{ key: 'Name', dir: 'asc' }}
          onRowClick={(c) =>
            navigate(`/customer-detail?id=${encodeURIComponent(rowId(c) ?? c.name)}`)
          }
          mobileCard={(c) => (
            <>
              <MobileCardHeader
                title={c.name}
                trailing={
                  <RowActions
                    label={c.name}
                    onEdit={mayEdit ? () => setForm(c) : undefined}
                    onDelete={mayDelete ? () => setDoomed(c) : undefined}
                  />
                }
              />
              {hideContact ? null : (
                <MobileCardRow label={t('Phone')}>
                  <span className="font-mono" dir="ltr">{c.phone}</span>
                </MobileCardRow>
              )}
              <MobileCardRow label={t('Vehicles Count')}>{derived(c.vehicles)}</MobileCardRow>
              <MobileCardRow label={t('Total Spent')}>
                <Money sar={parseSar(c.spent ?? '')} className="font-semibold text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Last Visit')}>{derived(c.last && t(c.last))}</MobileCardRow>
            </>
          )}
          empty={
            <NoMatches
              query={filtering}
              icon="Users"
              title="No customers yet"
              description="Customers are created at check-in or from the portal."
              action={addButton}
            />
          }
        />
      </ScreenFrame>

      {form !== undefined ? (
        <CustomerFormModal
          open
          onClose={() => setForm(undefined)}
          customer={form ?? undefined}
        />
      ) : null}

      {doomed ? (
        <DeleteRecordModal
          open
          onClose={() => setDoomed(undefined)}
          kind="Customer"
          name={doomed.name}
          consequences={
            <>
              <Consequence count={doomed.vehicles} label="vehicles stay in the registry" />
              <Consequence label="Job cards and invoices keep their history" />
            </>
          }
          onConfirm={async () => {
            const id = rowId(doomed)
            if (!id) throw new Error(t('This record has no id, so it cannot be deleted.'))
            if (removing) return
            await removeCustomer(id)
          }}
        />
      ) : null}
    </>
  )
}
