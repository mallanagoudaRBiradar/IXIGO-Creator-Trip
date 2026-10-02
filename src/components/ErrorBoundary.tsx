import { Component, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/**
 * Catches render errors anywhere below it, so one broken screen shows a recovery card
 * instead of freezing the whole app. `resetKey` (the route) clears the error on navigation.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('Trip Reels crashed:', error, info.componentStack)
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid h-full place-items-center px-8 text-center">
        <div>
          <div className="text-4xl">🧭</div>
          <p className="mt-3 font-display text-[22px] font-bold">Something went wrong</p>
          <p className="mx-auto mt-1.5 max-w-[30ch] text-[13px] text-white/60">This screen hit a snag. Reloading usually fixes it, and your trips and settings are safe.</p>
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={() => location.reload()} className="rounded-2xl bg-ixi-orange px-5 py-3 text-[14px] font-bold">
              Reload
            </button>
            <button onClick={() => (location.href = '/')} className="rounded-2xl bg-white/[.08] px-5 py-3 text-[14px] font-bold">
              Go to Reels
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('trip-reels-v1')
                location.href = '/'
              }}
              className="mt-2 text-[12px] font-semibold text-white/45 underline-offset-2 hover:underline"
            >
              Still stuck? Reset app data
            </button>
          </div>
          <details className="mt-4 text-left text-[11px] text-white/35">
            <summary className="cursor-pointer text-center">Technical details</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">{this.state.error.message}</pre>
          </details>
        </div>
      </div>
    )
  }
}
