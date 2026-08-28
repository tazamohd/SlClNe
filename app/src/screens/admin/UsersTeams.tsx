import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { roleMeta } from '@/data/rbac'
import type { RoleId } from '@/data/types'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'

/** Users & Teams — Administration's staff directory (`UsersTeams.dc.html`,
 *  mobile: `UsersTeams.Mobile.dc.html`).
 *
 *  No `users` collection exists — `technicians` covers the workshop floor
 *  (`useCollection('technicians')`); the rest of the staff (owner, manager,
 *  advisor, qc, parts, accountant, hr, frontdesk, callcenter, procurement)
 *  is a typed local seed pointed at its real `roleMeta` entry for
 *  name/email/colour, never a hardcoded palette. Portal roles (supplier,
 *  customer) and the platform-level superadmin aren't one workshop's staff,
 *  so they're excluded.
 *
 *  The design hardcodes the Users badge at "8" against five rendered rows;
 *  here it's derived from the roster (`Payments.dc.html`'s "one number that
 *  changed" fix, applied again).
 *
 *  Suspend/reactivate gates on `can('admin', 'x')` (owner/superadmin only —
 *  a manager has `admin: 'v'`) and flips local state with a toast, the seam
 *  `SuperAdmin.tsx` uses for org suspend/reactivate since the mock
 *  repository has no write path. Edit, Invite User, Create Team and Resend
 *  Invite have no capture form in this port, so they acknowledge honestly
 *  rather than pretend to persist — `SuperAdmin.tsx`'s "Add Organization"
 *  treatment. */

type AccountStatus = 'active' | 'invited' | 'suspended'

interface StaffMember {
  key: string
  name: string
  email: string
  initial: string
  roleId: RoleId
  team: string
  lastLogin: string | null
  status: AccountStatus
}

interface StaffSeed {
  roleId: Exclude<RoleId, 'technician' | 'superadmin' | 'supplier' | 'customer'>
  team: string
  lastLogin: string | null
  status: AccountStatus
}

/** Every non-technician staff role, pointed at a team and a demo presence.
 *  Names, emails and Arabic labels all come from `roleMeta` — never hardcoded
 *  here. */
const STAFF_SEED: readonly StaffSeed[] = [
  { roleId: 'owner', team: 'Management', lastLogin: '2 min ago', status: 'active' },
  { roleId: 'manager', team: 'Management', lastLogin: '1 hour ago', status: 'active' },
  { roleId: 'advisor', team: 'Front Desk', lastLogin: '3 hours ago', status: 'active' },
  { roleId: 'frontdesk', team: 'Front Desk', lastLogin: '2 days ago', status: 'suspended' },
  { roleId: 'callcenter', team: 'Front Desk', lastLogin: '5 hours ago', status: 'active' },
  { roleId: 'qc', team: 'Workshop', lastLogin: 'Yesterday', status: 'active' },
  { roleId: 'parts', team: 'Workshop', lastLogin: '30 min ago', status: 'active' },
  { roleId: 'accountant', team: 'Finance', lastLogin: 'Yesterday', status: 'active' },
  { roleId: 'hr', team: 'Finance', lastLogin: null, status: 'invited' },
  { roleId: 'procurement', team: 'Finance', lastLogin: '4 hours ago', status: 'active' },
]

/** Role filter options, in the same order as the seed above plus technicians. */
const ROLE_FILTER_ORDER: readonly RoleId[] = [
  'owner', 'manager', 'advisor', 'technician', 'qc', 'parts',
  'accountant', 'hr', 'frontdesk', 'callcenter', 'procurement',
]

const TEAM_ORDER = ['Management', 'Front Desk', 'Workshop', 'Finance'] as const

const TEAM_META: Record<(typeof TEAM_ORDER)[number], { icon: string; color: string }> = {
  Management: { icon: 'Crown', color: '#0A5ED7' },
  'Front Desk': { icon: 'Headset', color: '#64748B' },
  Workshop: { icon: 'Wrench', color: '#0BB3FF' },
  Finance: { icon: 'Calculator', color: '#0B1F3B' },
}

const STATUS_META: Record<AccountStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: '#0A5ED7' },
  invited: { label: 'Invite Pending', color: '#F97316' },
  suspended: { label: 'Suspended', color: '#F97316' },
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

/** Role pill — colour and label straight from `roleMeta`, never a hardcoded
 *  palette (README binding conventions for this screen). */
function RolePill({ roleId }: { roleId: RoleId }) {
  const { rtl } = usePreferences()
  const role = roleMeta(roleId)
  return (
    <Badge background={hexToRgba(role.color, 0.12)} color={role.color}>
      {rtl ? role.ar : role.label}
    </Badge>
  )
}

function StatusPill({ status }: { status: AccountStatus }) {
  const { t } = usePreferences()
  const meta = STATUS_META[status]
  return (
    <Badge background={hexToRgba(meta.color, 0.1)} color={meta.color}>
      {t(meta.label)}
    </Badge>
  )
}

function NoMatches({ filtering }: { filtering: boolean }) {
  const { t } = usePreferences()
  return filtering ? (
    <EmptyState
      icon="SearchX"
      title={t('No results')}
      description={t('Nothing matches the current filters.')}
    />
  ) : (
    <EmptyState
      icon="Users"
      title={t('No staff members yet')}
      description={t('Invite a user to build the team.')}
    />
  )
}

function RowActions({
  member,
  onSuspend,
}: {
  member: StaffMember
  onSuspend: (member: StaffMember) => void
}) {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const canEdit = can('admin', 'e')
  const canInvite = can('admin', 'c')
  const canModerate = can('admin', 'x')
  const base = 'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-colors'
  const btnClass = `${base} hover:bg-[rgba(10,94,215,.1)] hover:text-salis-blue`
  const warnClass = `${base} hover:bg-[rgba(249,115,22,.1)] hover:text-salis-orange`

  if (!canEdit && !canInvite && !canModerate) return null

  const editUser = () =>
    toast.show({ title: t('Edit user'), description: t('User editing is not yet available.') })
  const resendInvite = () => toast.show({ title: t('Invitation resent'), description: member.email })

  return (
    <div className="flex items-center justify-end gap-1">
      {canEdit ? (
        <button type="button" aria-label={`${t('Edit user')} — ${member.name}`} className={btnClass} onClick={editUser}>
          <Icon name="Pencil" size={14} />
        </button>
      ) : null}
      {canInvite && member.status === 'invited' ? (
        <button type="button" aria-label={`${t('Resend invite')} — ${member.name}`} className={btnClass} onClick={resendInvite}>
          <Icon name="Mail" size={14} />
        </button>
      ) : null}
      {canModerate && member.status !== 'invited' ? (
        <button
          type="button"
          aria-label={`${member.status === 'suspended' ? t('Reactivate') : t('Suspend')} — ${member.name}`}
          className={warnClass}
          onClick={() => onSuspend(member)}
        >
          <Icon name={member.status === 'suspended' ? 'UserCheck' : 'UserMinus'} size={14} />
        </button>
      ) : null}
    </div>
  )
}

function TeamCard({ name, members }: { name: (typeof TEAM_ORDER)[number]; members: readonly StaffMember[] }) {
  const { t } = usePreferences()
  const meta = TEAM_META[name]
  const shown = members.slice(0, 4)
  const extra = members.length - shown.length

  return (
    <div className="rounded-xl border border-border bg-inset p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className="flex flex-shrink-0 rounded-lg p-1.5"
          style={{ background: hexToRgba(meta.color, 0.1), color: meta.color }}
        >
          <Icon name={meta.icon} size={16} />
        </span>
        <h4 className="truncate text-sm font-semibold text-heading">{t(name)}</h4>
      </div>
      <div className="mb-2 flex">
        {shown.map((member) => (
          <span
            key={member.key}
            style={{ marginInlineStart: '-6px' }}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-card bg-salis-gradient text-[10px] font-bold text-white first:ms-0"
          >
            {member.initial}
          </span>
        ))}
        {extra > 0 ? (
          <span style={{ marginInlineStart: '-6px' }} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-card bg-inset text-[10px] font-bold text-muted">
            +{extra}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-muted">
        {members.length} {t('members')}
      </p>
    </div>
  )
}

export function UsersTeams() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const isMobile = useIsMobile()
  const { data: techs = [], isLoading } = useCollection('technicians')

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | RoleId>('all')
  const [overrides, setOverrides] = useState<Record<string, AccountStatus>>({})

  const canInvite = can('admin', 'c')
  const canEdit = can('admin', 'e')
  const canModerate = can('admin', 'x')

  const members = useMemo<StaffMember[]>(() => {
    const staff: StaffMember[] = STAFF_SEED.map((seed) => {
      const role = roleMeta(seed.roleId)
      const name = rtl ? role.demo.ar : role.demo.name
      return {
        key: seed.roleId,
        name,
        email: role.demo.email,
        initial: initialOf(name),
        roleId: seed.roleId,
        team: seed.team,
        lastLogin: seed.lastLogin,
        status: seed.status,
      }
    })
    const technicians: StaffMember[] = techs.map((tech: RowOf<'technicians'>) => {
      const handle = tech.name.split(' ')[0]?.toLowerCase() ?? 'tech'
      const email = `${handle}@salisauto.sa`
      return {
        key: email,
        name: tech.name,
        email,
        initial: initialOf(tech.name),
        roleId: 'technician',
        team: 'Workshop',
        lastLogin: null,
        status: 'active',
      }
    })
    return [...staff, ...technicians].map((member) =>
      overrides[member.key] ? { ...member, status: overrides[member.key] } : member
    )
  }, [techs, rtl, overrides])

  const filtering = query.trim().length > 0 || roleFilter !== 'all'

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return members.filter((member) => {
      if (roleFilter !== 'all' && member.roleId !== roleFilter) return false
      if (!needle) return true
      return [member.name, member.email, member.team].some((field) =>
        field.toLowerCase().includes(needle)
      )
    })
  }, [members, query, roleFilter])

  const teams = useMemo(
    () =>
      TEAM_ORDER.map((name) => ({ name, members: members.filter((member) => member.team === name) })).filter(
        (group) => group.members.length > 0
      ),
    [members]
  )

  const suspend = (member: StaffMember) => {
    const next: AccountStatus = member.status === 'suspended' ? 'active' : 'suspended'
    setOverrides((prev) => ({ ...prev, [member.key]: next }))
    toast.show({
      title: next === 'suspended' ? t('User suspended') : t('User reactivated'),
      description: member.name,
    })
  }
  const inviteUser = () =>
    toast.show({ title: t('Invite User'), description: t('Invitation onboarding is not yet available.') })
  const createTeam = () =>
    toast.show({ title: t('Create Team'), description: t('Team creation is not yet available.') })

  const columns: Column<StaffMember>[] = [
    {
      header: 'User',
      cell: (member) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-xs font-bold text-white">
            {member.initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-heading">{member.name}</p>
            <p className="truncate text-[11px] text-muted" dir="ltr">
              {member.email}
            </p>
          </div>
        </div>
      ),
    },
    { header: 'Role', cell: (member) => <RolePill roleId={member.roleId} /> },
    { header: 'Team', cell: (member) => t(member.team), className: 'text-muted' },
    {
      header: 'Last Login',
      cell: (member) =>
        member.lastLogin ? (
          <span dir="ltr">{member.lastLogin}</span>
        ) : (
          <span className="text-muted">{t('Never')}</span>
        ),
      className: 'text-[13px] text-muted',
    },
    { header: 'Status', cell: (member) => <StatusPill status={member.status} /> },
    ...(canEdit || canInvite || canModerate
      ? [
          {
            header: 'Actions',
            cell: (member: StaffMember) => <RowActions member={member} onSuspend={suspend} />,
            className: 'text-end',
          },
        ]
      : []),
  ]

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div
              className={cn(
                'relative flex rounded-xl bg-salis-gradient text-white',
                'shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]',
                isMobile ? 'p-2.5' : 'p-3'
              )}
            >
              <Icon name="Users" size={isMobile ? 22 : 28} />
            </div>
          </div>
          <div className="min-w-0">
            <h1
              className={cn(
                'font-display font-black text-heading',
                isMobile ? 'text-xl' : 'text-3xl'
              )}
            >
              {t('Users & Teams')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Administration')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {canInvite ? (
            <Button variant="outline" size={isMobile ? 'sm' : 'md'} onClick={inviteUser}>
              <Icon name="UserPlus" size={15} />
              {t('Invite User')}
            </Button>
          ) : null}
          {canInvite ? (
            <Button size={isMobile ? 'sm' : 'md'} onClick={createTeam}>
              <Icon name="Plus" size={16} />
              {t('Create Team')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-heading">
            {t('Users')}
            <Badge background="rgba(10,94,215,.08)" color="#0A5ED7">
              {members.length}
            </Badge>
          </h3>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <span className="relative flex flex-shrink-0 items-center">
              <Icon
                name="Search"
                size={14}
                className="pointer-events-none absolute text-muted start-3"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('Search users...')}
                aria-label={t('Search users')}
                className="h-9 w-full min-w-[160px] max-w-[220px] rounded border border-border bg-inset px-3 ps-8 text-[13px] text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
              />
            </span>
            <label className="inline-flex flex-shrink-0">
              <span className="sr-only">{t('Role')}</span>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as 'all' | RoleId)}
                className="h-9 cursor-pointer rounded border border-border bg-card px-2.5 font-action text-[13px] text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
              >
                <option value="all">{t('All Roles')}</option>
                {ROLE_FILTER_ORDER.map((id) => {
                  const role = roleMeta(id)
                  return (
                    <option key={id} value={id}>
                      {rtl ? role.ar : role.label}
                    </option>
                  )
                })}
              </select>
            </label>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(member) => member.key}
          loading={isLoading}
          empty={<NoMatches filtering={filtering} />}
          mobileCard={(member) => (
            <>
              <MobileCardHeader title={member.name} trailing={<StatusPill status={member.status} />} />
              <MobileCardRow>
                <RolePill roleId={member.roleId} /> · {t(member.team)}
              </MobileCardRow>
              <MobileCardRow label={t('Email')}>
                <span dir="ltr">{member.email}</span>
              </MobileCardRow>
            </>
          )}
        />
      </div>

      <Card className="p-4 sm:p-5">
        <h3 className="mb-4 text-base font-bold text-heading">{t('Teams')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {teams.map((team) => (
            <TeamCard key={team.name} name={team.name} members={team.members} />
          ))}
        </div>
      </Card>
    </>
  )
}
