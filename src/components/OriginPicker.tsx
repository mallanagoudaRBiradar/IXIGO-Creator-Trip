import { useState } from 'react'
import { Check, Loader2, LocateFixed } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { CITIES, getCity } from '../lib/mockData'
import { nearestCity } from '../lib/pricing'
import { useApp, useUI } from '../lib/store'
import { cx } from '../lib/utils'

export default function OriginPicker() {
  const open = useUI((s) => s.pickerOpen)
  const setPicker = useUI((s) => s.setPicker)
  const notify = useUI((s) => s.notify)
  const { origin, setOrigin } = useApp()
  const [locating, setLocating] = useState(false)

  const choose = (id: string, detected = false) => {
    setOrigin(id, detected)
    setPicker(false)
    notify({ title: `Prices now from ${getCity(id).name}`, body: 'Every reel re-priced with live fares from your city.', icon: '📍', tone: 'blue' })
  }

  const locate = () => {
    if (!navigator.geolocation) return notify({ title: 'Location is unavailable', body: 'Pick your city from the list instead.', icon: '📍', tone: 'blue' })
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false)
        choose(nearestCity(p.coords.latitude, p.coords.longitude).id, true)
      },
      () => {
        setLocating(false)
        notify({ title: 'Location permission is off', body: 'Allow location in your browser, or pick a city below.', icon: '📍', tone: 'blue' })
      },
      { timeout: 8000 },
    )
  }

  return (
    <BottomSheet open={open} onClose={() => setPicker(false)} z={70} label="Choose where you're travelling from">
      <div className="px-5 pb-6">
        <h2 className="font-display text-2xl font-bold">Travelling from</h2>
        <p className="mt-1 text-sm text-white/55">We price every leg of every reel from here.</p>
        <button onClick={locate} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-ixi-orange/15 px-4 py-3.5 text-left font-semibold text-ixi-ember">
          {locating ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
          {locating ? 'Finding you…' : 'Use my current location'}
        </button>
        <ul className="no-scrollbar mt-3 grid max-h-[42vh] grid-cols-2 gap-2 overflow-y-auto">
          {CITIES.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => choose(c.id)}
                className={cx('flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left text-sm font-semibold', c.id === origin ? 'border-ixi-orange bg-ixi-orange/10' : 'border-white/10 bg-white/[.03]')}
              >
                <span>
                  {c.name}
                  <span className="ml-1.5 text-xs font-medium text-white/40">{c.code}</span>
                </span>
                {c.id === origin && <Check size={16} className="text-ixi-orange" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  )
}
