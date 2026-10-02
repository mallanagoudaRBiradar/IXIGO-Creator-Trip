import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Play, Sparkles, Trophy, Users } from 'lucide-react'
import { Avatar, ModeIcon, PageHeader, SmartImage } from '../components/ui'
import { CreatorChip, CreatorRow } from '../components/social'
import { CREATORS, getCity } from '../lib/mockData'
import { useAllReels, useUnseenUploads } from '../lib/reels'
import { fromPrice } from '../lib/pricing'
import { useApp } from '../lib/store'
import { cx, inr } from '../lib/utils'

export default function Subscriptions() {
  const navigate = useNavigate()
  const following = useApp((s) => s.following)
  const bells = useApp((s) => s.bells)
  const origin = getCity(useApp((s) => s.origin))
  const [only, setOnly] = useState<string | null>(null)
  const all = useAllReels()
  const unseen = useUnseenUploads()
  const freshIds = unseen.map((r) => r.id)

  const subs = CREATORS.filter((c) => following.includes(c.handle))
  const suggested = CREATORS.filter((c) => !following.includes(c.handle)).sort((a, b) => b.subscribers - a.subscribers)
  const feed = useMemo(
    () => all.filter((r) => following.includes(r.creator.handle) && (!only || r.creator.handle === only)),
    [all, following, only],
  )

  return (
    <div className="no-scrollbar h-full overflow-y-auto pb-10">
      <PageHeader
        title="My Channels"
        sub={subs.length ? `${subs.length} channel${subs.length === 1 ? '' : 's'} · ${bells.length} with bells on` : 'The travel creators you subscribe to, all in one place.'}
        right={
          <button onClick={() => navigate('/leaderboard')} className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#F59E0B]/15 px-3 py-2 text-[12px] font-bold text-gold">
            <Trophy size={14} /> Top guides
          </button>
        }
      />

      {subs.length > 0 ? (
        <>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
            {subs.map((c) => <CreatorChip key={c.handle} creator={c} dot={unseen.some((r) => r.creator.handle === c.handle)} />)}
          </div>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
            <button onClick={() => setOnly(null)} className={cx('shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold', !only ? 'bg-white text-ixi-night' : 'bg-white/[.06] text-white/75')}>All</button>
            {subs.map((c) => (
              <button key={c.handle} onClick={() => setOnly(c.handle)} className={cx('shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold', only === c.handle ? 'bg-white text-ixi-night' : 'bg-white/[.06] text-white/75')}>
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <section className="mt-4 space-y-4 px-5">
            {feed.map((r) => (
              <article key={r.id} className="overflow-hidden rounded-[22px] bg-white/[.03]">
                <button onClick={() => navigate(`/?reel=${r.id}`)} className="theme-dark group relative block aspect-video w-full overflow-hidden text-left">
                  <SmartImage src={r.scenes[1]?.img ?? r.scenes[0].img} alt={r.title} fallback={r.fallback} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 backdrop-blur">
                    <Play size={20} fill="white" />
                  </span>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold">{r.days}D/{r.nights}N</span>
                  {freshIds.includes(r.id) && (
                    <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-md bg-ixi-orange px-1.5 py-0.5 text-[10px] font-extrabold">
                      <Sparkles size={10} /> NEW
                    </span>
                  )}
                </button>
                <div className="flex gap-3 p-3">
                  <button onClick={() => navigate(`/c/${r.creator.handle}`)} aria-label={`Open @${r.creator.handle}'s channel`} className="h-fit">
                    <Avatar name={r.creator.name} hue={r.creator.hue} size={36} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-[14px] font-bold leading-snug">{r.title}</div>
                    <div className="mt-0.5 truncate text-[12px] text-white/55">
                      @{r.creator.handle} · {r.views} views
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-ixi-ember">
                      <ModeIcon mode={r.recommendedMode} size={12} /> Go from {inr(fromPrice(r, origin))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <div className="mx-5 rounded-[24px] border border-dashed border-white/15 p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/[.06]">
            <Users size={22} className="text-white/60" />
          </span>
          <p className="mt-3 font-display text-[18px] font-bold">Your channel list is empty</p>
          <p className="mt-1 text-[13px] text-white/60">Subscribe below and their new trips will show up here, with a ping when they post.</p>
        </div>
      )}

      {suggested.length > 0 && (
        <section className="mt-8 px-5">
          <h2 className="flex items-center gap-2 font-display text-[19px] font-bold">
            {subs.length ? 'Creators you might love' : 'Trending travel creators'}
          </h2>
          <ul className="mt-3 space-y-2.5">
            {suggested.map((c) => <CreatorRow key={c.handle} creator={c} />)}
          </ul>
        </section>
      )}

      {subs.length > 0 && (
        <p className="mx-5 mt-6 flex items-center gap-2 text-[12px] text-white/45">
          <Bell size={13} /> An orange dot means a new trip. Tap a channel to manage notifications.
        </p>
      )}
    </div>
  )
}
