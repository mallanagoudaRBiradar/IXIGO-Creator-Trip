import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BadgeCheck, Check, Film, Loader2 } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { PartnerBadge, SmartImage } from './ui'
import { PAST_BOOKINGS, REELS } from '../lib/mockData'
import { cx } from '../lib/utils'

type Step = 'pick' | 'link' | 'verify' | 'done'

interface Props {
  open: boolean
  startAt: 'pick' | 'link'
  reelTitle?: string
  onClose: () => void
  onVerified: () => void
}

const CLIPS = REELS.flatMap((r) => r.scenes.slice(0, 2).map((s) => ({ img: s.img, fallback: r.fallback }))).slice(0, 9).map((c, i) => ({ ...c, len: `0:${28 + i * 5}` }))

export default function UploadSheet({ open, startAt, reelTitle, onClose, onVerified }: Props) {
  const [step, setStep] = useState<Step>(startAt)
  const [clip, setClip] = useState<number | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [checks, setChecks] = useState(0)

  useEffect(() => {
    if (open) {
      setStep(startAt)
      setClip(null)
      setPicked([])
      setChecks(0)
    }
  }, [open, startAt])

  useEffect(() => {
    if (step !== 'verify') return
    const t = [1, 2, 3].map((n) => window.setTimeout(() => setChecks(n), n * 700))
    const fin = window.setTimeout(() => {
      setStep('done')
      onVerified()
    }, 2600)
    return () => { t.forEach(clearTimeout); clearTimeout(fin) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const bookings = PAST_BOOKINGS.filter((b) => picked.includes(b.id))

  return (
    <BottomSheet open={open} onClose={() => step !== 'verify' && onClose()} height="82%" label="Publish a verified reel">
      <div className="flex shrink-0 items-center gap-2 px-5 pb-3">
        {(['pick', 'link', 'verify'] as Step[]).map((s, i) => {
          const idx = ['pick', 'link', 'verify', 'done'].indexOf(step)
          return <span key={s} className={cx('h-1 flex-1 rounded-full transition-colors', i <= idx ? 'bg-ixi-orange' : 'bg-white/10')} />
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex min-h-0 flex-1 flex-col">
          {step === 'pick' && (
            <>
              <div className="px-5">
                <h2 className="font-display text-[22px] font-bold">Pick a clip</h2>
                <p className="mt-1 text-[13px] text-white/55">Vertical video, up to 90 seconds.</p>
              </div>
              <div className="no-scrollbar mt-4 grid min-h-0 flex-1 grid-cols-3 gap-1.5 overflow-y-auto px-5 pb-4">
                {CLIPS.map((c, i) => (
                  <button key={i} onClick={() => setClip(i)} className={cx('relative aspect-[9/14] overflow-hidden rounded-xl ring-2 transition', clip === i ? 'ring-ixi-orange' : 'ring-transparent')} aria-pressed={clip === i}>
                    <SmartImage src={c.img} alt={`Clip ${i + 1}`} fallback={c.fallback} className="h-full w-full" />
                    <span className="absolute bottom-1 right-1.5 text-[10px] font-bold text-shadow">{c.len}</span>
                    {clip === i && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ixi-orange"><Check size={12} strokeWidth={3} /></span>}
                  </button>
                ))}
              </div>
              <Footer disabled={clip === null} onClick={() => setStep('link')} label="Next: link your bookings" />
            </>
          )}
          {step === 'link' && (
            <>
              <div className="px-5">
                <h2 className="font-display text-[22px] font-bold">Link the bookings from this trip</h2>
                <p className="mt-1 text-[13px] text-white/55">
                  {reelTitle ? `For “${reelTitle}”. ` : ''}Only completed trips from your ixigo, AbhiBus and ConfirmTkt history can be tagged, so viewers know it's real.
                </p>
              </div>
              <ul className="no-scrollbar mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-4">
                {PAST_BOOKINGS.map((b) => {
                  const on = picked.includes(b.id)
                  return (
                    <li key={b.id}>
                      <button onClick={() => setPicked(on ? picked.filter((x) => x !== b.id) : [...picked, b.id])} className={cx('flex w-full items-center gap-3 rounded-2xl border p-3 text-left', on ? 'border-ixi-orange bg-ixi-orange/10' : 'border-white/10')} aria-pressed={on}>
                        <div className="min-w-0 flex-1">
                          <PartnerBadge mode={b.partner} />
                          <div className="mt-1.5 text-[14px] font-semibold">{b.title}</div>
                          <div className="text-[12px] text-white/50">{b.detail}, {b.date}</div>
                        </div>
                        <span className={cx('grid h-6 w-6 place-items-center rounded-full border-2', on ? 'border-ixi-orange bg-ixi-orange' : 'border-white/25')}>
                          {on && <Check size={13} strokeWidth={3} />}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <Footer disabled={picked.length === 0} onClick={() => setStep('verify')} label={`Verify ${picked.length || ''} booking${picked.length === 1 ? '' : 's'}`} />
            </>
          )}
          {step === 'verify' && (
            <div className="flex flex-1 flex-col items-center justify-center px-8">
              <Loader2 size={40} className="animate-spin text-ixi-orange" />
              <ul className="mt-8 w-full max-w-xs space-y-3 text-[14px]">
                {[`Matching PNR ${bookings[0]?.pnr ?? ''}`, 'Checking travel dates are complete', 'Pairing stays and transport to your clip'].map((t, i) => (
                  <li key={t} className={cx('flex items-center gap-3 transition-opacity', checks > i ? 'opacity-100' : 'opacity-35')}>
                    <span className={cx('grid h-5 w-5 place-items-center rounded-full', checks > i ? 'bg-ctkt' : 'bg-white/10')}>{checks > i && <Check size={12} strokeWidth={3} />}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {step === 'done' && (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="grid h-20 w-20 place-items-center rounded-full bg-verify/15">
                <BadgeCheck size={44} className="text-verify" />
              </motion.div>
              <h2 className="mt-5 font-display text-[26px] font-extrabold">Live with a Verified trip badge</h2>
              <p className="mt-2 text-[14px] text-white/60">Viewers can now book this exact trip. You earn Gems on every booking it inspires.</p>
              <button onClick={onClose} className="mt-8 w-full rounded-2xl bg-ixi-orange py-3.5 font-display text-[16px] font-extrabold">Back to dashboard</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </BottomSheet>
  )
}

function Footer({ disabled, onClick, label }: { disabled: boolean; onClick: () => void; label: string }) {
  return (
    <div className="pb-safe shrink-0 border-t border-white/10 px-5 pb-3 pt-3 sm:pb-4">
      <button disabled={disabled} onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ixi-orange py-3.5 font-display text-[16px] font-extrabold transition-opacity disabled:opacity-35">
        <Film size={17} /> {label}
      </button>
    </div>
  )
}
