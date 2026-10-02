import { motion } from 'framer-motion'
import { useState } from 'react'
import { AlertCircle, BadgeCheck, Crown, Eye, Gem, Hourglass, Link2, Plus, Repeat2 } from 'lucide-react'
import UploadSheet from '../components/UploadSheet'
import { AnimatedNumber, Avatar, PageHeader, SmartImage } from '../components/ui'
import { getReel, img } from '../lib/mockData'
import { useApp, useUI } from '../lib/store'
import { compact, cx } from '../lib/utils'

const TIERS = [
  { name: 'Scout', at: 0, perks: 'Gems on every booking you inspire' },
  { name: 'Voyager', at: 50, perks: '1.5x Gems and zero convenience fees' },
  { name: 'Guru', at: 250, perks: 'Cash payouts, lounge access and an Expert badge' },
]

const DAILY = [6, 9, 7, 12, 10, 8, 14, 11, 13, 18, 15, 12, 21, 19]
const CLONES = 186

export default function Creator() {
  const me = getReel('jaipur-heritage')!.creator
  const gems = useApp((s) => s.gems)
  const notify = useUI((s) => s.notify)
  const [pushkarVerified, setPushkarVerified] = useState(false)
  const [upload, setUpload] = useState<null | 'pick' | 'link'>(null)
  const [published, setPublished] = useState(0)
  const [hoverBar, setHoverBar] = useState<number | null>(null)

  const next = TIERS.find((t) => t.at > CLONES)
  // milestones are spaced evenly so labels never collide; progress is piecewise between them
  const POS = [0, 45, 100]
  const seg = TIERS.findIndex((t, i) => CLONES < (TIERS[i + 1]?.at ?? Infinity))
  const pct = seg >= TIERS.length - 1 ? 100 : POS[seg] + ((CLONES - TIERS[seg].at) / (TIERS[seg + 1].at - TIERS[seg].at)) * (POS[seg + 1] - POS[seg])

  const reels = [
    { id: 'jaipur-heritage', title: 'Jaipur like royalty, by train', img: getReel('jaipur-heritage')!.scenes[0].img, views: '1.3M', clones: 142, gems: 14200, verified: true },
    { id: 'udaipur', title: 'Udaipur in 48 hours', img: img('1599661046289-e31897846e41'), views: '310K', clones: 44, gems: 4650, verified: true },
    { id: 'pushkar', title: 'Pushkar camel fair diaries', img: img('1524492412937-b28074a5d7da'), views: '0', clones: 0, gems: 0, verified: pushkarVerified },
  ]

  return (
    <div className="no-scrollbar h-full overflow-y-auto pb-10">
      <PageHeader
        title="Creator Hub"
        right={
          <button onClick={() => setUpload('pick')} className="flex items-center gap-1.5 rounded-full bg-ixi-orange px-3.5 py-2 text-[13px] font-bold shadow-glow">
            <Plus size={15} strokeWidth={3} /> New reel
          </button>
        }
      />

      <div className="flex items-center gap-3 px-5">
        <Avatar name={me.name} hue={me.hue} size={56} />
        <div>
          <div className="font-display text-[18px] font-bold">{me.name}</div>
          <div className="text-[13px] text-white/55">@{me.handle}, {compact(me.subscribers)} subscribers</div>
        </div>
      </div>

      {/* tier */}
      <section className="mx-5 mt-5 rounded-[26px] border border-white/10 bg-gradient-to-br from-ixi-ink to-ixi-navy p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] text-white/55">Your tier</div>
            <div className="flex items-center gap-2 font-display text-[26px] font-extrabold">
              <Crown size={22} className="text-ixi-ember" /> Voyager
            </div>
          </div>
          <div className="text-right text-[12px] text-white/60">
            <span className="font-display text-[22px] font-extrabold text-white">{next ? next.at - CLONES : 0}</span>
            <br /> bookings to {next?.name ?? 'the top'}
          </div>
        </div>
        <div className="relative mt-6 h-2.5 rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-ixi-orange to-ixi-ember" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
          {TIERS.map((t, i) => {
            const left = POS[i]
            const reached = CLONES >= t.at
            return (
              <div key={t.name} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%` }}>
                <span className={cx('block h-4 w-4 rounded-full border-[3px]', i === 0 && 'translate-x-1/2', i === 2 && '-translate-x-1/2', reached ? 'border-ixi-ember bg-snow' : 'border-white/30 bg-ixi-navy')} />
              </div>
            )
          })}
        </div>
        <div className="relative mt-3 h-8 text-[11px]">
          {TIERS.map((t, i) => (
            <span key={t.name} className={cx('absolute', i === 0 ? 'left-0 text-left' : i === 2 ? 'right-0 text-right' : '-translate-x-1/2 text-center', CLONES >= t.at ? 'text-white' : 'text-white/45')} style={i === 1 ? { left: `${POS[1]}%` } : undefined}>
              <span className="block font-bold">{t.name}</span>
              {t.at}+
            </span>
          ))}
        </div>
        <p className="mt-2 rounded-xl bg-white/[.05] px-3 py-2 text-[12px] text-white/70">
          <span className="font-semibold text-ixi-ember">At Guru:</span> {TIERS[2].perks.toLowerCase()}.
        </p>
      </section>

      {/* metrics */}
      <section className="mt-4 grid grid-cols-3 gap-2.5 px-5">
        <Metric icon={Repeat2} label="Trips booked" value={CLONES} delta="+12 this week" />
        <Metric icon={Gem} label="Gems earned" value={gems} delta="+2,140 this week" />
        <Metric icon={Hourglass} label="Pending" value={3120} delta="Credited after travel" suffix=" Gems" muted />
      </section>

      {/* chart */}
      <section className="mx-5 mt-4 rounded-[24px] bg-white/[.03] p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[17px] font-bold">Bookings, last 14 days</h2>
          <span className="text-[12px] text-white/50">{hoverBar !== null ? `${DAILY[hoverBar]} on day ${hoverBar + 1}` : `${DAILY.reduce((a, b) => a + b, 0)} total`}</span>
        </div>
        <div className="mt-4 flex h-28 items-end gap-1.5" onMouseLeave={() => setHoverBar(null)}>
          {DAILY.map((v, i) => (
            <button
              key={i}
              aria-label={`Day ${i + 1}: ${v} bookings`}
              onMouseEnter={() => setHoverBar(i)}
              onClick={() => setHoverBar(i)}
              className="flex h-full flex-1 items-end"
            >
              <motion.span
                className={cx('block w-full rounded-t-md', i === DAILY.length - 1 ? 'bg-ixi-orange' : hoverBar === i ? 'bg-ixi-ember' : 'bg-white/15')}
                initial={{ height: 0 }}
                animate={{ height: `${(v / 21) * 100}%` }}
                transition={{ delay: i * 0.03, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* reels */}
      <section className="mt-6 px-5">
        <h2 className="font-display text-[19px] font-bold">Your reels</h2>
        <ul className="mt-3 space-y-2.5">
          {published > 0 && (
            <li className="flex items-center gap-3 rounded-2xl border border-verify/30 bg-verify/5 p-2.5">
              <SmartImage src={img('1506953823976-52e1fdc0149a')} alt="" fallback={['#14B87A', '#0D1840']} className="h-16 w-12 shrink-0 rounded-lg" />
              <div className="flex-1 text-[13px]">
                <div className="font-semibold">Your new reel</div>
                <div className="flex items-center gap-1 text-verify"><BadgeCheck size={13} /> Just published</div>
              </div>
            </li>
          )}
          {reels.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-white/[.03] p-2.5">
              <SmartImage src={r.img} alt="" fallback={['#E8384F', '#F59E0B']} className="h-16 w-12 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold">{r.title}</div>
                {r.verified ? (
                  <div className="mt-0.5 flex items-center gap-3 text-[12px] text-white/55">
                    <span className="flex items-center gap-1"><Eye size={12} /> {r.views}</span>
                    <span className="flex items-center gap-1"><Repeat2 size={12} /> {r.clones}</span>
                    <span className="flex items-center gap-1 text-verify"><BadgeCheck size={12} /> Verified</span>
                  </div>
                ) : (
                  <div className="mt-0.5 flex items-center gap-1 text-[12px] text-ixi-ember"><AlertCircle size={12} /> Draft, needs a booking to go live</div>
                )}
              </div>
              {!r.verified && (
                <button onClick={() => setUpload('link')} className="flex shrink-0 items-center gap-1 rounded-xl bg-ixi-orange px-3 py-2 text-[12px] font-bold">
                  <Link2 size={13} /> Link booking
                </button>
              )}
            </li>
          ))}
        </ul>
        <button onClick={() => notify({ title: 'Gems redeemed', body: '4,000 Gems are on their way to your ixigo Money wallet.', icon: '💎' })} className="mt-4 w-full rounded-2xl border border-white/10 py-3 text-[14px] font-semibold">
          Redeem Gems to ixigo Money
        </button>
      </section>

      <UploadSheet
        open={upload !== null}
        startAt={upload ?? 'pick'}
        reelTitle={upload === 'link' ? 'Pushkar camel fair diaries' : undefined}
        onClose={() => setUpload(null)}
        onVerified={() => {
          if (upload === 'link') setPushkarVerified(true)
          else setPublished((p) => p + 1)
          notify({ title: 'Booking verified', body: 'Your reel is live with a Verified trip badge.', icon: '✅', tone: 'green' })
        }}
      />
    </div>
  )
}

function Metric({ icon: Icon, label, value, delta, suffix, muted }: { icon: typeof Gem; label: string; value: number; delta: string; suffix?: string; muted?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/[.04] p-3">
      <Icon size={16} className={muted ? 'text-white/50' : 'text-ixi-ember'} />
      <div className="mt-2 font-display text-[20px] font-extrabold leading-none">
        <AnimatedNumber value={value} from={0} format={(n) => Math.round(n).toLocaleString('en-IN')} />
        {suffix && <span className="ml-0.5 text-[11px] font-semibold text-white/50">{suffix}</span>}
      </div>
      <div className="mt-1 text-[11px] text-white/55">{label}</div>
      <div className={cx('mt-1.5 text-[10px] font-semibold', muted ? 'text-white/40' : 'text-ctkt')}>{delta}</div>
    </div>
  )
}
