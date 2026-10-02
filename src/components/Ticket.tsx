import type { ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { PARTNER, type City, type Mode } from '../lib/mockData'
import type { TransportQuote } from '../lib/pricing'
import { cx, duration } from '../lib/utils'
import { ModeIcon } from './ui'

interface Props {
  quote: TransportQuote
  from: City
  to: { code: string; name: string }
  footer?: ReactNode
  qr?: string
  notch?: string // background colour behind the ticket, for the punched notches
  className?: string
  reverse?: boolean
}

/** Boarding-pass styled transport card. Paper colour, perforated tear line. */
export default function Ticket({ quote, from, to, footer, qr, notch = '#0D1840', className, reverse }: Props) {
  const p = PARTNER[quote.mode as Mode]
  const a = reverse ? { code: to.code, name: to.name } : { code: from.code, name: from.name }
  const b = reverse ? { code: from.code, name: from.name } : to
  return (
    <div className={cx('relative rounded-[20px] bg-ixi-paper text-ixi-night', className)}>
      <div className="flex items-center justify-between px-4 pt-3.5">
        <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: p.color }}>
          <span className="grid h-5 w-5 place-items-center rounded-md text-white" style={{ background: p.color }}>
            <ModeIcon mode={quote.mode} size={12} />
          </span>
          {p.name}
        </span>
        <span className="text-[12px] font-semibold text-ixi-night/60">
          {quote.operator} {quote.number}
        </span>
      </div>
      <div className="flex items-center gap-3 px-4 pb-3 pt-2">
        <div className="min-w-0">
          <div className="font-display text-[30px] font-extrabold leading-none tracking-tight">{a.code}</div>
          <div className="mt-1 truncate text-[11px] font-medium text-ixi-night/55">{a.name}</div>
          <div className="text-[15px] font-bold tabular-nums">{quote.depart}</div>
        </div>
        <div className="flex flex-1 flex-col items-center text-ixi-night/50">
          <span className="text-[11px] font-semibold">{duration(quote.durationMins)}</span>
          <div className="relative my-1 flex w-full items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-ixi-night/40" />
            <span className="flex-1 border-t-2 border-dashed border-ixi-night/25" />
            <span className="mx-1" style={{ color: p.color }}><ModeIcon mode={quote.mode} size={16} /></span>
            <span className="flex-1 border-t-2 border-dashed border-ixi-night/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-ixi-night/40" />
          </div>
          <span className="text-[11px] font-medium">{quote.mode === 'flight' ? 'Non-stop' : quote.mode === 'bus' ? 'Sleeper AC' : '3A AC'}</span>
        </div>
        <div className="min-w-0 text-right">
          <div className="font-display text-[30px] font-extrabold leading-none tracking-tight">{b.code}</div>
          <div className="mt-1 truncate text-[11px] font-medium text-ixi-night/55">{b.name}</div>
          <div className="text-[15px] font-bold tabular-nums">{quote.arrive}</div>
        </div>
      </div>
      {(footer || qr) && (
        <>
          <div className="relative mx-4 border-t-2 border-dashed border-ixi-night/15">
            <span className="absolute -left-[26px] -top-[11px] h-5 w-5 rounded-full" style={{ background: notch }} />
            <span className="absolute -right-[26px] -top-[11px] h-5 w-5 rounded-full" style={{ background: notch }} />
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">{footer}</div>
            {qr && <QRCodeSVG value={qr} size={72} fgColor="#060B22" bgColor="transparent" />}
          </div>
        </>
      )}
    </div>
  )
}
