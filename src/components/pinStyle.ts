import { Coffee, Landmark, Mountain, Sparkles, Utensils, Waves } from 'lucide-react'
import type { Pin, PinKind } from '../lib/mockData'

export const PIN_STYLE: Record<PinKind, { icon: typeof Coffee; color: string; label: string }> = {
  cafe: { icon: Coffee, color: '#F59E0B', label: 'Café' },
  viewpoint: { icon: Mountain, color: '#38D9C0', label: 'Viewpoint' },
  beach: { icon: Waves, color: '#0EA5E9', label: 'Beach' },
  food: { icon: Utensils, color: '#E8384F', label: 'Food' },
  activity: { icon: Sparkles, color: '#8B5CF6', label: 'Activity' },
  heritage: { icon: Landmark, color: '#FF9A4D', label: 'Heritage' },
}

export const DAY_COLORS = ['#F57224', '#38D9C0', '#8B5CF6', '#0EA5E9', '#F59E0B']

export const mapsSearch = (name: string, place: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${place}`)}`

// Keyless OpenStreetMap tiles, darkened in CSS (.leaflet-tile-pane) to match the app.
// Fine for a demo; for production traffic switch to a keyed provider (MapTiler, Stadia) per OSM's tile policy.
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

/** Sorts a trip's pins into the order they are visited */
export const orderStops = (pins: Pin[], day: number | 'all') =>
  pins.filter((p) => day === 'all' || p.day === day).sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
