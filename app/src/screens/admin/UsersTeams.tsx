import { useCallback, useEffect, useMemo, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/States'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'
import { AddStaffModal } from './AddStaffModal'
import { actionFailureMessage, listStaff, type StaffUser } from './api'

interface User {
  name: string
  email: string
  role: string
  roleTone: 'blue' | 'sky' | 'slate' | 'orange' | 'navy'
  team: string
  lastLogin: string
  status: 'online' | 'offline'
}

interface Team {
  name: string
  icon: string
  memberCount: number
  avatars: string[]
  tone: 'blue' | 'sky' | 'orange'
}

const ROLE_TONES: Record<string, [string, string]> = {
  blue: ['rgba(10,94,215,.15)', 'var(--salis-blue)'],
  sky: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  slate: ['var(--tint-neutral)', 'var(--text-muted)'],
  orange: ['var(--tint-orange)', 'var(--salis-orange)'],
  navy: ['var(--tint-navy)', 'var(--salis-navy)'],
}

const STATUS_STYLES: Record<string, [string, string]> = {
  online: ['var(--tint-blue)', 'var(--salis-blue)'],
  offline: ['var(--tint-neutral)', 'var(--text-muted)'],
}

/** Tone for a live account's role badge, keyed by the same palette as the
 *  fixture rows above so the two never look visually inconsistent. Roles the
 *  map does not name (e.g. `owner`, `customer`) fall back to `slate`. */
const LIVE_ROLE_TONE: Record<string, keyof typeof ROLE_TONES> = {
  owner: 'blue',
  manager: 'sky',
  advisor: 'slate',
  technician: 'navy',
  qc: 'navy',
  parts: 'navy',
  accountant: 'orange',
  hr: 'orange',
  frontdesk: 'slate',
  callcenter: 'slate',
  procurement: 'sky',
}

const LIVE_STATUS_STYLES: Record<string, [string, string]> = {
  active: ['var(--tint-blue)', 'var(--salis-blue)'],
  pending: ['var(--tint-orange)', 'var(--salis-orange)'],
  disabled: ['var(--tint-neutral)', 'var(--text-muted)'],
}

const FIXTURE_USERS: User[] = [
  { name: 'Khalid Al-Amri', email: 'khalid@salisauto.sa', role: 'Owner', roleTone: 'blue', team: 'Management', lastLogin: '2 min ago', status: 'online' },
  { name: 'Ahmed Al-Rashid', email: 'ahmed@salisauto.sa', role: 'Manager', roleTone: 'sky', team: 'Operations', lastLogin: '1 hour ago', status: 'online' },
  { name: 'Fatima Al-Zahrani', email: 'fatima@salisauto.sa', role: 'Service Advisor', roleTone: 'slate', team: 'Front Desk', lastLogin: '3 hours ago', status: 'offline' },
  { name: 'Omar Al-Ghamdi', email: 'omar@salisauto.sa', role: 'Accountant', roleTone: 'orange', team: 'Finance', lastLogin: 'Yesterday', status: 'offline' },
  { name: 'Yousef Al-Otaibi', email: 'yousef@salisauto.sa', role: 'Technician', roleTone: 'navy', team: 'Workshop', lastLogin: '30 min ago', status: 'online' },
]

const FIXTURE_TEAMS: Team[] = [
  { name: 'Management', icon: 'Crown', memberCount: 2, avatars: ['K', 'A'], tone: 'blue' },
  { name: 'Workshop', icon: 'Wrench', memberCount: 4, avatars: ['Y', 'B', 'F', 'N'], tone: 'sky' },
  { name: 'Finance', icon: 'Calculator', memberCount: 2, avatars: ['O', 'S'], tone: 'orange' },
]

const TEAM_ICON_BG: Record<string, [string, string]> = {
  blue: ['var(--tint-blue)', 'var(--salis-blue)'],
  sky: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  orange: ['var(--tint-orange)', 'var(--salis-orange)'],
}

export function UsersTeams() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [q, setQ] = useState('')

  /* Live wiring (Phase A). `!isLive` keeps the fixture rows and disabled
   * buttons exactly as before — this is a build with no server to call, not
   * a state this list could ever load into. */
  const [liveUsers, setLiveUsers] = useState<StaffUser[] | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(isLive)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [addStaffOpen, setAddStaffOpen] = useState(false)

  const reloadStaff = useCallback(() => {
    if (!isLive) return
    setLoadingUsers(true)
    setLoadError(null)
    listStaff()
      .then((rows) => setLiveUsers(rows))
      .catch((cause) => setLoadError(actionFailureMessage(cause, 'Could not load the staff list.')))
      .finally(() => setLoadingUsers(false))
  }, [])

  useEffect(() => {
    reloadStaff()
  }, [reloadStaff])

  const liveRows = useMemo(() => {
    const rows = liveUsers ?? []
    if (!q.trim()) return rows
    const lower = q.trim().toLowerCase()
    return rows.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.role.toLowerCase().includes(lower),
    )
  }, [liveUsers, q])

  const fixtureRows = useMemo(() => {
    if (!q.trim()) return FIXTURE_USERS
    const lower = q.trim().toLowerCase()
    return FIXTURE_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.role.toLowerCase().includes(lower),
    )
  }, [q])

  const liveColumns: Column<StaffUser>[] = [
    {
      header: 'User',
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={u.name} />
          <div className="min-w-0">
            <p className="m-0 text-[13px] font-medium text-heading">{u.name}</p>
            <p className="m-0 text-[11px] text-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (u) => {
        const tone = ROLE_TONES[LIVE_ROLE_TONE[u.role] ?? 'slate']
        return (
          <Badge background={tone[0]} color={tone[1]}>
            {t(u.role)}
          </Badge>
        )
      },
    },
    {
      header: 'Status',
      cell: (u) => {
        const tone = LIVE_STATUS_STYLES[u.status] ?? LIVE_STATUS_STYLES.disabled
        return (
          <Badge background={tone[0]} color={tone[1]}>
            {t(u.status)}
          </Badge>
        )
      },
    },
  ]

  const userColumns: Column<User>[] = [
    {
      header: 'User',
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={u.name} />
          <div className="min-w-0">
            <p className="m-0 text-[13px] font-medium text-heading">{u.name}</p>
            <p className="m-0 text-[11px] text-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (u) => (
        <Badge
          background={ROLE_TONES[u.roleTone][0]}
          color={ROLE_TONES[u.roleTone][1]}
        >
          {t(u.role)}
        </Badge>
      ),
    },
    { header: 'Team', cell: (u) => <span className="text-[13px] text-muted">{t(u.team)}</span> },
    { header: 'Last Login', cell: (u) => <span className="text-[13px] text-muted">{u.lastLogin}</span> },
    {
      header: 'Status',
      cell: (u) => (
        <Badge
          background={STATUS_STYLES[u.status][0]}
          color={STATUS_STYLES[u.status][1]}
        >
          {t(u.status)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Users" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Users & Teams')}</h1>
            <p className="mt-1 text-sm text-muted">{t('Administration')}</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            disabled={!isLive}
            onClick={() => setAddStaffOpen(true)}
          >
            <Icon name="UserPlus" size={15} />
            {t('Add Staff')}
          </Button>
          <Button disabled={!isLive}>
            <Icon name="Plus" size={16} />
            {t('Create Team')}
          </Button>
        </div>
      </div>

      {isLive ? (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
            <h2 className="text-base font-bold text-heading">{t('Users')}</h2>
            <Badge background="rgba(10,94,215,.08)" color="var(--salis-blue)">
              {liveRows.length}
            </Badge>
            <div className="flex-1" />
            <Input
              icon="Search"
              inputSize="sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('Search users...')}
              className="w-full sm:w-56"
              aria-label={t('Search users')}
            />
          </div>

          {loadError ? (
            <div className="p-4 sm:p-6">
              <EmptyState icon="AlertCircle" title={t('Could not load staff')} description={loadError} />
            </div>
          ) : (
            <DataTable
              caption="Users list"
              columns={liveColumns}
              rows={liveRows}
              rowKey={(u) => u.id}
              loading={loadingUsers}
              empty={
                <EmptyState
                  icon="Users"
                  title={t('No users found')}
                  description={t('No users match the current search.')}
                />
              }
              mobileCard={(u) => (
                <>
                  <MobileCardHeader
                    leading={
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} />
                        <div className="min-w-0">
                          <span className="text-[13px] font-semibold text-heading">{u.name}</span>
                          <span className="block text-[11px] text-muted">{u.email}</span>
                        </div>
                      </div>
                    }
                    trailing={(() => {
                      const tone = LIVE_STATUS_STYLES[u.status] ?? LIVE_STATUS_STYLES.disabled
                      return (
                        <Badge background={tone[0]} color={tone[1]}>
                          {t(u.status)}
                        </Badge>
                      )
                    })()}
                  />
                  <MobileCardRow
                    label={t('Role')}
                    value={(() => {
                      const tone = ROLE_TONES[LIVE_ROLE_TONE[u.role] ?? 'slate']
                      return (
                        <Badge background={tone[0]} color={tone[1]}>
                          {t(u.role)}
                        </Badge>
                      )
                    })()}
                  />
                </>
              )}
            />
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
            <h2 className="text-base font-bold text-heading">{t('Users')}</h2>
            <Badge background="rgba(10,94,215,.08)" color="var(--salis-blue)">
              {fixtureRows.length}
            </Badge>
            <div className="flex-1" />
            <Input
              icon="Search"
              inputSize="sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('Search users...')}
              className="w-full sm:w-56"
              aria-label={t('Search users')}
            />
          </div>

          <DataTable
            caption="Users list"
            columns={userColumns}
            rows={fixtureRows}
            rowKey={(u) => u.email}
            empty={
              <EmptyState
                icon="Users"
                title={t('No users found')}
                description={t('No users match the current search.')}
              />
            }
            mobileCard={(u) => (
              <>
                <MobileCardHeader
                  leading={
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} />
                      <div className="min-w-0">
                        <span className="text-[13px] font-semibold text-heading">{u.name}</span>
                        <span className="block text-[11px] text-muted">{u.email}</span>
                      </div>
                    </div>
                  }
                  trailing={
                    <Badge
                      background={STATUS_STYLES[u.status][0]}
                      color={STATUS_STYLES[u.status][1]}
                    >
                      {t(u.status)}
                    </Badge>
                  }
                />
                <MobileCardRow
                  label={t('Role')}
                  value={
                    <Badge
                      background={ROLE_TONES[u.roleTone][0]}
                      color={ROLE_TONES[u.roleTone][1]}
                    >
                      {t(u.role)}
                    </Badge>
                  }
                />
                <MobileCardRow label={t('Team')} value={t(u.team)} />
                <MobileCardRow label={t('Last Login')} value={u.lastLogin} />
              </>
            )}
          />
        </Card>
      )}

      <AddStaffModal
        open={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        onCreated={reloadStaff}
      />

      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-heading">{t('Teams')}</h2>
        <div className={isMobile ? 'flex flex-col gap-3' : 'grid grid-cols-3 gap-4'}>
          {FIXTURE_TEAMS.map((tm) => {
            const [bg, fg] = TEAM_ICON_BG[tm.tone]
            return (
              <Card key={tm.name} className="bg-inset p-4">
                <div className="mb-2.5 flex items-center gap-2">
                  <span
                    className="flex rounded-lg p-1.5"
                    style={{ background: bg, color: fg }}
                  >
                    <Icon name={tm.icon} size={16} />
                  </span>
                  <h3 className="m-0 text-sm font-semibold text-heading">{t(tm.name)}</h3>
                </div>
                <div className="mb-2 flex">
                  {tm.avatars.map((av, i) => (
                    <Avatar key={av} name={av} size={28} className={`border-2 border-card${i > 0 ? ' -ms-1.5' : ''}`} />
                  ))}
                </div>
                <p className="m-0 text-xs text-muted">
                  {tm.memberCount} {t('members')}
                </p>
              </Card>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
