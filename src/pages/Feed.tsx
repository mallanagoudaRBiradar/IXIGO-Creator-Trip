import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ReelPlayer from '../components/ReelPlayer'
import BottomSheet from '../components/BottomSheet'
import { Avatar } from '../components/ui'
import { COMMENTS, getCity, getReel, REELS } from '../lib/mockData'
import { useApp, useUI } from '../lib/store'
import { cx } from '../lib/utils'

export default function Feed() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const scroller = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [tab, setTab] = useState<'for' | 'following'>('for')
  const [commentsFor, setCommentsFor] = useState<string | null>(null)
  const { origin, following, onboarded, setOnboarded } = useApp()
  const setPicker = useUI((s) => s.setPicker)

  const reels = useMemo(() => (tab === 'for' ? REELS : REELS.filter((r) => following.includes(r.creator.handle))), [tab, following])

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

  // deep link from Explore: /?reel=id
  useEffect(() => {
    const id = params.get('reel')
    const idx = reels.findIndex((r) => r.id === id)
    if (idx > 0 && scroller.current) scroller.current.scrollTo({ top: idx * scroller.current.clientHeight })
  }, [params, reels])

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
    <div className="relative h-full bg-black">
      <div ref={scroller} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain">
        {reels.map((r, i) => (
          <section key={r.id} data-index={i} className="h-full w-full snap-start snap-always" aria-label={r.title}>
            <ReelPlayer reel={r} active={i === active} onComments={() => setCommentsFor(r.id)} />
          </section>
        ))}
        {reels.length === 0 && (
          <div className="grid h-full place-items-center px-10 text-center">
            <div>
              <p className="font-display text-2xl font-bold">No one followed yet</p>
              <p className="mt-2 text-sm text-white/60">Tap the plus on any creator's avatar and their trips will show up here.</p>
              <button onClick={() => setTab('for')} className="mt-5 rounded-full bg-ixi-orange px-5 py-2.5 text-sm font-bold">Show me trips</button>
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
                {t === 'for' ? 'For you' : 'Following'}
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

      <BottomSheet open={!!commentReel} onClose={() => setCommentsFor(null)} label="Comments" height="58%">
        {commentReel && (
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className="px-5 pb-3 text-center text-sm font-bold">{commentReel.comments.toLocaleString('en-IN')} comments</h2>
            <ul className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 pb-6">
              {COMMENTS.map((c) => (
                <li key={c.user} className="flex gap-3">
                  <Avatar name={c.user.replace(/[._]/g, ' ')} hue={['#24316A', '#F57224']} size={34} />
                  <div className="text-sm">
                    <div className="text-xs text-white/50">
                      {c.user} <span className="ml-1">{c.time}</span>
                    </div>
                    <p className="mt-0.5 leading-snug">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
