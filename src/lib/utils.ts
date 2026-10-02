export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export const compact = (n: number) =>
  n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n)

export const duration = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

// yyyy-mm-dd in local time (toISOString is UTC and shifts the day back in IST)
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', opts)

export const weekday = (iso: string) => fmtDate(iso, { weekday: 'short' })

export const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 8).toUpperCase()

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  (!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !!document.getElementById('phone')?.classList.contains('reduce-motion'))

/** "now", "5m", "3h", "2d", "4w" — the YouTube-style relative stamp */
export const ago = (ts: number) => {
  const s = Math.max(0, (Date.now() - ts) / 1000)
  if (s < 45) return 'now'
  if (s < 3600) return `${Math.round(s / 60)}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  if (s < 86400 * 7) return `${Math.round(s / 86400)}d`
  return `${Math.round(s / (86400 * 7))}w`
}

/** "2.1M" -> 2100000 */
export const parseCount = (v: string) => {
  const n = parseFloat(v)
  return /m$/i.test(v) ? n * 1e6 : /k$/i.test(v) ? n * 1e3 : n || 0
}
