import type { ComponentType, ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { render, type RenderResult } from '@testing-library/react'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { SessionProvider } from '@/providers/SessionProvider'
import { ModalProvider } from '@/components/ui/Modal'
import { ToastProvider } from '@/components/ui/Toast'
import { STORAGE_KEYS } from '@/lib/storage'
import type { Language, RoleId } from '@/data/types'

/** The provider stack from `App.tsx`, minus the router which tests supply as a
 *  `MemoryRouter` so navigation is observable.
 *
 *  Screens read their role and language from providers, so a test that mounts a
 *  screen bare would exercise a program that never runs in production. Retries
 *  are off: a query that fails should fail the test immediately, not after
 *  three silent attempts. */
export interface HarnessOptions {
  role?: RoleId
  language?: Language
  route?: string
}

function Providers({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return (
    <QueryClientProvider client={client}>
      <PreferencesProvider>
        <SessionProvider>
          <ToastProvider>
            <ModalProvider>{children}</ModalProvider>
          </ToastProvider>
        </SessionProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  )
}

/** Seeds the preferences and session that the providers read at first render.
 *  They read storage in a `useState` initialiser, so this has to happen before
 *  the tree mounts. */
function seed({ role, language }: HarnessOptions): void {
  if (role) window.localStorage.setItem(STORAGE_KEYS.role, role)
  if (language) window.localStorage.setItem(STORAGE_KEYS.lang, language)
}

export function renderWithProviders(ui: ReactElement, options: HarnessOptions = {}): RenderResult {
  seed(options)
  return render(
    <Providers>
      <MemoryRouter initialEntries={[options.route ?? '/']}>{ui}</MemoryRouter>
    </Providers>
  )
}

/** Mounts a screen component by reference, so a `.ts` test file can render a
 *  screen without needing JSX of its own. */
export function renderScreen(
  Screen: ComponentType,
  options: HarnessOptions = {}
): RenderResult {
  return renderWithProviders(<Screen />, options)
}
