import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { ArrowLeft, Check, ChevronsRight, CreditCard, Gem, Loader2, Smartphone, Wallet } from 'lucide-react'
import { ModeIcon, PartnerBadge, SmartImage } from '../ui'
import { FRIENDS } from './CrewView'
import { getCity, PARTNER, type Reel } from '../../lib/mockData'
import type { PriceBreakdown, TripConfig } from '../../lib/pricing'
import { useApp, useUI } from '../../lib/store'
import { addDays, cx, fmtDate, inr, prefersReducedMotion, uid, weekday } from '../../lib/utils'

interface Base {
  reel: Reel
  cfg: TripConfig
  price: PriceBreakdown
}

const METHODS = [
  { id: 'upi', label: 'UPI', sub: 'Google Pay, PhonePe, Paytm or any UPI app', icon: Smartphone },
  { id: 'card', label: 'Credit or debit card', sub: 'No-cost EMI on cards above ₹10,000', icon: CreditCard },
  { id: 'wallet', label: 'ixigo Money', sub: 'Balance ₹1,240', icon: Wallet },
]

export function PayView({ reel, cfg, price, share, onBack, onPaid }: Base & { share: boolean; onBack: () => void; onPaid: (amount: number) => void }) {
  const [method, setMethod] = useState('upi')
  const [useGems, setUseGems] = useState(true)
  const gemsBalance = useApp((s) => s.gems)
  const base = share ? price.perPerson : price.total
  const gemOff = useGems ? Math.min(250, Math.floor(gemsBalance / 4)) : 0
  const amount = base - gemOff
  const end = addDays(cfg.startDate, reel.nights)

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 px-4 pb-3">
        <button onClick={onBack} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-white/[.06]">
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-display text-[20px] font-bold">Review and pay</h2>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
        <div className="flex gap-3 rounded-2xl bg-white/[.04] p-3">
          <SmartImage src={reel.scenes[0].img} alt="" fallback={reel.fallback} className="h-20 w-20 shrink-0 rounded-xl" />
          <div className="min-w-0 text-[13px]">
            <div className="font-display text-[17px] font-bold">{reel.destination.name}</div>
            <div className="text-white/60">
              {weekday(cfg.startDate)} {fmtDate(cfg.startDate)} to {weekday(end)} {fmtDate(end)}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <PartnerBadge mode={cfg.mode} />
              <span className="truncate text-white/60">{reel.stays[cfg.tier].name}</span>
            </div>
          </div>
        </div>

        {share && (
          <p className="rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-3 text-[13px] text-white/80">
            You're paying 1 of {cfg.travelers} shares. Seats and rooms are held for the crew for 24 hours.
          </p>
        )}

        <fieldset>
          <legend className="mb-2 font-display text-[16px] font-bold">Pay with</legend>
          <div className="space-y-2">
            {METHODS.map((m) => (
              <label key={m.id} className={cx('flex cursor-pointer items-center gap-3 rounded-2xl border p-3', method === m.id ? 'border-ixi-orange bg-ixi-orange/10' : 'border-white/10')}>
                <input type="radio" name="pay" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.06]"><m.icon size={17} /></span>
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold">{m.label}</span>
                  <span className="block text-[11px] text-white/50">{m.sub}</span>
                </span>
                <span className={cx('h-5 w-5 rounded-full border-2', method === m.id ? 'border-[6px] border-ixi-orange' : 'border-white/25')} />
              </label>
            ))}
          </div>
        </fieldset>

        <button onClick={() => setUseGems((g) => !g)} className="flex w-full items-center gap-3 rounded-2xl bg-white/[.04] p-3 text-left" aria-pressed={useGems}>
          <Gem size={18} className="text-ixi-ember" />
          <span className="flex-1 text-[13px]">
            <span className="block font-semibold">Use ixigo Gems</span>
            <span className="text-white/50">Redeem {(250 * 4).toLocaleString('en-IN')} Gems for {inr(250)} off</span>
          </span>
          <span className={cx('relative h-6 w-11 rounded-full transition-colors', useGems ? 'bg-ixi-orange' : 'bg-white/15')}>
            <motion.span layout className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white', useGems ? 'right-0.5' : 'left-0.5')} />
          </span>
        </button>

        <dl className="space-y-1.5 text-[13px]">
          <div className="flex justify-between"><dt className="text-white/55">{share ? 'Your share' : 'Trip total'}</dt><dd className="tabular-nums">{inr(base)}</dd></div>
          {gemOff > 0 && <div className="flex justify-between text-ctkt"><dt>Gems</dt><dd className="tabular-nums">−{inr(gemOff)}</dd></div>}
          <div className="flex justify-between pt-1 text-[16px] font-bold"><dt>To pay</dt><dd className="tabular-nums">{inr(amount)}</dd></div>
        </dl>
      </div>
      <div className="pb-safe shrink-0 border-t border-white/10 px-4 pb-3 pt-3 sm:pb-4">
        <SlideToPay label={`Slide to pay ${inr(amount)}`} onComplete={() => onPaid(amount)} />
      </div>
    </>
  )
}

function SlideToPay({ label, onComplete }: { label: string; onComplete: () => void }) {
  const track = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [max, setMax] = useState(260)
  const done = useRef(false)
  useLayoutEffect(() => {
    if (track.current) setMax(track.current.offsetWidth - 64)
  }, [])
  const textOpacity = useTransform(x, [0, max * 0.6], [1, 0])
  const fill = useTransform(x, (v) => v + 58)

  const complete = () => {
    if (done.current) return
    done.current = true
    animate(x, max, { duration: 0.15 })
    if (navigator.vibrate) navigator.vibrate(30)
    setTimeout(onComplete, 180)
  }

  return (
    <div ref={track} className="relative h-[62px] overflow-hidden rounded-2xl bg-white/[.07] p-[3px]">
      <motion.div className="absolute inset-y-[3px] left-[3px] rounded-[14px] bg-gradient-to-r from-ixi-orange/40 to-ixi-orange" style={{ width: fill }} />
      <motion.span style={{ opacity: textOpacity }} className="pointer-events-none absolute inset-0 grid place-items-center pl-12 text-[15px] font-bold">
        {label}
      </motion.span>
      <motion.button
        drag="x"
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => (x.get() > max * 0.8 ? complete() : animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 }))}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && complete()}
        aria-label={`${label}. Press Enter to pay`}
        className="relative z-10 grid h-14 w-14 cursor-grab touch-none place-items-center rounded-[14px] bg-ixi-orange shadow-glow active:cursor-grabbing"
      >
        <ChevronsRight size={24} />
      </motion.button>
    </div>
  )
}

export function ProcessingView({ reel, cfg, price, share, paid, onDone }: Base & { share: boolean; paid: number; onDone: (tripId: string) => void }) {
  const addTrip = useApp((s) => s.addTrip)
  const q = price.transport
  const steps = [
    `Holding ${cfg.travelers} ${cfg.mode === 'flight' ? 'seats' : cfg.mode === 'bus' ? 'berths' : 'berths'} on ${q.operator}`,
    `Confirming ${reel.stays[cfg.tier].name}`,
    `Issuing e-tickets via ${PARTNER[cfg.mode].name}`,
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = [0, 1, 2].map((n) => window.setTimeout(() => setI(n + 1), 850 * (n + 1)))
    const fin = window.setTimeout(() => {
      const trip = addTrip({
        bookingId: uid('IXR-'),
        pnr: uid(''),
        config: cfg,
        total: price.total,
        paidByYou: paid,
        crew: share ? FRIENDS.slice(0, cfg.travelers - 1).map((f) => f.name) : [],
      })
      onDone(trip.id)
    }, 850 * 3 + 400)
    return () => { t.forEach(clearTimeout); clearTimeout(fin) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }} className="mb-8 grid h-20 w-20 place-items-center rounded-full border-4 border-ixi-orange/25 border-t-ixi-orange">
        <ModeIcon mode={cfg.mode} size={28} className="text-ixi-ember" />
      </motion.div>
      <ol className="w-full max-w-xs space-y-3.5">
        {steps.map((s, n) => (
          <li key={s} className={cx('flex items-center gap-3 text-[14px] transition-opacity', n <= i ? 'opacity-100' : 'opacity-30')}>
            <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full', n < i ? 'bg-ctkt' : 'bg-white/10')}>
              {n < i ? <Check size={13} strokeWidth={3} /> : n === i ? <Loader2 size={13} className="animate-spin" /> : null}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}

export function SuccessView({ reel, cfg, price, tripId }: Base & { tripId: string | null }) {
  const navigate = useNavigate()
  const closeSheet = useUI((s) => s.closeSheet)
  const trip = useApp((s) => s.trips.find((t) => t.id === tripId))
  const gems = Math.round(price.total * 0.01)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const r = document.getElementById('phone')?.getBoundingClientRect()
    const x = r ? (r.left + r.width / 2) / window.innerWidth : 0.5
    const y = r ? (r.top + r.height * 0.3) / window.innerHeight : 0.3
    const colors = ['#F57224', '#FF9A4D', '#38D9C0', '#FFF5EA', '#E8384F']
    confetti({ particleCount: 110, spread: 75, origin: { x, y }, colors, scalar: 0.9 })
    setTimeout(() => confetti({ particleCount: 60, spread: 110, origin: { x, y: y + 0.05 }, colors, startVelocity: 25 }), 250)
  }, [])

  const open = () => {
    closeSheet()
    if (tripId) navigate(`/trips/${tripId}`)
  }

  return (
    <div className="no-scrollbar flex flex-1 flex-col items-center overflow-y-auto px-6 pb-6 pt-6 text-center">
      <motion.svg viewBox="0 0 80 80" className="h-20 w-20" initial="h" animate="v">
        <motion.circle cx="40" cy="40" r="36" fill="#14B87A" variants={{ h: { scale: 0 }, v: { scale: 1 } }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} />
        <motion.path d="M25 41 l10 10 l20 -22" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" variants={{ h: { pathLength: 0 }, v: { pathLength: 1 } }} transition={{ delay: 0.25, duration: 0.4 }} />
      </motion.svg>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-5 font-display text-[30px] font-extrabold leading-tight tracking-tight">
        You're going to {reel.destination.name}
      </motion.h2>
      <p className="mt-2 max-w-[30ch] text-[14px] text-white/60">
        Tickets, stay and {reel.creator.name.split(' ')[0]}'s map are ready in your Trips tab.
      </p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-6 w-full rounded-[20px] bg-ixi-paper p-4 text-left text-ixi-night">
        <div className="flex justify-between text-[12px] text-ixi-night/55">
          <span>Booking ID</span>
          <span>PNR</span>
        </div>
        <div className="flex justify-between font-display text-[18px] font-extrabold">
          <span>{trip?.bookingId ?? 'IXR-000000'}</span>
          <span>{trip?.pnr ?? '—'}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t-2 border-dashed border-ixi-night/15 pt-3 text-[13px]">
          <span>
            {getCity(cfg.origin).code} to {reel.destination.code}, {fmtDate(cfg.startDate)}
          </span>
          <span className="font-bold tabular-nums">{inr(trip?.paidByYou ?? price.total)} paid</span>
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-4 flex items-center gap-2 rounded-full bg-ixi-orange/10 px-3.5 py-2 text-[12px] font-semibold text-ixi-ember">
        <Gem size={14} /> {gems} Gems sent to @{reel.creator.handle} for the inspiration
      </motion.p>

      <div className="mt-auto w-full space-y-2 pt-6">
        <button onClick={open} className="w-full rounded-2xl bg-ixi-orange py-3.5 font-display text-[16px] font-extrabold shadow-glow">
          Open trip companion
        </button>
        <button onClick={closeSheet} className="w-full rounded-2xl py-3 text-[14px] font-semibold text-white/70">
          Keep exploring
        </button>
      </div>
    </div>
  )
}
