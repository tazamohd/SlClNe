import { Link } from 'react-router-dom'
import { z } from 'zod'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Form, FormErrorSummary, useZodForm } from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'
import { useIsMobile } from '@/lib/useMediaQuery'
import { AuthFormField } from './AuthFormField'

const nameRule = z.string().trim().min(1, 'Please enter your name.')
const emailRule = z
  .string()
  .trim()
  .min(1, 'Please enter your email address.')
  .email('Please enter a valid email address.')
const phoneRule = z.string().trim().min(1, 'Please enter your phone number.')
const passwordRule = z
  .string()
  .min(1, 'Please enter a password.')
  .min(8, 'Password must be at least 8 characters.')
const confirmRule = z.string().min(1, 'Please confirm your password.')

/** The registration contract. The messages are English source strings —
 *  the field renders them through `t()`. */
export const registerSchema = z
  .object({
    name: nameRule,
    email: emailRule,
    phone: phoneRule,
    password: passwordRule,
    confirmPassword: confirmRule,
    agreed: z.boolean().refine((value) => value, 'You must agree to the Terms & Privacy Policy.'),
  })
  .superRefine((values, ctx) => {
    if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      })
    }
  })

interface RegisterValues extends Record<string, unknown> {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  agreed: boolean
}

/** Registration form — name, email, phone, password. Validates inline on
 *  blur and summarises a refused submit above the fields. */
export function Register() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()

  const form = useZodForm<RegisterValues, z.output<typeof registerSchema>>({
    schema: registerSchema,
    initial: { name: '', email: '', phone: '', password: '', confirmPassword: '', agreed: false },
    onSubmit: () => {
      if (!isLive) {
        toast.show({
          title: t('Registration is not available yet'),
          description: t('Please use the demo login to explore the application.'),
        })
        return
      }
      toast.show({ title: t('Registration submitted') })
    },
  })

  const agreed = form.values.agreed
  const agreedError = form.errors.agreed && form.submitted ? t(form.errors.agreed) : null

  return (
    <AuthLayout className="mx-auto max-w-[460px]">
      <div className="rounded-2xl border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] shadow-lg backdrop-blur-[24px]">
        <div className={`flex flex-col items-center gap-2 pb-0 ${isMobile ? 'p-4' : 'p-6'}`}>
          <BrandMark width={isMobile ? 90 : 110} />
          <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>{t('Create Account')}</h2>
        </div>

        <Form form={form} className={isMobile ? 'p-4' : 'p-6'}>
          <FormErrorSummary />

          <AuthFormField
            form={form}
            name="name"
            label="Full Name"
            autoComplete="name"
            placeholderKey="Full Name"
            icon={<Icon name="User" size={20} />}
            rule={nameRule}
          />

          <AuthFormField
            form={form}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            icon={<Icon name="Mail" size={20} />}
            ltr
            rule={emailRule}
          />

          <AuthFormField
            form={form}
            name="phone"
            label="Phone"
            type="tel"
            autoComplete="tel"
            placeholder="+966 5X XXX XXXX"
            icon={<Icon name="Phone" size={20} />}
            ltr
            mono
            rule={phoneRule}
          />

          <AuthFormField
            form={form}
            name="password"
            label="Password"
            password="new-password"
            strength
            placeholder="••••••••"
            icon={<Icon name="Lock" size={20} />}
            rule={passwordRule}
          />

          <AuthFormField
            form={form}
            name="confirmPassword"
            label="Confirm Password"
            password="new-password"
            placeholder="••••••••"
            icon={<Icon name="Lock" size={20} />}
            rule={confirmRule}
          />

          <div className="flex flex-col gap-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreed}
              aria-invalid={agreedError ? true : undefined}
              onClick={() => form.setValue('agreed', !agreed)}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-start font-action text-[13px] text-body focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
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
            {agreedError ? (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-salis-orange">
                <Icon name="AlertCircle" size={12} className="flex-shrink-0" />
                {agreedError}
              </span>
            ) : null}
          </div>

          <Button type="submit" size="lg" className="w-full" loading={form.pending}>
            {t('Register')}
          </Button>

          <p className="text-center font-action text-sm text-muted">
            {t('Already have an account?')}{' '}
            <Link to="/login" className="inline-flex min-h-[44px] items-center font-semibold">
              {t('Sign In')}
            </Link>
          </p>
        </Form>
      </div>
    </AuthLayout>
  )
}
