import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'
import { useIsMobile } from '@/lib/useMediaQuery'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  agreed?: string
}

export function validateRegister(values: {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  agreed: boolean
}): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.'
  if (!values.phone.trim()) errors.phone = 'Please enter your phone number.'
  if (!values.password) errors.password = 'Please enter a password.'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password.'
  else if (values.password && values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.'
  if (!values.agreed) errors.agreed = 'You must agree to the Terms & Privacy Policy.'
  return errors
}

/** Registration form — name, email, phone, password. */
export function Register() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  function submit(event: FormEvent) {
    event.preventDefault()
    const found = validateRegister({ name, email, phone, password, confirmPassword, agreed })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    if (!isLive) {
      toast.show({
        title: t('Registration is not available yet'),
        description: t('Please use the demo login to explore the application.'),
      })
      return
    }

    toast.show({ title: t('Registration submitted') })
  }

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[460px]'}>
      <div className="rounded-2xl border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] shadow-lg backdrop-blur-[24px]">
        <div className={`flex flex-col items-center gap-2 pb-0 ${isMobile ? 'p-4' : 'p-6'}`}>
          <BrandMark width={isMobile ? 90 : 110} />
          <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>{t('Create Account')}</h2>
        </div>

        <form onSubmit={submit} className={`flex flex-col gap-3.5 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-name"
              className="font-action text-xs font-medium tracking-[.025em] text-heading"
            >
              {t('Full Name')}
            </label>
            <Input
              id="reg-name"
              autoComplete="name"
              placeholder={t('Full Name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<Icon name="User" size={20} />}
              invalid={!!errors.name}
              aria-describedby={errors.name ? 'reg-name-error' : undefined}
            />
            {errors.name && <p id="reg-name-error" className="text-xs text-salis-orange">{t(errors.name)}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-email"
              className="font-action text-xs font-medium tracking-[.025em] text-heading"
            >
              {t('Email')}
            </label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Icon name="Mail" size={20} />}
              dir="ltr"
              invalid={!!errors.email}
              aria-describedby={errors.email ? 'reg-email-error' : undefined}
            />
            {errors.email && <p id="reg-email-error" className="text-xs text-salis-orange">{t(errors.email)}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-phone"
              className="font-action text-xs font-medium tracking-[.025em] text-heading"
            >
              {t('Phone')}
            </label>
            <Input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+966 5X XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Icon name="Phone" size={20} />}
              dir="ltr"
              className="font-mono text-[13px]"
              invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
            />
            {errors.phone && <p id="reg-phone-error" className="text-xs text-salis-orange">{t(errors.phone)}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-pw"
              className="font-action text-xs font-medium tracking-[.025em] text-heading"
            >
              {t('Password')}
            </label>
            <Input
              id="reg-pw"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Icon name="Lock" size={20} />}
              dir="ltr"
              invalid={!!errors.password}
              aria-describedby={errors.password ? 'reg-pw-error' : undefined}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={t('Toggle password visibility')}
                  className="flex cursor-pointer border-none bg-transparent p-0 text-muted"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
                </button>
              }
            />
            {errors.password && <p id="reg-pw-error" className="text-xs text-salis-orange">{t(errors.password)}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-confirm"
              className="font-action text-xs font-medium tracking-[.025em] text-heading"
            >
              {t('Confirm Password')}
            </label>
            <Input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Icon name="Lock" size={20} />}
              dir="ltr"
              invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'reg-confirm-error' : undefined}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={t('Toggle password visibility')}
                  className="flex cursor-pointer border-none bg-transparent p-0 text-muted"
                >
                  <Icon name={showConfirm ? 'EyeOff' : 'Eye'} size={20} />
                </button>
              }
            />
            {errors.confirmPassword && <p id="reg-confirm-error" className="text-xs text-salis-orange">{t(errors.confirmPassword)}</p>}
          </div>

          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            onClick={() => setAgreed((v) => !v)}
            className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 font-action text-[13px] text-body"
          >
            <span
              className={cn(
                'inline-flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] transition-all duration-150',
                agreed
                  ? 'border-none bg-salis-gradient text-white'
                  : 'border-[1.5px] border-border-strong bg-inset text-transparent'
              )}
            >
              <Icon name="Check" size={12} strokeWidth={3} />
            </span>
            <span>{t('I agree to the Terms & Privacy Policy')}</span>
          </button>
          {errors.agreed && <p className="text-xs text-salis-orange">{t(errors.agreed)}</p>}

          <Button type="submit" size="lg" className="w-full">
            {t('Register')}
          </Button>

          <p className="text-center font-action text-sm text-muted">
            {t('Already have an account?')}{' '}
            <Link to="/login" className="font-semibold">
              {t('Sign In')}
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
