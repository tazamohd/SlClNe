import { useEffect, useRef, useState, type ClipboardEvent } from 'react'
import { cn } from '@/lib/cn'

/** Six-digit code entry drawn as six cells over one real `<input>`.
 *
 *  One input, not six: that is what lets iOS and Android offer the code from
 *  the SMS (`autoComplete="one-time-code"`), what makes a pasted "482 913"
 *  land as one value, and what a screen reader announces as a single field
 *  rather than "Digit 1 of 6, edit text" six times. The cells are painted
 *  from the value and hidden from assistive technology; the input sits over
 *  them, transparent, so a tap on any cell focuses it.
 *
 *  Always LTR: a verification code is digits, and RTL would present them in
 *  the wrong order. */
export function OneTimeCodeInput({
  value,
  onChange,
  onComplete,
  length = 6,
  autoFocus,
  label,
  invalid,
  disabled,
  id,
}: {
  value: string
  onChange: (next: string) => void
  /** Fires once each time the value reaches `length` digits. */
  onComplete?: (code: string) => void
  length?: number
  autoFocus?: boolean
  /** Accessible name — already translated by the caller. */
  label: string
  invalid?: boolean
  disabled?: boolean
  id?: string
}) {
  const [focused, setFocused] = useState(false)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  useEffect(() => {
    if (value.length === length) completeRef.current?.(value)
  }, [value, length])

  const sanitise = (raw: string) => raw.replace(/\D/g, '').slice(0, length)

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    // `maxLength` would truncate "482 913" to "482 91" before onChange saw
    // it; taking the paste ourselves keeps every digit.
    const digits = sanitise(event.clipboardData.getData('text'))
    if (!digits) return
    event.preventDefault()
    onChange(digits)
  }

  const cells = Array.from({ length }, (_, index) => value[index] ?? '')
  const activeIndex = Math.min(value.length, length - 1)

  return (
    <div className="relative mb-5 flex justify-center" dir="ltr">
      <div className="pointer-events-none flex gap-2" aria-hidden>
        {cells.map((char, index) => {
          const active = focused && index === activeIndex
          return (
            <span
              key={index}
              className={cn(
                'flex h-[52px] w-11 items-center justify-center rounded border bg-inset font-mono text-xl font-bold text-heading transition-all duration-200',
                invalid
                  ? 'border-salis-orange'
                  : active
                    ? 'border-salis-blue bg-card shadow-[0_0_0_3px_rgba(10,94,215,.15)]'
                    : 'border-border'
              )}
            >
              {char}
              {active && !char ? (
                <span className="h-6 w-px animate-pulse bg-salis-blue motion-reduce:animate-none" />
              ) : null}
            </span>
          )
        })}
      </div>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(sanitise(event.target.value))}
        onPaste={handlePaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={length}
        dir="ltr"
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={label}
        aria-invalid={invalid || undefined}
        data-testid="one-time-code"
        // Transparent, over the cells: focusable and tappable, never seen.
        className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none"
      />
    </div>
  )
}
