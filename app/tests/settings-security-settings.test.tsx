import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** `SecuritySettings` (BLK-004).
 *
 *  Previously six hand-picked values, none read from anywhere: a password
 *  minimum, a "Require 2FA" toggle, a "Session Timeout" of a flat 30 minutes,
 *  a max-login-attempts figure, an "IP Whitelist Enabled" toggle and an
 *  audit-log retention period. Three describe features this system does not
 *  have (2FA, IP allow-listing, audit-log retention) and are gone, not
 *  re-sourced. The other three, plus a real active-session count, now come
 *  from `GET /security/summary` — the same figures the login and
 *  password-change endpoints actually enforce.
 */

const flags = vi.hoisted(() => ({ live: false }))
const security = vi.hoisted(() => ({
  summary: null as Record<string, unknown> | null,
  fail: false,
}))

vi.mock('@/data/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/data/repository')>()
  return {
    ...mod,
    get isLive() {
      return flags.live
    },
    get securityApi() {
      return security.summary || security.fail
        ? {
            summary: async () => {
              if (security.fail) throw new Error('boom')
              return security.summary
            },
          }
        : null
    },
  }
})

const SUMMARY = {
  passwordMinLength: 12,
  loginMaxAttempts: 8,
  loginLockoutSeconds: 300,
  refreshTokenTtlDays: 30,
  activeSessions: 3,
}

const FABRICATED = ['Require 2FA', 'IP Whitelist Enabled', 'Audit Log Retention', '30 minutes', '90 days']

beforeEach(() => {
  flags.live = false
  security.summary = null
  security.fail = false
})

describe('SecuritySettings', () => {
  it('fixture: reads no policy at all rather than showing a hand-picked one', async () => {
    const { SecuritySettings } = await import('@/screens/settings/SecuritySettings')
    renderScreen(SecuritySettings, { role: 'owner' })
    expect(screen.getByText(/can only be read from the API/)).toBeInTheDocument()
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
  })

  it('live: shows the real enforced password minimum and login-lockout figures', async () => {
    flags.live = true
    security.summary = SUMMARY
    const { SecuritySettings } = await import('@/screens/settings/SecuritySettings')
    renderScreen(SecuritySettings, { role: 'owner' })
    expect(await screen.findByText('12 characters')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('5 minutes')).toBeInTheDocument()
    expect(screen.getByText('30 days')).toBeInTheDocument()
  })

  it('live: shows the real active-session count, not a hardcoded zero', async () => {
    flags.live = true
    security.summary = SUMMARY
    const { SecuritySettings } = await import('@/screens/settings/SecuritySettings')
    renderScreen(SecuritySettings, { role: 'owner' })
    expect(await screen.findByText('3')).toBeInTheDocument()
  })

  it('live: no fabricated feature survives — 2FA, IP allow-listing or audit retention', async () => {
    flags.live = true
    security.summary = SUMMARY
    const { SecuritySettings } = await import('@/screens/settings/SecuritySettings')
    renderScreen(SecuritySettings, { role: 'owner' })
    await screen.findByText('12 characters')
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
  })

  it('live: a lockout duration that is not a whole number of minutes shows in seconds', async () => {
    flags.live = true
    security.summary = { ...SUMMARY, loginLockoutSeconds: 90 }
    const { SecuritySettings } = await import('@/screens/settings/SecuritySettings')
    renderScreen(SecuritySettings, { role: 'owner' })
    expect(await screen.findByText('90 seconds')).toBeInTheDocument()
  })

  it('live: a failed read is an error state, never a substituted figure', async () => {
    flags.live = true
    security.fail = true
    const { SecuritySettings } = await import('@/screens/settings/SecuritySettings')
    renderScreen(SecuritySettings, { role: 'owner' })
    expect(await screen.findByText('Could not read the security policy')).toBeInTheDocument()
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
  })
})
