import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, BedDouble, Coffee, Landmark, LogOut, Mountain, Navigation, Sparkles, Utensils, Waves } from 'lucide-react'
import Ticket from '../components/Ticket'
import { Avatar, SmartImage } from '../components/ui'
import { getCity, getReel, type City, type PinKind, type Reel } from '../lib/mockData'
import { buildTimeline, daysUntil, type TimelineItem } from '../lib/trip'
import { useApp, type Trip } from '../lib/store'
import { cx, fmtDate, weekday } from '../lib/utils'

const PIN_STYLE: Record<PinKind, { icon: typeof Coffee; color: string }> = {
  cafe: { icon: Coffee, color: '#F59E0B' },
  viewpoint: { icon: Mountain, color: '#38D9C0' },
  beach: { icon: Waves, color: '#0EA5E9' },
  food: { icon: Utensils, color: '#E8384F' },
  activity: { icon: Sparkles, color: '#8B5CF6' },
  heritage: { icon: Landmark, color: '#FF9A4D' },
}

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const trip = useApp((s) => s.trips.find((t) => t.id === id))
  const reel = trip ? getReel(trip.config.reelId) : undefined
  const days = useMemo(() => (trip && reel ? buildTimeline(trip, reel) : []), [trip, reel])
  const [activeDay, setActiveDay] = useState(1)
  const scroller = useRef<HTMLDivElement>(null)

  if (!trip || !reel) {
    return (
      <div className="grid h-full place-items-center px-10 text-center">
        <div>
          <p className="font-display text-xl font-bold">This trip isn't on this device</p>
          <button onClick={() => navigate('/trips')} className="mt-4 rounded-full bg-ixi-orange px-5 py-2.5 text-sm font-bold">See your trips</button>
        </div>
      </div>
    )
  }

  const origin = getCity(trip.config.origin)
  const stay = reel.stays[trip.config.tier]
  const n = daysUntil(trip.config.startDate)

  const jump = (d: number) => {
    setActiveDay(d)
    const el = scroller.current?.querySelector(`[data-day="${d}"]`) as HTMLElement | null
    if (el && scroller.current) scroller.current.scrollTo({ top: el.offsetTop - 56, behavior: 'smooth' })
  }

  const onScroll = () => {
    const root = scroller.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-day]'))
    const current = els.filter((el) => el.offsetTop - 80 <= root.scrollTop).pop()
    if (current) setActiveDay(Number(current.dataset.day))
  }

  return (
    <div ref={scroller} onScroll={onScroll} className="no-scrollbar h-full overflow-y-auto pb-10">
      {/* hero */}
      <div className="relative h-64">
        <SmartImage src={reel.scenes[0].img} alt={reel.destination.name} fallback={reel.fallback} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ixi-night via-ixi-night/40 to-black/30" />
        <div className="pt-safe absolute inset-x-0 top-0 px-4">
          <button onClick={() => navigate('/trips')} aria-label="Back to trips" className="mt-1 grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur">
            <ArrowLeft size={18} />
          </button>
        </div>
        <div className="absolute inset-x-5 bottom-4">
          <span className="rounded-full bg-ixi-orange px-2.5 py-1 text-[11px] font-bold">
            {n > 0 ? `Trip starts in ${n} day${n > 1 ? 's' : ''}` : n === 0 ? 'Trip starts today' : 'Trip completed'}
          </span>
          <h1 className="mt-2 font-display text-[34px] font-extrabold leading-none tracking-tight">{reel.destination.name}</h1>
          <p className="mt-1.5 text-[13px] text-white/70">
            Booking {trip.bookingId}, {trip.config.travelers} traveller{trip.config.travelers > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* creator strip */}
      <div className="mx-5 mt-1 flex items-center gap-3 rounded-2xl bg-white/[.04] p-3">
        <Avatar name={reel.creator.name} hue={reel.creator.hue} size={36} />
        <p className="text-[12px] leading-snug text-white/70">
          <span className="font-semibold text-white">@{reel.creator.handle}</span> tagged {reel.pins.length} spots for this trip. They're pinned to the right day below.
        </p>
      </div>

      {/* day tabs */}
      <div className="sticky top-0 z-10 mt-4 bg-ixi-night/95 px-5 py-2.5 backdrop-blur">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {days.map((d) => (
            <button
              key={d.day}
              onClick={() => jump(d.day)}
              className={cx('relative shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold', activeDay === d.day ? 'text-white' : 'text-white/55')}
            >
              {activeDay === d.day && <motion.span layoutId="day-pill" className="absolute inset-0 -z-10 rounded-full bg-white/10" />}
              Day {d.day}
              <span className="ml-1.5 text-[11px] font-medium text-white/45">{weekday(d.date)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* timeline */}
      <div className="px-5">
        {days.map((d) => (
          <section key={d.day} data-day={d.day} className="pt-5">
            <h2 className="font-display text-[20px] font-bold">
              Day {d.day}, {fmtDate(d.date, { weekday: 'long', day: 'numeric', month: 'short' })}
            </h2>
            <p className="text-[13px] text-white/50">{d.title}</p>
            <ol className="relative mt-4 space-y-4 border-l-2 border-white/10 pl-6">
              {d.items.map((it, i) => (
                <li key={i} className="relative">
                  <Dot item={it} />
                  <div className="mb-1.5 text-[12px] font-semibold tabular-nums text-white/50">{it.time}</div>
                  <Item item={it} trip={trip} reel={reel} origin={origin} stayName={stay.name} stayImg={stay.img} />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}

function Item({ item, trip, reel, origin, stayName, stayImg }: { item: TimelineItem; trip: Trip; reel: Reel; origin: City; stayName: string; stayImg: string }) {
    if (item.kind === 'transport') {
      const seat = item.quote.mode === 'flight' ? '14C' : item.quote.mode === 'bus' ? 'Lower L7' : 'B2, 34'
      return (
        <Ticket
          quote={item.quote}
          from={origin}
          to={{ code: reel.destination.code, name: reel.destination.name }}
          reverse={item.reverse}
          notch="#060B22"
          qr={`${trip.bookingId}|${trip.pnr}|${item.reverse ? 'RET' : 'OUT'}`}
          footer={
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-ixi-night/55">
              <div>PNR<div className="text-[14px] font-extrabold text-ixi-night">{trip.pnr}</div></div>
              <div>Seat<div className="text-[14px] font-extrabold text-ixi-night">{seat}</div></div>
              <div className="col-span-2 flex items-center gap-1.5 font-semibold text-ctkt">
                <span className="relative flex h-2 w-2"><span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-ctkt" /><span className="relative h-2 w-2 rounded-full bg-ctkt" /></span>
                On time, live status
              </div>
            </div>
          }
        />
      )
    }
    if (item.kind === 'checkin') {
      return (
        <div className="overflow-hidden rounded-[20px] border border-white/10 bg-ixi-navy">
          <div className="flex gap-3 p-3">
            <SmartImage src={stayImg} alt={stayName} fallback={reel.fallback} className="h-16 w-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-ixi-ember"><BedDouble size={13} /> Check-in</div>
              <div className="truncate font-display text-[16px] font-bold">{stayName}</div>
              <div className="text-[12px] text-white/50">{reel.nights} nights, voucher {trip.bookingId.replace('IXR', 'HTL')}</div>
            </div>
            <div className="rounded-lg bg-white p-1.5"><QRCodeSVG value={`${trip.bookingId}|HOTEL`} size={44} fgColor="#060B22" /></div>
          </div>
          <div className="border-t border-white/5 px-3 py-2 text-[12px] text-white/55">Show this at reception. ID needed for every guest.</div>
        </div>
      )
    }
    if (item.kind === 'checkout') {
      return (
        <div className="flex items-center gap-3 rounded-2xl bg-white/[.04] p-3 text-[13px]">
          <LogOut size={16} className="text-white/60" />
          Check out of {stayName}. Leave bags at reception if you're exploring.
        </div>
      )
    }
    const { pin } = item
    const st = PIN_STYLE[pin.kind]
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pin.name}, ${reel.destination.name}, ${reel.destination.state}`)}`
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-[16px] font-bold">{pin.name}</div>
            <p className="mt-1 text-[13px] leading-snug text-white/70">
              <span className="font-semibold" style={{ color: st.color }}>{reel.creator.name.split(' ')[0]}:</span> {pin.note}
            </p>
          </div>
          <a href={maps} target="_blank" rel="noreferrer" aria-label={`Open ${pin.name} in Maps`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[.07]">
            <Navigation size={15} />
          </a>
        </div>
      </div>
    )
  }

function Dot({ item }: { item: TimelineItem }) {
  const color = item.kind === 'pin' ? PIN_STYLE[item.pin.kind].color : item.kind === 'transport' ? '#F57224' : '#FFF5EA'
  const Icon = item.kind === 'pin' ? PIN_STYLE[item.pin.kind].icon : null
  return (
    <span className="absolute -left-[38px] top-0 grid h-6 w-6 place-items-center rounded-full border-2 border-ixi-night" style={{ background: color }}>
      {Icon && <Icon size={12} className="text-ixi-night" />}
    </span>
  )
}

