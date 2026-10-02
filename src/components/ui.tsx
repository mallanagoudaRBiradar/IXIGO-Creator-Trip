import { animate, useMotionValue } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { Bus, Plane, TrainFront } from 'lucide-react'
import { PARTNER, type Mode } from '../lib/mockData'
import { cx, inr } from '../lib/utils'

/** Image with a gradient fallback, so a slow or offline network never shows a broken frame */
export function SmartImage({ src, alt, fallback, className }: { src: string; alt: string; fallback: [string, string]; className?: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'err'>('loading')
  return (
    <div className={cx('relative overflow-hidden', className)} style={{ background: `linear-gradient(135deg, ${fallback[0]}, ${fallback[1]})` }}>
      {state !== 'err' && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          onLoad={() => setState('ok')}
          onError={() => setState('err')}
          className={cx('h-full w-full select-none object-cover transition-opacity duration-500', state === 'ok' ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </div>
  )
}

export function Avatar({ name, hue, size = 40, ring = false }: { name: string; hue: [string, string]; size?: number; ring?: boolean }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('')
  return (
    <div
      className={cx('grid shrink-0 place-items-center rounded-full font-display font-bold text-white', ring && 'ring-2 ring-white')}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, ${hue[0]}, ${hue[1]})` }}
      aria-hidden
    >
      {initials}
    </div>
  )
}

export function AnimatedNumber({ value, from, format = inr, className }: { value: number; from?: number; format?: (n: number) => string; className?: string }) {
  const mv = useMotionValue(from ?? value)
  const [text, setText] = useState(format(from ?? value))
  useEffect(() => {
    const c = animate(mv, value, { duration: from !== undefined ? 1.2 : 0.55, ease: [0.22, 1, 0.36, 1] })
    const unsub = mv.on('change', (v) => setText(format(v)))
    return () => { c.stop(); unsub() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <span className={cx('tabular-nums', className)}>{text}</span>
}

export const ModeIcon = ({ mode, size = 16, className }: { mode: Mode; size?: number; className?: string }) => {
  const I = mode === 'flight' ? Plane : mode === 'bus' ? Bus : TrainFront
  return <I size={size} className={className} />
}

export function PartnerBadge({ mode, className }: { mode: Mode; className?: string }) {
  const p = PARTNER[mode]
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-white', className)} style={{ background: p.color }}>
      <ModeIcon mode={mode} size={11} />
      {p.name}
    </span>
  )
}

export function PageHeader({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <header className="pt-safe px-5 pb-3">
      <div className="flex items-end justify-between gap-3 pt-2">
        <div>
          <h1 className="font-display text-[30px] font-extrabold leading-none tracking-tight">{title}</h1>
          {sub && <p className="mt-2 max-w-[30ch] text-sm leading-snug text-white/60">{sub}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}

export function Price({ n, className }: { n: number; className?: string }) {
  return <span className={cx('tabular-nums', className)}>{inr(n)}</span>
}
