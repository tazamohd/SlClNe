import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { ROLES, destinationFor } from '@/data/rbac'
import type { Role, RoleId } from '@/data/types'

/** The role switcher, for the one account that has it.
 *
 *  It renders nothing at all for every other session — the check is
 *  `canSwitchRole`, which is true only while the signed-in account's own role
 *  is `test`. That is a display decision and nothing more: the server re-checks
 *  the switch against the account's row and refuses anyone else with a 403, so
 *  a caller who forces this component to mount gets a control that does not
 *  work rather than a privilege it did not have.
 *
 *  It lives at the app root rather than in the sidebar because acting as a
 *  customer, a supplier or a technician takes the tester into a portal shell
 *  that has no sidebar — a switcher only the back-office shell rendered would
 *  be a one-way door out of the back office.
 */
export function TestRoleBar() {
  const { t, rtl } = usePreferences()
  const { canSwitchRole, role, switchRole } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!canSwitchRole) return null

  const current = (ROLES as readonly Role[]).find((r) => r.id === role)

  async function pick(next: RoleId) {
    setBusy(true)
    setError(null)
    const result = await switchRole(next)
    setBusy(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setOpen(false)
    navigate(destinationFor(result.role), { replace: true })
  }

  return (
    <div
      className="fixed bottom-3 z-[60] flex flex-col items-start gap-2 end-3"
      data-testid="test-role-bar"
    >
      {open && (
        <div
          role="listbox"
          aria-label={t('Act as role')}
          className="max-h-[calc(var(--vh-full)*0.6)] w-[240px] overflow-y-auto rounded-lg border border-border bg-card p-1.5 shadow-lg"
        >
          {(ROLES as readonly Role[]).map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={option.id === role}
              disabled={busy}
              onClick={() => void pick(option.id as RoleId)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2 py-1.5 text-start font-action text-[13px] text-heading transition-colors duration-150 hover:bg-tint-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue disabled:cursor-progress"
            >
              <Icon name={option.icon} size={14} className="flex-shrink-0 text-muted" />
              <span className="min-w-0 flex-1 truncate">{rtl ? option.ar : option.label}</span>
              {option.id === role && <Icon name="Check" size={13} className="text-salis-blue" />}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="max-w-[240px] rounded-md bg-card px-2 py-1 text-xs text-salis-orange shadow-sm">
          {error}
        </p>
      )}

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3 py-2 font-action text-xs font-semibold text-heading shadow-lg transition-colors duration-150 hover:border-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
      >
        <Icon name="FlaskConical" size={14} className="text-salis-blue" />
        <span>{t('Acting as')}:</span>
        <span className="text-salis-blue">{current ? (rtl ? current.ar : current.label) : role}</span>
        <Icon name={open ? 'ChevronDown' : 'ChevronRight'} size={12} className="text-muted" />
      </button>
    </div>
  )
}
