import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'

/** Registration form — name, email, phone, password. */
export function Register() {
  const { t } = usePreferences()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
  }

  return (
    <AuthLayout className="mx-auto max-w-[460px]">
      <div className="rounded-2xl border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] shadow-lg backdrop-blur-[24px]">
        <div className="flex flex-col items-center gap-2 p-6 pb-0">
          <BrandMark width={110} />
          <h2 className="font-display text-xl font-bold text-heading">{t('Create Account')}</h2>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3.5 p-6">
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
            />
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
            />
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
            />
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

          <Button type="submit" size="lg" className="w-full" disabled={!isLive}>
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
