import { getCity, type Pin, type Reel } from './mockData'
import { priceTrip, type TransportQuote } from './pricing'
import type { Trip } from './store'
import { addDays } from './utils'

export type TimelineItem =
  | { kind: 'transport'; time: string; quote: TransportQuote; reverse: boolean; overnight: boolean }
  | { kind: 'checkin'; time: string }
  | { kind: 'checkout'; time: string }
  | { kind: 'pin'; time: string; pin: Pin }

export interface TimelineDay {
  day: number
  date: string
  title: string
  items: TimelineItem[]
}

const toMins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const toClock = (m: number) => {
  const x = ((Math.round(m) % 1440) + 1440) % 1440
  return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`
}

export function buildTimeline(trip: Trip, reel: Reel): TimelineDay[] {
  const origin = getCity(trip.config.origin)
  const q = priceTrip(trip.config, reel, origin).transport
  const dep = toMins(q.depart)
  const overnight = dep + q.durationMins >= 1440
  const arrive = (dep + q.durationMins) % 1440
  // check in after arrival, never before noon
  const q15 = (m: number) => Math.ceil(m / 15) * 15
  const checkin = q15(Math.max(arrive + 45, 12 * 60))
  // return leg leaves after checkout
  const retDep = q15(Math.max(dep, 13 * 60 + 30))
  const ret: TransportQuote = { ...q, depart: toClock(retDep), arrive: toClock(retDep + q.durationMins) }

  const days: TimelineDay[] = []
  for (let d = 1; d <= reel.days; d++) {
    const items: TimelineItem[] = []
    const pins = reel.pins.filter((p) => p.day === d).sort((a, b) => a.time.localeCompare(b.time))
    if (d === 1) {
      items.push({ kind: 'transport', time: overnight ? `Arrives ${q.arrive}` : `Departs ${q.depart}`, quote: q, reverse: false, overnight })
      items.push({ kind: 'checkin', time: toClock(checkin) })
      // shift day-one spots so they fall after check-in
      let t = checkin + 60
      pins.forEach((pin) => {
        const at = q15(Math.max(toMins(pin.time), t))
        items.push({ kind: 'pin', time: toClock(at), pin })
        t = at + 90
      })
    } else if (d === reel.days) {
      pins.filter((p) => toMins(p.time) < retDep - 60).forEach((pin) => items.push({ kind: 'pin', time: pin.time, pin }))
      items.splice(items.findIndex((i) => i.kind === 'pin' && toMins(i.time) > 11 * 60) >>> 0, 0, { kind: 'checkout', time: '11:00' })
      items.push({ kind: 'transport', time: `Departs ${ret.depart}`, quote: ret, reverse: true, overnight: retDep + q.durationMins >= 1440 })
    } else {
      pins.forEach((pin) => items.push({ kind: 'pin', time: pin.time, pin }))
    }
    days.push({
      day: d,
      date: addDays(trip.config.startDate, d - 1),
      title: d === 1 ? (overnight ? 'Overnight in, then settle in' : 'Arrive and settle in') : d === reel.days ? 'Last morning, head home' : `Exploring ${reel.destination.name}`,
      items,
    })
  }
  return days
}

export const daysUntil = (iso: string) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((new Date(iso + 'T00:00:00').getTime() - now.getTime()) / 86400000)
}
