import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { writeStored, STORAGE_KEYS } from '@/lib/storage'
import type { RoleId } from '@/data/types'

interface RoleOption {
  id: RoleId
  icon: string
  label: string
  desc: string
  ar: string
  count: string
}

/** The four broad role families offered on the post-invite picker — not the
 *  full 14-role demo list from Login, which is the actual sign-in surface.
 *  Ids line up with `RoleId` so the pick can be persisted the same way the
 *  session provider does, without pretending to authenticate anyone. */
const ROLE_OPTIONS: readonly RoleOption[] = [
  {
    id: 'owner',
    icon: 'Crown',
    label: 'Workshop Owner',
    desc: 'Full workshop & team management',
    ar: 'إدارة كاملة للورشة والفريق',
    count: '248',
  },
  {
    id: 'advisor',
    icon: 'ClipboardList',
    label: 'Service Advisor',
    desc: 'Customer intake & service orders',
    ar: 'استقبال العملاء وإدارة الطلبات',
    count: '1.2K',
  },
  {
    id: 'technician',
    icon: 'Wrench',
    label: 'Technician',
    desc: 'Execute jobs & update status',
    ar: 'تنفيذ الأعمال وتحديث الحالة',
    count: '3.4K',
  },
  {
    id: 'manager',
    icon: 'Users',
    label: 'Manager',
    desc: 'Reports, oversight & permissions',
    ar: 'التقارير والإشراف والصلاحيات',
    count: '680',
  },
]

/** Post-invite role picker — whoever opened the invite link chooses which
 *  role they're accepting before moving on to workspace selection.
 *
 *  Public, pre-session: picking a card only records the intent under the same
 *  `salis-role` storage key `SessionProvider` reads, it does not sign anyone
 *  in — that still needs a password on the Login screen. */
export function RoleSelection() {
  const { t, rtl } = usePreferences()
  const [picked, setPicked] = useState<RoleId>('owner')

  function select(id: RoleId) {
    writeStored(STORAGE_KEYS.role, id)
    setPicked(id)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute bottom-0 end-0 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.1),transparent_65%)] blur-[64px]" />
      </div>

      <div className="relative z-[1] flex w-full max-w-[560px] animate-fade-up flex-col gap-6 p-4">
        <div className="text-center">
          <img
            src="/assets/logo-blue-orange.png"
            alt="SALIS AUTO"
            className="mx-auto h-auto w-[90px]"
          />
          <h1 className="mt-3 font-display text-[22px] font-black text-heading">
            {t('Select Your Role')}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">{t('Choose your role in the system')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map((role) => (
            <RoleTile
              key={role.id}
              role={role}
              selected={picked === role.id}
              onSelect={() => select(role.id)}
            />
          ))}
        </div>

        <Link
          to="/workspace-selection"
          className="box-border inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-salis-gradient font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
        >
          {t('Continue')}
        </Link>
      </div>
    </div>
  )
}

function RoleTile({
  role,
  selected,
  onSelect,
}: {
  role: RoleOption
  selected: boolean
  onSelect: () => void
}) {
  const { t, rtl } = usePreferences()

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer flex-col gap-2.5 rounded-[14px] border p-4 text-start',
        'transition-all duration-150',
        selected
          ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.06)] text-salis-blue shadow-[0_8px_24px_rgba(10,94,215,.12)]'
          : 'border-border bg-card text-body'
      )}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex flex-shrink-0 items-center justify-center rounded-xl p-2.5',
            selected
              ? 'bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]'
              : 'bg-[rgba(10,94,215,.08)] text-salis-blue'
          )}
        >
          <Icon name={role.icon} size={20} />
        </span>
        <span className="font-action text-sm font-bold">{t(role.label)}</span>
      </span>

      <p className="text-pretty text-xs leading-[1.4] opacity-75">
        {rtl ? role.ar : t(role.desc)}
      </p>

      <span className="flex items-center gap-1.5 text-[11px] opacity-60">
        <Icon name="Users" size={12} />
        <span dir="ltr">{role.count}</span>
        <span>{t('Users')}</span>
      </span>
    </button>
  )
}
