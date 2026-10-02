import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ArrowLeft, Check, CheckCheck, Copy, Minus, Plus } from 'lucide-react'
import { Avatar, SmartImage } from '../ui'
import { getCity, type Reel } from '../../lib/mockData'
import type { PriceBreakdown, TripConfig } from '../../lib/pricing'
import { useUI } from '../../lib/store'
import { cx, inr } from '../../lib/utils'

export const FRIENDS = [
  { name: 'Rohan Iyer', reply: "I'm in, booking leave today", hue: ['#3B82F6', '#14B87A'] as [string, string] },
  { name: 'Priya Das', reply: 'That stay though 😍 count me in', hue: ['#E8384F', '#F59E0B'] as [string, string] },
  { name: 'Sameer Khan', reply: 'Paid my share. Who is getting snacks?', hue: ['#8B5CF6', '#3B82F6'] as [string, string] },
  { name: 'Ishaan Gupta', reply: 'Finally a plan that is actually happening', hue: ['#14B87A', '#F57224'] as [string, string] },
  { name: 'Ananya Rao', reply: 'Yes yes yes', hue: ['#F57224', '#8B5CF6'] as [string, string] },
  { name: 'Kunal Shah', reply: "Done. Let's go", hue: ['#0EA5E9', '#E8384F'] as [string, string] },
  { name: 'Diya Menon', reply: 'Adding to my calendar', hue: ['#F59E0B', '#14B87A'] as [string, string] },
]

interface Props {
  reel: Reel
  cfg: TripConfig
  setCfg: (c: TripConfig) => void
  price: PriceBreakdown
  onBack: () => void
  onPayShare: () => void
}

export default function CrewView({ reel, cfg, setCfg, price, onBack, onPayShare }: Props) {
  const notify = useUI((s) => s.notify)
  const origin = getCity(cfg.origin)
  const friends = FRIENDS.slice(0, cfg.travelers - 1)
  const [shown, setShown] = useState(0)
  const link = `https://ixigo.com/r/${reel.id}?from=${cfg.origin}&crew=${cfg.travelers}`
  const message = `Let's do this trip! ${reel.title}. ${reel.days} days in ${reel.destination.name} from ${origin.name}, ${inr(price.perPerson)} each. Split it on ixigo: ${link}`

  // friends reply one by one
  useEffect(() => {
    setShown(0)
    const timers = friends.map((_, i) => window.setTimeout(() => setShown(i + 1), 900 + i * 1100))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.travelers])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      notify({ title: 'Link copied', body: 'Paste it anywhere. Friends can join and pay their share.', icon: '🔗', tone: 'blue' })
    } catch {
      notify({ title: 'Copy is blocked here', body: link, icon: '🔗', tone: 'blue' })
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: reel.title, text: message, url: link })
        return
      } catch { /* user cancelled, fall back to WhatsApp */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
  }

  const set = (n: number) => setCfg({ ...cfg, travelers: Math.min(8, Math.max(2, n)) })

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 px-4 pb-3">
        <button onClick={onBack} aria-label="Back to trip" className="grid h-9 w-9 place-items-center rounded-full bg-white/[.06]">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="font-display text-[20px] font-bold leading-none">Split with crew</h2>
          <p className="mt-1 text-[12px] text-white/55">Everyone pays their own share. Seats are held together.</p>
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {/* WhatsApp preview */}
        <div className="theme-dark overflow-hidden rounded-[22px] border border-white/10">
          <div className="flex items-center gap-2.5 bg-[#1F2C34] px-3 py-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#25D366] text-sm">🌴</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold">{reel.destination.name} crew</div>
              <div className="truncate text-[11px] text-white/50">You, {friends.map((f) => f.name.split(' ')[0]).join(', ')}</div>
            </div>
          </div>
          <div className="wa-wall space-y-2 px-3 py-3">
            <div className="ml-auto w-[82%] rounded-2xl rounded-tr-sm bg-[#005C4B] p-1.5">
              <div className="overflow-hidden rounded-xl bg-[#0A3B32]">
                <SmartImage src={reel.scenes[0].img} alt="" fallback={reel.fallback} className="h-24 w-full" />
                <div className="p-2.5">
                  <div className="text-[13px] font-bold leading-snug">{reel.title}</div>
                  <div className="mt-0.5 text-[11px] text-white/65">
                    {reel.days} days from {origin.name}, {inr(price.perPerson)} each
                  </div>
                  <div className="mt-1 text-[10px] text-white/40">ixigo.com</div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 px-1 pt-1 text-[10px] text-white/55">
                now <CheckCheck size={13} className="text-[#53BDEB]" />
              </div>
            </div>
            <AnimatePresence>
              {friends.slice(0, shown).map((f) => (
                <motion.div key={f.name} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-fit max-w-[78%] rounded-2xl rounded-tl-sm bg-[#1F2C34] px-3 py-1.5">
                  <div className="text-[11px] font-semibold" style={{ color: f.hue[0] }}>{f.name.split(' ')[0]}</div>
                  <div className="text-[13px]">{f.reply}</div>
                </motion.div>
              ))}
            </AnimatePresence>
            {shown < friends.length && (
              <div className="flex w-fit gap-1 rounded-2xl bg-[#1F2C34] px-3 py-2.5" aria-label="Typing">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-white/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* crew size */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[.04] px-4 py-3">
          <div>
            <div className="text-[14px] font-semibold">People going</div>
            <div className="text-[12px] text-white/50">Total {inr(price.total)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Fewer people" onClick={() => set(cfg.travelers - 1)} disabled={cfg.travelers <= 2} className="grid h-8 w-8 place-items-center rounded-full bg-white/[.08] disabled:opacity-30">
              <Minus size={15} />
            </button>
            <span className="w-6 text-center font-bold tabular-nums">{cfg.travelers}</span>
            <button aria-label="More people" onClick={() => set(cfg.travelers + 1)} disabled={cfg.travelers >= 8} className="grid h-8 w-8 place-items-center rounded-full bg-white/[.08] disabled:opacity-30">
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* split ledger */}
        <ul className="mt-3 divide-y divide-white/5 rounded-2xl bg-white/[.03]">
          <li className="flex items-center gap-3 px-4 py-3">
            <Avatar name="You" hue={['#F57224', '#FF9A4D']} size={34} />
            <span className="flex-1 text-[14px] font-semibold">You</span>
            <span className="text-[14px] font-bold tabular-nums">{inr(price.perPerson)}</span>
            <span className="w-16 rounded-full bg-ixi-orange/15 py-0.5 text-center text-[11px] font-bold text-ixi-ember">Your turn</span>
          </li>
          {friends.map((f, i) => {
            const joined = i < shown
            const paid = joined && i % 2 === 0
            return (
              <li key={f.name} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={f.name} hue={f.hue} size={34} />
                <span className="flex-1 text-[14px] font-semibold">{f.name}</span>
                <span className="text-[14px] font-bold tabular-nums">{inr(price.perPerson)}</span>
                <span className={cx('flex w-16 items-center justify-center gap-0.5 rounded-full py-0.5 text-[11px] font-bold', paid ? 'bg-ctkt/15 text-ctkt' : joined ? 'bg-white/10 text-white/80' : 'bg-white/5 text-white/40')}>
                  {paid && <Check size={11} strokeWidth={3} />}
                  {paid ? 'Paid' : joined ? 'Joined' : 'Invited'}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="pb-safe shrink-0 space-y-2 border-t border-white/10 px-4 pb-3 pt-3 sm:pb-4">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button onClick={share} className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-[15px] font-bold text-[#04260f]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" /></svg>
            Send on WhatsApp
          </button>
          <button onClick={copy} aria-label="Copy invite link" className="grid w-12 place-items-center rounded-2xl border border-white/10">
            <Copy size={17} />
          </button>
        </div>
        <button onClick={onPayShare} className="w-full rounded-2xl bg-ixi-orange py-3.5 font-display text-[16px] font-extrabold shadow-glow">
          Pay my share, {inr(price.perPerson)}
        </button>
      </div>
    </>
  )
}
