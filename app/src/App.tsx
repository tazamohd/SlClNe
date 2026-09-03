import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { SessionProvider } from '@/providers/SessionProvider'
import { ModalProvider } from '@/components/ui/Modal'
import { ToastProvider } from '@/components/ui/Toast'
import { RepositoryProvider } from '@/providers/RepositoryProvider'
import { AppRoutes } from '@/routes'

// Mock data never goes stale, and won't once it's real either — the screens
// here are dashboards and registries, not tickers.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <SessionProvider>
          <RepositoryProvider>
            <ToastProvider>
              <ModalProvider>
                {/* `v7_startTransition` wraps navigations in a transition, so
                    the screen you are on stays visible until the next lazy
                    chunk has landed — no flash of skeleton on a warm cache. */}
                <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true }}>
                  <AppRoutes />
                </BrowserRouter>
              </ModalProvider>
            </ToastProvider>
          </RepositoryProvider>
        </SessionProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  )
}
