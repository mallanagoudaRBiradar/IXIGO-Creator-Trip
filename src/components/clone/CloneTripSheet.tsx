import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import BottomSheet from '../BottomSheet'
import BuildView from './BuildView'
import CrewView from './CrewView'
import { PayView, ProcessingView, SuccessView } from './Checkout'
import { getCity, getReel } from '../../lib/mockData'
import { defaultConfig, priceTrip, type TripConfig } from '../../lib/pricing'
import { useApp, useUI, type SheetStep } from '../../lib/store'

const ORDER: SheetStep[] = ['build', 'crew', 'pay', 'processing', 'success']

export default function CloneTripSheet() {
  const { sheet, closeSheet, setStep } = useUI()
  const origin = useApp((s) => s.origin)
  const reel = sheet.reelId ? getReel(sheet.reelId) : undefined
  const [cfg, setCfg] = useState<TripConfig | null>(null)
  const [share, setShare] = useState(false) // paying only your share of a crew split
  const [tripId, setTripId] = useState<string | null>(null)
  // a ref, because the step change (zustand) can render before a local setState lands
  const paid = useRef(0)
  const [prevStep, setPrevStep] = useState<SheetStep>('build')

  // fresh config whenever the sheet opens for a reel
  useEffect(() => {
    if (sheet.open && reel) {
      const base = sheet.config ?? defaultConfig(reel, origin)
      setCfg(sheet.step === 'crew' ? { ...base, travelers: Math.max(base.travelers, 4) } : base)
      setShare(sheet.step === 'crew')
      setTripId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet.open, sheet.reelId])

  // follow origin changes made in the picker while the sheet is open
  useEffect(() => {
    setCfg((c) => (c && c.origin !== origin ? { ...c, origin, fareDrop: undefined } : c))
  }, [origin])

  const price = useMemo(() => (cfg && reel ? priceTrip(cfg, reel, getCity(cfg.origin)) : null), [cfg, reel])
  const step = sheet.step
  const dir = ORDER.indexOf(step) >= ORDER.indexOf(prevStep) ? 1 : -1
  const go = (s: SheetStep) => {
    setPrevStep(step)
    setStep(s)
  }

  const locked = step === 'processing'

  return (
    <BottomSheet open={sheet.open} onClose={() => !locked && closeSheet()} height="88%" label="Clone this trip">
      {reel && cfg && price && (
        <div className="relative min-h-0 flex-1">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={step}
              custom={dir}
              className="absolute inset-0 flex flex-col"
              initial={{ x: dir * 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir * -60, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            >
              {step === 'build' && (
                <BuildView reel={reel} cfg={cfg} setCfg={setCfg} price={price} onBook={() => { setShare(false); go('pay') }} onCrew={() => { setCfg({ ...cfg, travelers: Math.max(cfg.travelers, 3) }); go('crew') }} />
              )}
              {step === 'crew' && <CrewView reel={reel} cfg={cfg} setCfg={setCfg} price={price} onBack={() => go('build')} onPayShare={() => { setShare(true); go('pay') }} />}
              {step === 'pay' && <PayView reel={reel} cfg={cfg} price={price} share={share} onBack={() => go(share ? 'crew' : 'build')} onPaid={(amt) => { paid.current = amt; go('processing') }} />}
              {step === 'processing' && <ProcessingView reel={reel} cfg={cfg} price={price} share={share} paid={paid.current} onDone={(id) => { setTripId(id); go('success') }} />}
              {step === 'success' && <SuccessView reel={reel} cfg={cfg} price={price} tripId={tripId} />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </BottomSheet>
  )
}
