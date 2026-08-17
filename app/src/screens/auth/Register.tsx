import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { AuthCard, Field } from '@/components/shell/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public self-signup. The design hands off to RoleSelection on submit —
 *  the invited party picks customer or supplier once the account exists. */
export function Register() {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      toast.show({ title: t('Error'), description: t('Please fill in all fields'), error: true })
      return
    }
    navigate('/role-selection')
  }

  return (
    <AuthLayout className="mx-auto max-w-[420px]">
      <AuthCard
        logo
        title={t('Register')}
        footer={
          <p className="mt-4 text-center font-action text-sm text-muted">
            {t("Don't have an account?")}{' '}
            <Link to="/login" className="font-semibold">
              {t('Sign In')}
            </Link>
          </p>
        }
      >
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <Field label={t('Full Name')} htmlFor="fullName">
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder={t('Full Name')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>

          <Field label={t('Email')} htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
            />
          </Field>

          <Field label={t('Phone')} htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+966 5X XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className="font-mono text-[13px]"
            />
          </Field>

          <Field label={t('Password')} htmlFor="pw">
            <Input
              id="pw"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
          </Field>

          <Button type="submit" size="lg" className="w-full">
            {t('Register')}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
