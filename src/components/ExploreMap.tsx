import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { Map as MapIcon, Play, X } from 'lucide-react'
import { TILE_ATTR, TILE_URL } from './pinStyle'
import { ModeIcon, SmartImage } from './ui'
import type { City, Reel } from '../lib/mockData'
import { fromPrice } from '../lib/pricing'
import { useUI } from '../lib/store'
import { inr } from '../lib/utils'

const short = (n: number) => `₹${n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : n}`

/** All of India with a price pin per destination, priced from the viewer's city */
export default function ExploreMap({ reels, origin }: { reels: Reel[]; origin: City }) {
  const navigate = useNavigate()
  const openMap = useUI((s) => s.openMap)

  // one pin per destination, carrying every trip there
  const places = useMemo(() => {
    const by = new Map<string, Reel[]>()
    for (const r of reels) by.set(r.destination.id, [...(by.get(r.destination.id) ?? []), r])
    const list = [...by.values()].map((rs) => ({ dest: rs[0].destination, reels: rs, from: Math.min(...rs.map((r) => fromPrice(r, origin))), side: '' as '' | 'l' | 'r' }))
    // destinations within ~2° of each other (Goa and Gokarna) would overlap at country zoom: split them left/right
    for (const a of list)
      for (const b of list)
        if (a !== b && !a.side && Math.hypot(a.dest.lat - b.dest.lat, a.dest.lng - b.dest.lng) < 2) {
          a.side = a.dest.lng <= b.dest.lng ? 'l' : 'r'
          b.side = a.side === 'l' ? 'r' : 'l'
        }
    return list
  }, [reels, origin])

  const [sel, setSel] = useState<string | null>(null)
  const place = places.find((p) => p.dest.id === sel)
  useEffect(() => {
    if (sel && !place) setSel(null)
  }, [sel, place])

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[21.5, 79]} zoom={4} zoomControl={false} className="h-full w-full" minZoom={3}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={18} />
        <Fit points={[[origin.lat, origin.lng], ...places.map((p) => [p.dest.lat, p.dest.lng] as [number, number])]} />
        <Marker position={[origin.lat, origin.lng]} icon={ORIGIN} title={`You, ${origin.name}`} zIndexOffset={-100} />
        {place && (
          <Polyline
            positions={[[origin.lat, origin.lng], [place.dest.lat, place.dest.lng]]}
            pathOptions={{ color: '#F57224', weight: 2.5, dashArray: '6 8', opacity: 0.9 }}
          />
        )}
        {places.map((p) => (
          <Marker
            key={p.dest.id}
            position={[p.dest.lat, p.dest.lng]}
            icon={priceIcon(p.from, p.reels.length, p.dest.id === sel, p.side)}
            zIndexOffset={p.dest.id === sel ? 1000 : 0}
            eventHandlers={{ click: () => setSel(p.dest.id) }}
            title={`${p.dest.name}, from ${inr(p.from)}`}
          />
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-full bg-ixi-night/85 px-3 py-1.5 text-[12px] font-semibold backdrop-blur">
        <span className="h-2.5 w-2.5 rounded-full border-2 border-snow bg-[#3B82F6]" /> Prices from {origin.name}
      </div>

      <AnimatePresence>
        {place && (
          <motion.div
            key={place.dest.id}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="absolute inset-x-3 bottom-3 z-[500] rounded-[22px] border border-white/10 bg-ixi-navy/95 p-3 shadow-2xl backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-[18px] font-bold leading-tight">{place.dest.name}</div>
                <div className="text-[12px] text-white/55">
                  {place.dest.state} · {place.reels.length} trip{place.reels.length === 1 ? '' : 's'} · from {inr(place.from)}
                </div>
              </div>
              <button onClick={() => setSel(null)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
                <X size={15} />
              </button>
            </div>
            <div className="no-scrollbar -mx-3 mt-2.5 flex gap-2.5 overflow-x-auto px-3">
              {place.reels.map((r) => (
                <div key={r.id} className="flex w-[250px] shrink-0 gap-2.5 rounded-2xl bg-white/[.05] p-2">
                  <SmartImage src={r.scenes[0].img} alt="" fallback={r.fallback} className="h-[84px] w-16 shrink-0 rounded-xl" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="line-clamp-2 text-[13px] font-bold leading-snug">{r.title}</div>
                    <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-white/55">
                      <ModeIcon mode={r.recommendedMode} size={11} /> {inr(fromPrice(r, origin))} · @{r.creator.handle}
                    </div>
                    <div className="mt-auto flex gap-1.5 pt-1.5">
                      <button onClick={() => navigate(`/?reel=${r.id}`)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-ixi-orange py-1.5 text-[12px] font-bold">
                        <Play size={11} fill="white" /> Watch
                      </button>
                      <button onClick={() => openMap(r.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/10 py-1.5 text-[12px] font-bold">
                        <MapIcon size={12} /> Spots
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ORIGIN = L.divIcon({ className: '', html: '<div class="origin-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })

const priceIcon = (from: number, count: number, active: boolean, side: '' | 'l' | 'r') =>
  L.divIcon({
    className: '',
    html: `<div class="price-pin${active ? ' is-active' : ''}${side ? ` side-${side}` : ''}">${short(from)}${count > 1 ? `<small>·${count}</small>` : ''}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })

function Fit({ points }: { points: [number, number][] }) {
  const map = useMap()
  const key = points.map((p) => p.join(',')).join('|')
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize()
      map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 6 })
    }, 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key])
  return null
}
