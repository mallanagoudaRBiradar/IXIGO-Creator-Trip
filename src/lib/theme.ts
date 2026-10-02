import { useEffect, useState } from 'react'
import { useApp } from './store'

const query = () => window.matchMedia?.('(prefers-color-scheme: light)')

/** The theme actually in use, resolving "system" against the device setting (and following changes) */
export function useResolvedTheme(): 'light' | 'dark' {
  const pref = useApp((s) => s.theme)
  const [systemLight, setSystemLight] = useState(() => !!query()?.matches)
  useEffect(() => {
    const mq = query()
    if (!mq) return
    const on = (e: MediaQueryListEvent) => setSystemLight(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return pref === 'system' ? (systemLight ? 'light' : 'dark') : pref
}
