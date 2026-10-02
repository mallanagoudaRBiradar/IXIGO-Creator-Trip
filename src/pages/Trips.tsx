import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck, MapPin, Users } from 'lucide-react'
import { PageHeader, PartnerBadge, SmartImage } from '../components/ui'
import { getCity, getReel } from '../lib/mockData'
import { daysUntil } from '../lib/trip'
import { useApp } from '../lib/store'
import { addDays, fmtDate, inr } from '../lib/utils'

export default function Trips() {
  const trips = useApp((s) => s.trips)
  const navigate = useNavigate()
  return (
    <div className="no-scrollbar h-full overflow-y-auto pb-8">
      <PageHeader title="Trips" sub="Tickets, stays and your creator's map, organised day by day." />
      {trips.length === 0 ? (
        <div className="mx-5 mt-10 rounded-3xl border border-dashed border-white/15 p-8 text-center">
          <p className="font-display text-xl font-bold">No trips booked yet</p>
          <p className="mt-2 text-sm text-white/55">Tap Take me there on any reel and your trip will appear here with your tickets.</p>
          <button onClick={() => navigate('/')} className="mt-5 rounded-full bg-ixi-orange px-5 py-2.5 text-sm font-bold">Browse reels</button>
        </div>
      ) : (
        <ul className="space-y-4 px-5">
          {trips.map((t, i) => {
            const reel = getReel(t.config.reelId)
            if (!reel) return null
            const n = daysUntil(t.config.startDate)
            const end = addDays(t.config.startDate, reel.nights)
            return (
              <motion.li key={t.id} initial={i === 0 ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }}>
                <Link to={`/trips/${t.id}`} className="block overflow-hidden rounded-[26px] border border-white/10 bg-ixi-navy">
                  <div className="relative h-40">
                    <SmartImage src={reel.scenes[0].img} alt={reel.destination.name} fallback={reel.fallback} className="h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ixi-navy via-ixi-navy/30 to-transparent" />
                    <span className="theme-dark absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[12px] font-bold backdrop-blur">
                      {n > 1 ? `In ${n} days` : n === 1 ? 'Tomorrow' : n === 0 ? 'Today' : 'Completed'}
                    </span>
                    <div className="absolute inset-x-4 bottom-3">
                      <h2 className="font-display text-[24px] font-extrabold leading-none">{reel.destination.name}</h2>
                      <p className="mt-1 text-[13px] text-white/70">
                        {fmtDate(t.config.startDate)} to {fmtDate(end)}, from {getCity(t.config.origin).name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 text-[12px] text-white/65">
                    <PartnerBadge mode={t.config.mode} />
                    <span className="flex items-center gap-1"><MapPin size={12} /> {reel.pins.length} spots</span>
                    {t.crew.length > 0 && <span className="flex items-center gap-1"><Users size={12} /> {t.crew.length + 1} going</span>}
                    <span className="ml-auto font-semibold tabular-nums text-white">{inr(t.paidByYou)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-white/5 px-4 py-2.5 text-[12px] text-white/50">
                    <BadgeCheck size={13} className="text-verify" /> Inspired by @{reel.creator.handle}
                  </div>
                </Link>
              </motion.li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
