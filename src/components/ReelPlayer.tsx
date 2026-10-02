import { AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Bookmark, Heart, MessageCircle, Music2, Pause, Plus, Send, Volume2, VolumeX } from 'lucide-react'
import { getCity, type Reel } from '../lib/mockData'
import { defaultConfig, fromPrice } from '../lib/pricing'
import { useApp, useUI } from '../lib/store'
import { compact, cx, inr } from '../lib/utils'
import { Avatar, ModeIcon, SmartImage } from './ui'

const SCENE_MS = 3800

function SceneBar({ i, elapsed }: { i: number; elapsed: MotionValue<number> }) {
  const w = useTransform(elapsed, (e) => `${Math.min(100, Math.max(0, ((e - i * SCENE_MS) / SCENE_MS) * 100))}%`)
  return (
    <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
      <motion.div className="h-full rounded-full bg-white" style={{ width: w }} />
    </div>
  )
}

interface Props {
  reel: Reel
  active: boolean
  onComments: () => void
}

export default function ReelPlayer({ reel, active, onComments }: Props) {
  const n = reel.scenes.length
  const elapsed = useMotionValue(0)
  const [scene, setScene] = useState(0)
  const sceneRef = useRef(0)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([])
  const [showVerify, setShowVerify] = useState(false)
  const lastTap = useRef(0)
  const tapTimer = useRef<number>()

  const origin = useApp((s) => s.origin)
  const liked = useApp((s) => s.liked.includes(reel.id))
  const following = useApp((s) => s.following.includes(reel.creator.handle))
  const verified = useApp((s) => s.verifiedReels.includes(reel.id))
  const saved = useApp((s) => s.dreams.some((d) => d.config.reelId === reel.id))
  const { toggleLike, toggleFollow, saveDream } = useApp()
  const { openSheet, notify } = useUI()
  const price = fromPrice(reel, getCity(origin))

  // playback clock
  useEffect(() => {
    if (!active) {
      elapsed.set(0)
      sceneRef.current = 0
      setScene(0)
      setPaused(false)
      return
    }
    if (paused) return
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      // rAF timestamps can be slightly behind performance.now() on the first frame
      let e = elapsed.get() + Math.max(0, t - last)
      last = t
      if (e >= n * SCENE_MS || e < 0) e = 0
      elapsed.set(e)
      const s = Math.floor(e / SCENE_MS)
      if (s !== sceneRef.current) {
        sceneRef.current = s
        setScene(s)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, paused, n, elapsed])

  const jump = (s: number) => {
    const next = (s + n) % n
    sceneRef.current = next
    setScene(next)
    elapsed.set(next * SCENE_MS)
  }

  const like = (x: number, y: number) => {
    if (!liked) toggleLike(reel.id)
    const id = Date.now()
    setHearts((h) => [...h, { id, x, y }])
    setTimeout(() => setHearts((h) => h.filter((q) => q.id !== id)), 900)
  }

  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const now = Date.now()
    if (now - lastTap.current < 280) {
      clearTimeout(tapTimer.current)
      lastTap.current = 0
      like(x, y)
      return
    }
    lastTap.current = now
    tapTimer.current = window.setTimeout(() => {
      const third = rect.width / 3
      if (x < third) jump(sceneRef.current - 1)
      else if (x > third * 2) jump(sceneRef.current + 1)
      else setPaused((p) => !p)
    }, 280)
  }

  const save = () => {
    if (saved) return notify({ title: 'Already on your Dream Board', body: 'We are watching fares for this trip.', icon: '✨' })
    saveDream(defaultConfig(reel, origin))
    notify({ title: 'Saved to Dream Board', body: `We'll ping you the moment ${reel.destination.name} fares drop.`, icon: '✨' })
  }

  const current = reel.scenes[scene] ?? reel.scenes[0]

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Scenes with Ken Burns motion */}
      <div className="absolute inset-0" onClick={onTap}>
        <AnimatePresence initial={false}>
          <motion.div key={scene} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.16, x: scene % 2 ? 12 : -12 }}
              animate={active && !paused ? { scale: 1.02, x: 0 } : {}}
              transition={{ duration: SCENE_MS / 1000 + 0.8, ease: 'linear' }}
            >
              <SmartImage src={current.img} alt={current.caption} fallback={reel.fallback} className="h-full w-full" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {/* preload the rest */}
        {active && <div className="hidden">{reel.scenes.map((s) => <img key={s.img} src={s.img} alt="" />)}</div>}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black via-black/55 to-transparent" />

        {/* subtitle */}
        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center px-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={scene + reel.id}
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260 }}
              className="text-shadow text-center font-display text-[26px] font-extrabold leading-[1.05] tracking-tight"
            >
              {current.caption}
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {paused && (
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.3 }} className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-black/40 backdrop-blur">
                <Pause size={34} fill="white" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {hearts.map((h) => (
          <motion.span
            key={h.id}
            className="pointer-events-none absolute"
            style={{ left: h.x - 48, top: h.y - 48 }}
            initial={{ scale: 0, rotate: -15, opacity: 1 }}
            animate={{ scale: [0, 1.25, 1], y: -70, opacity: [1, 1, 0] }}
            transition={{ duration: 0.85 }}
          >
            <Heart size={96} fill="#FF3D57" stroke="none" />
          </motion.span>
        ))}
      </div>

      {/* scene progress */}
      <div className="pt-safe pointer-events-none absolute inset-x-0 top-0 flex gap-1 px-3">
        <div className="mt-[42px] flex flex-1 gap-1">
          {reel.scenes.map((_, i) => <SceneBar key={i} i={i} elapsed={elapsed} />)}
        </div>
      </div>

      {/* right rail */}
      <div className="absolute bottom-[172px] right-2.5 z-10 flex flex-col items-center gap-[18px]">
        <div className="relative mb-1">
          <Avatar name={reel.creator.name} hue={reel.creator.hue} size={46} ring />
          <button
            aria-label={following ? `Unfollow ${reel.creator.handle}` : `Follow ${reel.creator.handle}`}
            onClick={() => toggleFollow(reel.creator.handle)}
            className={cx('absolute -bottom-2 left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full text-white transition-colors', following ? 'bg-ctkt' : 'bg-ixi-orange')}
          >
            {following ? <BadgeCheck size={12} /> : <Plus size={13} strokeWidth={3} />}
          </button>
        </div>
        <RailButton label={compact(reel.likes + (liked ? 1 : 0))} aria={liked ? 'Unlike' : 'Like'} onClick={() => toggleLike(reel.id)}>
          <motion.span key={String(liked)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 14 }}>
            <Heart size={30} fill={liked ? '#FF3D57' : 'transparent'} stroke={liked ? '#FF3D57' : 'white'} />
          </motion.span>
        </RailButton>
        <RailButton label={compact(reel.comments)} aria="Comments" onClick={onComments}>
          <MessageCircle size={29} />
        </RailButton>
        <RailButton label={saved ? 'Saved' : 'Dream'} aria="Save to Dream Board" onClick={save}>
          <Bookmark size={28} fill={saved ? '#FF9A4D' : 'transparent'} stroke={saved ? '#FF9A4D' : 'white'} />
        </RailButton>
        <RailButton label="Crew" aria="Share with your crew" onClick={() => openSheet(reel.id, 'crew')}>
          <Send size={27} />
        </RailButton>
        <button aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 backdrop-blur">
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </div>

      {/* bottom info + CTA */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-3.5 pb-3">
        <div className="pr-16">
          <div className="flex items-center gap-2">
            <span className="text-shadow text-[15px] font-bold">@{reel.creator.handle}</span>
            {verified && (
              <button onClick={() => setShowVerify((v) => !v)} className="flex items-center gap-1 rounded-full bg-verify/20 px-2 py-0.5 text-[11px] font-bold text-verify backdrop-blur" aria-expanded={showVerify}>
                <BadgeCheck size={13} /> Verified trip
              </button>
            )}
          </div>
          <AnimatePresence>
            {showVerify && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 overflow-hidden rounded-xl bg-black/50 px-3 py-2 text-[12px] leading-snug text-white/85 backdrop-blur">
                {reel.creator.name.split(' ')[0]} booked every leg of this trip on ixigo. We matched the PNRs to this reel, so what you see is what you can book.
              </motion.p>
            )}
          </AnimatePresence>
          <h2 className="text-shadow mt-1.5 font-display text-[21px] font-bold leading-tight">{reel.title}</h2>
          <p className="text-shadow mt-1 line-clamp-2 text-[13px] leading-snug text-white/85">{reel.caption}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {reel.vibes.map((v) => (
              <span key={v} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">#{v}</span>
            ))}
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              <ModeIcon mode={reel.recommendedMode} size={12} /> {reel.days}D/{reel.nights}N
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 overflow-hidden text-[12px] text-white/75">
            <Music2 size={13} className="shrink-0" />
            <div className="w-44 overflow-hidden">
              <div className="marquee flex w-max gap-8 whitespace-nowrap">
                <span>{reel.music}</span>
                <span>{reel.music}</span>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => openSheet(reel.id, 'build')}
          className="cta-sweep relative mt-3.5 flex w-full items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-ixi-orange to-[#FF8A3D] py-3 pl-5 pr-3 shadow-glow"
        >
          <span className="text-left">
            <span className="block font-display text-[19px] font-extrabold leading-none">Clone this trip</span>
            <span className="mt-1 block text-[12px] font-medium text-white/85">
              {inr(price)} per person from {getCity(origin).name}
            </span>
          </span>
          <span className="whitespace-nowrap rounded-xl bg-white/20 px-3 py-2 text-[12px] font-bold">{compact(reel.clones)} cloned</span>
        </motion.button>
      </div>
    </div>
  )
}

function RailButton({ children, label, aria, onClick }: { children: React.ReactNode; label: string; aria: string; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.85 }} onClick={onClick} aria-label={aria} className="flex flex-col items-center gap-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,.5)]">
      {children}
      <span className="text-[11px] font-semibold">{label}</span>
    </motion.button>
  )
}
