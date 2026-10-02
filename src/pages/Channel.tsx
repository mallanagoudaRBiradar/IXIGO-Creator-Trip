import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BadgeCheck, CalendarDays, ChevronUp, Crown, Eye, MapPin, MessageCircleQuestion, MoreVertical, Pin, Play, Repeat2, Share2, Sparkles, Trophy } from 'lucide-react'
import ModerationSheet, { type ModTarget } from '../components/ModerationSheet'
import { Avatar, ModeIcon, SmartImage } from '../components/ui'
import { BellButton, CreatorRow, SubscribeButton, UserAvatar, useSubscribers } from '../components/social'
import { CREATORS, getCity, getCreator, getReel, type Creator, type Question } from '../lib/mockData'
import { checkPost, mask } from '../lib/moderation'
import { fromPrice } from '../lib/pricing'
import { topGuideTitles, useQuestions, useReelsBy, useUnseenUploads } from '../lib/reels'
import { ME, useApp, useUI } from '../lib/store'
import { ago, compact, cx, inr, parseCount } from '../lib/utils'

type Tab = 'videos' | 'qa' | 'about'

export default function Channel() {
  const { handle = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const creator = getCreator(handle)
  const subscribed = useApp((s) => s.following.includes(handle))
  const released = useApp((s) => s.released)
  const seen = useApp((s) => s.seenUploads)
  const markUploadsSeen = useApp((s) => s.markUploadsSeen)
  const origin = getCity(useApp((s) => s.origin))
  const notify = useUI((s) => s.notify)
  const reels = useReelsBy(handle)
  const tab = (['videos', 'qa', 'about'].includes(params.get('tab') ?? '') ? params.get('tab') : 'videos') as Tab
  const setTab = (t: Tab) => setParams(t === 'videos' ? {} : { tab: t }, { replace: true })
  const tabsRef = useRef<HTMLDivElement>(null)

  // Uploads that were waiting when you opened the channel count as seen (clears the dot in My Channels),
  // but keep their NEW badge for this visit. Anything posted while you're here stays unseen until watched.
  const [freshIds] = useState(() => released.map((r) => r.reelId).filter((id) => !seen.includes(id)))
  const unseen = useUnseenUploads()
  const newIds = [...freshIds, ...unseen.map((r) => r.id)]
  useEffect(() => {
    const mine = freshIds.filter((id) => getReel(id)?.creator.handle === handle)
    if (mine.length) markUploadsSeen(mine)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle])

  if (!creator) {
    return (
      <div className="grid h-full place-items-center px-10 text-center">
        <div>
          <p className="font-display text-2xl font-bold">Channel not found</p>
          <p className="mt-2 text-sm text-white/60">@{handle} doesn't exist or has moved.</p>
          <button onClick={() => navigate('/subs')} className="mt-5 rounded-full bg-ixi-orange px-5 py-2.5 text-sm font-bold">Browse creators</button>
        </div>
      </div>
    )
  }

  const views = reels.reduce((a, r) => a + parseCount(r.views), 0)
  const clones = reels.reduce((a, r) => a + r.clones, 0)
  const others = CREATORS.filter((c) => c.handle !== creator.handle)
  const titles = topGuideTitles(creator.handle)

  const share = async () => {
    const url = `${location.origin}/c/${creator.handle}`
    try {
      if (navigator.share) await navigator.share({ title: `${creator.name} on Trip Reels`, url })
      else {
        await navigator.clipboard.writeText(url)
        notify({ title: 'Link copied', body: 'Share the channel with your crew.', icon: '🔗' })
      }
    } catch {
      // user dismissed the share sheet
    }
  }

  const goToQA = () => {
    setTab('qa')
    setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div className="no-scrollbar h-full overflow-y-auto pb-10">
      {/* banner */}
      <div className="relative h-40">
        {reels[0] ? (
          <SmartImage src={reels[reels.length - 1].scenes[0].img} alt="" fallback={creator.hue} className="absolute inset-0 h-full w-full" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${creator.hue[0]}, ${creator.hue[1]})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-ixi-night" />
        <div className="theme-dark pt-safe absolute inset-x-0 top-0 flex items-center justify-between px-3">
          <button onClick={() => (history.length > 1 ? navigate(-1) : navigate('/'))} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur">
            <ArrowLeft size={18} />
          </button>
          <button onClick={share} aria-label="Share channel" className="grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* identity */}
      <div className="-mt-10 px-5">
        <div className="relative w-fit rounded-full ring-4 ring-ixi-night">
          <Avatar name={creator.name} hue={creator.hue} size={84} />
        </div>
        <h1 className="mt-3 flex items-center gap-1.5 font-display text-[26px] font-extrabold leading-tight">
          {creator.name}
          {creator.tier === 'Guru' && <BadgeCheck size={20} className="shrink-0 text-verify" aria-label="Verified creator" />}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-white/60">
          <span>@{creator.handle}</span>
          <span className="flex items-center gap-1 rounded-full bg-ixi-orange/15 px-2 py-0.5 text-[11px] font-bold text-ixi-ember">
            <Crown size={11} /> {creator.tier}
          </span>
          {titles.map((d) => (
            <Link key={d.id} to={`/leaderboard?dest=${d.id}&period=month`} className="flex items-center gap-1 rounded-full bg-[#F59E0B]/15 px-2 py-0.5 text-[11px] font-bold text-gold">
              <Trophy size={11} /> Top {d.name} guide this month
            </Link>
          ))}
        </div>
        <Stats creator={creator} videos={reels.length} views={views} />
        <p className="mt-3 text-[14px] leading-snug text-white/80">{creator.bio}</p>

        <div className="mt-4 flex items-center gap-2">
          <SubscribeButton creator={creator} size="lg" className="flex-1" />
          {subscribed && <BellButton creator={creator} />}
        </div>
      </div>

      <AskBox creator={creator} onAsked={goToQA} onSeeAll={goToQA} />

      {/* tabs */}
      <div ref={tabsRef} className="sticky top-0 z-10 mt-5 flex border-b border-white/10 bg-ixi-night/95 px-3 backdrop-blur" role="tablist">
        {(['videos', 'qa', 'about'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cx('relative flex-1 py-3 text-[14px] font-bold transition-colors', tab === t ? 'text-white' : 'text-white/50')}>
            {t === 'videos' ? 'Trips' : t === 'qa' ? 'Q&A' : 'About'}
            {tab === t && <motion.span layoutId="channel-tab" className="absolute inset-x-5 bottom-0 h-[3px] rounded-full bg-white" />}
          </button>
        ))}
      </div>

      {tab === 'videos' && (
        <section className="px-5 pt-4">
          {reels.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/60">No trips posted yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {reels.map((r) => (
                <button key={r.id} onClick={() => navigate(`/?reel=${r.id}`)} className="theme-dark group relative aspect-[9/14] overflow-hidden rounded-[20px] text-left">
                  <SmartImage src={r.scenes[0].img} alt={r.title} fallback={r.fallback} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30" />
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
                    <Play size={10} fill="white" /> {r.views}
                  </span>
                  {newIds.includes(r.id) && (
                    <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-md bg-ixi-orange px-1.5 py-0.5 text-[10px] font-extrabold">
                      <Sparkles size={10} /> NEW
                    </span>
                  )}
                  <div className="absolute inset-x-2.5 bottom-2.5">
                    <div className="line-clamp-2 text-[13px] font-bold leading-snug">{r.title}</div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-white/70">
                      <ModeIcon mode={r.recommendedMode} size={11} /> from {inr(fromPrice(r, origin))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'qa' && <QATab creator={creator} />}

      {tab === 'about' && (
        <section className="space-y-3 px-5 pt-4 text-[14px]">
          <p className="leading-relaxed text-white/80">{creator.bio}</p>
          <ul className="space-y-2.5 rounded-2xl bg-white/[.03] p-4 text-white/75">
            <li className="flex items-center gap-2.5"><MapPin size={16} className="text-white/45" /> Based in {creator.home}</li>
            <li className="flex items-center gap-2.5"><CalendarDays size={16} className="text-white/45" /> Joined {creator.joined}</li>
            <li className="flex items-center gap-2.5"><Eye size={16} className="text-white/45" /> {Math.round(views).toLocaleString('en-IN')} views</li>
            <li className="flex items-center gap-2.5"><Repeat2 size={16} className="text-white/45" /> {clones.toLocaleString('en-IN')} trips booked by viewers</li>
            <li className="flex items-center gap-2.5"><BadgeCheck size={16} className="text-verify" /> Every trip is PNR-verified on ixigo</li>
          </ul>
        </section>
      )}

      {/* browse more */}
      <section className="mt-8 px-5">
        <h2 className="font-display text-[19px] font-bold">More creators</h2>
        <ul className="mt-3 space-y-2.5">
          {others.map((c) => <CreatorRow key={c.handle} creator={c} />)}
        </ul>
      </section>
    </div>
  )
}

function Stats({ creator, videos, views }: { creator: Creator; videos: number; views: number }) {
  const subs = useSubscribers(creator)
  return (
    <div className="mt-3 flex gap-5 text-[13px] text-white/60">
      <span><b className="font-display text-[17px] text-white">{compact(subs)}</b> subscribers</span>
      <span><b className="font-display text-[17px] text-white">{videos}</b> trip{videos === 1 ? '' : 's'}</span>
      <span><b className="font-display text-[17px] text-white">{compact(views)}</b> views</span>
    </div>
  )
}

// ---- Q&A ----------------------------------------------------------------------

const SUGGESTIONS = ['What was your total budget?', 'Best time to go?', 'Is it safe for solo travel?', 'Where did you stay?']

/** Pinned on every channel: ask the creator anything, with their latest pinned answer as social proof */
function AskBox({ creator, onAsked, onSeeAll }: { creator: Creator; onAsked: () => void; onSeeAll: () => void }) {
  const questions = useQuestions(creator.handle)
  const myQuestions = useApp((s) => s.myQuestions)
  const askQuestion = useApp((s) => s.askQuestion)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const first = creator.name.split(' ')[0]
  const featured = questions.filter((q) => q.answer && q.pinned).sort((a, b) => b.upvotes - a.upvotes)[0]
  const answered = questions.filter((q) => q.answer).length

  const submit = (value = text) => {
    const v = checkPost(value, myQuestions)
    if (!v.ok) return setError(v.reason)
    askQuestion(creator.handle, value)
    setText('')
    setError(null)
    onAsked()
  }

  return (
    <section className="mx-5 mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-ixi-ink to-ixi-navy">
      <div className="flex items-center justify-between px-4 pt-3.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ixi-ember">
          <Pin size={12} /> Ask {first} anything
        </div>
        <button onClick={onSeeAll} className="text-[12px] font-semibold text-white/60 hover:text-white">
          {answered} answered ›
        </button>
      </div>

      {featured && (
        <button onClick={onSeeAll} className="mx-4 mt-2.5 block w-[calc(100%-2rem)] rounded-2xl bg-white/[.06] p-3 text-left">
          <p className="text-[13px] font-semibold leading-snug">“{mask(featured.text)}”</p>
          <div className="mt-2 flex gap-2">
            <Avatar name={creator.name} hue={creator.hue} size={22} />
            <p className="line-clamp-2 text-[12.5px] leading-snug text-white/70">{featured.answer}</p>
          </div>
        </button>
      )}

      <form
        className="flex items-center gap-2 px-4 pt-3"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (error) setError(null)
          }}
          maxLength={300}
          placeholder={`Ask ${first} about budget, stays, timing…`}
          aria-label={`Ask ${first} a question`}
          className="min-w-0 flex-1 rounded-full bg-white/[.08] px-4 py-2.5 text-[14px] outline-none placeholder:text-white/40 focus:bg-white/[.12]"
        />
        <button type="submit" disabled={!text.trim()} className="shrink-0 rounded-full bg-ixi-orange px-4 py-2.5 text-[13px] font-bold transition-opacity disabled:opacity-35">
          Ask
        </button>
      </form>
      {error && (
        <p role="alert" className="mx-4 mt-2 flex items-start gap-1.5 text-[12px] text-danger">
          <AlertCircle size={13} className="mt-px shrink-0" /> {error}
        </p>
      )}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-3.5 pt-2.5">
        {SUGGESTIONS.map((q) => (
          <button key={q} onClick={() => submit(q)} className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[12px] text-white/70 hover:bg-white/[.06]">
            {q}
          </button>
        ))}
      </div>
    </section>
  )
}

function QATab({ creator }: { creator: Creator }) {
  const questions = useQuestions(creator.handle)
  const upvoted = useApp((s) => s.upvotedQuestions)
  const deleteQuestion = useApp((s) => s.deleteQuestion)
  const [sort, setSort] = useState<'top' | 'new'>('top')
  const [modTarget, setModTarget] = useState<ModTarget | null>(null)
  const score = (q: Question) => q.upvotes + (upvoted.includes(q.id) ? 1 : 0)

  const list = useMemo(() => {
    const waiting = questions.filter((q) => !q.answer).sort((a, b) => b.at - a.at)
    const done = questions.filter((q) => q.answer)
    done.sort(sort === 'new' ? (a, b) => (b.answeredAt ?? b.at) - (a.answeredAt ?? a.at) : (a, b) => Number(!!b.pinned) - Number(!!a.pinned) || score(b) - score(a))
    return [...waiting, ...done]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, sort, upvoted])

  return (
    <section className="px-5 pt-4">
      <div className="flex gap-2">
        {(['top', 'new'] as const).map((s) => (
          <button key={s} onClick={() => setSort(s)} className={cx('rounded-lg px-3 py-1.5 text-[12px] font-semibold', sort === s ? 'bg-white text-ixi-night' : 'bg-white/[.07] text-white/75')}>
            {s === 'top' ? 'Most helpful' : 'Latest answers'}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-6 text-center text-[13px] text-white/60">
          <MessageCircleQuestion className="mx-auto mb-2 text-white/40" />
          No questions yet. Ask the first one above.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          <AnimatePresence initial={false}>
            {list.map((q) => (
              <motion.li key={q.id} layout="position" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <QuestionCard q={q} creator={creator} onMore={setModTarget} onDelete={() => deleteQuestion(q.id)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      <ModerationSheet target={modTarget} onClose={() => setModTarget(null)} />
    </section>
  )
}

function QuestionCard({ q, creator, onMore, onDelete }: { q: Question; creator: Creator; onMore: (t: ModTarget) => void; onDelete: () => void }) {
  const upvoted = useApp((s) => s.upvotedQuestions.includes(q.id))
  const toggleUpvote = useApp((s) => s.toggleUpvote)
  const mine = q.user === ME.handle
  const text = mask(q.text)
  const votes = q.upvotes + (upvoted ? 1 : 0)

  return (
    <article className={cx('rounded-2xl border p-3.5', q.pinned && q.answer ? 'border-ixi-orange/30 bg-ixi-orange/[.05]' : 'border-white/10 bg-white/[.03]')}>
      {q.pinned && q.answer && (
        <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-ixi-ember">
          <Pin size={11} /> Pinned by @{creator.handle}
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => toggleUpvote(q.id)}
          aria-pressed={upvoted}
          aria-label={upvoted ? 'Remove upvote' : 'Upvote question'}
          className={cx('flex h-fit w-10 shrink-0 flex-col items-center rounded-xl py-1.5 text-[12px] font-bold transition-colors', upvoted ? 'bg-ixi-orange text-white' : 'bg-white/[.06] text-white/70')}
        >
          <ChevronUp size={16} strokeWidth={3} />
          {compact(votes)}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[12px] text-white/50">
            <UserAvatar handle={q.user} size={18} />
            <span className={cx('font-semibold', mine ? 'text-ixi-ember' : 'text-white/75')}>{mine ? 'You' : `@${q.user}`}</span>
            <span>{ago(q.at)}</span>
            <button
              onClick={() => onMore({ id: q.id, user: q.user, text, kind: 'question', mine, onDelete })}
              aria-label="More options"
              className="-mr-1 ml-auto grid h-6 w-6 place-items-center rounded-full hover:bg-white/10"
            >
              <MoreVertical size={14} />
            </button>
          </div>
          <p className="mt-1 text-[14px] font-semibold leading-snug">{text}</p>

          {q.answer ? (
            <div className="mt-2.5 flex gap-2 rounded-xl bg-white/[.06] p-2.5">
              <Avatar name={creator.name} hue={creator.hue} size={26} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="rounded-full bg-white/15 px-2 py-px font-semibold">@{creator.handle}</span>
                  <span className="text-white/45">{ago(q.answeredAt ?? q.at)}</span>
                </div>
                <p className="mt-1 text-[13px] leading-snug text-white/85">{q.answer}</p>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-white/[.06] px-3 py-2 text-[12px] text-white/55">
              <Avatar name={creator.name} hue={creator.hue} size={20} />
              {creator.name.split(' ')[0]} is typing
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-1 w-1 rounded-full bg-white/60" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.18 }} />
                ))}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
