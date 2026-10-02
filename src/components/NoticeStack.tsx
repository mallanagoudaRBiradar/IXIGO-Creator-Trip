import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '../lib/store'

const TONES = { orange: '#F57224', green: '#14B87A', blue: '#3B82F6' }

export default function NoticeStack() {
  const notices = useUI((s) => s.notices)
  const dismiss = useUI((s) => s.dismiss)
  return (
    <div className="theme-dark pointer-events-none absolute inset-x-2.5 top-[max(env(safe-area-inset-top),10px)] z-[90] flex flex-col gap-2 sm:top-12" aria-live="polite">
      <AnimatePresence initial={false}>
        {notices.map((n) => (
          <motion.button
            key={n.id}
            layout
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.8, bottom: 0 }}
            onDragEnd={(_, i) => i.offset.y < -30 && dismiss(n.id)}
            initial={{ y: -90, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            onClick={() => {
              n.onAction?.()
              dismiss(n.id)
            }}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-[22px] border border-white/15 bg-[#1b2350]/90 p-3 text-left shadow-2xl backdrop-blur-xl"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-lg" style={{ background: TONES[n.tone ?? 'orange'] }}>
              {n.icon ?? '✈️'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between text-[11px] text-white/50">
                <span className="font-semibold">ixigo</span>
                <span>now</span>
              </span>
              <span className="block text-[14px] font-bold leading-snug">{n.title}</span>
              <span className="block text-[13px] leading-snug text-white/75">{n.body}</span>
              {n.actionLabel && <span className="mt-1 block text-[12px] font-bold text-ixi-ember">{n.actionLabel}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
