import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import type { Pin } from '../lib/mockData'
import { prefersReducedMotion } from '../lib/utils'
import { PIN_STYLE, TILE_ATTR, TILE_URL } from './pinStyle'


const ROUTE_MS = 2600


interface Props {
  stops: Pin[]
  selected: number | null
  onSelect: (i: number) => void
  replay: number // bump to replay the route animation
}

/** Interactive trip map: numbered pins in visiting order, with the route drawing itself between them */
export default function TripMap({ stops, selected, onSelect, replay }: Props) {
  const points = useMemo(() => stops.map((p) => [p.lat, p.lng] as [number, number]), [stops])
  const [progress, setProgress] = useState(0)

  // cumulative distance along the route, so the line draws at a steady speed
  const cum = useMemo(() => {
    const out = [0]
    for (let i = 1; i < points.length; i++) {
      const [a, b] = [points[i - 1], points[i]]
      out.push(out[i - 1] + Math.hypot(a[0] - b[0], a[1] - b[1]))
    }
    return out
  }, [points])
  const total = cum[cum.length - 1] || 1

  useEffect(() => {
    if (prefersReducedMotion() || points.length < 2) {
      setProgress(1)
      return
    }
    setProgress(0)
    let raf = 0
    let start = 0
    const tick = (t: number) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / ROUTE_MS)
      setProgress(1 - Math.pow(1 - p, 2)) // ease out
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    // let the sheet finish sliding in and the map fit first
    const delay = setTimeout(() => (raf = requestAnimationFrame(tick)), 450)
    return () => {
      clearTimeout(delay)
      cancelAnimationFrame(raf)
    }
  }, [points, replay])

  const { drawn, head } = useMemo(() => {
    if (points.length < 2) return { drawn: points, head: points[0] }
    const d = progress * total
    const out: [number, number][] = [points[0]]
    for (let i = 1; i < points.length; i++) {
      if (cum[i] <= d) {
        out.push(points[i])
        continue
      }
      const seg = cum[i] - cum[i - 1] || 1
      const f = (d - cum[i - 1]) / seg
      const [a, b] = [points[i - 1], points[i]]
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f])
      break
    }
    return { drawn: out, head: out[out.length - 1] }
  }, [progress, points, cum, total])

  const center = points[0] ?? [20.6, 78.9]

  return (
    <MapContainer center={center} zoom={13} zoomControl={false} attributionControl className="h-full w-full" scrollWheelZoom>
      <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={19} />
      <FitBounds points={points} />
      <FlyTo point={selected !== null ? points[selected] : undefined} />
      {/* faint full route under the animated one */}
      <Polyline positions={points} pathOptions={{ color: '#ffffff', opacity: 0.12, weight: 4, dashArray: '2 8' }} />
      <Polyline positions={drawn} pathOptions={{ color: '#F57224', weight: 4, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} />
      {stops.map((p, i) => {
        const reached = points.length < 2 || cum[i] <= progress * total + 1e-9
        return (
          <Marker
            key={`${p.name}-${i}`}
            position={[p.lat, p.lng]}
            icon={pinIcon(i + 1, PIN_STYLE[p.kind].color, reached, selected === i)}
            eventHandlers={{ click: () => onSelect(i) }}
            zIndexOffset={selected === i ? 1000 : 0}
            title={p.name}
            alt={`${i + 1}. ${p.name}`}
          />
        )
      })}
      {head && progress < 1 && <Marker position={head} icon={HEAD} interactive={false} />}
    </MapContainer>
  )
}

const HEAD = L.divIcon({ className: '', html: '<div class="map-head"></div>', iconSize: [14, 14], iconAnchor: [7, 7] })

// Icons are cached so the per-frame route animation doesn't rebuild every marker
const iconCache = new Map<string, L.DivIcon>()
const pinIcon = (n: number, color: string, reached: boolean, active: boolean) => {
  const key = `${n}|${color}|${reached}|${active}`
  let icon = iconCache.get(key)
  if (!icon) {
    icon = L.divIcon({
      className: '',
      html: `<div class="map-pin${reached ? ' pop' : ' is-pending'}${active ? ' is-active' : ''}" style="--c:${color}"><span>${n}</span></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    })
    iconCache.set(key, icon)
  }
  return icon
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  const key = points.map((p) => p.join(',')).join('|')
  useEffect(() => {
    // the container may have been sized by a sliding sheet; re-measure before fitting
    const t = setTimeout(() => {
      map.invalidateSize()
      if (points.length === 1) map.setView(points[0], 15)
      else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 })
    }, 320)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key])
  return null
}

function FlyTo({ point }: { point?: [number, number] }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (point) map.flyTo(point, Math.max(map.getZoom(), 14), { duration: 0.6 })
  }, [map, point])
  return null
}

