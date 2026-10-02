import { CITIES, type City, type Mode, type Reel, type Tier } from './mockData'
import { toISODate } from './utils'

export interface TripConfig {
  reelId: string
  origin: string // city id
  mode: Mode
  tier: Tier
  travelers: number
  experiences: string[]
  startDate: string // ISO yyyy-mm-dd
  fareDrop?: number // locked-in price drop from the Dream Board
}

export interface TransportQuote {
  mode: Mode
  perPerson: number // round trip
  total: number
  durationMins: number
  depart: string
  arrive: string
  operator: string
  number: string
  confirmChance?: number // ConfirmTkt prediction
  seatsLeft: number
}

export interface PriceBreakdown {
  transport: TransportQuote
  stay: number
  rooms: number
  experiences: number
  bundleDiscount: number
  fareDrop: number
  total: number
  perPerson: number
  separateTotal: number // what it would cost booking pieces separately
}

const toRad = (d: number) => (d * Math.PI) / 180

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  // road / rail routes are ~25% longer than straight line
  return Math.max(120, 2 * R * Math.asin(Math.sqrt(h)) * 1.25)
}

export function nearestCity(lat: number, lng: number): City {
  return CITIES.reduce((best, c) =>
    distanceKm({ lat, lng }, c) < distanceKm({ lat, lng }, best) ? c : best,
  )
}

// Small deterministic hash so the same route always shows the same operator/time
function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const round49 = (n: number) => Math.round(n / 50) * 50 - 1

const OPERATORS: Record<Mode, string[]> = {
  flight: ['IndiGo', 'Air India Express', 'Akasa Air', 'SpiceJet'],
  bus: ['VRL Travels', 'IntrCity SmartBus', 'Orange Travels', 'Zingbus'],
  train: ['Superfast Express', 'Rajdhani Express', 'Duronto Express', 'Vande Bharat'],
}

function clock(mins: number) {
  const m = ((mins % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  const mm = Math.round(m % 60)
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function quoteTransport(mode: Mode, origin: City, reel: Reel, travelers: number, date: string): TransportQuote {
  const km = distanceKm(origin, reel.destination)
  const seed = hash(origin.id + reel.id + mode + date)
  // weekend + short-notice demand multiplier
  const day = new Date(date).getDay()
  const demand = day === 5 || day === 6 ? 1.12 : 1
  let oneWay = 0
  let duration = 0
  let departMins = 0
  if (mode === 'flight') {
    oneWay = (2100 + km * 3.0) * demand
    duration = 55 + (km / 1.25 / 750) * 60 + 25 // taxi + cruise + ground transfer
    departMins = 360 + (seed % 10) * 75
  } else if (mode === 'bus') {
    oneWay = (320 + km * 1.4) * demand
    duration = (km / 50) * 60
    departMins = 1140 + (seed % 5) * 30 // evening departures, overnight
  } else {
    oneWay = (160 + km * 0.92) * demand
    duration = (km / 56) * 60
    departMins = 1020 + (seed % 8) * 45
  }
  const perPerson = round49(oneWay * 2)
  const ops = OPERATORS[mode]
  const operator = ops[seed % ops.length]
  const prefix = mode === 'flight' ? ['6E', 'IX', 'QP', 'SG'][seed % 4] : mode === 'train' ? '12' : 'AB'
  return {
    mode,
    perPerson,
    total: perPerson * travelers,
    durationMins: Math.round(duration),
    depart: clock(departMins),
    arrive: clock(departMins + duration),
    operator,
    number: `${prefix}${mode === 'flight' ? ' ' : ''}${(seed % 900) + 100}${mode === 'train' ? (seed % 9) + 1 : ''}`,
    confirmChance: mode === 'train' ? 68 + (seed % 29) : undefined,
    seatsLeft: 2 + (seed % 9),
  }
}

export function priceTrip(cfg: TripConfig, reel: Reel, origin: City): PriceBreakdown {
  const transport = quoteTransport(cfg.mode, origin, reel, cfg.travelers, cfg.startDate)
  const rooms = Math.ceil(cfg.travelers / 2)
  const stay = reel.stays[cfg.tier].pricePerNight * reel.nights * rooms
  const experiences = reel.experiences
    .filter((e) => cfg.experiences.includes(e.id))
    .reduce((s, e) => s + e.price * cfg.travelers, 0)
  const separateTotal = transport.total + stay + experiences
  const bundleDiscount = Math.round((transport.total + stay) * 0.07)
  const fareDrop = Math.min(cfg.fareDrop ?? 0, Math.round(separateTotal * 0.3))
  const total = separateTotal - bundleDiscount - fareDrop
  return {
    transport,
    stay,
    rooms,
    experiences,
    bundleDiscount,
    fareDrop,
    total,
    perPerson: Math.round(total / cfg.travelers),
    separateTotal,
  }
}

/** Cheapest "from" price shown on a reel's CTA (recommended mode, budget tier, solo) */
export function fromPrice(reel: Reel, origin: City) {
  const cfg = defaultConfig(reel, origin.id)
  return priceTrip({ ...cfg, tier: 'budget', travelers: 1, experiences: [] }, reel, origin).perPerson
}

export function nextFriday(from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7))
  return toISODate(d)
}

export function defaultConfig(reel: Reel, origin: string, travelers = 2): TripConfig {
  return {
    reelId: reel.id,
    origin,
    mode: reel.recommendedMode,
    tier: reel.recommendedTier,
    travelers,
    experiences: reel.experiences.slice(0, 1).map((e) => e.id),
    startDate: nextFriday(),
  }
}
