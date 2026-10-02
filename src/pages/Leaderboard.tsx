import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, Crown, Info, Minus, Trophy } from 'lucide-react'
import { Avatar } from '../components/ui'
import { SubscribeButton } from '../components/social'
import { getCreator, LB_DESTS } from '../lib/mockData'
import { useLeaderboard, type Period, type Standing } from '../lib/reels'
import { cx } from '../lib/utils'

export default function Leaderboard() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const dest = LB_DESTS.some((d) => d.id === params.get('dest')) ? params.get('dest')! : 'all'
  const period: Period = params.get('period') === 'month' ? 'month' : 'week'
  const rows = useLeaderboard(dest, period)
  const set = (next: { dest?: string; period?: Period }) => {
    const d = next.dest ?? dest
    const p = next.period ?? period
    setParams({ ...(d !== 'all' && { dest: d }), ...(p !== 'week' && { period: p }) }, { replace: true })
  }

  const place = LB_DESTS.find((d) => d.id === dest)?.name
  const when = period === 'week' ? 'this week' : 'this month'
  const leader = rows[0] && getCreator(rows[0].handle)
  const podium = [rows[1], rows[0], rows[2]].filter(Boolean) as Standing[]
  const yours = rows.reduce((a, r) => a + r.yours, 0)

  return (
    <div className="no-scrollbar h-full overflow-y-auto pb-10">
      <header className="pt-safe flex items-center gap-3 px-4 pb-2">
        <button onClick={() => (history.length > 1 ? navigate(-1) : navigate('/explore'))} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-white/[.07]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-[24px] font-extrabold">Top guides</h1>
      </header>

      <div className="mx-5 mt-2 grid grid-cols-2 rounded-xl bg-white/[.06] p-1" role="tablist" aria-label="Period">
        {(['week', 'month'] as const).map((p) => (
          <button key={p} role="tab" aria-selected={period === p} onClick={() => set({ period: p })} className={cx('relative rounded-lg py-2 text-[13px] font-bold transition-colors', period === p ? 'text-ixi-night' : 'text-white/65')}>
            {period === p && <motion.span layoutId="lb-period" className="absolute inset-0 -z-0 rounded-lg bg-white" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
            <span className="relative">{p === 'week' ? 'This week' : 'This month'}</span>
          </button>
        ))}
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5">
        {[{ id: 'all', name: 'All India' }, ...LB_DESTS].map((d) => (
          <button key={d.id} onClick={() => set({ dest: d.id })} className={cx('shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors', dest === d.id ? 'bg-ixi-orange text-white' : 'bg-white/[.06] text-white/75')}>
            {d.name}
          </button>
        ))}
      </div>

      {leader && (
        <motion.div key={dest + period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-5 mt-5 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#F59E0B]/20 to-transparent px-4 py-3">
          <Trophy size={20} className="shrink-0 text-gold" />
          <p className="text-[14px] leading-snug">
            <span className="font-bold">{leader.name.split(' ')[0]}</span> is the top {place ? `${place} ` : ''}guide {when}
          </p>
        </motion.div>
      )}

      {/* podium */}
      <div className="mt-6 flex items-end justify-center gap-3 px-5">
        {podium.map((s) => {
          const c = getCreator(s.handle)
          if (!c) return null
          const first = s.rank === 1
          return (
            <motion.button
              key={`${dest}-${period}-${s.handle}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: s.rank * 0.08, type: 'spring', damping: 20 }}
              onClick={() => navigate(`/c/${c.handle}`)}
              className="flex w-[30%] flex-col items-center"
            >
              {first && <Crown size={22} className="mb-1 text-gold" fill="#FBBF24" />}
              <span className={cx('rounded-full p-[3px]', first ? 'bg-[#FBBF24]' : s.rank === 2 ? 'bg-[#CBD5E1]' : 'bg-[#D97706]')}>
                <Avatar name={c.name} hue={c.hue} size={first ? 70 : 56} />
              </span>
              <span className="mt-2 w-full truncate text-center text-[13px] font-bold">{c.name.split(' ')[0]}</span>
              <span className="text-[11px] text-white/55">{s.clones.toLocaleString('en-IN')} trips</span>
              <span
                className={cx('mt-2 grid w-full place-items-center rounded-t-xl font-display text-[22px] font-extrabold', first ? 'h-20 bg-[#FBBF24]/25' : s.rank === 2 ? 'h-14 bg-white/10' : 'h-10 bg-[#D97706]/20')}
              >
                {s.rank}
              </span>
            </motion.button>
          )
        })}
      </div>

      <ul className="mt-1 space-y-2 px-5">
        {rows.map((s) => {
          const c = getCreator(s.handle)
          if (!c) return null
          return (
            <li key={s.handle} className="flex items-center gap-3 rounded-2xl bg-white/[.03] p-2.5">
              <span className="w-6 text-center font-display text-[16px] font-extrabold text-white/70">{s.rank}</span>
              <button onClick={() => navigate(`/c/${c.handle}`)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                <Avatar name={c.name} hue={c.hue} size={40} />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-bold">{c.name}</span>
                  <span className="flex items-center gap-1.5 text-[12px] text-white/55">
                    {s.clones.toLocaleString('en-IN')} trips booked
                    <Delta d={s.delta} />
                  </span>
                  {s.yours > 0 && <span className="block text-[11px] font-semibold text-ctkt">incl. {s.yours} booked by you</span>}
                </span>
              </button>
              <SubscribeButton creator={c} size="sm" />
            </li>
          )
        })}
      </ul>

      <p className="mx-5 mt-5 flex items-start gap-2 rounded-2xl bg-white/[.03] p-3.5 text-[12px] leading-snug text-white/55">
        <Info size={14} className="mt-px shrink-0" />
        Ranked by PNR-verified trips booked from each creator's reels. Your bookings count too{yours > 0 ? `: you've added ${yours} ${when}` : ''}. Resets every Monday and on the 1st.
      </p>
    </div>
  )
}

function Delta({ d }: { d: number | null }) {
  if (d === null) return null
  if (d === 0) return <Minus size={12} className="text-white/35" aria-label="No change" />
  return (
    <span className={cx('flex items-center text-[11px] font-bold', d > 0 ? 'text-ctkt' : 'text-abhi')} aria-label={`${d > 0 ? 'Up' : 'Down'} ${Math.abs(d)}`}>
      {d > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
      {Math.abs(d)}
    </span>
  )
}
