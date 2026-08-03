import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

/** Six-box verification code entry, shared by OTP and 2FA.
 *
 *  The prototypes rendered six loose inputs with no focus management, so you
 *  had to click each box and couldn't paste a code at all — which is how codes
 *  actually arrive. This advances on type, steps back on Backspace, and
 *  distributes a pasted code across the boxes.
 *
 *  Always LTR: a verification code is digits, and RTL would present them in the
 *  wrong order. */
export function CodeInput({
  value,
  onChange,
  length = 6,
  autoFocus,
}: {
  /** Current code; may be shorter than `length`. */
  value: string
  onChange: (next: string) => void
  length?: number
  autoFocus?: boolean
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const setChar = (index: number, char: string) => {
    const chars = value.padEnd(length, ' ').split('')
    chars[index] = char || ' '
    onChange(chars.join('').trimEnd())
  }

  function handleInput(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    setChar(index, digit)
    if (digit && index < length - 1) refs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus()
      setChar(index - 1, '')
      event.preventDefault()
    }
    if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus()
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!digits) return
    event.preventDefault()
    onChange(digits)
    refs.current[Math.min(digits.length, length - 1)]?.focus()
  }

  return (
    <div className="mb-5 flex justify-center gap-2" dir="ltr">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node
          }}
          value={value[index]?.trim() ?? ''}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          className="h-[52px] w-11 rounded border border-border bg-inset text-center text-xl font-bold text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
        />
      ))}
    </div>
  )
}
