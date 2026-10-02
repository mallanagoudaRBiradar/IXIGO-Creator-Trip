import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, EyeOff, Flag, ShieldCheck, Trash2, UserX } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { REPORT_REASONS, type ReportReason } from '../lib/moderation'
import { useApp, useUI } from '../lib/store'
import { cx } from '../lib/utils'

export interface ModTarget {
  id: string
  user: string
  text: string
  kind: 'comment' | 'question'
  mine: boolean
  onDelete?: () => void
}

/** The "⋯" menu on any comment or question: delete your own, or report, hide or block someone else */
export default function ModerationSheet({ target, onClose }: { target: ModTarget | null; onClose: () => void }) {
  return (
    <BottomSheet open={!!target} onClose={onClose} label="Comment options" z={70}>
      {target && <Menu key={target.id} t={target} onClose={onClose} />}
    </BottomSheet>
  )
}

function Menu({ t, onClose }: { t: ModTarget; onClose: () => void }) {
  const { hideComment, unhideComment, reportComment, blockUser, unblockUser } = useApp()
  const notify = useUI((s) => s.notify)
  const [step, setStep] = useState<'menu' | 'report' | 'done'>('menu')
  const [reason, setReason] = useState<ReportReason | null>(null)
  const noun = t.kind === 'comment' ? 'comment' : 'question'

  // parents re-render often (live comments), so keep the latest onClose in a ref rather than restarting the timer
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (step !== 'done') return
    const id = setTimeout(() => close.current(), 1800)
    return () => clearTimeout(id)
  }, [step])

  const hide = () => {
    hideComment(t.id)
    onClose()
    notify({ title: `${noun[0].toUpperCase() + noun.slice(1)} hidden`, body: 'Only you stop seeing it. Tap to undo.', icon: '🙈', actionLabel: 'Undo', onAction: () => unhideComment(t.id) })
  }

  const block = () => {
    blockUser(t.user)
    onClose()
    notify({ title: `Blocked @${t.user}`, body: 'You won’t see their comments or questions anywhere. Tap to undo.', icon: '🚫', actionLabel: 'Undo', onAction: () => unblockUser(t.user) })
  }

  const submit = () => {
    if (!reason) return
    reportComment(t.id, reason)
    setStep('done')
  }

  return (
    <div className="pb-safe px-5 pb-5">
      {step === 'menu' && (
        <>
          <p className="mb-3 line-clamp-2 rounded-xl bg-white/[.05] px-3 py-2 text-[13px] text-white/65">
            <span className="font-semibold text-white/85">{t.mine ? 'You' : `@${t.user}`}:</span> {t.text}
          </p>
          <ul className="space-y-1">
            {t.mine ? (
              <Item
                icon={Trash2}
                label={`Delete ${noun}`}
                hint="Removes it for everyone"
                danger
                onClick={() => {
                  t.onDelete?.()
                  onClose()
                }}
              />
            ) : (
              <>
                <Item icon={Flag} label={`Report ${noun}`} hint="Our team reviews every report within 24 hours" danger onClick={() => setStep('report')} />
                <Item icon={EyeOff} label={`Hide this ${noun}`} hint="Only hides it for you" onClick={hide} />
                <Item icon={UserX} label={`Block @${t.user}`} hint="Hide everything they post" onClick={block} />
              </>
            )}
          </ul>
        </>
      )}

      {step === 'report' && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <button onClick={() => setStep('menu')} aria-label="Back" className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-[16px] font-bold">Why are you reporting this?</h2>
          </div>
          <div role="radiogroup" className="space-y-1.5">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.id}
                role="radio"
                aria-checked={reason === r.id}
                onClick={() => setReason(r.id)}
                className={cx('flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors', reason === r.id ? 'border-ixi-orange bg-ixi-orange/10' : 'border-white/10 bg-white/[.03]')}
              >
                <span className={cx('grid h-4 w-4 shrink-0 place-items-center rounded-full border-2', reason === r.id ? 'border-ixi-orange' : 'border-white/30')}>
                  {reason === r.id && <span className="h-2 w-2 rounded-full bg-ixi-orange" />}
                </span>
                <span>
                  <span className="block text-[14px] font-semibold">{r.label}</span>
                  {r.hint && <span className="block text-[12px] text-white/50">{r.hint}</span>}
                </span>
              </button>
            ))}
          </div>
          <button onClick={submit} disabled={!reason} className="mt-4 w-full rounded-2xl bg-abhi py-3 text-[14px] font-bold transition-opacity disabled:opacity-35">
            Submit report
          </button>
        </>
      )}

      {step === 'done' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ctkt/20">
            <ShieldCheck size={28} className="text-ctkt" />
          </span>
          <p className="mt-3 font-display text-[18px] font-bold">Thanks for reporting</p>
          <p className="mx-auto mt-1 max-w-[30ch] text-[13px] text-white/60">We’ve hidden it for you and our team will review it. You can manage this in You › Hidden & blocked.</p>
        </motion.div>
      )}
    </div>
  )
}

function Item({ icon: Icon, label, hint, danger, onClick }: { icon: typeof Flag; label: string; hint: string; danger?: boolean; onClick: () => void }) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/[.05]">
        <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full', danger ? 'bg-abhi/15 text-abhi' : 'bg-white/[.07] text-white/80')}>
          <Icon size={17} />
        </span>
        <span>
          <span className={cx('block text-[14px] font-semibold', danger && 'text-abhi')}>{label}</span>
          <span className="block text-[12px] text-white/50">{hint}</span>
        </span>
      </button>
    </li>
  )
}
