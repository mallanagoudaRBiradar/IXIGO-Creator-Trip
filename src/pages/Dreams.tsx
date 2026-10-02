import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trash2, TrendingDown } from 'lucide-react'
import { PageHeader, PartnerBadge, SmartImage } from '../components/ui'
import { getCity, getReel } from '../lib/mockData'
import { useApp, useUI } from '../lib/store'
import { fmtDate, inr } from '../lib/utils'

function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  const w = 120
  const h = 36
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const color = up ? '#E8384F' : '#14B87A'
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-[120px]" aria-hidden>
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }} />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} />
    </svg>
  )
}

export default function Dreams() {
  const { dreams, removeDream, dropDreamPrice } = useApp()
  const { openSheet, notify } = useUI()
  const navigate = useNavigate()

  return (
    <div className="no-scrollbar h-full overflow-y-auto pb-8">
      <PageHeader title="Dream Board" sub="We watch fares on these trips around the clock and ping you when they drop." />
      {dreams.length === 0 ? (
        <div className="mx-5 mt-8 rounded-3xl border border-dashed border-white/15 p-8 text-center">
          <div className="text-4xl">✨</div>
          <p className="mt-3 font-display text-xl font-bold">Nothing saved yet</p>
          <p className="mt-2 text-sm text-white/55">Tap the bookmark on any reel. We'll track the whole trip's price and tell you when it's cheaper.</p>
          <button onClick={() => navigate('/')} className="mt-5 rounded-full bg-ixi-orange px-5 py-2.5 text-sm font-bold">Browse reels</button>
        </div>
      ) : (
        <ul className="space-y-3 px-5">
          <AnimatePresence initial={false}>
            {dreams.map((d) => {
              const reel = getReel(d.config.reelId)
              if (!reel) return null
              const diff = d.savedPrice - d.currentPrice
              return (
                <motion.li key={d.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }} className="overflow-hidden rounded-[24px] border border-white/10 bg-ixi-navy">
                  <div className="flex gap-3 p-3">
                    <SmartImage src={reel.scenes[0].img} alt={reel.destination.name} fallback={reel.fallback} className="h-24 w-20 shrink-0 rounded-2xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="truncate font-display text-[18px] font-bold">{reel.destination.name}</h2>
                          <p className="text-[12px] text-white/55">
                            From {getCity(d.config.origin).name}, {fmtDate(d.config.startDate)}, {d.config.travelers} guests
                          </p>
                        </div>
                        <button onClick={() => removeDream(d.id)} aria-label={`Remove ${reel.destination.name}`} className="p-1 text-white/40 hover:text-white">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-2">
                        <div>
                          <motion.div key={d.currentPrice} initial={{ scale: 1.15, color: '#38D9C0' }} animate={{ scale: 1, color: '#ffffff' }} className="origin-left font-display text-[22px] font-extrabold tabular-nums leading-none">
                            {inr(d.currentPrice)}
                          </motion.div>
                          {diff > 0 ? (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-ctkt/15 px-2 py-0.5 text-[11px] font-bold text-ctkt">
                              <TrendingDown size={12} /> {inr(diff)} lower than saved
                            </span>
                          ) : (
                            <span className="mt-1 flex items-center gap-1.5 text-[11px] text-white/50">
                              <span className="relative flex h-2 w-2"><span className="ping-soft absolute h-full w-full rounded-full bg-ixi-orange" /><span className="relative h-2 w-2 rounded-full bg-ixi-orange" /></span>
                              Tracking fares
                            </span>
                          )}
                        </div>
                        <Sparkline values={d.history} up={false} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-white/5 px-3 py-2.5">
                    <PartnerBadge mode={d.config.mode} />
                    <button
                      onClick={() => {
                        const drop = Math.max(400, Math.round((d.currentPrice * 0.05) / 50) * 50)
                        dropDreamPrice(d.id, drop)
                        notify({ title: `Fares dropped by ${inr(drop)}`, body: `${reel.destination.name} from ${getCity(d.config.origin).name} is now ${inr(d.currentPrice - drop)}.`, icon: '📉', tone: 'green' })
                      }}
                      className="text-[11px] font-semibold text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
                    >
                      Demo a fare drop
                    </button>
                    <button onClick={() => openSheet(reel.id, 'build', { ...d.config, fareDrop: d.savedPrice - d.currentPrice })} className="ml-auto rounded-xl bg-ixi-orange px-4 py-2 text-[13px] font-bold">
                      Book at {inr(d.currentPrice)}
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
