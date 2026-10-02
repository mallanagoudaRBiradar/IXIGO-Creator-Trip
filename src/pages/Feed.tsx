import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ReelPlayer from '../components/ReelPlayer'
import CommentsSheet from '../components/CommentsSheet'
import { getCity, getReel } from '../lib/mockData'
import { useAllReels } from '../lib/reels'
import { useApp, useUI } from '../lib/store'
import { cx } from '../lib/utils'

export default function Feed() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const scroller = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [tab, setTab] = useState<'for' | 'following'>('for')
  const [commentsFor, setCommentsFor] = useState<string | null>(null)
  const { origin, following, onboarded, setOnboarded } = useApp()
  const setPicker = useUI((s) => s.setPicker)
  const notify = useUI((s) => s.notify)
  const addHistory = useApp((s) => s.addHistory)
  const markUploadsSeen = useApp((s) => s.markUploadsSeen)
  const all = useAllReels()

  const reels = useMemo(() => (tab === 'for' ? all : all.filter((r) => following.includes(r.creator.handle))), [tab, following, all])

  // reset to the top when switching between For you and My Channels (unless a deep link is pending)
  useEffect(() => {
    if (params.get('reel')) return
    scroller.current?.scrollTo({ top: 0 })
    setActive(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // which reel is on screen
  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.index))),
      { root, threshold: 0.6 },
    )
    root.querySelectorAll('[data-index]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [reels])

  // deep links: /?reel=id (Explore, channels, shared links), &comments=1 opens the thread, &ref=share greets new visitors
  useEffect(() => {
    const id = params.get('reel')
    if (!id) return
    let idx = reels.findIndex((r) => r.id === id)
    if (idx < 0 && tab !== 'for') {
      setTab('for')
      return
    }
    idx = Math.max(0, idx)
    if (scroller.current) scroller.current.scrollTo({ top: idx * scroller.current.clientHeight })
    setActive(idx)
    if (params.get('comments')) setCommentsFor(id)
    if (params.get('ref') === 'share') {
      const reel = getReel(id)
      if (reel) notify({ title: 'A friend shared this trip with you', body: `${reel.title}. Tap Take me there to price it from your city.`, icon: '🎁', tone: 'blue' })
    }
    // consume the link so a refresh or tab switch doesn't repeat it
    setParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, reels])

  // a new upload is prepended to the list: keep the viewer on the reel they were watching
  const activeId = useRef<string | null>(null)
  useLayoutEffect(() => {
    const idx = activeId.current ? reels.findIndex((r) => r.id === activeId.current) : -1
    if (idx >= 0 && idx !== active && scroller.current) {
      scroller.current.scrollTop = idx * scroller.current.clientHeight
      setActive(idx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reels])
  useEffect(() => {
    activeId.current = reels[active]?.id ?? null
  }, [active, reels])

  // watch history, and clear the "new upload" dot once a fresh trip has actually been watched
  useEffect(() => {
    const reel = reels[active]
    if (!reel) return
    const t = setTimeout(() => {
      if (!useApp.getState().prefs.pauseHistory) addHistory(reel.id)
      markUploadsSeen([reel.id])
    }, 1500)
    return () => clearTimeout(t)
  }, [active, reels, addHistory, markUploadsSeen])

  useEffect(() => {
    if (active > 0 && !onboarded) setOnboarded()
  }, [active, onboarded, setOnboarded])

  const go = (dir: 1 | -1) => scroller.current?.scrollBy({ top: dir * scroller.current.clientHeight, behavior: 'smooth' })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && typeof t.closest === 'function' && t.closest('input,textarea,[role=dialog]')) return
      if (document.querySelector('[role=dialog]')) return
      if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); go(-1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const commentReel = commentsFor ? getReel(commentsFor) : null

  return (
    <div className="theme-dark relative h-full bg-black">
      <div ref={scroller} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain">
        {reels.map((r, i) => (
          <section key={r.id} data-index={i} className="h-full w-full snap-start snap-always" aria-label={r.title}>
            <ReelPlayer reel={r} active={i === active} onComments={() => setCommentsFor(r.id)} />
          </section>
        ))}
        {reels.length === 0 && (
          <div className="grid h-full place-items-center px-10 text-center">
            <div>
              <p className="font-display text-2xl font-bold">No subscriptions yet</p>
              <p className="mt-2 text-sm text-white/60">Subscribe to creators and their trips will show up here.</p>
              <div className="mt-5 flex justify-center gap-2">
                <button onClick={() => navigate('/subs')} className="rounded-full bg-ixi-orange px-5 py-2.5 text-sm font-bold">Find creators</button>
                <button onClick={() => setTab('for')} className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold">Show me trips</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* top bar */}
      <div className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-20 px-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPicker(true)}
            className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/35 py-1.5 pl-2 pr-2.5 text-[12px] font-semibold backdrop-blur"
            aria-label="Change departure city"
          >
            <MapPin size={13} className="text-ixi-ember" /> {getCity(origin).name}
            <ChevronDown size={13} />
          </button>
          <div className="pointer-events-auto flex gap-4 text-[15px] font-bold">
            {(['following', 'for'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cx('relative pb-1 transition-colors', tab === t ? 'text-white' : 'text-white/55')}>
                {t === 'for' ? 'For you' : 'My Channels'}
                {tab === t && <motion.span layoutId="feed-tab" className="absolute inset-x-2 -bottom-0.5 h-[3px] rounded-full bg-white" />}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/explore')} aria-label="Search trips" className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-black/35 backdrop-blur">
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* first-run hint */}
      <AnimatePresence>
        {!onboarded && tab === 'for' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.6 }}
            className="pointer-events-none absolute inset-x-0 top-[54%] z-20 flex flex-col items-center"
          >
            <motion.div animate={{ y: [0, -16, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
              <ChevronUp size={30} />
            </motion.div>
            <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold backdrop-blur">Swipe up for the next trip</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CommentsSheet reel={commentReel ?? null} onClose={() => setCommentsFor(null)} />
    </div>
  )
}
