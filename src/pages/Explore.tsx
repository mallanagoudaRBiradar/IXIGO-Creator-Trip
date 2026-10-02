import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BadgeCheck, ChevronRight, Eye, LayoutGrid, Map as MapIcon, Search, Trophy, X } from 'lucide-react'
import { MapLoading } from '../components/MapSheet'
import { ModeIcon, PageHeader, SmartImage } from '../components/ui'
import { CreatorChip, CreatorRow } from '../components/social'
import { CREATORS, getCity, getCreator, LB_DESTS } from '../lib/mockData'
import { useAllReels, useLeaderboard } from '../lib/reels'
import { fromPrice } from '../lib/pricing'
import { useApp } from '../lib/store'
import { cx, inr } from '../lib/utils'

const ExploreMap = lazy(() => import('../components/ExploreMap'))

export default function Explore() {
  const navigate = useNavigate()
  const origin = getCity(useApp((s) => s.origin))
  const [q, setQ] = useState('')
  const [vibe, setVibe] = useState('All')
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'map' ? 'map' : 'list'
  const all = useAllReels()
  const vibes = useMemo(() => ['All', ...Array.from(new Set(all.flatMap((r) => r.vibes)))], [all])
  const weekly = useLeaderboard('all', 'week')

  const results = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/^[@#]/, '')
    return all.filter((r) => (vibe === 'All' || r.vibes.includes(vibe)))
      .filter((r) => !t || [r.destination.name, r.destination.state, r.title, r.creator.handle, r.creator.name, ...r.vibes].some((s) => s.toLowerCase().includes(t)))
  }, [q, vibe, all])

  const creatorHits = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/^[@#]/, '')
    return t ? CREATORS.filter((c) => [c.handle, c.name, c.home].some((s) => s.toLowerCase().includes(t))) : []
  }, [q])

  const byPrice = useMemo(() => [...all].sort((a, b) => fromPrice(a, origin) - fromPrice(b, origin)), [all, origin])

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Explore"
        sub={`Every trip priced from ${origin.name}.`}
        right={
          <div className="flex rounded-full bg-white/[.07] p-1" role="tablist" aria-label="View">
            {(['list', 'map'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                aria-label={v === 'list' ? 'List view' : 'Map view'}
                onClick={() => setParams(v === 'map' ? { view: 'map' } : {}, { replace: true })}
                className={cx('flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors', view === v ? 'bg-white text-ixi-night' : 'text-white/65')}
              >
                {v === 'list' ? <LayoutGrid size={13} /> : <MapIcon size={13} />} {v === 'list' ? 'List' : 'Map'}
              </button>
            ))}
          </div>
        }
      />
      <div className="px-5">
        <label className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 focus-within:border-ixi-orange">
          <Search size={17} className="text-white/45" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try Goa, trek or @arjun.backpacks"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/35 focus-visible:outline-none"
            aria-label="Search trips, places and creators"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear search"><X size={16} className="text-white/50" /></button>
          )}
        </label>
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5">
        {vibes.map((v) => (
          <button key={v} onClick={() => setVibe(v)} className={cx('shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors', vibe === v ? 'bg-white text-ixi-night' : 'bg-white/[.06] text-white/75')}>
            {v === 'All' ? v : `#${v}`}
          </button>
        ))}
      </div>

      {view === 'map' ? (
        <div className="relative mt-3 min-h-0 flex-1 overflow-hidden border-t border-white/10">
          <Suspense fallback={<MapLoading />}>
            <ExploreMap reels={results} origin={origin} />
          </Suspense>
          {results.length === 0 && (
            <div className="pointer-events-none absolute inset-x-5 top-14 z-[500] rounded-2xl bg-ixi-night/90 p-3 text-center text-[13px] text-white/70">No trips match. Clear the search or pick another vibe.</div>
          )}
        </div>
      ) : (
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-8">
      {creatorHits.length > 0 && (
        <section className="mt-6 px-5">
          <h2 className="font-display text-[19px] font-bold">Creators</h2>
          <ul className="mt-3 space-y-2.5">
            {creatorHits.map((c) => <CreatorRow key={c.handle} creator={c} />)}
          </ul>
        </section>
      )}

      {!q && vibe === 'All' && (
        <section className="mt-6">
          <div className="flex items-baseline justify-between px-5">
            <h2 className="font-display text-[19px] font-bold">Top creators</h2>
            <button onClick={() => navigate('/subs')} className="hit text-[13px] font-semibold text-ixi-ember">See all</button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
            {[...CREATORS].sort((a, b) => b.subscribers - a.subscribers).map((c) => <CreatorChip key={c.handle} creator={c} />)}
          </div>
        </section>
      )}

      {!q && vibe === 'All' && weekly.length > 0 && (
        <button onClick={() => navigate('/leaderboard')} className="mx-5 mt-5 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-[22px] border border-[#F59E0B]/25 bg-gradient-to-r from-[#F59E0B]/15 to-transparent p-3.5 text-left">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F59E0B]/20">
            <Trophy size={20} className="text-gold" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">Top guides this week</span>
            <span className="block truncate text-[12px] text-white/60">
              {weekly.slice(0, 3).map((s, i) => `${i + 1}. ${getCreator(s.handle)?.name.split(' ')[0]}`).join('  ·  ')} · {LB_DESTS.length} destinations
            </span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-white/40" />
        </button>
      )}

      {!q && vibe === 'All' && (
        <section className="mt-6">
          <h2 className="px-5 font-display text-[19px] font-bold">Cheapest from {origin.name} this weekend</h2>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
            {byPrice.map((r) => (
              <button key={r.id} onClick={() => navigate(`/?reel=${r.id}`)} className="theme-dark relative h-44 w-36 shrink-0 overflow-hidden rounded-[22px] text-left">
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
              <button key={r.id} onClick={() => navigate(`/?reel=${r.id}`)} className={cx('theme-dark group relative overflow-hidden rounded-[22px] text-left', i % 3 === 0 ? 'row-span-2 h-[300px]' : 'h-[144px]')}>
                <SmartImage src={r.scenes[1]?.img ?? r.scenes[0].img} alt={r.title} fallback={r.fallback} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
                  <Eye size={11} /> {r.views}
                </span>
                <div className="absolute inset-x-3 bottom-2.5">
                  <div className="line-clamp-2 text-[13px] font-bold leading-snug">{r.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-white/70">
                    <BadgeCheck size={11} className="shrink-0 text-verify" /> @{r.creator.handle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
      </div>
      )}
    </div>
  )
}
