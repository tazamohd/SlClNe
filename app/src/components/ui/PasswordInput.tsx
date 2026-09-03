import { forwardRef, useId, useState, type KeyboardEvent, type FocusEvent } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'
import { Input, type InputProps } from './Input'

/** A password field with the behaviours every password field needs and the
 *  prototypes gave only to Login: a show/hide toggle, a Caps Lock warning, and
 *  the `autoComplete` hint that lets a password manager tell a sign-in apart
 *  from a sign-up.
 *
 *  The optional strength meter is four segments in blue tints — the palette
 *  has no green and no red (README §7), so weak reads as orange copy under
 *  light-blue segments and strong as the brand gradient. It scores shape, not
 *  entropy: length, mixed case, digits, symbols. Good enough to nudge a user
 *  off `password1`; the server's `MIN_PASSWORD_LENGTH` remains the rule. */

export type PasswordStrength = 0 | 1 | 2 | 3 | 4

const STRENGTH_LABELS: Record<Exclude<PasswordStrength, 0>, string> = {
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
}

export function passwordStrength(value: string): PasswordStrength {
  if (!value) return 0
  if (value.length < 8) return 1
  const checks = [
    value.length >= 12,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ]
  const points = 1 + checks.filter(Boolean).length
  return Math.min(4, points) as PasswordStrength
}

export interface PasswordInputProps
  extends Omit<InputProps, 'type' | 'trailing' | 'autoComplete' | 'value'> {
  /** Which credential this is — a password manager fills a `current-password`
   *  and offers to generate a `new-password`. Required so it cannot be left
   *  off by accident, which is what happened on every prototype but Login. */
  autoComplete: 'current-password' | 'new-password'
  value: string
  /** Show the four-segment strength meter under the field. */
  strength?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      autoComplete,
      value,
      strength = false,
      className,
      onKeyDown,
      onKeyUp,
      onBlur,
      'aria-describedby': describedBy,
      ...props
    },
    ref
  ) {
    const { t } = usePreferences()
    const [visible, setVisible] = useState(false)
    const [capsLock, setCapsLock] = useState(false)
    const generatedId = useId()
    const capsId = `${generatedId}-caps`
    const meterId = `${generatedId}-strength`

    const readCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
      // `getModifierState` is missing on synthetic events in some test
      // harnesses; a missing method reads as "off", never as a crash.
      setCapsLock(Boolean(event.getModifierState?.('CapsLock')))
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      readCapsLock(event)
      onKeyDown?.(event)
    }
    const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
      readCapsLock(event)
      onKeyUp?.(event)
    }
    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setCapsLock(false)
      onBlur?.(event)
    }

    const score = strength ? passwordStrength(value) : 0
    const described =
      [describedBy, capsLock ? capsId : null, strength && score ? meterId : null]
        .filter(Boolean)
        .join(' ') || undefined

    return (
      <div className="flex flex-col gap-1.5">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          dir="ltr"
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          aria-describedby={described}
          // Room for a 44px toggle: `Input` reserves 44px for a trailing
          // control, and the toggle overhangs the reserved inset by 8px.
          className={cn('pe-14', className)}
          trailing={
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? t('Hide password') : t('Show password')}
              aria-pressed={visible}
              className="-me-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-muted transition-colors duration-150 hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
            >
              <Icon name={visible ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          }
          {...props}
        />
        {/* Polite, not assertive: the warning matters before the next submit,
            not before the next keystroke. */}
        <span role="status" aria-live="polite" className="contents">
          {capsLock ? (
            <span
              id={capsId}
              className="flex items-center gap-1.5 text-[11px] font-medium text-salis-orange"
            >
              <Icon name="AlertCircle" size={12} className="flex-shrink-0" />
              {t('Caps Lock is on')}
            </span>
          ) : null}
        </span>
        {strength ? <StrengthMeter score={score} id={meterId} /> : null}
      </div>
    )
  }
)

function StrengthMeter({ score, id }: { score: PasswordStrength; id: string }) {
  const { t } = usePreferences()
  const strong = score >= 3
  return (
    <div id={id} className="flex items-center gap-3" data-strength={score}>
      <span className="flex flex-1 gap-1" aria-hidden>
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-200',
              segment > score
                ? 'bg-border'
                : strong
                  ? 'bg-salis-gradient-r'
                  : 'bg-salis-blue/40'
            )}
          />
        ))}
      </span>
      <span
        aria-live="polite"
        className={cn(
          'min-w-[3.5rem] text-end text-[11px] font-semibold',
          score === 0 ? 'text-faint' : strong ? 'text-salis-blue' : 'text-salis-orange'
        )}
      >
        {score === 0 ? (
          <span className="sr-only">{t('Password strength')}</span>
        ) : (
          <>
            <span className="sr-only">{t('Password strength')}: </span>
            {t(STRENGTH_LABELS[score])}
          </>
        )}
      </span>
    </div>
  )
}
