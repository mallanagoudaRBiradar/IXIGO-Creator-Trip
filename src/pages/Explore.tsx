import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Eye, Search, X } from 'lucide-react'
import { ModeIcon, PageHeader, SmartImage } from '../components/ui'
import { getCity, REELS } from '../lib/mockData'
import { fromPrice } from '../lib/pricing'
import { useApp } from '../lib/store'
import { cx, inr } from '../lib/utils'

const VIBES = ['All', ...Array.from(new Set(REELS.flatMap((r) => r.vibes)))]

export default function Explore() {
  const navigate = useNavigate()
  const origin = getCity(useApp((s) => s.origin))
  const [q, setQ] = useState('')
  const [vibe, setVibe] = useState('All')

  const results = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/^[@#]/, '')
    return REELS.filter((r) => (vibe === 'All' || r.vibes.includes(vibe)))
      .filter((r) => !t || [r.destination.name, r.destination.state, r.title, r.creator.handle, r.creator.name, ...r.vibes].some((s) => s.toLowerCase().includes(t)))
  }, [q, vibe])

  const byPrice = useMemo(() => [...REELS].sort((a, b) => fromPrice(a, origin) - fromPrice(b, origin)), [origin])

  return (
    <div className="no-scrollbar h-full overflow-y-auto pb-8">
      <PageHeader title="Explore" sub={`Every trip priced from ${origin.name}.`} />
      <div className="px-5">
        <label className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 focus-within:border-ixi-orange">
          <Search size={17} className="text-white/45" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try Goa, trek or @meera.goes"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/35"
            aria-label="Search trips, places and creators"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear search"><X size={16} className="text-white/50" /></button>
          )}
        </label>
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5">
        {VIBES.map((v) => (
          <button key={v} onClick={() => setVibe(v)} className={cx('shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors', vibe === v ? 'bg-white text-ixi-night' : 'bg-white/[.06] text-white/75')}>
            {v === 'All' ? v : `#${v}`}
          </button>
        ))}
      </div>

      {!q && vibe === 'All' && (
        <section className="mt-6">
          <h2 className="px-5 font-display text-[19px] font-bold">Cheapest from {origin.name} this weekend</h2>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
            {byPrice.map((r) => (
              <button key={r.id} onClick={() => navigate(`/?reel=${r.id}`)} className="relative h-44 w-36 shrink-0 overflow-hidden rounded-[22px] text-left">
                <SmartImage src={r.scenes[0].img} alt={r.destination.name} fallback={r.fallback} className="absolute inset-0 h-full w-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3">
                  <div className="font-display text-[17px] font-bold leading-tight">{r.destination.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[12px] text-white/80">
                    <ModeIcon mode={r.recommendedMode} size={12} /> from {inr(fromPrice(r, origin))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 px-5">
        <h2 className="font-display text-[19px] font-bold">{q || vibe !== 'All' ? `${results.length} trip${results.length === 1 ? '' : 's'}` : 'Verified trips'}</h2>
        {results.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/60">
            No trips match “{q}”. Try a place like Jaipur or a vibe like Trek.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {results.map((r, i) => (
              <button key={r.id} onClick={() => navigate(`/?reel=${r.id}`)} className={cx('group relative overflow-hidden rounded-[22px] text-left', i % 3 === 0 ? 'row-span-2 h-[300px]' : 'h-[144px]')}>
                <SmartImage src={r.scenes[1]?.img ?? r.scenes[0].img} alt={r.title} fallback={r.fallback} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
                  <Eye size={11} /> {r.views}
                </span>
                <div className="absolute inset-x-3 bottom-2.5">
                  <div className="line-clamp-2 text-[13px] font-bold leading-snug">{r.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70">
                    <BadgeCheck size={11} className="text-verify" /> @{r.creator.handle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
