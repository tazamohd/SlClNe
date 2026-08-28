import { Component, type ErrorInfo, type ReactNode } from 'react'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

function DefaultFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const { t } = usePreferences()
  return (
    <div role="alert" className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tint-orange text-salis-orange">
        <Icon name="AlertTriangle" size={24} />
      </span>
      <div>
        <h2 className="text-lg font-bold text-heading">{t('Something went wrong')}</h2>
        <p className="mt-1 text-sm text-muted">
          {error.message || t('An unexpected error occurred.')}
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-salis-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-salis-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
      >
        {t('Try again')}
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  private reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return <DefaultFallback error={this.state.error} onReset={this.reset} />
    }

    return this.props.children
  }
}
