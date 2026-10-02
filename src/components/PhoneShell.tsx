import { useEffect, useState, type ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Battery, ChevronDown, ChevronUp, Signal, Wifi } from 'lucide-react'
import { useLocation } from 'react-router-dom'

function StatusBar() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 20000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[80] hidden h-11 items-center justify-between px-8 text-[13px] font-semibold text-white sm:flex">
      <span className="tabular-nums">{now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: false })}</span>
      <div className="absolute left-1/2 top-2.5 h-[26px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1.5">
        <Signal size={14} /> <Wifi size={14} /> <Battery size={18} />
      </span>
    </div>
  )
}

function DesktopPitch() {
  const url = typeof window !== 'undefined' ? window.location.origin : ''
  const isLocalhost = /localhost|127\.0\.0\.1/.test(url)
  return (
    <aside className="hidden w-[400px] shrink-0 lg:block">
      <div className="flex items-center gap-2.5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-ixi-orange">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M8 5v14l11-7z" /></svg>
        </div>
        <div className="leading-tight">
          <div className="font-display text-lg font-bold">Trip Reels</div>
          <div className="text-xs text-white/50">an ixigo Creator Hub concept</div>
        </div>
      </div>
      <h1 className="mt-10 font-display text-[56px] font-extrabold leading-[0.95] tracking-tight">
        Watch a trip.
        <br />
        Book the exact one.
      </h1>
      <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-white/65">
        Every reel is a creator's real, PNR-verified itinerary. One tap prices it from your city across ixigo flights, AbhiBus and ConfirmTkt trains.
      </p>
      <ol className="mt-8 space-y-4">
        {[
          ['Watch', 'Swipe through verified trips matched to your vibe.'],
          ['Clone', 'The whole itinerary is priced live from where you are.'],
          ['Go', 'Swap the stay, split with friends, and travel with a day-by-day companion.'],
        ].map(([t, d], i) => (
          <li key={t} className="flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 font-display text-sm font-bold text-ixi-ember">{i + 1}</span>
            <div>
              <div className="font-semibold">{t}</div>
              <div className="text-sm text-white/55">{d}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[.03] p-4">
        <div className="rounded-lg bg-white p-2">
          <QRCodeSVG value={url || 'https://ixigo.com'} size={84} fgColor="#060B22" />
        </div>
        <div className="text-sm text-white/65">
          <div className="font-semibold text-white">Try it on your phone</div>
          {isLocalhost ? 'Run npm run dev, then open the Network URL it prints on your phone.' : 'Scan with your camera. Same Wi-Fi network.'}
          <button
            className="mt-2 block text-xs font-semibold text-ixi-ember underline-offset-2 hover:underline"
            onClick={() => {
              localStorage.removeItem('trip-reels-v1')
              location.href = '/'
            }}
          >
            Reset demo data
          </button>
        </div>
      </div>
    </aside>
  )
}

const press = (key: string) => window.dispatchEvent(new KeyboardEvent('keydown', { key }))

export default function PhoneShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div className="stage flex h-[100dvh] w-full items-center justify-center gap-20 overflow-hidden">
      <DesktopPitch />
      <div className="relative">
      <div
        id="phone"
        className="relative isolate h-[100dvh] w-full overflow-hidden bg-ixi-night sm:h-[min(880px,calc(100dvh-40px))] sm:w-[408px] sm:rounded-[54px] sm:shadow-[0_0_0_11px_#14182b,0_0_0_12px_#2a2f48,0_40px_120px_-20px_rgba(0,0,0,.8)]"
        style={{ transform: 'translateZ(0)' }}
      >
        <StatusBar />
        {children}
      </div>
      {pathname === '/' && (
        <div className="absolute left-full top-1/2 ml-6 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
          <button aria-label="Previous reel" onClick={() => press('ArrowUp')} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10">
            <ChevronUp size={20} />
          </button>
          <button aria-label="Next reel" onClick={() => press('ArrowDown')} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10">
            <ChevronDown size={20} />
          </button>
          <span className="mt-1 text-center text-[10px] text-white/35">or use<br />arrow keys</span>
        </div>
      )}
      </div>
    </div>
  )
}
