import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation, RotateCcw, Route } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { DAY_COLORS, PIN_STYLE, mapsSearch, orderStops } from './pinStyle'

// Leaflet only loads when a map is first opened
const TripMap = lazy(() => import('./TripMap'))
import { Avatar } from './ui'
import { getReel, type Reel } from '../lib/mockData'
import { useUI } from '../lib/store'
import { cx } from '../lib/utils'

export default function MapSheet() {
  const reelId = useUI((s) => s.mapReelId)
  const openMap = useUI((s) => s.openMap)
  const reel = reelId ? getReel(reelId) : undefined
  return (
    <BottomSheet open={!!reel} onClose={() => openMap(null)} label="Trip map" height="90%" z={55}>
      {reel && <TripMapView key={reel.id} reel={reel} />}
    </BottomSheet>
  )
}

function TripMapView({ reel }: { reel: Reel }) {
  const navigate = useNavigate()
  const { openMap, openSheet } = useUI()
  const days = useMemo(() => [...new Set(reel.pins.map((p) => p.day))].sort(), [reel])
  const [day, setDay] = useState<number | 'all'>('all')
  const [selected, setSelected] = useState<number | null>(null)
  const [replay, setReplay] = useState(0)
  const stops = useMemo(() => orderStops(reel.pins, day), [reel, day])
  const place = `${reel.destination.name}, ${reel.destination.state}`
  const sel = selected !== null ? stops[selected] : null

  useEffect(() => setSelected(null), [day])

  // Google Maps directions through every stop (it accepts up to 9 waypoints)
  const routeUrl = useMemo(() => {
    if (stops.length < 2) return mapsSearch(stops[0]?.name ?? reel.destination.name, place)
    const ll = (p: (typeof stops)[number]) => `${p.lat},${p.lng}`
    const mid = stops.slice(1, -1).slice(0, 9).map(ll).join('|')
    return `https://www.google.com/maps/dir/?api=1&origin=${ll(stops[0])}&destination=${ll(stops[stops.length - 1])}${mid ? `&waypoints=${encodeURIComponent(mid)}` : ''}&travelmode=driving`
  }, [stops, place, reel])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-5 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              openMap(null)
              navigate(`/c/${reel.creator.handle}`)
            }}
            aria-label={`Open @${reel.creator.handle}'s channel`}
          >
            <Avatar name={reel.creator.name} hue={reel.creator.hue} size={38} />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-[19px] font-bold leading-tight">{reel.destination.name} trip map</h2>
            <p className="truncate text-[12px] text-white/55">
              @{reel.creator.handle} tagged {reel.pins.length} spots over {days.length} days
            </p>
          </div>
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter by day">
          {(['all', ...days] as const).map((d) => (
            <button
              key={d}
              role="tab"
              aria-selected={day === d}
              onClick={() => setDay(d)}
              className={cx('flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors', day === d ? 'bg-white text-ixi-night' : 'bg-white/[.07] text-white/75')}
            >
              {d !== 'all' && <span className="h-2 w-2 rounded-full" style={{ background: DAY_COLORS[(d - 1) % DAY_COLORS.length] }} />}
              {d === 'all' ? 'Whole trip' : `Day ${d}`}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[46%] shrink-0 overflow-hidden border-y border-white/10">
        <Suspense fallback={<MapLoading />}>
          <TripMap stops={stops} selected={selected} onSelect={setSelected} replay={replay} />
        </Suspense>
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex justify-between">
          <button onClick={() => setReplay((r) => r + 1)} className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-ixi-night/85 px-3 py-1.5 text-[12px] font-bold backdrop-blur">
            <RotateCcw size={13} /> Replay route
          </button>
          <a href={routeUrl} target="_blank" rel="noreferrer" className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-ixi-orange px-3 py-1.5 text-[12px] font-bold">
            <Route size={13} /> Open full route
          </a>
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-3">
        <AnimatePresence mode="wait">
          {sel && (
            <motion.div key={sel.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 rounded-2xl border border-white/10 bg-white/[.05] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: PIN_STYLE[sel.kind].color }}>
                    {PIN_STYLE[sel.kind].label} · Day {sel.day}, {sel.time}
                  </div>
                  <div className="mt-0.5 font-display text-[17px] font-bold">{sel.name}</div>
                  <p className="mt-1 text-[13px] leading-snug text-white/75">
                    <span className="font-semibold text-white">{reel.creator.name.split(' ')[0]}:</span> {sel.note}
                  </p>
                </div>
                <a href={mapsSearch(sel.name, place)} target="_blank" rel="noreferrer" aria-label={`Open ${sel.name} in Maps`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ixi-orange">
                  <Navigation size={16} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ol className="space-y-1.5">
          {stops.map((p, i) => {
            const st = PIN_STYLE[p.kind]
            const Icon = st.icon
            const newDay = i === 0 || stops[i - 1].day !== p.day
            return (
              <li key={`${p.name}-${i}`}>
                {day === 'all' && newDay && <div className="mb-1.5 mt-2 text-[12px] font-bold text-white/45">Day {p.day}</div>}
                <button
                  onClick={() => setSelected(i)}
                  className={cx('flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors', selected === i ? 'bg-white/10' : 'hover:bg-white/[.05]')}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-extrabold text-abyss" style={{ background: st.color }}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                    <span className="flex items-center gap-1 text-[12px] text-white/50">
                      <Icon size={11} /> {st.label} · {p.time}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="pb-safe shrink-0 border-t border-white/10 px-5 py-3">
        <button
          onClick={() => {
            openMap(null)
            openSheet(reel.id, 'build')
          }}
          className="w-full rounded-2xl bg-gradient-to-r from-ixi-orange to-[#FF8A3D] py-3 font-display text-[16px] font-extrabold shadow-glow"
        >
          Take me there ✈️
        </button>
      </div>
    </div>
  )
}

export function MapLoading() {
  return <div className="grid h-full w-full animate-pulse place-items-center bg-ixi-ink text-[12px] text-white/40">Loading map…</div>
}
