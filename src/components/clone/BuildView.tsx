import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, CalendarDays, Check, ChevronDown, Gem, Minus, Plus, Sparkles, Star, Users } from 'lucide-react'
import Ticket from '../Ticket'
import { AnimatedNumber, ModeIcon, SmartImage } from '../ui'
import { getCity, PARTNER, type Mode, type Reel, type Tier } from '../../lib/mockData'
import { nextFriday, quoteTransport, type PriceBreakdown, type TripConfig } from '../../lib/pricing'
import { useApp, useUI, canNotify } from '../../lib/store'
import { addDays, cx, fmtDate, inr, toISODate, weekday } from '../../lib/utils'

interface Props {
  reel: Reel
  cfg: TripConfig
  setCfg: (c: TripConfig) => void
  price: PriceBreakdown
  onBook: () => void
  onCrew: () => void
}

const TIERS: { id: Tier; label: string }[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'standard', label: 'Standard' },
  { id: 'luxury', label: 'Luxury' },
]

export default function BuildView({ reel, cfg, setCfg, price, onBook, onCrew }: Props) {
  const navigate = useNavigate()
  const origin = getCity(cfg.origin)
  const { saveDream, dropDreamPrice } = useApp()
  const savedAlready = useApp((s) => s.dreams.some((d) => d.config.reelId === reel.id && d.config.origin === cfg.origin))
  const { notify, setPicker } = useUI()
  const [justSaved, setJustSaved] = useState(false)
  useEffect(() => setJustSaved(false), [cfg.origin])

  const dates = useMemo(() => {
    const f = nextFriday()
    return [0, 7, 14, 21].map((n) => addDays(f, n))
  }, [])
  const minDate = useMemo(() => addDays(toISODate(new Date()), 1), [])
  const customDate = !dates.includes(cfg.startDate)

  // a locked Dream Board fare only holds for the same route and mode
  const set = (patch: Partial<TripConfig>) =>
    setCfg({ ...cfg, ...patch, ...(patch.mode || patch.origin ? { fareDrop: undefined } : {}) })
  const stay = reel.stays[cfg.tier]
  const gems = Math.round(price.total * 0.01)

  const save = () => {
    const d = saveDream(cfg)
    if (!d) return
    setJustSaved(true)
    notify({ title: 'Saved to Dream Board', body: `We're tracking fares for ${reel.destination.name} from ${origin.name}.`, icon: '✨' })
    // Demo: a fare drop lands a few seconds later
    const drop = Math.max(500, Math.round((d.currentPrice * 0.07) / 50) * 50)
    window.setTimeout(() => {
      dropDreamPrice(d.id, drop)
      // the price still drops on the Dream Board; the push only shows if price alerts are on
      if (!canNotify('priceDrops')) return
      notify({
        title: `Fares dropped by ${inr(drop)}`,
        body: `Your saved ${reel.destination.name} trip from ${origin.name} is now ${inr(d.currentPrice - drop)}.`,
        icon: '📉',
        tone: 'green',
        actionLabel: 'View on Dream Board',
        onAction: () => {
          useUI.getState().closeSheet()
          navigate('/dreams')
        },
      })
    }, 7000)
  }

  return (
    <>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
        {/* header */}
        <div className="theme-dark relative mx-4 h-36 overflow-hidden rounded-3xl">
          <SmartImage src={reel.scenes[0].img} alt={reel.destination.name} fallback={reel.fallback} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ixi-night via-ixi-night/40 to-transparent" />
          <div className="absolute inset-x-4 bottom-3.5">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white/80">
              <BadgeCheck size={14} className="text-verify" /> @{reel.creator.handle}'s exact trip
            </div>
            <h2 className="mt-1 font-display text-[26px] font-extrabold leading-none tracking-tight">{reel.destination.name}</h2>
            <button onClick={() => setPicker(true)} className="mt-1.5 flex items-center gap-1 text-[13px] font-semibold text-ixi-ember">
              from {origin.name} <ChevronDown size={14} />
            </button>
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
            {reel.days} days, {reel.nights} nights
          </span>
        </div>

        {/* when + who */}
        <div className="mt-4 px-4">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {dates.map((d) => (
              <button
                key={d}
                onClick={() => set({ startDate: d })}
                className={cx('shrink-0 rounded-2xl border px-3.5 py-2 text-left', d === cfg.startDate ? 'border-ixi-orange bg-ixi-orange/15' : 'border-white/10 bg-white/[.03]')}
              >
                <div className="text-[11px] text-white/55">{weekday(d)}</div>
                <div className="text-[14px] font-bold">{fmtDate(d)}</div>
              </button>
            ))}
            {/* the input covers the chip so a tap opens the native picker on iOS and Android */}
            <label
              className={cx('relative shrink-0 rounded-2xl border px-3.5 py-2 text-left', customDate ? 'border-ixi-orange bg-ixi-orange/15' : 'border-white/10 bg-white/[.03]')}
            >
              <div className="flex items-center gap-1 text-[11px] text-white/55">
                <CalendarDays size={12} /> {customDate ? weekday(cfg.startDate) : 'Any date'}
              </div>
              <div className="text-[14px] font-bold">{customDate ? fmtDate(cfg.startDate) : 'Pick date'}</div>
              <input
                type="date"
                aria-label="Pick a start date"
                min={minDate}
                value={cfg.startDate}
                onChange={(e) => e.target.value && set({ startDate: e.target.value })}
                className="absolute inset-0 h-full w-full cursor-pointer text-[16px] opacity-0"
              />
            </label>
          </div>
          <div className="mt-2.5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] py-1.5 pl-4 pr-1.5">
            <div>
              <div className="text-[14px] font-semibold">Travellers</div>
              <div className="text-[11px] text-white/50">{price.rooms} room{price.rooms > 1 ? 's' : ''}, priced together</div>
            </div>
            <div className="flex items-center gap-1">
              <button aria-label="Fewer travellers" disabled={cfg.travelers <= 1} onClick={() => set({ travelers: cfg.travelers - 1 })} className="grid h-9 w-9 place-items-center rounded-full bg-white/[.06] disabled:opacity-30">
                <Minus size={15} />
              </button>
              <motion.span key={cfg.travelers} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="w-8 text-center text-[16px] font-bold tabular-nums">{cfg.travelers}</motion.span>
              <button aria-label="More travellers" disabled={cfg.travelers >= 8} onClick={() => set({ travelers: cfg.travelers + 1 })} className="grid h-9 w-9 place-items-center rounded-full bg-white/[.06] disabled:opacity-30">
                <Plus size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* getting there */}
        <Section title="Getting there" hint="Round trip">
          <div className="grid grid-cols-3 gap-2">
            {(['flight', 'bus', 'train'] as Mode[]).map((m) => {
              const q = quoteTransport(m, origin, reel, cfg.travelers, cfg.startDate)
              const on = cfg.mode === m
              return (
                <button
                  key={m}
                  onClick={() => set({ mode: m })}
                  className={cx('relative rounded-2xl border p-2.5 text-left transition-colors', on ? 'bg-white/[.06]' : 'border-white/10 bg-white/[.02]')}
                  style={on ? { borderColor: PARTNER[m].color } : undefined}
                  aria-pressed={on}
                >
                  {reel.recommendedMode === m && <span className="absolute -top-2 right-2 rounded-full bg-verify px-1.5 py-px text-[9px] font-bold text-abyss">Creator's pick</span>}
                  <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: PARTNER[m].color }}>
                    <ModeIcon mode={m} size={14} /> {PARTNER[m].label}
                  </span>
                  <span className="mt-1 block text-[14px] font-bold tabular-nums">{inr(q.perPerson)}</span>
                  <span className="block text-[10px] text-white/45">{PARTNER[m].name}</span>
                </button>
              )
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={cfg.mode + cfg.origin} initial={{ opacity: 0, y: 8, rotateX: -12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <Ticket
                className="mt-3"
                quote={price.transport}
                from={origin}
                to={{ code: reel.destination.code, name: reel.destination.name }}
                footer={<TicketFooter mode={cfg.mode} price={price} travelers={cfg.travelers} />}
              />
            </motion.div>
          </AnimatePresence>
        </Section>

        {/* where you'll stay */}
        <Section title="Where you'll stay" hint="Smart Swap keeps the rest of the trip">
          <div className="relative grid grid-cols-3 rounded-2xl bg-white/[.05] p-1">
            {TIERS.map((t) => {
              const on = cfg.tier === t.id
              return (
                <button key={t.id} onClick={() => set({ tier: t.id })} className="relative z-10 rounded-xl px-2 py-2 text-center" aria-pressed={on}>
                  {on && <motion.span layoutId="tier-pill" className="absolute inset-0 -z-10 rounded-xl bg-ixi-orange" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                  <span className="block text-[13px] font-bold">{t.label}</span>
                  <span className={cx('block text-[11px] tabular-nums', on ? 'text-white/85' : 'text-white/45')}>{inr(reel.stays[t.id].pricePerNight)}/night</span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 overflow-hidden rounded-[20px] border border-white/10 bg-ixi-ink">
            <div className="relative h-36">
              <AnimatePresence initial={false}>
                <motion.div key={cfg.tier} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                  <SmartImage src={stay.img} alt={stay.name} fallback={reel.fallback} className="h-full w-full" />
                </motion.div>
              </AnimatePresence>
              {cfg.tier === reel.recommendedTier && (
                <span className="theme-dark absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-bold text-verify backdrop-blur">
                  <BadgeCheck size={12} /> {reel.creator.name.split(' ')[0]} stayed here
                </span>
              )}
            </div>
            <div className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.h4 key={stay.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="truncate font-display text-[17px] font-bold">
                      {stay.name}
                    </motion.h4>
                  </AnimatePresence>
                  <p className="text-[12px] text-white/55">
                    {stay.area}, {price.rooms} room{price.rooms > 1 ? 's' : ''} for {reel.nights} nights
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-lg bg-ctkt/15 px-1.5 py-0.5 text-[12px] font-bold text-ctkt">
                  <Star size={11} fill="currentColor" /> {stay.rating}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {stay.perks.map((p) => (
                  <span key={p} className="rounded-full bg-white/[.06] px-2 py-0.5 text-[11px] text-white/75">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* experiences */}
        <Section title={`${reel.creator.name.split(' ')[0]}'s experiences`} hint="Add what you like">
          <ul className="space-y-2">
            {reel.experiences.map((e) => {
              const on = cfg.experiences.includes(e.id)
              return (
                <li key={e.id}>
                  <button
                    onClick={() => set({ experiences: on ? cfg.experiences.filter((x) => x !== e.id) : [...cfg.experiences, e.id] })}
                    className={cx('flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors', on ? 'border-ixi-orange/60 bg-ixi-orange/10' : 'border-white/10 bg-white/[.02]')}
                    aria-pressed={on}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[.06] text-xl">{e.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{e.title}</span>
                      <span className="block text-[12px] text-white/50">
                        {e.duration}, {inr(e.price)} per person
                      </span>
                    </span>
                    <span className={cx('grid h-6 w-6 place-items-center rounded-full border-2 transition-colors', on ? 'border-ixi-orange bg-ixi-orange' : 'border-white/25')}>
                      {on && <Check size={13} strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Section>

        {/* breakdown */}
        <Section title="Price breakdown">
          <dl className="space-y-2 rounded-2xl bg-white/[.03] p-4 text-[13px]">
            <Row k={`${PARTNER[cfg.mode].label} for ${cfg.travelers}`} v={inr(price.transport.total)} />
            <Row k={`${stay.name.split(' ').slice(0, 3).join(' ')}`} v={inr(price.stay)} />
            {price.experiences > 0 && <Row k="Experiences" v={inr(price.experiences)} />}
            <Row k="Bundle discount" v={`−${inr(price.bundleDiscount)}`} green />
            {price.fareDrop > 0 && <Row k="Dream Board fare drop" v={`−${inr(price.fareDrop)}`} green />}
            <Row k="Convenience fee" v="Free on creator trips" green />
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[15px] font-bold">
              <dt>Total</dt>
              <dd><AnimatedNumber value={price.total} /></dd>
            </div>
          </dl>
          <p className="mt-2.5 flex items-center gap-2 text-[12px] text-white/60">
            <Gem size={14} className="text-ixi-ember" /> @{reel.creator.handle} earns {gems} Gems when you book.
          </p>
        </Section>
      </div>

      {/* sticky footer */}
      <div className="pb-safe shrink-0 border-t border-white/10 bg-ixi-navy/95 px-4 pt-3 backdrop-blur sm:pb-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-display text-[24px] font-extrabold leading-none">
              <AnimatedNumber value={price.total} />
            </div>
            <div className="mt-1 text-[12px] text-white/55">
              <AnimatedNumber value={price.perPerson} /> per person, you save <span className="font-semibold text-ctkt"><AnimatedNumber value={price.bundleDiscount} /></span>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onBook} className="cta-sweep relative overflow-hidden rounded-2xl bg-ixi-orange px-6 py-3.5 font-display text-[16px] font-extrabold shadow-glow">
            Book now
          </motion.button>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 pb-1">
          <button onClick={save} disabled={justSaved} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-[13px] font-semibold disabled:text-ixi-ember">
            {justSaved ? <Check size={15} /> : <Sparkles size={15} className="text-ixi-ember" />}
            {justSaved ? 'Watching fares' : savedAlready ? 'Update Dream Board' : 'Save to Dream Board'}
          </button>
          <button onClick={onCrew} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-[13px] font-semibold">
            <Users size={15} className="text-[#25D366]" /> Split with crew
          </button>
        </div>
      </div>
    </>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 px-4">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h3 className="font-display text-[18px] font-bold">{title}</h3>
        {hint && <span className="text-[11px] text-white/45">{hint}</span>}
      </div>
      {children}
    </section>
  )
}

function Row({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="truncate text-white/60">{k}</dt>
      <dd className={cx('shrink-0 font-semibold tabular-nums', green && 'text-ctkt')}>{v}</dd>
    </div>
  )
}

function TicketFooter({ mode, price, travelers }: { mode: Mode; price: PriceBreakdown; travelers: number }) {
  const q = price.transport
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 text-[12px] leading-snug text-abyss/65">
        {mode === 'train' && q.confirmChance ? (
          <>
            <span className="font-bold text-ctkt">{q.confirmChance}% chance</span> of confirmation
            <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-ixi-night/10">
              <motion.div className="h-full rounded-full bg-ctkt" initial={{ width: 0 }} animate={{ width: `${q.confirmChance}%` }} transition={{ duration: 0.8 }} />
            </div>
          </>
        ) : mode === 'bus' ? (
          <>Overnight, so you save a hotel night. {q.seatsLeft} berths left</>
        ) : (
          <>15 kg check-in included. {q.seatsLeft} seats left at this fare</>
        )}
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[16px] font-extrabold tabular-nums text-abyss">{inr(q.total)}</div>
        <div className="text-[10px] text-abyss/50">{travelers} traveller{travelers > 1 ? 's' : ''}</div>
      </div>
    </div>
  )
}

