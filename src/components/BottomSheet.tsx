import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { cx } from '../lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  height?: string // e.g. '88%'; omit for content height
  z?: number
  label: string
  className?: string
}

export default function BottomSheet({ open, onClose, children, height, z = 50, label, className }: Props) {
  const controls = useDragControls()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-[#02040f]/70 backdrop-blur-[2px]"
            style={{ zIndex: z }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={cx('absolute inset-x-0 bottom-0 flex max-h-[92%] flex-col overflow-hidden rounded-t-[30px] border-t border-white/10 bg-ixi-navy shadow-[0_-20px_60px_rgba(0,0,0,.5)]', className)}
            style={{ zIndex: z + 1, height }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 340, mass: 0.9 }}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose()
            }}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-2.5 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="h-1.5 w-11 rounded-full bg-white/25" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
