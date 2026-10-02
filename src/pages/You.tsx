import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Bookmark, ChevronRight, Clapperboard, Heart, History, Luggage, MessageCircle, MessageCircleQuestion, Monitor, Moon, Settings, ShieldCheck, Sparkles, Sun, Trash2, UserX, Users } from 'lucide-react'
import { Avatar, SmartImage } from '../components/ui'
import { CreatorChip, UserAvatar } from '../components/social'
import { CREATORS, SEED_COMMENTS, SEED_QUESTIONS, getCreator, getReel, type Reel } from '../lib/mockData'
import { REPORT_REASONS } from '../lib/moderation'
import { ME, useApp, type ThemePref } from '../lib/store'
import { ago, compact, cx, inr } from '../lib/utils'

type Section = 'history' | 'liked' | 'saved' | 'comments' | 'questions'

export default function You() {
  const navigate = useNavigate()
  const s = useApp()
  const [section, setSection] = useState<Section>('history')
  const [params, setParams] = useSearchParams()
  const [safetyOpen, setSafetyOpen] = useState(false)
  const safetyRef = useRef<HTMLElement>(null)
  const profile = s.profile

  // Settings › Hidden & blocked links here with ?safety=1
  useEffect(() => {
    if (!params.get('safety')) return
    setSafetyOpen(true)
    setParams({}, { replace: true })
    setTimeout(() => safetyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350)
  }, [params, setParams])

  const history = useMemo(() => s.history.map((h) => ({ ...h, reel: getReel(h.reelId) })).filter((h): h is typeof h & { reel: Reel } => !!h.reel), [s.history])
  const liked = useMemo(() => s.liked.map(getReel).filter((r): r is Reel => !!r).reverse(), [s.liked])
  const subs = CREATORS.filter((c) => s.following.includes(c.handle))
  const comments = useMemo(() => [...s.myComments].sort((a, b) => b.at - a.at), [s.myComments])
  const questions = useMemo(() => [...s.myQuestions].sort((a, b) => b.at - a.at), [s.myQuestions])

  const tabs: { id: Section; label: string; icon: typeof Heart; n: number }[] = [
    { id: 'history', label: 'History', icon: History, n: history.length },
    { id: 'liked', label: 'Liked', icon: Heart, n: liked.length },
    { id: 'saved', label: 'Saved', icon: Bookmark, n: s.dreams.length },
    { id: 'comments', label: 'Comments', icon: MessageCircle, n: comments.length },
    { id: 'questions', label: 'Questions', icon: MessageCircleQuestion, n: questions.length },
  ]

  return (
    <div className="no-scrollbar h-full overflow-y-auto pb-10">
      {/* profile */}
      <header className="pt-safe px-5">
        <div className="flex items-center gap-4 pt-2">
          <Link to="/settings" aria-label="Edit profile" className="shrink-0">
            <Avatar name={profile.name} hue={profile.hue} size={64} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[24px] font-extrabold leading-tight">{profile.name}</h1>
            <p className="truncate text-[13px] text-white/55">@{profile.username}</p>
            <p className="mt-0.5 text-[12px] text-white/45">
              {subs.length} subscription{subs.length === 1 ? '' : 's'} · {s.trips.length} trip{s.trips.length === 1 ? '' : 's'} booked
            </p>
          </div>
          <button onClick={() => navigate('/settings')} aria-label="Settings" className="grid h-10 w-10 shrink-0 place-items-center self-start rounded-full bg-white/[.07] transition-colors hover:bg-white/[.12]">
            <Settings size={19} />
          </button>
        </div>
        {profile.bio && <p className="mt-3 text-[14px] leading-snug text-white/75">{profile.bio}</p>}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <QuickLink to="/creator" icon={Clapperboard} label="Creator Hub" />
          <QuickLink to="/dreams" icon={Sparkles} label="Dream Board" />
          <QuickLink to="/trips" icon={Luggage} label="Your trips" />
        </div>
      </header>

      <ThemeSwitch />

      {/* subscriptions */}
      <section className="mt-6">
        <div className="flex items-baseline justify-between px-5">
          <h2 className="font-display text-[18px] font-bold">Subscriptions</h2>
          <Link to="/subs" className="text-[13px] font-semibold text-ixi-ember">Manage</Link>
        </div>
        {subs.length ? (
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5">
            {subs.map((c) => <CreatorChip key={c.handle} creator={c} />)}
          </div>
        ) : (
          <div className="px-5">
            <Empty icon={Users} text="You haven't subscribed to anyone yet." cta="Find creators" onClick={() => navigate('/subs')} />
          </div>
        )}
      </section>

      {/* library tabs */}
      <div className="no-scrollbar sticky top-0 z-10 mt-6 flex gap-2 overflow-x-auto bg-ixi-night/95 px-5 py-2.5 backdrop-blur" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={section === t.id}
            onClick={() => setSection(t.id)}
            className={cx('flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors', section === t.id ? 'bg-white text-ixi-night' : 'bg-white/[.06] text-white/75')}
          >
            <t.icon size={14} /> {t.label}
            {t.n > 0 && <span className={cx('text-[11px]', section === t.id ? 'text-ixi-night/60' : 'text-white/45')}>{t.n}</span>}
          </button>
        ))}
      </div>

      <div className="px-5 pt-2">
        {section === 'history' &&
          (history.length ? (
            <>
              <div className="mb-2 flex justify-end">
                <button onClick={s.clearHistory} className="flex items-center gap-1 text-[12px] font-semibold text-white/50 hover:text-white">
                  <Trash2 size={12} /> Clear history
                </button>
              </div>
              <ul className="space-y-2">
                {history.map((h) => (
                  <ReelRow key={h.reelId} reel={h.reel} meta={`Watched ${ago(h.at)} ago`.replace('now ago', 'just now')} onClick={() => navigate(`/?reel=${h.reelId}`)} />
                ))}
              </ul>
            </>
          ) : (
            <Empty icon={History} text="Trips you watch show up here." cta="Watch reels" onClick={() => navigate('/')} />
          ))}

        {section === 'liked' &&
          (liked.length ? (
            <div className="grid grid-cols-3 gap-2">
              {liked.map((r) => (
                <button key={r.id} onClick={() => navigate(`/?reel=${r.id}`)} className="theme-dark relative aspect-[9/14] overflow-hidden rounded-xl text-left">
                  <SmartImage src={r.scenes[0].img} alt={r.title} fallback={r.fallback} className="absolute inset-0 h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                  <Heart size={14} fill="#FF3D57" stroke="none" className="absolute right-1.5 top-1.5" />
                  <span className="absolute inset-x-1.5 bottom-1.5 line-clamp-2 text-[11px] font-bold leading-tight">{r.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <Empty icon={Heart} text="Double-tap a reel or tap the heart to like it." cta="Find trips" onClick={() => navigate('/')} />
          ))}

        {section === 'saved' &&
          (s.dreams.length ? (
            <ul className="space-y-2">
              {s.dreams.map((d) => {
                const r = getReel(d.config.reelId)
                if (!r) return null
                const drop = d.savedPrice - d.currentPrice
                return <ReelRow key={d.id} reel={r} meta={drop > 0 ? `Now ${inr(d.currentPrice)}, ${inr(drop)} cheaper` : `Watching fares, ${inr(d.currentPrice)}`} accent={drop > 0} onClick={() => navigate('/dreams')} />
              })}
            </ul>
          ) : (
            <Empty icon={Bookmark} text="Tap the bookmark on a reel to save it and track its price." cta="Find trips" onClick={() => navigate('/')} />
          ))}

        {section === 'comments' &&
          (comments.length ? (
            <ul className="space-y-2">
              {comments.map((c) => {
                const r = getReel(c.reelId)
                if (!r) return null
                const parent = c.parentId ? [...SEED_COMMENTS, ...s.myComments].find((p) => p.id === c.parentId) : undefined
                return (
                  <li key={c.id} className="flex gap-3 rounded-2xl bg-white/[.03] p-2.5">
                    <button onClick={() => navigate(`/?reel=${r.id}&comments=1`)} className="shrink-0" aria-label={`Open comments on ${r.title}`}>
                      <SmartImage src={r.scenes[0].img} alt="" fallback={r.fallback} className="h-16 w-12 rounded-lg" />
                    </button>
                    <button onClick={() => navigate(`/?reel=${r.id}&comments=1`)} className="min-w-0 flex-1 text-left">
                      <div className="truncate text-[12px] text-white/50">
                        {parent ? `Replied to @${parent.user === ME.handle ? 'you' : parent.user}` : 'Commented'} on {r.title}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[14px] leading-snug">{c.text}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-white/45">
                        {ago(c.at)}
                        {s.likedComments.includes(c.id) && <span className="flex items-center gap-0.5"><Heart size={10} fill="#FF3D57" stroke="none" /> 1</span>}
                      </div>
                    </button>
                    <button onClick={() => s.deleteComment(c.id)} aria-label="Delete comment" className="grid h-8 w-8 shrink-0 place-items-center self-center rounded-full text-white/40 hover:bg-white/10 hover:text-abhi">
                      <Trash2 size={14} />
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty icon={MessageCircle} text="Your comments on trips show up here." cta="Join the conversation" onClick={() => navigate('/')} />
          ))}

        {section === 'questions' &&
          (questions.length ? (
            <ul className="space-y-2">
              {questions.map((q) => {
                const c = getCreator(q.creator)
                if (!c) return null
                return (
                  <li key={q.id}>
                    <button onClick={() => navigate(`/c/${q.creator}?tab=qa`)} className="w-full rounded-2xl bg-white/[.03] p-3 text-left">
                      <div className="flex items-center gap-2 text-[12px] text-white/50">
                        <Avatar name={c.name} hue={c.hue} size={20} /> Asked {c.name.split(' ')[0]} · {ago(q.at)}
                        <span className={cx('ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold', q.answer ? 'bg-ctkt/20 text-ctkt' : 'bg-white/10 text-white/60')}>
                          {q.answer ? 'Answered' : 'Waiting'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[14px] font-semibold leading-snug">{q.text}</p>
                      {q.answer && <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-white/65">{q.answer}</p>}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty icon={MessageCircleQuestion} text="Ask any creator a question from their channel." cta="Browse channels" onClick={() => navigate('/subs')} />
          ))}
      </div>

      <SafetyCenter open={safetyOpen} setOpen={setSafetyOpen} ref={safetyRef} />
    </div>
  )
}

const THEMES: { id: ThemePref; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'Auto', icon: Monitor },
]

/** One-tap appearance switch on the profile; the full options live in Settings */
function ThemeSwitch() {
  const theme = useApp((s) => s.theme)
  const setTheme = useApp((s) => s.setTheme)
  return (
    <div className="mx-5 mt-4 flex items-center justify-between rounded-2xl bg-white/[.04] py-2 pl-4 pr-2">
      <span className="text-[14px] font-semibold">Appearance</span>
      <div className="flex rounded-full bg-white/[.07] p-1" role="radiogroup" aria-label="Appearance">
        {THEMES.map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-checked={theme === t.id}
            onClick={() => setTheme(t.id)}
            className={cx('flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-bold transition-colors', theme === t.id ? 'bg-white text-ixi-night' : 'text-white/60')}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Hidden comments, open reports and blocked users, all reversible */
const SafetyCenter = forwardRef<HTMLElement, { open: boolean; setOpen: (fn: (o: boolean) => boolean) => void }>(function SafetyCenter({ open, setOpen }, ref) {
  const { hiddenComments, reports, blockedUsers, unhideComment, unblockUser } = useApp()
  const myComments = useApp((s) => s.myComments)
  const pool = [...SEED_COMMENTS, ...myComments, ...SEED_QUESTIONS]
  const hidden = hiddenComments.map((id) => ({ id, item: pool.find((c) => c.id === id), report: reports.find((r) => r.id === id) }))
  const total = hidden.length + blockedUsers.length

  return (
    <section ref={ref} className="mx-5 mt-8 rounded-[22px] border border-white/10 bg-white/[.03]">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-4 text-left" aria-expanded={open}>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ctkt/15">
          <ShieldCheck size={19} className="text-ctkt" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">Hidden & blocked</span>
          <span className="block text-[12px] text-white/55">
            {total ? `${hidden.length} hidden or reported · ${blockedUsers.length} blocked` : 'Nothing hidden. Use ⋯ on any comment to report, hide or block.'}
          </span>
        </span>
        <ChevronRight size={18} className={cx('text-white/40 transition-transform', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-white/10 p-4">
          {blockedUsers.length > 0 && (
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wide text-white/45">Blocked accounts</h3>
              <ul className="mt-2 space-y-2">
                {blockedUsers.map((h) => (
                  <li key={h} className="flex items-center gap-2.5">
                    <UserAvatar handle={h} size={30} />
                    <span className="flex-1 truncate text-[14px]">@{h}</span>
                    <button onClick={() => unblockUser(h)} className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold">
                      <UserX size={12} /> Unblock
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hidden.length > 0 && (
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wide text-white/45">Hidden and reported</h3>
              <ul className="mt-2 space-y-2">
                {hidden.map(({ id, item, report }) => (
                  <li key={id} className="flex items-start gap-2.5 rounded-xl bg-white/[.05] p-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] text-white/50">
                        @{item?.user ?? 'unknown'} ·{' '}
                        {report ? (
                          <span className="font-semibold text-ixi-ember">Reported: {REPORT_REASONS.find((r) => r.id === report.reason)?.label}, under review</span>
                        ) : (
                          'Hidden by you'
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-white/75">{item?.text ?? 'Live comment from an earlier session'}</p>
                    </div>
                    <button onClick={() => unhideComment(id)} className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold">
                      {report ? 'Withdraw' : 'Unhide'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[12px] leading-snug text-white/45">
            Trip Reels automatically blocks abusive language, spam, links and phone numbers in comments and questions. Reports are reviewed by our team within 24 hours.
          </p>
        </div>
      )}
    </section>
  )
})

function QuickLink({ to, icon: Icon, label }: { to: string; icon: typeof Heart; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/[.05] py-3 text-[12px] font-semibold transition-colors hover:bg-white/[.08]">
      <Icon size={18} className="text-ixi-ember" /> {label}
    </Link>
  )
}

function ReelRow({ reel, meta, accent, onClick }: { reel: Reel; meta: string; accent?: boolean; onClick: () => void }) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-white/[.03] p-2.5 text-left transition-colors hover:bg-white/[.06]">
        <SmartImage src={reel.scenes[0].img} alt="" fallback={reel.fallback} className="h-16 w-12 shrink-0 rounded-lg" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold">{reel.title}</span>
          <span className="block truncate text-[12px] text-white/50">@{reel.creator.handle} · {compact(reel.likes)} likes</span>
          <span className={cx('mt-0.5 block text-[12px] font-semibold', accent ? 'text-ctkt' : 'text-white/60')}>{meta}</span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-white/30" />
      </button>
    </li>
  )
}

function Empty({ icon: Icon, text, cta, onClick }: { icon: typeof Heart; text: string; cta: string; onClick: () => void }) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-white/15 p-5 text-center">
      <Icon className="mx-auto text-white/35" size={22} />
      <p className="mt-2 text-[13px] text-white/60">{text}</p>
      <button onClick={onClick} className="mt-3 rounded-full bg-white/10 px-4 py-2 text-[12px] font-bold">{cta}</button>
    </div>
  )
}
